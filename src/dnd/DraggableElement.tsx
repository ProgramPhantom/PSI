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

function DraggableElement(props: {name: string, handler: SequenceHandler}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ElementTypes.PULSE,
    item: { name: props.name },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();
      if (item && dropResult) {
        // alert(`index: ${dropResult.index}, channel: ${dropResult.channelName}, insert: ${dropResult.insert}, orientation: ${dropResult.orientation}`);
        props.handler.positional(props.name, dropResult.channelName, {config: {orientation: dropResult.orientation}}, dropResult.index, dropResult.insert)
        props.handler.draw();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }))

  const opacity = isDragging ? 0.4 : 1
  return (
    <div ref={drag} style={{ ...style, opacity }} data-testid={`pulse`} >
      {props.name}
    </div>
  )
}

export default DraggableElement