import React, {useEffect, useState, useRef, useLayoutEffect, ReactNode, ReactElement, useSyncExternalStore, DOMElement} from 'react'
import { SVG, extend as SVGextend, Element, Svg } from '@svgdotjs/svg.js'
import Channel from './vanilla/channel';
import  { ISVG } from './vanilla/svgElement';
import { IChannel, IChannelStyle } from './vanilla/channel';
import Sequence from "./vanilla/sequence";
import { ScriptError } from './vanilla/parser';
import SequenceHandler from './vanilla/sequenceHandler';
import TokenType from "./vanilla/sequenceHandler"
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import DropArea from './dnd/InsertArea';
import DraggableElement from './dnd/DraggableElement';
import DropField from './dnd/DropField';
import { Visual } from './vanilla/visual';
import SVGForm from './form/SVGForm';
import { svgPulses } from './vanilla/default/data/svgPulse';
import { UpdateObj } from './vanilla/util';
import Positional from './vanilla/positional';
import Debug from './Debug';
import Resizer from './Resizer';
import { select } from 'svg.js';
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CanvasDragLayer } from './dnd/CanvasDragLayer';
import { CanvasDropContainer } from './dnd/CanvasDropContainer';
import CanvasDraggableElement from './dnd/CanvasDraggableElement';
import ENGINE from './vanilla/engine';


const DRAWCANVASID = "drawDiv";
const DESTINATIONVCANVASID = "destinationDiv";

const DRAWSVGID = "drawSVGHere";
const DESTINATIONSVGID = "moveSVGHere";

