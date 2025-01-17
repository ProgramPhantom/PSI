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
import { Orientation } from '../vanilla/positional';
import { Visual } from '../vanilla/visual';

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
    PULSE: "pulse"
}

export interface DropResult {
  index: number,
  channelName: string,
  orientation: Orientation,
  insert: boolean,
}

interface IDraggableElementProps {
  name: string, 
  handler: SequenceHandler,
  element?: Visual
}

const DraggableElement: React.FC<IDraggableElementProps> = (props) => {
  const [{ isDragging }, drag] = useDrag(() => ({

    type: ElementTypes.PULSE,
    item: { name: props.name },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();
      if (item && dropResult) {
        props.handler.positional(props.name, dropResult.channelName, {config: {orientation: dropResult.orientation}}, dropResult.index, dropResult.insert)
        props.handler.draw();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }))

  if (props.element) {
    var copy = props.element.svg?.clone(true, true)
    copy?.x(0);
    copy?.y(0);
    copy?.show();
  }

  const opacity = isDragging ? 0 : 1

  // const opacity = isDragging ? 0.4 : 1
  return (
    
    props.element === undefined ? 

    (<div ref={drag} style={{ ...style, opacity }} data-testid={`pulse`} >{props.name}</div>) 

    : 

    (<div ref={drag} style={{position: "absolute", 
          width: props.element.contentWidth,
          height: props.element.contentHeight, 
          left: props.element.contentX, 
          top: props.element.contentY, opacity: opacity}}>

      <svg className="content" dangerouslySetInnerHTML={{__html: copy?.node.outerHTML!}} 
        style={{height: props.element.contentHeight, width: props.element.contentWidth, display: "inline-block"}}></svg>
      </div>)
    
  )
}

export default DraggableElement