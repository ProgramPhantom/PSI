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
  border: '1px solid #d3d8de',
  backgroundColor: 'white',
  padding: '12px 8px',
  marginRight: '0.5rem',
  marginBottom: '0.5rem',
  cursor: 'move',
  float: 'left',
  width: "100px",
  height: "60px",
  borderRadius: "4px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
}



export const ElementTypes = {
    PREFAB: "pulse",
    CANVAS_ELEMENT: "real_element"
}



interface IDraggableElementProps {
  element: Visual,
  handler: SequenceHandler,
  onDoubleClick?: (element: Visual) => void
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
    var copy = props.element.getInternalRepresentation()
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

  const handleDoubleClick = () => {
    if (props.onDoubleClick) {
      props.onDoubleClick(props.element);
    }
  };

  return (
    (
      <div 
        ref={drag} 
        style={{
          width: "120px",
          height: "120px", 
          padding: "12px 8px",
          border: "1px solid #d3d8de",
          borderRadius: "4px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: opacity,
          cursor: "grab",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease",
          userSelect: "none"
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        onDoubleClick={handleDoubleClick}
        title={`Drag ${props.element.ref} to canvas`}
      >
        <svg 
          style={{
            width: props.element.contentWidth,
            height: props.element.contentHeight,
            maxWidth: "90%", 
            maxHeight: "90%",
            marginBottom: "auto", marginTop: "auto"
          }} 
          dangerouslySetInnerHTML={{__html: copy?.svg()!}}
        />
        <span style={{
          fontSize: "12px",
          color: "#5c7080",
          fontWeight: "600",
          textAlign: "center",
          lineHeight: "1.4",
          marginTop: "auto"
        }}>
          {props.element.ref}
        </span>
      </div>
    )
  )
}

export default DraggableElement