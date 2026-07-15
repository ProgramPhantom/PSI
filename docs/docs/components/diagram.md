# Diagram

The `Diagram` class represents the root node of a sequence diagram. It inherits from `Collection<Visual>` and coordinates overall sizing, positioning, and sequence layout.

## Key Properties and Accessors

- **`sequences: Sequence[]`**: Retrieves the list of child sequence blocks aligned within the diagram.
- **`channels: Channel[]`**: A flattened list of all channels across all sequences in the diagram.
- **`allPulseElements: Visual[]`**: A flattened list of all pulse elements across all sequences.
- **`sequenceAligner: SequenceAligner`**: The child aligner responsible for vertical positioning of sequences.

## Layout Calculations

- **`getTopLeft()`**: Computes the coordinates of the upper-left boundary of the entire diagram based on the bounding boxes (`drawBound`) of its child sequences.
- **`computeSize()`**: Computes the sizing requirements by calculating the outer boundaries (top, bottom, left, right) of all child elements and updating its inner content size dimensions.
