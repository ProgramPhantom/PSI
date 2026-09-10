---
id: quickstart
title: Quickstart
sidebar_position: 1
---

# Quickstart

When you first load Pulse Planner, you will be met with a simple diagram: a single proton channel.

## 1. The default channel

When you first open Pulse Planner, a $^1\text{H}$ channel is already on the canvas — you don't need to create one to get started.

## 2. Drag a pulse onto the canvas

In order to start adding pulses to your diagram, simply drag from the Element Draw and drop them to the desired location on the canvas. By dropping an element in any open space on the canvas, you have created what is called a “free” element: an element that behaves the way you would expect in a standard SVG editor. 

## 3. Drag a pulse onto a channel

When dragging the pulse, you may have noticed a blue area appear around the proton channel. By dragging and dropping a pulse, such that the mouse is released over one of these blue areas, a “pulse” element is created. This is an SVG element that has been placed into the layout manager of the application. It’s position is now automatically controlled by the application. If you added a wider pulse, you may notice that the channel has repositioned itself around this pulse, and grown the width of the bar on which the pulse sits. You can remove the pulse from the automatic positioning by grabbing the pulse directly from the canvas and dropping it elsewhere on the diagram. Again, you will notice the channel automatically updates to respond. 

## 4. Add a new channel

Now, click one of the inbuilt channels from the channel panel in the top right of the canvas. The channel will appear instantly, and be automatically positioned with respect to the initial channel. By dragging another pulse, you will see that this channel has it’s own blue insert areas, and pulses can be inserted into that channel by dragging and dropping.

## 5. Removing elements

In order to remove elements from the canvas, including channels, simply click on them so that a blue and grey box appears around the object. Then press the red bin icon in the top right of the `Form` or press `DEL`/`BACKSPACE`. 

## 6. Adding, removing and resizing columns

Inspect the area immediately above the first hydrogen channel. You will see some blue `+` icons and a grey vertical bar. Pressing the blue buttons adds a column into the diagram. The grey handle can be used to resize the column in which the pulses reside. Adding a column also reveals a red `-` symbol, that can be used to remove an entire column. 

> [!WARNING]
> Deleting columns containing pulses cannot be undone. 