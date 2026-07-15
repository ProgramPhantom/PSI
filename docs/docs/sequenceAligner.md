# SequenceAligner

The `SequenceAligner` class is a specialized layout manager that aligns sequence grids. It inherits from `Aligner` and manages the absolute positioning of `Sequence` children.

## Alignment Workflow

- Configured with `placementMode = { type: "free" }` to allow moving sequence groups arbitrarily on the canvas interface.
- Overrides the `add({ child })` method to enforce that each child sequence has its layout mode set to `"aligner"` while retaining its custom configuration parameters.
