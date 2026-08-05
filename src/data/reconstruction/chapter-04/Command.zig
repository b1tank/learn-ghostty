const Command = @This();

const std = @import("std");
const Allocator = std.mem.Allocator;

argv: []const []const u8,

pub const Result = struct {
    inner: std.process.RunResult,

    pub fn deinit(self: *Result, alloc: Allocator) void {
        alloc.free(self.inner.stdout);
        alloc.free(self.inner.stderr);
        self.* = undefined;
    }
};

/// Run a finite child with ordinary stdin/stdout/stderr pipe semantics.
pub fn run(self: Command, alloc: Allocator, io: std.Io) !Result {
    return .{ .inner = try std.process.run(
        alloc,
        io,
        .{ .argv = self.argv },
    ) };
}
