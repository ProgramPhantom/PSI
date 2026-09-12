# Pulse Positioning

Positioning pulses in chanels is the primary goal of Pulse Planner. Getting to grips with the concepts in this file is highly important to using Pulse Planner effectively.


## Pulse Data

"Pulse Data" is the interface by which users can position pulse type elements in the diagram. This is a proxy for the grid placement mode, and is translated into the grid placement mode automatically. Its job is to expose simpler controls to the user to change how a pulse appears on a channel. Access the Pulse Data of an element placed in a channel by selecting it and navigating to the "Placement" dropdown. It contains the following data:

- Orientation ["Top", "Bottom", "Both"]: This control decides whether the pulse goes on the top or bottom of the channel, or is centred to the `Channel Bar`. 
- Align X ["Left", "Centre", "Right"]: Controls the horizontal alignment in the grid cell of the pulse.
- Align Y ["Top", "Centre", "Bottom"]: Controls the vertical alignment in the grid cell of the pulse.
- No. Sections [INT]: This controls the width of the pulse in columns. For pulses that span multiple pulses on different channels, the number of sections can be increased to show this.
- Clip channel bar [BOOLEAN]: This is a stylistic control that determines whether the body of the pulse deletes the `Channel Bar` below it, primarily used for Acquire.



## Dragging and dropping pulses into the diagram

When dragging elements, blue insert areas appear in each column on each channel. These blue insert areas correspond to different positions in the diagram, and dropping an element there automatically populates the element with the correct pulse data to be positioned in the respective cell of the sequence. 

By default, dropping an element to a blue insert area above the channel assigns the "Top" orientation data and hence the element appears above the `Channel Bar`. Alternatively, inserting an element below the `Channel Bar` assigns the "Bottom" orientation, and also automatically applies a visual flip to an element. This can altered by selecting the element and changing the state of the flipped field.

To centre an element to the `Channel Bar`, simply select the "Both" orientation and change the Align Y option to "Centre". 