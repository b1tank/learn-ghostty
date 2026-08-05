const std = @import("std");
const build_config = @import("../build_config.zig");
const CoreApp = @import("../App.zig");
const CoreSurface = @import("../Surface.zig");

const GtkApp = opaque {};
const GtkSurface = opaque {};

extern fn gfs_gtk_app_new(capture_timeout_ms: c_uint) ?*GtkApp;
extern fn gfs_gtk_app_run(app: *GtkApp) void;
extern fn gfs_gtk_app_free(app: *GtkApp) void;
extern fn gfs_gtk_surface_new(app: *GtkApp, width: c_int, height: c_int) ?*GtkSurface;
extern fn gfs_gtk_surface_free(surface: *GtkSurface) void;

pub const App = struct {
    core_app: *CoreApp,
    native: *GtkApp,
    surface: ?Surface,

    pub fn init(self: *App, core_app: *CoreApp) !void {
        const native = gfs_gtk_app_new(build_config.capture_timeout_ms) orelse
            return error.GtkInitFailed;
        self.* = .{ .core_app = core_app, .native = native, .surface = null };
        std.debug.print("[gtk] initialized\n", .{});
    }

    pub fn terminate(self: *App) void {
        if (self.surface) |*surface| surface.terminate();
        self.surface = null;
        gfs_gtk_app_free(self.native);
        std.debug.print("[gtk] terminated\n", .{});
    }

    pub fn run(self: *App) !void {
        self.surface = .{};
        try self.surface.?.init(self.core_app, self.native, 1);
        std.debug.print("[gtk] window presented 900x600\n", .{});
        gfs_gtk_app_run(self.native);
        std.debug.print("[gtk] event loop exited\n", .{});
    }
};

pub const Surface = struct {
    core_surface: ?*CoreSurface = null,
    native: ?*GtkSurface = null,

    pub fn init(self: *Surface, app: *CoreApp, gtk_app: *GtkApp, id: u64) !void {
        const core_surface = try CoreSurface.create(app, id);
        errdefer core_surface.destroy();
        const native = gfs_gtk_surface_new(gtk_app, 900, 600) orelse
            return error.GtkSurfaceInitFailed;
        self.* = .{ .core_surface = core_surface, .native = native };
    }

    pub fn terminate(self: *Surface) void {
        if (self.native) |native| gfs_gtk_surface_free(native);
        self.native = null;
        if (self.core_surface) |surface| surface.destroy();
        self.core_surface = null;
    }
};
