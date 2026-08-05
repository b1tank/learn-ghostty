const build_config = @import("build_config.zig");

pub const headless = @import("apprt/headless.zig");

/// The build-selected application runtime.
pub const runtime = switch (build_config.app_runtime) {
    .headless => headless,
};

pub const App = runtime.App;
pub const Surface = runtime.Surface;

test {
    _ = runtime;
}
