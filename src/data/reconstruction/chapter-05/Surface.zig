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

pub fn runPipeProbe(self: *Surface) !void {
    const shell_script =
        \\printf 'child: hello\n'
        \\if [ -t 0 ]; then echo 'stdin_tty=yes'; else echo 'stdin_tty=no'; fi
        \\if [ -t 1 ]; then echo 'stdout_tty=yes'; else echo 'stdout_tty=no'; fi
        \\if [ -t 2 ]; then echo 'stderr_tty=yes'; else echo 'stderr_tty=no'; fi
    ;
    const command: Command = .{ .argv = &.{ "/bin/sh", "-c", shell_script } };
    var result = try command.run(self.app.alloc, self.app.io);
    defer result.deinit(self.app.alloc);

    std.debug.print("[pipe child stdout]\n{s}", .{result.inner.stdout});
    if (result.inner.stderr.len > 0)
        std.debug.print("[pipe child stderr]\n{s}", .{result.inner.stderr});

    switch (result.inner.term) {
        .exited => |code| std.debug.print("[pipe child] exited {d}\n", .{code}),
        else => std.debug.print("[pipe child] abnormal exit\n", .{}),
    }
}

pub fn runPtyProbe(self: *Surface) !void {
    _ = self;
    const shell_script =
        \\printf 'child: hello\n'
        \\if [ -t 0 ]; then echo 'stdin_tty=yes'; else echo 'stdin_tty=no'; fi
        \\if [ -t 1 ]; then echo 'stdout_tty=yes'; else echo 'stdout_tty=no'; fi
        \\if [ -t 2 ]; then echo 'stderr_tty=yes'; else echo 'stderr_tty=no'; fi
        \\case "$(tty)" in /dev/pts/*) echo 'tty_path=devpts';; *) echo 'tty_path=unexpected';; esac
        \\set -- $(stty size); echo "rows=$1 cols=$2"
        \\pid=$$; sid=$(ps -o sid= -p $$ | tr -d ' '); pgrp=$(ps -o pgid= -p $$ | tr -d ' '); fg=$(ps -o tpgid= -p $$ | tr -d ' ')
        \\[ "$pid" = "$sid" ] && echo 'pid_equals_sid=yes' || echo 'pid_equals_sid=no'
        \\[ "$pgrp" = "$fg" ] && echo 'pgrp_equals_foreground=yes' || echo 'pgrp_equals_foreground=no'
    ;
    const command: Command = .{ .argv = &.{ "/bin/sh", "-c", shell_script } };
    var pty = try @import("pty.zig").Pty.open(.{ .ws_row = 24, .ws_col = 80 });
    defer pty.deinit();
    const result = try command.runPty(&pty);
    std.debug.print("[pty child stdout]\n{s}", .{result.output()});
    std.debug.print("[pty child] exited {d}\n", .{result.exit_code});
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
