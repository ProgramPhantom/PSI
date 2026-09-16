
# Placement Modes

Understanding placement modes are important for being able to create advanced pulse sequecnes and getting the most out of Pulse Planner. Placement modes are groups of information which govern how an element is positioned on the canvas. We will explain some of the placement modes and how they work.

## Free

"Free" is the most simple placement mode. All this means is that the relavent element is positioned on the diagram at its `x` and `y` coordinates. This is the standard position mode for any element dropped into an empty space on the canvas

## Grid

Grid is another common placement mode. It expresses how an element is positioned in a grid type element. It does this by specifying the coordinates of the cell in which it is positioned, and alignment in that cell (if it is centered, flush with the left side etc). 

### Pulse Data

There is a proxy for the grid placement mode called `Pulse Data`. To read more about `Pulse Data`, [see here](./pulsePositioning.md).


## Binds

Binds is another placement mode which allows annotation objects to be connected to other objects via the layout engine.