const std = @import("std");
const CoreApp = @import("../App.zig");
const CoreSurface = @import("../Surface.zig");

const GtkWidget = opaque {};
const GtkWindow = opaque {};
const GMainLoop = opaque {};

extern fn gtk_init() void;
extern fn gtk_window_new() ?*GtkWidget;
extern fn gtk_window_set_title(window: *GtkWindow, title: [*:0]const u8) void;
extern fn gtk_window_set_default_size(window: *GtkWindow, width: c_int, height: c_int) void;
extern fn gtk_window_present(window: *GtkWindow) void;
extern fn gtk_window_destroy(window: *GtkWindow) void;
extern fn g_main_loop_new(context: ?*anyopaque, running: c_int) ?*GMainLoop;
extern fn g_main_loop_run(loop: *GMainLoop) void;
extern fn g_main_loop_quit(loop: *GMainLoop) void;
extern fn g_main_loop_unref(loop: *GMainLoop) void;
extern fn g_timeout_add(
    interval: c_uint,
    function: *const fn (?*anyopaque) callconv(.c) c_int,
    data: ?*anyopaque,
) c_uint;

pub const App = struct {
    core_app: *CoreApp,
    loop: *GMainLoop,
    surface: ?Surface,

    pub fn init(self: *App, core_app: *CoreApp) void {
        gtk_init();
        self.* = .{
            .core_app = core_app,
            .loop = g_main_loop_new(null, 0).?,
            .surface = null,
        };
        std.debug.print("[gtk] initialized\n", .{});
    }

    pub fn terminate(self: *App) void {
        if (self.surface) |*surface| surface.terminate();
        self.surface = null;
        g_main_loop_unref(self.loop);
        std.debug.print("[gtk] terminated\n", .{});
    }

    pub fn run(self: *App) !void {
        self.surface = .{};
        try self.surface.?.init(self.core_app, 1);

        const widget = gtk_window_new().?;
        const window: *GtkWindow = @ptrCast(widget);
        gtk_window_set_title(window, "Ghostty from Scratch");
        gtk_window_set_default_size(window, 900, 600);
        gtk_window_present(window);
        std.debug.print("[gtk] window presented 900x600\n", .{});

        _ = g_timeout_add(1800, quitLoop, self.loop);
        g_main_loop_run(self.loop);
        std.debug.print("[gtk] event loop exited\n", .{});
        gtk_window_destroy(window);
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

fn quitLoop(data: ?*anyopaque) callconv(.c) c_int {
    const loop: *GMainLoop = @ptrCast(@alignCast(data.?));
    g_main_loop_quit(loop);
    return 0;
}
