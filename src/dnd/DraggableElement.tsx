import React, { CSSProperties, ChangeEvent, useEffect, useState } from 'react'
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Draggable from './SortableItem';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import SortableItem from './SortableItem';
import { Item } from './Item';
import { useDrag } from 'react-dnd';
import SequenceHandler from '../vanilla/sequenceHandler';
import { Visual } from '../vanilla/visual';
import '@svgdotjs/svg.draggable.js'
import { SVG } from '@svgdotjs/svg.js';
import { IInsertAreaResult } from './InsertArea';
import { getEmptyImage } from 'react-dnd-html5-backend';
import '@svgdotjs/svg.draggable.js'
import { title } from 'process';


const style: CSSProperties = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left',
  width: "100px",
  height: "30px"
}



export const ElementTypes = {
    PREFAB: "pulse",
    CANVAS_ELEMENT: "real_element"
}



interface IDraggableElementProps {
  element: Visual,
  handler: SequenceHandler
}

interface IDraggableElementDropItem {
  element: Visual
}

/* When an element is selected, the svg on the canvas is hidden and the element is replaced
by this. It is a different object that can be dragged. */
const DraggableElement: React.FC<IDraggableElementProps> = (props) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ElementTypes.PREFAB,
    item: { element: props.element } as IDraggableElementDropItem,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<IInsertAreaResult>();

      if (item && dropResult) {
        props.handler.mountElementFromTemplate({mountConfig: {...dropResult}}, props.element.ref, dropResult.insert)
        props.handler.draw();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    })
  }))

  if (props.element) {
    var copy = props.element.svg?.clone(true, true)
    copy?.x(0);
    copy?.y(0);
    copy?.show();
    if (copy) {
      copy.draggable(true)
    }
    
  }

  const opacity = isDragging ? 0.5 : 1

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])


  return (
    (
      <div ref={drag} style={{
                minWidth: "30px",
                minHeight: "30px", 
                padding: "20px",
                border: "1px solid black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: opacity}} title='draggable element' >
            <svg style={{width: props.element.contentWidth, height: props.element.contentHeight}} 
                 dangerouslySetInnerHTML={{__html: copy?.svg()!}}>

            </svg>
            <span style={{margin: "15px 0px 0px 0px"}}>"{props.element.ref}"</span>
      </div>
    )
    
  )
}

export default DraggableElement