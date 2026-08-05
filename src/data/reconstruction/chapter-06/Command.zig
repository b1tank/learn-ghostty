const Command = @This();

const std = @import("std");
const Allocator = std.mem.Allocator;
const ptypkg = @import("pty.zig");
const Pty = ptypkg.Pty;
const c = ptypkg.c;

argv: []const []const u8,

pub const Result = struct {
    inner: std.process.RunResult,

    pub fn deinit(self: *Result, alloc: Allocator) void {
        alloc.free(self.inner.stdout);
        alloc.free(self.inner.stderr);
        self.* = undefined;
    }
};

/// Run a finite child with ordinary stdin/stdout/stderr pipe semantics.
pub fn run(self: Command, alloc: Allocator, io: std.Io) !Result {
    return .{ .inner = try std.process.run(
        alloc,
        io,
        .{ .argv = self.argv },
    ) };
}

pub const Child = struct {
    pid: c.pid_t,
    waited: bool = false,

    pub fn wait(self: *Child) !u8 {
        if (self.waited) return error.AlreadyWaited;
        var status: c_int = 0;
        if (c.waitpid(self.pid, &status, 0) < 0) return error.WaitFailed;
        self.waited = true;
        if (c.WIFEXITED(status)) return @intCast(c.WEXITSTATUS(status));
        return 255;
    }
};

/// Fork and exec a child attached to the supplied PTY. The parent returns
/// immediately with an owned child handle and the PTY master still open.
pub fn startPty(self: Command, pty: *Pty) !Child {
    const pid = c.fork();
    if (pid < 0) return error.ForkFailed;
    if (pid == 0) {
        pty.childPreExec() catch c._exit(126);

        var argv: [16:null]?[*:0]const u8 = .{null} ** 16;
        if (self.argv.len >= argv.len) c._exit(125);
        for (self.argv, 0..) |arg, index| argv[index] = @ptrCast(arg.ptr);
        _ = c.execv(@ptrCast(self.argv[0].ptr), @ptrCast(&argv));
        c._exit(127);
    }

    pty.closeSlave();
    return .{ .pid = pid };
}

pub const PtyResult = struct {
    bytes: [4096]u8 = undefined,
    len: usize = 0,
    exit_code: u8,

    pub fn output(self: *const PtyResult) []const u8 {
        return self.bytes[0..self.len];
    }
};

/// Convenience used by the finite Chapter 05 probe.
pub fn runPty(self: Command, pty: *Pty) !PtyResult {
    var child = try self.startPty(pty);
    var result: PtyResult = .{ .exit_code = 255 };
    var raw: [512]u8 = undefined;
    while (true) {
        const count = try pty.read(&raw);
        if (count == 0) break;
        for (raw[0..count]) |byte| {
            if (byte == '\r') continue;
            if (result.len == result.bytes.len) return error.OutputTooLong;
            result.bytes[result.len] = byte;
            result.len += 1;
        }
    }
    result.exit_code = try child.wait();
    return result;
}
