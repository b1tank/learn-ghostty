const Surface = @This();

const std = @import("std");
const App = @import("App.zig");

app: *App,
id: u64,

pub fn create(app: *App, id: u64) !*Surface {
    const surface = try app.alloc.create(Surface);
    surface.* = .{ .app = app, .id = id };
    app.surfaceCreated();
    std.debug.print("[surface {d}] created\n", .{id});
    return surface;
}

pub fn destroy(self: *Surface) void {
    const app = self.app;
    const id = self.id;
    std.debug.print("[surface {d}] destroyed\n", .{id});
    app.surfaceDestroyed();
    app.alloc.destroy(self);
}

test "create and destroy Surface" {
    const app = try App.create(std.testing.allocator);
    defer app.destroy();
    const surface = try Surface.create(app, 1);
    surface.destroy();
}