interface ICanvasProps {
    drawSurface: React.MutableRefObject<Svg | undefined>
    select: (element?: Positional<Visual>) => void
    handler: SequenceHandler
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    console.log("CREATING CANVAS")
    const handlerId = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot)

    const svgDestinationObj = useRef<Svg>();

    const [zoom, setZoom] = useState(5);
    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Visual | undefined>(undefined);

    useLayoutEffect(() => {
        var drawSurface = document.getElementById(DRAWSVGID);
        var destinationSurface = document.getElementById(DESTINATIONSVGID);
        var div = document.getElementById(DRAWCANVASID);

        if (props.drawSurface.current === undefined || svgDestinationObj.current === undefined) {
            if (drawSurface !== null || destinationSurface !== null) {
                props.drawSurface.current = new Svg(drawSurface!.outerHTML);
                svgDestinationObj.current = new Svg(destinationSurface!.outerHTML);
            } else {
                var drawSvg = SVG().addTo("#" + DRAWCANVASID).size("800px", "400px").attr({id: DRAWSVGID});
                props.drawSurface.current = drawSvg;
                ENGINE.handler.surface = props.drawSurface.current;

                var destinationSvg = SVG().addTo("#" + DESTINATIONVCANVASID).size("800px", "400px").attr({id: DESTINATIONSVGID});
                svgDestinationObj.current = destinationSvg;
            }
        } 
    }, [props.drawSurface, svgDestinationObj])

    useEffect(() => {
        if (props.drawSurface.current) {
            MountSequence()
        }
    }, [handlerId])

    // When drawing straight to the MapInteractionCSS div it breaks, so]
    // I am adding elements to a different div first and then moving it onto the canvas
    // Mounts the image from the drawSVG
    function MountSequence() {
        var canvasWidth = ENGINE.handler.sequence.width ;
        var canvasHeight = ENGINE.handler.sequence.height ;

        props.drawSurface.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        svgDestinationObj.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)

        if (document.getElementById("BORDER") === null) {
            props.drawSurface.current!.rect()
            .attr({fill: "none", stroke: "black", "stroke-width": "1px", "width": "100%", "height": "100%", "stroke-opacity": 0.4})
            .id("BORDER");
        }

        svgDestinationObj.current!.children().forEach((c) => {
            c.remove();
        })
        ;

        props.drawSurface.current!.children().forEach((c) => {
            var newSvg: Element = c.clone(true, false);
            var originalId = c.id();

            // RECURSION

            newSvg.id(originalId)
            
            svgDestinationObj.current!.add(newSvg);

            // Following did not work because this broke the connection between the svg inside the rect class and the parent,
            // drawSvg element destruction is now handled by element class.
            // props.drawSurface.current!.add(SVG(c.svg()))  // Add it back (clone does not work!)
            // clone is breaking the ids in the latex svgs, so nothing appears
        });
    }

    function canvasClicked(click: React.MouseEvent<HTMLDivElement>) {

        var targetId: string | undefined;
        if ((click.target as HTMLDivElement).tagName === "path") {
            targetId = (click.target as HTMLDivElement).parentElement?.id;
        } else {
            targetId = (click.target as HTMLDivElement).id;
        }


        if (targetId === undefined) { 
            console.warn(`Cannot find id for ${click}`);
            return
        }
        
        var element: Positional<Visual> | undefined = ENGINE.handler.selectPositional(targetId);

        console.log("mouse down")
        console.log(element)
        console.log(targetId)
        if (element === undefined && selectedElement !== undefined) { // Clicking off
            
            selectedElement!.svg?.show();
            setSelectedElement(undefined)
            setDragging(false)

        } else if (element !== undefined && selectedElement !== undefined) {  // Click straight to a new element
            selectedElement!.svg?.show();
            setSelectedElement(element.element!)
            element?.element.svg?.hide();
            
            
        } else if (element !== undefined) { // From nothing selected to element
            setSelectedElement(element.element!)
            element?.element.svg?.hide();
            
        }
        
        
        if (element !== undefined) {
            props.select(element)
        } else {
            props.select(undefined)
        }
        MountSequence();
    }


    return (
        <>
        {/* width: "0px", height: "0px", visibility: "hidden"*/}
        <div id={DRAWCANVASID} style={{width: "0px", height: "0px", visibility: "hidden"}}></div>


        <div style={{width: "100%", height: "100%",  display: "flex"}} 
        onMouseUp={(e) => {canvasClicked(e); }}
        onDragEnd={() => {console.log("drag ended"); setDragging(false)}}
                >

            <CanvasDropContainer >
                <TransformWrapper initialScale={zoom} onZoomStop={(z) => {setZoom(z.state.scale)}}
                                centerOnInit={true} 
                                limitToBounds={false} 
                                centerZoomedOut={true}
                                disabled={dragging}
                                onPanningStart={() => {setPanning(true); console.log("PANNING START")}}
                                onPanningStop={() => {setPanning(false); console.log("PANNING EN")}}
                                >
                    <TransformComponent wrapperStyle={{width: "100%", height: "100%"}}>
                        <div style={{width: "100%", height: "100%", display: "inline-block", position: "relative"}}>
                            
                            
                                <Debug sequenceHandler={ENGINE.handler}></Debug>
                                <div id={DESTINATIONVCANVASID} >
                                    
                                </div>
                                <DropField sequence={ENGINE.handler}></DropField>

                            

                                {
                                    selectedElement !== undefined ?
                                    <div style={{position: "absolute", 
                                        width: selectedElement.contentWidth,
                                        height: selectedElement.contentHeight, 
                                        left: selectedElement.contentX, 
                                        top: selectedElement.contentY,}} 
                                        onMouseDown={() => {setDragging(true)}} 
                                        >

                                        <CanvasDraggableElement handler={ENGINE.handler} name={selectedElement.refName} element={selectedElement} x={selectedElement.x} 
                                                                y={selectedElement.y}>

                                        </CanvasDraggableElement>
                                        </div>
                                     : <></>
                                }   
                                

                        </div>
                    </TransformComponent>
                </TransformWrapper>

                <CanvasDragLayer scale={zoom} />
            </CanvasDropContainer>
        </div>
        
        
        </>
    )
}

export default Canvas

/*
value={mapState}
onChange={(value) => setMapState(value as MapState)}
<TransformWrapper>
            <TransformComponent>
                <div id={DESTINATIONVCANVASID} style={{objectFit: "contain", width: "100%", height: "100%", minHeight: "600px"}}>
                
                </div>
            </TransformComponent>
        </TransformWrapper>

*/ 