# Sequence Diagram Concepts

This document explains the key concepts and objects that make up the Pulse Sequence Diagram editor.

## Key Terminology

- **Sequence**: The object representing an entire pulse sequence (currently the largest object making up the diagram). In the future, the diagram could support multiple sequences. The sequence owns the channel column, the label column + pulse columns, label column, and pulse columns.
- **Channel**: A collection of objects that make up a channel label, a bar, and a series of pulses. The channel owns the channel label, the upper/lower aligners, and the bar. It does not directly position the pulses.
- **Upper/Lower Aligners**: Aligner objects responsible for positioning the pulses vertically in the channel. They ensure all pulses are moved up flush with the bar.
- **Channel Column**: An aligner that positions all the channels in a column.
- **Channel Label**: The text object belonging to a channel. Its X coordinate is controlled by the label column, and its Y coordinate is controlled by the Y position of the corresponding bar.
- **Label Column + Pulse Columns**: An aligner that positions the label column next to the pulse columns.
- **Label Column**: The column responsible for setting the X coordinate of the channel labels. This ensures all channel labels are centralized.
- **Pulse Columns**: An aligner that arranges a series of columns (which are also aligners) one after another.
- **Pulse Column**: Responsible for controlling the X coordinate of a pulse. A pulse is added to a pulse column and is centralized within it. When a larger pulse is added, the pulse column increases in width, notifying all children to update and re-center.
- **SVG Element**: A visual element drawn by means of stored SVG content written directly to the surface.
- **Rect Element**: A visual element constructed by a draw command based on its internal properties with a call to the `.rect()` method in the SVG library. (This is a simpler element that does not require direct SVG definitions).

---

> [!NOTE]
> This is a migrated document from the legacy `explaination.txt`.
