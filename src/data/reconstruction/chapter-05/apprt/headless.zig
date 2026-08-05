const std = @import("std");
const CoreApp = @import("../App.zig");
const CoreSurface = @import("../Surface.zig");

pub const App = struct {
    core_app: *CoreApp,
    surface: ?Surface,

    pub fn init(self: *App, core_app: *CoreApp) void {
        self.* = .{ .core_app = core_app, .surface = null };
        std.debug.print("[runtime] initialized\n", .{});
    }

    pub fn terminate(self: *App) void {
        if (self.surface) |*surface| surface.terminate();
        self.surface = null;
        std.debug.print("[runtime] terminated\n", .{});
    }

    pub fn run(self: *App) !void {
        self.surface = .{};
        try self.surface.?.init(self.core_app, 1);
        std.debug.print("[runtime] tick\n", .{});
        try self.surface.?.core_surface.?.runPipeProbe();
        try self.surface.?.core_surface.?.runPtyProbe();
    }
};

pub const Surface = struct {
    core_surface: ?*CoreSurface = null,

    pub fn init(self: *Surface, app: *CoreApp, id: u64) !void {
        self.core_surface = try CoreSurface.create(app, id);
    }

    pub fn terminate(self: *Surface) void {
        if (self.core_surface) |surface| surface.destroy();
        self.core_surface = null;
    }
};

test "headless runtime owns a Surface" {
    const core_app = try CoreApp.create(std.testing.allocator, std.testing.io);
    defer core_app.destroy();

    var app: App = undefined;
    app.init(core_app);
    defer app.terminate();
    try app.run();
}
