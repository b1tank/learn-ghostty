const std = @import("std");

pub const c = @cImport({
    @cInclude("errno.h");
    @cInclude("pty.h");
    @cInclude("sys/ioctl.h");
    @cInclude("sys/types.h");
    @cInclude("sys/wait.h");
    @cInclude("unistd.h");
});

pub const winsize = extern struct {
    ws_row: u16 = 24,
    ws_col: u16 = 80,
    ws_xpixel: u16 = 0,
    ws_ypixel: u16 = 0,
};

pub const Pty = struct {
    master: c_int,
    slave: c_int,

    pub fn open(size: winsize) !Pty {
        var mutable_size = size;
        var master: c_int = undefined;
        var slave: c_int = undefined;
        if (c.openpty(&master, &slave, null, null, @ptrCast(&mutable_size)) < 0)
            return error.OpenptyFailed;
        return .{ .master = master, .slave = slave };
    }

    pub fn read(self: *Pty, buffer: []u8) !usize {
        while (true) {
            const count = c.read(self.master, buffer.ptr, buffer.len);
            if (count > 0) return @intCast(count);
            if (count == 0) return 0;
            const errno = c.__errno_location().*;
            if (errno == c.EINTR) continue;
            if (errno == c.EIO) return 0;
            return error.ReadFailed;
        }
    }

    pub fn writeAll(self: *Pty, bytes: []const u8) !void {
        var offset: usize = 0;
        while (offset < bytes.len) {
            const count = c.write(self.master, bytes.ptr + offset, bytes.len - offset);
            if (count > 0) {
                offset += @intCast(count);
                continue;
            }
            if (count < 0 and c.__errno_location().* == c.EINTR) continue;
            return error.WriteFailed;
        }
    }

    pub fn closeSlave(self: *Pty) void {
        if (self.slave >= 0) {
            _ = c.close(self.slave);
            self.slave = -1;
        }
    }

    pub fn deinit(self: *Pty) void {
        self.closeSlave();
        if (self.master >= 0) _ = c.close(self.master);
        self.* = .{ .master = -1, .slave = -1 };
    }

    /// Establish the slave as stdin/out/err and as the controlling terminal.
    /// This runs in the forked child before exec.
    pub fn childPreExec(self: Pty) !void {
        _ = c.close(self.master);
        if (c.setsid() < 0) return error.SetSidFailed;
        if (c.ioctl(self.slave, c.TIOCSCTTY, @as(c_int, 0)) < 0)
            return error.SetControllingTerminalFailed;
        inline for (0..3) |fd| {
            if (c.dup2(self.slave, @intCast(fd)) < 0) return error.DupFailed;
        }
        if (self.slave > 2) _ = c.close(self.slave);
    }
};

test "open and close PTY" {
    var pty = try Pty.open(.{});
    pty.deinit();
    try std.testing.expectEqual(@as(c_int, -1), pty.master);
}
