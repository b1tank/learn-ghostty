pub const ExeEntrypoint = enum {
    ghostty,
};

pub const AppRuntime = enum {
    headless,
};

/// The build-selected executable entrypoint.
pub const exe_entrypoint: ExeEntrypoint = .ghostty;

/// The build-selected platform runtime.
pub const app_runtime: AppRuntime = .headless;
