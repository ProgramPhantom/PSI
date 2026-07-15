# Sequence

The `Sequence` class represents a collection of channels arranged in a grid-like structure. It inherits from `Grid` and acts as the container for channels in a sequence.

## Layout Organization

A sequence organizes its channels inside a grid coordinate space:
- **Columns**: Column 0 is reserved for channel labels, column 1 is for the channel baseline (bars), and columns 2+ hold the columns of pulses.
- **Rows**: Each row in the sequence represents a single `Channel`.

## Key Features

- **`deleteEmptyColumns()`**: A cleanup routine that scans the grid columns starting from index 2. If a column contains no non-structural elements (e.g., all cells are empty or contain only background grid lines), it is removed from the sequence.
- **`configureChannel()`**: Executed automatically when a channel is added. It places the channel on the next row (row index `numRows`) and sets the placement configuration so the channel spans across all columns.
- **`getChannelOnRow(row)`**: Retrieves the channel assigned to the specified grid row.
