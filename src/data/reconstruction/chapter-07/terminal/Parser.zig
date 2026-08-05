const Parser = @This();

const std = @import("std");

pub const State = enum { ground, escape, csi };

pub const Action = union(enum) {
    print: u8,
    execute: u8,
    sgr: u16,
};

state: State = .ground,
parameter: u16 = 0,
has_parameter: bool = false,
actions: [256]Action = undefined,
action_count: usize = 0,

pub fn feed(self: *Parser, bytes: []const u8) !void {
    for (bytes) |byte| if (self.next(byte)) |action| {
        if (self.action_count == self.actions.len) return error.TooManyActions;
        self.actions[self.action_count] = action;
        self.action_count += 1;
    };
}

pub fn next(self: *Parser, byte: u8) ?Action {
    return switch (self.state) {
        .ground => switch (byte) {
            0x1B => state: {
                self.state = .escape;
                break :state null;
            },
            0x00...0x1A, 0x1C...0x1F, 0x7F => .{ .execute = byte },
            else => .{ .print = byte },
        },
        .escape => if (byte == '[') state: {
            self.state = .csi;
            self.parameter = 0;
            self.has_parameter = false;
            break :state null;
        } else state: {
            self.state = .ground;
            break :state null;
        },
        .csi => switch (byte) {
            '0'...'9' => state: {
                self.parameter = self.parameter * 10 + (byte - '0');
                self.has_parameter = true;
                break :state null;
            },
            'm' => dispatch: {
                const value = if (self.has_parameter) self.parameter else 0;
                self.state = .ground;
                break :dispatch .{ .sgr = value };
            },
            else => state: {
                self.state = .ground;
                break :state null;
            },
        },
    };
}

pub fn traceActions(self: *const Parser) void {
    var index: usize = 0;
    while (index < self.action_count) {
        switch (self.actions[index]) {
            .print => {
                std.debug.print("[parser print] ", .{});
                while (index < self.action_count) : (index += 1) switch (self.actions[index]) {
                    .print => |byte| std.debug.print("{c}", .{byte}),
                    else => break,
                };
                std.debug.print("\n", .{});
            },
            .execute => |byte| {
                std.debug.print("[parser execute] {s}\n", .{controlName(byte)});
                index += 1;
            },
            .sgr => |value| {
                std.debug.print("[parser sgr] {d}\n", .{value});
                index += 1;
            },
        }
    }
}

fn controlName(byte: u8) []const u8 {
    return switch (byte) {
        '\r' => "CR",
        '\n' => "LF",
        else => "C0",
    };
}

test "actions do not depend on input chunks" {
    const input = "A\x1b[32mB\x1b[0m\r\n";

    var whole: Parser = .{};
    try whole.feed(input);

    var split: Parser = .{};
    for (input) |byte| try split.feed(&.{byte});

    try std.testing.expectEqual(whole.state, split.state);
    try std.testing.expectEqualSlices(
        Action,
        whole.actions[0..whole.action_count],
        split.actions[0..split.action_count],
    );
}
