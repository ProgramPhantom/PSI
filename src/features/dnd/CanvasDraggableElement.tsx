import { Button, Colors, Icon } from '@blueprintjs/core';
import '@svgdotjs/svg.draggable.js';
import React, { CSSProperties, memo, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { HandleStyles } from 'react-rnd';
import ENGINE from '../../logic/engine';
import { IMountConfig } from '../../logic/mountable';
import { Visual } from '../../logic/visual';
import { IDrop, isCanvasDrop } from './CanvasDropContainer';
import { IMountAreaResult, isMountDrop } from './InsertArea';
import { ElementTypes } from './TemplateDraggableElement';


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

      if (isCanvasDrop(dropResult)) {
        //ENGINE.handler.moveElement(item.element, dropResult.x, dropResult.y);
      } else if (isMountDrop(dropResult)) {
        var result = dropResult as IMountAreaResult
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

  var visualRef = useRef<SVGSVGElement>();
  var visual = props.element.getInternalRepresentation().show();
  
  const refreshElement = () => {
    props.element.bindingsToThis.forEach((b) => {
      b.anchorObject.enforceBinding()
    })
  }


  // Removed the default preview?
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  useEffect(() => {
    if (visualRef.current) {
      visualRef.current.appendChild(visual.node) 
    };
  }, [props.element])

  return (
    <>
    
    {/*
    <Rnd disableDragging={true} resizeHandleStyles={hStyle}>
    <div style={{width: props.element.contentWidth, height: props.element.contentHeight, display: "block"}} 
                dangerouslySetInnerHTML={{__html: copy?.node.outerHTML!}} ></div> outline: isDragging ? `none` : `1px dashed ${Colors.BLUE3}`
      </Rnd> */}
      <div style={{zIndex: 15000, opacity: isDragging ? 0.4 : 1, position: "relative"}}>
        
        {/* Pin Button - positioned in top left */}
        <Button type='button'
             variant='minimal' 
             icon={<Icon icon="lock" size={5} style={{opacity: 0.6}}/>}
             style={{transition: "all 0.2s ease",
             position: "absolute",
             minHeight: 0, minWidth: 0,
             top: "-8px",
             left: "0px",
             zIndex: 40,
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
            <svg  style={{width: "100%", height: "100%", position: "absolute", top: -props.element.offset[1], left: -props.element.offset[0]}}>
              <svg ref={visualRef}>

              </svg>
              <rect style={{ stroke: isDragging ? `none` : `${Colors.BLUE3}`, width: "100%", height: "100%", 
                strokeWidth: "1px", fill: `${Colors.BLUE5}`, fillOpacity: "10%", strokeDasharray: "1 1"}}></rect>
            
            </svg>
        </div>

        
      </div>
    </>
  )
})

export default CanvasDraggableElement