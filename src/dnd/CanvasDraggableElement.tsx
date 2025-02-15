import React, { CSSProperties, ChangeEvent, memo, useEffect, useState } from 'react'
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
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ElementTypes } from './DraggableElement';
import { ICanvasDropResult, IDrop } from './CanvasDropContainer';
import { HandleStyles, Rnd } from 'react-rnd';
import { IInsertAreaResult } from './InsertArea';
import ENGINE from '../vanilla/engine';
import { hasMountConfig } from '../vanilla/util';
import { Orientation } from '../vanilla/mountable';


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

const handleStyle: React.CSSProperties = {
  width: "2px",
  height: "2px",
  borderRadius: "50%",
  borderColor: "#a7acb0",
  borderWidth: "1px",
  borderStyle: "solid",
  backgroundColor: "white",

  display: "inline-block",
  transform: "translate(-50%, -50%)",
  transformOrigin: "top left"
}

const hStyle: HandleStyles = {
  topLeft: {... handleStyle, left: 0, top: 0},
  top: {...handleStyle, left: "50%", top: 0 },
  topRight: {...handleStyle, left: "100%", top: 0},
  left: {...handleStyle, left: 0, top: "50%"},
  right: {...handleStyle, left: "100%", top: "50%"},
  bottomLeft: {...handleStyle, left: 0, top: "100%"},
  bottom: {...handleStyle, left: "50%", top: "100%"},
  bottomRight: {...handleStyle, left: "100%",  top: "100%"}
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
  element: Visual,
  x: number,
  y: number
}

export interface CanvasDraggableElementPayload {
    element: Visual
}




const CanvasDraggableElement: React.FC<IDraggableElementProps> = memo(function CanvasDraggableElement(props: IDraggableElementProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ElementTypes.CANVAS_ELEMENT,
    item: { element: props.element } as CanvasDraggableElementPayload,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<IDrop>();
      if (dropResult === null) {return}
      
      if (dropResult && dropResult.dropEffect === "move") {

      } else if (dropResult.dropEffect === "insert") {
        var result = dropResult as IInsertAreaResult
        var targetChannel = ENGINE.handler.sequence.channelsDic[result.channelName];

        var positionalElement;
        if (item.element.hasMountConfig) {
          // positionalElement = new Positional(item.element, targetChannel, item.positionalConfig)
          item.element.mountConfig = {...item.element.mountConfig!, orientation: result.orientation, channelName: result.channelName};

          props.handler.shiftMountedElements(item.element, result.index);
        } else {
          throw Error("Not yet implemented");
        }

        props.handler.draw();
      }

    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    })
  }), [props.x, props.y, props.name])

  
  var copy = props.element.svg?.clone(true, true)
  copy?.x(0);
  copy?.y(0);
  copy?.show();
  
  // Removed the default preview?
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  return (
    <>
    
    {/*
    <Rnd disableDragging={true} resizeHandleStyles={hStyle}>
      </Rnd> */}
      <div style={{background: "rgba(255, 211, 92, 0.66)", opacity: isDragging ? 0 : 1}}>
        <div ref={drag} style={{  height: props.element.contentHeight, width: props.element.contentWidth}}>
            <svg style={{width: props.element.contentWidth, height: props.element.contentHeight, display: "block"}} 
                dangerouslySetInnerHTML={{__html: copy?.node.outerHTML!}} ></svg>
        </div>
      </div>
      
    
    </>
  )
})

export default CanvasDraggableElement