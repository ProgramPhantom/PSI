import type { CSSProperties, FC, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useDrop } from 'react-dnd'
import { Visual } from '../vanilla/visual'
import { ElementTypes } from './TemplateDraggableElement'



const styles: CSSProperties = {
  width: "100%",
  height: "100%",
  position: 'relative',
}

export interface ICanvasContainerProps {
    children: ReactNode[],
    scale: number
}

export interface ICanvasDropResult extends IDrop {
    x: number,
    y: number
}
export function isCanvasDrop(object: IDrop): object is ICanvasDropResult {
  return object.dropEffect === "move"
}

export type DropEffect = "move" | "insert"
export interface IDrop {
  dropEffect: DropEffect
}

/* This is a drop target that covers the entire canvas for collecting drops that are intended
for movements of elements. */
export const CanvasDropContainer: FC<ICanvasContainerProps> = (props) => {


  const [, drop] = useDrop(
    () => ({
      accept: [ElementTypes.CANVAS_ELEMENT, ElementTypes.PREFAB  ],
      drop(item: ICanvasDropResult, monitor) {
        // Allow drop to be handled by insertAreas
        const didDrop = monitor.didDrop()
        if (didDrop) {
          return undefined
        }

        console.log(monitor.getClientOffset())
        
        // Get the client offset (absolute position) where the drop occurred
        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) {
          return {dropEffect: "move", x: 0, y: 0}
        }

        // Get the drawDiv element which contains the actual image content
        const drawDiv = document.getElementById('diagram-root') as HTMLElement
        if (!drawDiv) {
          return {dropEffect: "move", x: clientOffset.x, y: clientOffset.y}
        }

        const drawDivRect = drawDiv.getBoundingClientRect()
        
         // Calculate coordinates relative to the diagram root
         // The getBoundingClientRect() already accounts for transformations (scale, pan, etc.)
         // So we subtract the root's position and then divide by scale to get diagram coordinates
         const relativeX = (clientOffset.x - drawDivRect.left) / props.scale
         const relativeY = (clientOffset.y - drawDivRect.top) / props.scale

        return {dropEffect: "move", x: relativeX, y: relativeY}
      },
         }),
     [props.scale]
   )

  return (
    <div ref={drop} style={styles} data-canvas-container>
      {props.children}
    </div>
  )
}
