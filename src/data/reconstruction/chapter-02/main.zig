const build_config = @import("build_config.zig");

/// See build_config.ExeEntrypoint for why the executable routes this way.
const entrypoint = switch (build_config.exe_entrypoint) {
    .ghostty => @import("main_ghostty.zig"),
};

/// The build-selected process entrypoint.
pub const main = entrypoint.main;

test {
    _ = entrypoint;
}
