const App = @This();

const std = @import("std");
const Allocator = std.mem.Allocator;

/// General-purpose allocator used to own the stable App pointer.
alloc: Allocator,

pub const CreateError = Allocator.Error;

/// Allocate and initialize the process-wide application state.
pub fn create(alloc: Allocator) CreateError!*App {
    const app = try alloc.create(App);
    errdefer alloc.destroy(app);

    app.init(alloc);
    std.debug.print("[app] created\n", .{});
    return app;
}

pub fn init(self: *App, alloc: Allocator) void {
    self.* = .{ .alloc = alloc };
}

/// Release resources owned by App.
///
/// Chapter 01 has no resources beyond the allocation itself. Later chapters
/// will add cleanup here as App gains real state.
pub fn deinit(self: *App) void {
    _ = self;
}

/// Deinitialize App and release its stable allocation.
pub fn destroy(self: *App) void {
    const alloc = self.alloc;
    self.deinit();
    std.debug.print("[app] destroyed\n", .{});
    alloc.destroy(self);
}

/// Temporarily stand in for the platform runtime's event loop.
///
/// A later chapter moves this responsibility out of App.
pub fn run(self: *App) void {
    _ = self;
    std.debug.print("[app] running\n", .{});
}

test "create and destroy App" {
    const app = try App.create(std.testing.allocator);
    app.destroy();
}
