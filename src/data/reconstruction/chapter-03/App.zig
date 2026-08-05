const App = @This();

const std = @import("std");
const Allocator = std.mem.Allocator;

/// General-purpose allocator used to own stable App and Surface pointers.
alloc: Allocator,

/// Number of live core terminal surfaces.
surface_count: usize,

pub const CreateError = Allocator.Error;

pub fn create(alloc: Allocator) CreateError!*App {
    const app = try alloc.create(App);
    errdefer alloc.destroy(app);

    app.init(alloc);
    std.debug.print("[app] created\n", .{});
    return app;
}

pub fn init(self: *App, alloc: Allocator) void {
    self.* = .{ .alloc = alloc, .surface_count = 0 };
}

pub fn deinit(self: *App) void {
    std.debug.assert(self.surface_count == 0);
}

pub fn destroy(self: *App) void {
    const alloc = self.alloc;
    self.deinit();
    std.debug.print("[app] destroyed\n", .{});
    alloc.destroy(self);
}

pub fn surfaceCreated(self: *App) void {
    self.surface_count += 1;
}

pub fn surfaceDestroyed(self: *App) void {
    std.debug.assert(self.surface_count > 0);
    self.surface_count -= 1;
}

test "create and destroy App" {
    const app = try App.create(std.testing.allocator);
    app.destroy();
}
