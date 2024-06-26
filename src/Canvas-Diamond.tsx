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

    
    function MountSequence() {
        var canvasWidth = props.handler.sequence.width;
        var canvasHeight = props.handler.sequence.height;

        props.drawSurface.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        svgDestinationObj.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        props.drawSurface.current!.rect()
        .attr({fill: "none", stroke: "black", "stroke-width": "1px", "width": "100%", "height": "100%"})
        .id("BORDER");

        // When drawing straight to the MapInteractionCSS div it breaks, so]
        // I am adding elements to a different div first and then moving it onto the canvas

        console.log("removing: ", props.drawSurface.current?.children())
        // svgDestinationObj.current!.children().forEach((c) => {
        //     c.remove();
        // })

        console.log(props.drawSurface.current?.children());
        props.drawSurface.current!.children().forEach((c) => {
            c.clone().addTo(svgDestinationObj.current!)
            c.remove(); 
        });
    }

    useEffect(() => {
        if (props.drawSurface.current) {
            var dim = ConstructSequence();
        }
    }, [props.script])

    useEffect(() => {
        if (props.drawSurface.current) {
            console.log(props.sequenceId)
            MountSequence()
        }
    }, [props.sequenceId])

    function ConstructSequence(extraScript: string=""): {x: number, ys: number[]} {
        var ys: number[] = [];
        
        props.drawSurface.current!.clear();
        svgDestinationObj.current!.clear()

        var toParse = props.script + extraScript;

        var intialChannels = Object.keys(props.handler.sequence.channelsDic).toString();

        try {
            props.handler.parser.parseScript(toParse);
            parseErr.current = "none";
        } catch (e){
            if (e instanceof ScriptError) {
                parseErr.current = e.message;
                
            } else {
                parseErr.current = e as string;
            }
          
            
        }
    
        try {
            props.handler.draw();
        } catch (e) {
            
            drawErr.current = e as string;
            console.error(e)

        }


        for (const c of Object.values(props.handler.sequence.channelsDic)) {
            ys.push(c.barY)
        }

        return {x: props.handler.sequence.width, ys: ys};
    }

    // APPARENTLY the order of these functions changes the order in which the dependancy comparison is done!???!
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
        
        <div id={DRAWCANVASID} style={{}}></div>

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
            
            <DropField sequence={props.handler}></DropField>


            <div id={DESTINATIONVCANVASID} style={{position: "absolute", zIndex: -1}}>
                
            </div>

            
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