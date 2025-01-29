import update from 'immutability-helper'
import type { CSSProperties, FC, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useDrop } from 'react-dnd'


import { Visual } from '../vanilla/visual'
import { ElementTypes } from './DraggableElement'
import CanvasDraggableElement, { } from './CanvasDraggableElement'
import ENGINE from '../vanilla/engine'


const styles: CSSProperties = {
  width: "100%",
  height: "100%",
  position: 'relative',
}

export interface ICanvasContainerProps {
    children: ReactNode[]
}

export interface ICanvasDropResult extends IDrop {
    x: number,
    y: number
}

export interface IDrop {
  dropEffect: string
}

/* This is a drop target that covers the entire canvas for collecting drops that are intended
for movements of elements. */
export const CanvasDropContainer: FC<ICanvasContainerProps> = (props) => {

  const [element, setElement] = useState<ReactNode[]>(props.children);

  const moveBox = useCallback(
    (id: string, left: number, top: number) => {
        // setElement(
        //     update(element, {[id]: {$merge: { left, top },},
        // }),
      
    },
    [element],
  )

  const [, drop] = useDrop(
    () => ({
      accept: [ElementTypes.CANVAS_ELEMENT, /* ElementTypes.PREFAB */ ],
      drop(item: ICanvasDropResult, monitor) {
        // Allow drop to be handled by insertAreas
        const didDrop = monitor.didDrop()
        if (didDrop) {
          return undefined
        }
        
        
        // Function called on drop by the drop location
        const delta = monitor.getDifferenceFromInitialOffset() as {
          x: number
          y: number
        }

        // let left = Math.round(item.x + delta.x)
        // let top = Math.round(item.y + delta.y)

        // moveBox(item.id, left, top)

        // TODO: return coords for draggable element to move element in end
        return {dropEffect: "move"}
      },
    }),
    [moveBox]
  )

  return (
    <div ref={drop} style={styles}>
      {props.children}
    </div>
  )
}
