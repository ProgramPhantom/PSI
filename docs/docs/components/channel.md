# Channel

The `Channel` class represents a single track (or signal line) in a sequence. It inherits from `Subgrid` and is composed of a baseline bar, a label, and pulse elements aligned horizontally.

## Grid Structure

Each channel is configured as a `3-row` subgrid:
- **Row 0 (Top)**: Used for pulses oriented upward (above the baseline).
- **Row 1 (Center)**: Contains the baseline `bar` and the channel `label` (on the far left, column 0).
- **Row 2 (Bottom)**: Used for pulses oriented downward (below the baseline).

## Key Components & Roles

- **`label`**: A text visual component (rendered using LaTeX markup) placed at `{ row: 1, col: 0 }`.
- **`bar`**: A horizontal line visual component (`RectElement`) placed at `{ row: 1, col: 1 }`. It spans from column 1 to the end of the channel.
- **`pulseElements`**: Child visual elements representing NMR pulses (e.g., hard pulses, shape pulses, gradients).

## Sizing & Spacing

- **`sizeBar()`**: Automatically calculates and extends the width of the baseline bar to stretch across all columns currently present in the channel.
- **`getSpacesToNextPulse(orientation, index)`**: Traverses columns starting from `index` inside either the top (Row 0) or bottom (Row 2) rows to calculate how many empty cells remain until the next pulse element.
