const std = @import("std");
const App = @import("App.zig");

/// The application entrypoint selected by src/main.zig.
pub fn main() !void {
    std.debug.print("[entry] ghostty\n", .{});
    std.debug.print("[main] process started\n", .{});

    {
        const app = try App.create(std.heap.page_allocator);
        defer app.destroy();
        app.run();
    }

    std.debug.print("[main] process exiting\n", .{});
}
