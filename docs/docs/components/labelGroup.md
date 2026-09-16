# LabelGroup

The `LabelGroup` object is designed to automatically position `Annotation` objects around pulses. It does this by creating a grid around a pulse and providing five automatic mounting positions in which to place annotations. These five positions are: top, left, right, bottom and centre. 

This object is created automatically when applying an annotation to a pulse object via the `Annotation Drop Zones`. To annotate a pulse object, simply drag a pulse onto the canvas, and ensure it is not selected. Then, beging dragging your annotation object over the pulse. Five blue regions representing the five mounting positions will appear, drop the annotation into one of these to automatically position it and create a `LabelGroup` object.
