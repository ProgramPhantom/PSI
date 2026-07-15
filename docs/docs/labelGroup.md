# LabelGroup

The `LabelGroup` class wraps a core visual element (such as a pulse) and provides coordinate slots for attaching annotations/labels in any of the cardinal directions. It inherits from `Grid`.

## Layout Grid (3x3 Matrix)

A `LabelGroup` is configured as a `3x3` grid system to position labels relative to the core visual:

| Grid Position | Slot | Description |
|---|---|---|
| `row: 0, col: 1` | `labelTop` | Label positioned directly above the core element. |
| `row: 1, col: 0` | `labelLeft` | Label positioned to the left of the core element. |
| `row: 1, col: 1` | `coreChild` & `labelCentre` | The core pulse element and any centered overlay text. |
| `row: 1, col: 2` | `labelRight` | Label positioned to the right of the core element. |
| `row: 2, col: 1` | `labelBottom` | Label positioned directly below the core element. |

## Sizing Contribution

Labels in a group can be configured to contribute to the layout width/height or bypass layout bounds using the `contribution` settings:
- Sizing contribution is automatically managed based on pulse orientation (e.g., if a pulse is top-oriented, bottom labels bypass sizing contributions to prevent canvas layout jitter).

## Static Helpers

- **`applyAnnotation(targetState, annotationState)`**: Automatically wraps a raw pulse or visual element in a `LabelGroup` when an annotation is added, or appends the annotation if the target is already a label group.
