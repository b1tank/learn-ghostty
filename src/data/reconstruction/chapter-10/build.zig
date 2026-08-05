const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const gtk = b.option(bool, "gtk", "Build the GTK runtime") orelse false;
    const capture_timeout_ms = b.option(u32, "capture-timeout-ms", "Auto-exit GTK for capture only") orelse 0;

    const root_module = b.createModule(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    const options = b.addOptions();
    options.addOption(bool, "gtk", gtk);
    options.addOption(u32, "capture_timeout_ms", capture_timeout_ms);
    root_module.addOptions("build_options", options);
    root_module.link_libc = true;
    if (gtk) {
        root_module.linkSystemLibrary("gtk4", .{ .use_pkg_config = .force });
        root_module.linkSystemLibrary("epoxy", .{ .use_pkg_config = .force });
        root_module.addCSourceFile(.{ .file = b.path("src/apprt/gtk_shim.c"), .flags = &.{} });
    }

    const exe = b.addExecutable(.{
        .name = "ghostty-from-scratch",
        .root_module = root_module,
    });
    b.installArtifact(exe);

    const run = b.addRunArtifact(exe);
    run.step.dependOn(b.getInstallStep());
    if (b.args) |args| run.addArgs(args);

    const run_step = b.step("run", "Run ghostty-from-scratch");
    run_step.dependOn(&run.step);

    const tests = b.addTest(.{ .root_module = root_module });
    const run_tests = b.addRunArtifact(tests);
    const test_step = b.step("test", "Run the Zig tests");
    test_step.dependOn(&run_tests.step);
}
