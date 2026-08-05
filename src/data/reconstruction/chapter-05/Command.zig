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

pub const PtyResult = struct {
    bytes: [4096]u8 = undefined,
    len: usize = 0,
    exit_code: u8,

    pub fn output(self: *const PtyResult) []const u8 {
        return self.bytes[0..self.len];
    }
};

/// Fork, attach the child to the PTY slave, exec the command, and collect the
/// finite probe output from the PTY master.
pub fn runPty(self: Command, pty: *Pty) !PtyResult {
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
    var result: PtyResult = .{ .exit_code = 255 };
    var raw: [512]u8 = undefined;
    while (true) {
        const count = c.read(pty.master, &raw, raw.len);
        if (count > 0) {
            for (raw[0..@intCast(count)]) |byte| {
                if (byte == '\r') continue;
                if (result.len == result.bytes.len) return error.OutputTooLong;
                result.bytes[result.len] = byte;
                result.len += 1;
            }
            continue;
        }
        if (count == 0) break;
        const errno = c.__errno_location().*;
        if (errno == c.EINTR) continue;
        if (errno == c.EIO) break;
        return error.ReadFailed;
    }

    var status: c_int = 0;
    if (c.waitpid(pid, &status, 0) < 0) return error.WaitFailed;
    if (c.WIFEXITED(status)) result.exit_code = @intCast(c.WEXITSTATUS(status));
    return result;
}
