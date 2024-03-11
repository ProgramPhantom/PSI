import React, {useEffect, useState, useRef, useLayoutEffect} from 'react'
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Channel from './vanilla/channel';
import { channelInterface, channelStyle } from './vanilla/channel';
import Sequence from "./vanilla/sequence";
import SequenceHandler from './vanilla/sequenceHandler';
import TokenType from "./vanilla/sequenceHandler"
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MapInteractionCSS } from 'react-map-interaction';


const DRAWCANVASID = "drawDiv";
const DESTINATIONVCANVASID = "destinationDiv";


const DRAWSVGID = "drawSVGHere";
const DESTINATIONSVGID = "moveSVGHere";

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 200;

const BUTTON_PAD = [15, 0];

export default function Canvas(props:  {script: string, zoom: number, handler: SequenceHandler, updateChannels: (c: string[]) => void}) {
    const svgDrawObj = useRef<Svg>();
    const svgDestinationObj = useRef<Svg>();


    var [buttonX, setButtonX] = useState<number>(0);
    var [buttonYs, setButtonYs] = useState<number[]>([]);


    useLayoutEffect(() => {
        var drawSurface = document.getElementById(DRAWSVGID);
        var destinationSurface = document.getElementById(DRAWSVGID);
        var div = document.getElementById(DRAWCANVASID);
        if (svgDrawObj.current === undefined || svgDestinationObj.current === undefined) {
            if (drawSurface !== null || destinationSurface !== null) {
                svgDrawObj.current = new Svg(drawSurface!.outerHTML);
                svgDestinationObj.current = new Svg(destinationSurface!.outerHTML);
            } else {
                var drawSvg = SVG().addTo("#" + DRAWCANVASID).size("800px", "400px").attr({id: DRAWSVGID});
                svgDrawObj.current = drawSvg;

                var destinationSvg = SVG().addTo("#" + DESTINATIONVCANVASID).size("800px", "400px").attr({id: DESTINATIONSVGID});
                svgDestinationObj.current = destinationSvg;
            }
        } 
    }, [svgDrawObj, svgDestinationObj])

    

    
    if (svgDrawObj.current) {


        var dim = ConstructSequence();
    }

    function ConstructSequence(extraScript: string=""): {x: number, ys: number[]} {
        var ys: number[] = [];
        
        svgDrawObj.current!.clear();
        svgDestinationObj.current!.clear()

        var toParse = props.script + extraScript;
        props.handler.script = toParse;

        var intialChannels = Object.keys(props.handler.sequence.channels).toString();

        console.log(svgDrawObj.current);
        console.log(svgDestinationObj.current);
        
        try {
            props.handler.parseScript(props.handler.script);
        } catch (e){
            console.log(e)
        }
    
        try {
            props.handler.draw(svgDrawObj.current!);
        } catch (e) {
            console.log(e)
        }
        
        for (const c of Object.values(props.handler.sequence.channels)) {
            ys.push(c.barY)
        }

        var canvasWidth = props.handler.sequence.width;
        var canvasHeight = props.handler.sequence.height;

        svgDrawObj.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        svgDestinationObj.current!.size(`${canvasWidth}px`, `${canvasHeight}px`)
        svgDrawObj.current!.rect().attr({fill: "none", stroke: "black", "stroke-width": "1px", "width": "100%", "height": "100%"})
        // svgObj.current!.viewbox(0, 0, canvasWidth, canvasHeight)

        svgDrawObj.current!.children().forEach((c) => {
            console.log(c);
            c.addTo(svgDestinationObj.current!)
        }
        );



        // svgDestinationObj.current!.replace(svgDrawObj.current!);
        // svgDrawObj.current!.clear();

        return {x: props.handler.sequence.width, ys: ys};
    }

    // APPARENTLY the order of these functions changes the order in which the dependancy comparison is done!???!
    useEffect(() => {
        props.updateChannels(Object.keys(props.handler.sequence.channels))
        console.log(Object.keys(props.handler.sequence.channels))
    }, [Object.keys(props.handler.sequence.channels).join()])


    return (
        <>
        <div id={DRAWCANVASID} style={{width: "0", height: "0", visibility: "hidden"}}></div>
        
        <MapInteractionCSS
            showControls
            defaultValue={{
                scale: 1,
                translation: { x: 0, y: 0 }
            }}
            minScale={0.5}
            maxScale={3}
            translationBounds={{
                yMin: 0,
                xMin: -props.handler.sequence.width * 3 + 50,

                xMax: props.handler.sequence.width,
                yMax: props.handler.sequence.height
            }}
            >
            <div id={DESTINATIONVCANVASID} style={{objectFit: "contain"}}>
                
            </div>
        </MapInteractionCSS>
        
        </>
    )
}



/*
<TransformWrapper>
            <TransformComponent>
                <div id={DESTINATIONVCANVASID} style={{objectFit: "contain", width: "100%", height: "100%", minHeight: "600px"}}>
                
                </div>
            </TransformComponent>
        </TransformWrapper>

*/ 