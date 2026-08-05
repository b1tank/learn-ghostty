const options = @import("build_options");

pub const ExeEntrypoint = enum {
    ghostty,
};

pub const AppRuntime = enum {
    headless,
    gtk,
};

/// The build-selected executable entrypoint.
pub const exe_entrypoint: ExeEntrypoint = .ghostty;

/// The build-selected platform runtime.
pub const app_runtime: AppRuntime = if (options.gtk) .gtk else .headless;
pub const capture_timeout_ms: u32 = options.capture_timeout_ms;
