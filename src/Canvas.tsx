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
import { MapInteractionCSS } from 'react-map-interaction';
import DropArea from './dnd/InsertArea';
import DraggableElement from './dnd/DraggableElement';
import DropField from './dnd/DropField';
import { Visual } from './vanilla/visual';
import SVGForm from './form/SVGForm';
import { svgPulses } from './vanilla/default/data/svgPulse';
import { UpdateObj } from './vanilla/util';
import Positional from './vanilla/positional';
import Debug from './Debug';
import ENGINE from './vanilla/engine';
import Resizer from './Resizer';
import { select } from 'svg.js';



const DRAWCANVASID = "drawDiv";
const DESTINATIONVCANVASID = "destinationDiv";

const DRAWSVGID = "drawSVGHere";
const DESTINATIONSVGID = "moveSVGHere";

interface ICanvasProps {
    drawSurface: React.MutableRefObject<Svg | undefined>
    select: (element?: Positional<Visual>) => void
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    console.log("CREATING CANVAS")
    const handlerId = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot)

    const svgDestinationObj = useRef<Svg>();

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
                props.handler.surface = props.drawSurface.current;

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
            var newSvg: Element = c.clone();
            var originalId = c.id();

            // RECURSION

            newSvg.id(originalId)
            
            svgDestinationObj.current!.add(newSvg).id(originalId);

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
        if (element === undefined && selectedElement !== undefined) { // Clicking off
            console.log("no element found")
            selectedElement!.svg?.show();
            setSelectedElement(undefined)
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

        <MapInteractionCSS
            
            disableZoom={selectedElement === undefined ? false : true}
            showControls
            defaultValue={{
                scale: 1,
                translation: { x: 0, y: 0 }
            }}
            minScale={1}
            maxScale={7}
            translationBounds={{
                yMin: -ENGINE.handler.sequence.height * 10,
                xMin: -ENGINE.handler.sequence.width * 30,

                xMax: ENGINE.handler.sequence.width * 40,
                yMax: ENGINE.handler.sequence.height * 40
            }}
            >

            <Debug sequenceHandler={ENGINE.handler}></Debug>
                <div id={DESTINATIONVCANVASID} style={{position: "absolute",  pointerEvents: "all"}} 
                    onMouseDown={(e) => {e.stopPropagation(); canvasClicked(e)}}>
                    
                </div>
            <DropField sequence={ENGINE.handler}></DropField>
    
                
            {
                selectedElement !== undefined ?
                <DraggableElement handler={ENGINE.handler} name={selectedElement.refName} element={selectedElement}>

                </DraggableElement> : <></>
            }

        </MapInteractionCSS>
        
        
     
                    
                
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