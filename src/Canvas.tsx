import React, {useEffect, useState, useRef, useLayoutEffect} from 'react'
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Channel from './vanilla/channel';
import { IChannel, channelStyle } from './vanilla/channel';
import Sequence from "./vanilla/sequence";
import { ScriptError } from './vanilla/parser';
import SequenceHandler from './vanilla/sequenceHandler';
import TokenType from "./vanilla/sequenceHandler"
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MapInteractionCSS } from 'react-map-interaction';
import DropArea from './dnd/InsertArea';
import DraggableElement from './dnd/DraggableElement';
import DropField from './dnd/DropField';

type MapState = {scale: Number, translation: {x: number, y: number}}

const DRAWCANVASID = "drawDiv";
const DESTINATIONVCANVASID = "destinationDiv";


const DRAWSVGID = "drawSVGHere";
const DESTINATIONSVGID = "moveSVGHere";

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 200;

const BUTTON_PAD = [15, 0];

export default function Canvas(props:  {script: string, zoom: number, 
    handler: SequenceHandler,
    sequenceId: string,
    updateChannels: (c: string[]) => void,
    provideErrors: (parseError: string, drawError: string) => void,
    drawSurface: React.MutableRefObject<Svg | undefined>}) {

    const svgDestinationObj = useRef<Svg>();

    const parseErr = useRef<string>("");
    const drawErr = useRef<string>("");
    
    var [buttonX, setButtonX] = useState<number>(0);
    var [buttonYs, setButtonYs] = useState<number[]>([]);
    
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

    
    if (props.drawSurface.current) {
        
    }

    // When drawing straight to the MapInteractionCSS div it breaks, so]
    // I am adding elements to a different div first and then moving it onto the canvas
    // Mounts the image from the drawSVG
    function MountSequence() {
        var canvasWidth = props.handler.sequence.width ;
        var canvasHeight = props.handler.sequence.height ;

        props.drawSurface.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        svgDestinationObj.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        props.drawSurface.current!.rect()
        .attr({fill: "none", stroke: "black", "stroke-width": "1px", "width": "100%", "height": "100%"})
        .id("BORDER");

        
        svgDestinationObj.current!.children().forEach((c) => {
            c.remove();
        })

        props.drawSurface.current!.children().forEach((c) => {
            // var newSvg: SVGElement = Object.assign(Object.create(Object.getPrototypeOf(c)), c)
            var newSvg: SVGElement = c.clone();
            newSvg.addTo(svgDestinationObj.current!);

            // Following did not work because this broke the connection between the svg inside the rect class and the parent,
            // drawSvg element destruction is now handled by element class.
            // props.drawSurface.current!.add(SVG(c.svg()))  // Add it back (clone does not work!)
            // clone is breaking the ids in the latex svgs, so nothing appears
        });
    }
    
    // Construct and draw the sequence from the script
    function ConstructSequence(extraScript: string=""): {x: number, ys: number[]} {
        var ys: number[] = [];
        
        props.drawSurface.current!.clear();
        svgDestinationObj.current!.clear();

        var toParse = props.script + extraScript;


        try {
            props.handler.parser.parseScript(toParse);
            parseErr.current = "none";
        } catch (e){
            if (e instanceof ScriptError) {
                parseErr.current = e.message;
                
            } else {
                parseErr.current = e as string;
                throw e
            }
      
        }
    
        try {
            props.handler.draw();
        } catch (e) {
            
            drawErr.current = e as string;
            throw e
        }

        ys = [10]

        return {x: props.handler.sequence.width, ys: ys};
    }


    useEffect(() => {
        if (props.drawSurface.current) {
            var dim = ConstructSequence();
        }
    }, [props.script])

    useEffect(() => {
        if (props.drawSurface.current) {
            MountSequence()
        }
    }, [props.sequenceId])

    useEffect(() => {
        props.updateChannels(Object.keys(props.handler.sequence.channelsDic))
    }, [Object.keys(props.handler.sequence.channelsDic).join()])

    useEffect(() => {
        MountSequence();
    }, [props.sequenceId])

    useEffect(() => {
        props.provideErrors(parseErr.current, drawErr.current);
    }, [parseErr.current as string, drawErr.current as string])


    return (
        <>
        {/* width: "0px", height: "0px", visibility: "hidden"*/}
        <div id={DRAWCANVASID} style={{width: "0px", height: "0px", visibility: "hidden"}}></div>

        <MapInteractionCSS
            showControls
            defaultValue={{
                scale: 1,
                translation: { x: 0, y: 0 }
            }}
            minScale={1}
            maxScale={7}
            translationBounds={{
                yMin: -props.handler.sequence.height * 3,
                xMin: -props.handler.sequence.width * 3,

                xMax: props.handler.sequence.width * 4,
                yMax: props.handler.sequence.height * 4
            }}
            >
            
            <div id={DESTINATIONVCANVASID} style={{position: "absolute", zIndex: -1}}>
                
            </div>
            <DropField sequence={props.handler}></DropField>

            
        </MapInteractionCSS>
    
        
        </>
    )
}



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