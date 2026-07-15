# Label

The `Label` class represents a combined textual annotation and its associated line indicator. It inherits from `Aligner` and handles drawing LaTeX text alongside layout alignment lines.

## Layout Configuration

- **`text`**: The text element rendering LaTeX markup.
- **`line`**: The line indicator element drawn beneath/around the text.
- **`LabelTextPosition`**: Can be one of the following:
  - `"top"`: Text drawn above the alignment line.
  - `"bottom"`: Text drawn below the alignment line.
  - `"inline"`: Text breaks/interrupts the line.

## Inline Masking

When `textPosition` is `"inline"`, the `Label` class dynamically creates an SVG mask at draw time:
1. Calculates the bounding box of the text.
2. Applies a luminance-type SVG Mask to the `line` component.
3. This crops/masks the line so that it does not draw behind the text, keeping the LaTeX content completely readable without overlapping vector paths.
