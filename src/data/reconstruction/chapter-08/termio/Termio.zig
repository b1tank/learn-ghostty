const Termio = @This();

const std = @import("std");
const Command = @import("../Command.zig");
const ptypkg = @import("../pty.zig");
const Pty = ptypkg.Pty;
const terminalpkg = @import("../terminal/main.zig");
const Parser = terminalpkg.Parser;
const Terminal = terminalpkg.Terminal;

pty: Pty,
child: Command.Child,
phase_bytes: [4096]u8 = undefined,
phase_len: usize = 0,
parser: Parser = .{},
terminal: Terminal = .{},

pub fn init(command: Command, size: ptypkg.winsize) !Termio {
    var pty = try Pty.open(size);
    errdefer pty.deinit();
    const child = try command.startPty(&pty);
    std.debug.print("[termio] started\n", .{});
    return .{ .pty = pty, .child = child, .parser = .{}, .terminal = .{} };
}

pub fn deinit(self: *Termio) void {
    self.pty.deinit();
    if (!self.child.waited) _ = self.child.wait() catch {};
    std.debug.print("[termio] stopped\n", .{});
}

pub fn writeAll(self: *Termio, bytes: []const u8) !void {
    try self.pty.writeAll(bytes);
    traceHex("write", bytes);
}

pub fn readUntil(self: *Termio, marker: []const u8) ![]const u8 {
    self.phase_len = 0;
    var chunk: [3]u8 = undefined;
    while (std.mem.indexOf(u8, self.phase_bytes[0..self.phase_len], marker) == null) {
        const count = try self.pty.read(&chunk);
        if (count == 0) return error.EndOfStream;
        try self.append(chunk[0..count]);
    }
    return self.phase_bytes[0..self.phase_len];
}

pub fn readToEnd(self: *Termio) ![]const u8 {
    self.phase_len = 0;
    var chunk: [3]u8 = undefined;
    while (true) {
        const count = try self.pty.read(&chunk);
        if (count == 0) break;
        try self.append(chunk[0..count]);
    }
    return self.phase_bytes[0..self.phase_len];
}

pub fn wait(self: *Termio) !u8 {
    return self.child.wait();
}

pub fn traceParser(self: *const Termio) void {
    self.parser.traceActions();
}

pub fn traceTerminal(self: *const Termio) void {
    self.terminal.trace();
}

fn append(self: *Termio, bytes: []const u8) !void {
    if (self.phase_len + bytes.len > self.phase_bytes.len) return error.OutputTooLong;
    const action_start = self.parser.action_count;
    try self.parser.feed(bytes);
    self.terminal.apply(self.parser.actionsSince(action_start));
    @memcpy(self.phase_bytes[self.phase_len..][0..bytes.len], bytes);
    self.phase_len += bytes.len;
}

pub fn traceHex(label: []const u8, bytes: []const u8) void {
    std.debug.print("[termio {s}]", .{label});
    for (bytes) |byte| std.debug.print(" {X:0>2}", .{byte});
    std.debug.print("\n", .{});
}

test "Termio owns interactive PTY reads and writes" {
    const script: []const u8 = "printf 'ready>'; IFS= read -r line; printf 'reply:%s\\n' \"$line\"";
    const command: Command = .{ .argv = &.{ "/bin/sh", "-c", script } };
    var termio = try Termio.init(command, .{});
    defer termio.deinit();
    _ = try termio.readUntil("ready>");
    try termio.writeAll("test\n");
    _ = try termio.readToEnd();
    try std.testing.expectEqual(@as(u8, 0), try termio.wait());
}
