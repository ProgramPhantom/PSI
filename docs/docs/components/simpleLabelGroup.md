# SimpleLabelGroup

The `SimpleLabelGroup` class is an optimized, simplified variant of `LabelGroup` that only supports vertical annotations (top and bottom). It inherits from `Grid`.

## Layout Grid (3x1 Matrix)

Unlike the standard `LabelGroup`, `SimpleLabelGroup` is configured as a `3x1` grid to align elements vertically:

| Grid Position | Slot | Description |
|---|---|---|
| `row: 0, col: 0` | `labelTop` | Label positioned above the core element. |
| `row: 1, col: 0` | `coreChild` | The core element being annotated. |
| `row: 2, col: 0` | `labelBottom` | Label positioned below the core element. |

## Sizing Modes

- Vertical coordinates default to `fit` or `grow` size modes.
- Simple label groups bypass horizontal alignment logic to save computation overhead when side-annotations (left/right) are not required.
