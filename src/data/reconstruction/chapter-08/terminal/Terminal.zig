const Terminal = @This();

const std = @import("std");
const Action = @import("Parser.zig").Action;

pub const rows = 3;
pub const columns = 24;

pub const Style = enum { default, green };
pub const Cell = struct { char: u8 = ' ', style: Style = .default };
const blank_row = [_]Cell{.{}} ** columns;

cells: [rows][columns]Cell = [_][columns]Cell{blank_row} ** rows,
cursor_row: usize = 0,
cursor_column: usize = 0,
style: Style = .default,

pub fn apply(self: *Terminal, actions: []const Action) void {
    for (actions) |action| switch (action) {
        .print => |byte| self.print(byte),
        .execute => |byte| self.execute(byte),
        .sgr => |value| self.setGraphicRendition(value),
    };
}

fn print(self: *Terminal, byte: u8) void {
    self.cells[self.cursor_row][self.cursor_column] = .{
        .char = byte,
        .style = self.style,
    };
    self.cursor_column += 1;
    if (self.cursor_column == columns) {
        self.cursor_column = 0;
        self.cursor_row = @min(self.cursor_row + 1, rows - 1);
    }
}

fn execute(self: *Terminal, byte: u8) void {
    switch (byte) {
        '\r' => self.cursor_column = 0,
        '\n' => self.cursor_row = @min(self.cursor_row + 1, rows - 1),
        else => {},
    }
}

fn setGraphicRendition(self: *Terminal, value: u16) void {
    self.style = switch (value) {
        32 => .green,
        else => .default,
    };
}

pub fn trace(self: *const Terminal) void {
    for (self.cells, 0..) |row, row_index| {
        std.debug.print("[terminal row {d}] ", .{row_index});
        for (row) |cell| std.debug.print("{c}", .{if (cell.char == ' ') '.' else cell.char});
        std.debug.print("\n", .{});

        std.debug.print("[terminal style {d}] ", .{row_index});
        for (row) |cell| std.debug.print("{c}", .{
            if (cell.style == .green) @as(u8, 'G') else @as(u8, '.'),
        });
        std.debug.print("\n", .{});
    }
    std.debug.print("[terminal cursor] row={d} col={d} style={s}\n", .{
        self.cursor_row,
        self.cursor_column,
        @tagName(self.style),
    });
}

test "actions update cells cursor and style" {
    var terminal: Terminal = .{};
    terminal.apply(&.{
        .{ .print = 'A' },
        .{ .sgr = 32 },
        .{ .print = 'B' },
        .{ .sgr = 0 },
        .{ .execute = '\r' },
        .{ .execute = '\n' },
        .{ .print = 'C' },
    });

    try std.testing.expectEqual(@as(u8, 'A'), terminal.cells[0][0].char);
    try std.testing.expectEqual(Style.green, terminal.cells[0][1].style);
    try std.testing.expectEqual(@as(u8, 'C'), terminal.cells[1][0].char);
    try std.testing.expectEqual(@as(usize, 1), terminal.cursor_column);
}
