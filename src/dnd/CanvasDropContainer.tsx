import update from 'immutability-helper'
import type { CSSProperties, FC, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useDrop } from 'react-dnd'


import { Visual } from '../vanilla/visual'
import { ElementTypes } from './DraggableElement'
import CanvasDraggableElement, { } from './CanvasDraggableElement'
import ENGINE from '../vanilla/engine'
import { Orientation } from '../vanilla/positional'


const styles: CSSProperties = {
  width: "100%",
  height: "100%",
  border: '1px solid black',
  position: 'relative',
}

export interface ICanvasContainerProps {
    children: ReactNode[]
}

export interface ICanvasDropResult {
    x: number,
    y: number
}


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
      accept: [ElementTypes.REAL_ELEMENT, /* ElementTypes.PREFAB */ ],
      drop(item: ICanvasDropResult, monitor) {
        // Function called on drop by the drop location
        const delta = monitor.getDifferenceFromInitialOffset() as {
          x: number
          y: number
        }

        let left = Math.round(item.x + delta.x)
        let top = Math.round(item.y + delta.y)

        // moveBox(item.id, left, top)
        console.log(`item:`)
        console.log(item)
        return undefined
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
