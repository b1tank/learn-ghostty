const Surface = @This();

const std = @import("std");
const App = @import("App.zig");
const Command = @import("Command.zig");

app: *App,
id: u64,

pub fn create(app: *App, id: u64) !*Surface {
    const surface = try app.alloc.create(Surface);
    surface.* = .{ .app = app, .id = id };
    app.surfaceCreated();
    std.debug.print("[surface {d}] created\n", .{id});
    return surface;
}

pub fn runChild(self: *Surface) !void {
    const shell_script =
        \\printf 'child: hello\n'
        \\if [ -t 0 ]; then echo 'stdin_tty=yes'; else echo 'stdin_tty=no'; fi
        \\if [ -t 1 ]; then echo 'stdout_tty=yes'; else echo 'stdout_tty=no'; fi
        \\if [ -t 2 ]; then echo 'stderr_tty=yes'; else echo 'stderr_tty=no'; fi
    ;
    const command: Command = .{ .argv = &.{ "/bin/sh", "-c", shell_script } };
    var result = try command.run(self.app.alloc, self.app.io);
    defer result.deinit(self.app.alloc);

    std.debug.print("[child stdout]\n{s}", .{result.inner.stdout});
    if (result.inner.stderr.len > 0)
        std.debug.print("[child stderr]\n{s}", .{result.inner.stderr});

    switch (result.inner.term) {
        .exited => |code| std.debug.print("[child] exited {d}\n", .{code}),
        else => std.debug.print("[child] abnormal exit\n", .{}),
    }
}

pub fn destroy(self: *Surface) void {
    const app = self.app;
    const id = self.id;
    std.debug.print("[surface {d}] destroyed\n", .{id});
    app.surfaceDestroyed();
    app.alloc.destroy(self);
}

test "create and destroy Surface" {
    const app = try App.create(std.testing.allocator, std.testing.io);
    defer app.destroy();
    const surface = try Surface.create(app, 1);
    surface.destroy();
}
