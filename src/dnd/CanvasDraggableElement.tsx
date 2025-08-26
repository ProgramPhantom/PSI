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
import DiagramHandler from '../vanilla/diagramHandler';
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
import { IMountConfig, Orientation } from '../vanilla/mountable';
import { Svg } from '@svgdotjs/svg.js';
import { ID } from '../vanilla/point';
import { Button, Colors, Icon } from '@blueprintjs/core';


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
  channelID: ID,
  orientation: Orientation,
  insert: boolean,
}

interface IDraggableElementProps {
  name: string, 
  element: Visual,
  x: number,
  y: number
}

export interface CanvasDraggableElementPayload {
    element: Visual
}



/* When an element on the canvas is selected, it is replaced by this, a draggable element */
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
        var targetChannel = ENGINE.handler.diagram.channelsDict[result.channelID];
        var targetSequence = ENGINE.handler.diagram.sequenceDict[result.sequenceID];

        var positionalElement;
        if (item.element.hasMountConfig) {
          var newMountConfig: IMountConfig = {...item.element.mountConfig!, 
            orientation: result.orientation, channelID: result.channelID, sequenceID: result.sequenceID, index: result.index};

          if (result.insert) {
            ENGINE.handler.shiftMountedElement(item.element, newMountConfig);
          } else {
            ENGINE.handler.moveMountedElement(item.element, newMountConfig)
          }
          
        } else {
          throw Error("Not yet implemented"); // Converting an unmounted object into a mounted one.
        }

        ENGINE.handler.draw();
      }

    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    })
  }), [props.x, props.y, props.name])

  
  var visual = props.element.getInternalRepresentation();
  
  // Removed the default preview?
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  function refreshElement() {
    props.element.bindingsToThis.forEach((b) => {
      b.anchorObject.enforceBinding()
    })
  }

  return (
    <>
    
    {/*
    <Rnd disableDragging={true} resizeHandleStyles={hStyle}>
    <div style={{width: props.element.contentWidth, height: props.element.contentHeight, display: "block"}} 
                dangerouslySetInnerHTML={{__html: copy?.node.outerHTML!}} ></div> outline: isDragging ? `none` : `1px dashed ${Colors.BLUE3}`
      </Rnd> */}
      <div style={{ opacity: isDragging ? 0.4 : 1, position: "relative"}}>
        
        {/* Pin Button - positioned in top left */}
        <Button type='button'
             variant='minimal' 
             icon={<Icon icon="lock" size={5} style={{opacity: 0.6}}/>}
             style={{transition: "all 0.2s ease",
             position: "absolute",
             minHeight: 0, minWidth: 0,
             top: "-8px",
             left: "0px",
             zIndex: 10,
             width: "6px",
             height: "8px",
             padding: 0,
             outline: "none",
             background: "transparent"
             
          }}        
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"; }}
        />

        {/* Refresh button */}
        <Button type='button'
             variant='minimal' 
             icon={<Icon icon="refresh" size={5} style={{opacity: 0.6}}/>}
             style={{transition: "all 0.2s ease",
             position: "absolute",
             minHeight: 0, minWidth: 0,
             top: "-8px",
             left: "6px",
             zIndex: 10,
             width: "6px",
             height: "8px",
             padding: 0,
             outline: "none",
             background: "transparent"
             
          }}        
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"; }}
          onClick={() => refreshElement()}
         />
        
        <div ref={drag} style={{  height: props.element.contentHeight, width: props.element.contentWidth}}>
            {/* Border */}
            <svg style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0}}>
              <rect style={{stroke: isDragging ? `none` : `${Colors.BLUE3}`, width: "100%", height: "100%", 
                strokeWidth: "1px", fill: `${Colors.BLUE5}`, fillOpacity: "10%", strokeDasharray: "1 1"}}></rect>
            </svg>


            <svg style={{width: props.element.contentWidth, height: props.element.contentHeight, display: "block", 
            position: "relative", top: -props.element.offset[1], left: -props.element.offset[0]}} 
                dangerouslySetInnerHTML={{__html: visual?.node.outerHTML!}} ></svg>
          
            
        </div>

        
      </div>
    </>
  )
})

export default CanvasDraggableElement