import React, {useEffect, useState, useRef, useLayoutEffect} from 'react'
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Channel from './vanilla/channel';
import { channelInterface, channelStyle } from './vanilla/channel';
import Sequence from "./vanilla/sequence";
import SequenceHandler from './vanilla/sequenceHandler';
import TokenType from "./vanilla/sequenceHandler"

const CANVASID = "canvasDiv";
const SVGID = "svgSurface"

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 200;

const BUTTON_PAD = [15, 0];

export default function Canvas(props:  {script: string, zoom: number, handler: SequenceHandler, updateChannels: (c: string[]) => void}) {
    const svgObj = useRef<Svg>();


    var [buttonX, setButtonX] = useState<number>(0);
    var [buttonYs, setButtonYs] = useState<number[]>([]);


    useLayoutEffect(() => {
        var svgSurface = document.getElementById(SVGID);
        var div = document.getElementById(CANVASID);
        if (svgObj.current === undefined) {
            if (svgSurface !== null) {
                svgObj.current = new Svg(svgSurface!.outerHTML);
            } else {
                var svg = SVG().addTo("#" + CANVASID).size("800px", "400px").attr({id: SVGID});
                svgObj.current = svg;
            }
        } 
    }, [svgObj])

    useEffect(() => {
        

        
    })

    
    if (svgObj.current) {
        var dim = ConstructSequence();
    }

    function ConstructSequence(extraScript: string=""): {x: number, ys: number[]} {
        var ys: number[] = [];
        
        svgObj.current!.clear();

        var toParse = props.script + extraScript;
        props.handler.script = toParse;

        var intialChannels = Object.keys(props.handler.sequence.channels).toString();
        
        try {
            props.handler.parseScript(props.handler.script);
            
        } catch (e){
            
        }
        
        try {
            
            props.handler.draw(svgObj.current!);
            
        } catch (e) {
            
        }

        var newChannels = Object.keys(props.handler.sequence.channels);
        if (intialChannels !== newChannels.toString()) {
            props.updateChannels(Object.keys(props.handler.sequence.channels))
            
            // Does extra render but idk how to make this work
        }
        
        for (const c of Object.values(props.handler.sequence.channels)) {
            ys.push(c.barY)
        }

        var canvasWidth = props.handler.sequence.width;
        var canvasHeight = props.handler.sequence.height;

        svgObj.current!.size(`${canvasWidth*props.zoom}px`, `${canvasHeight*props.zoom}px`)
        svgObj.current!.rect().attr({fill: "none", stroke: "black", "stroke-width": "1px", "width": "100%", "height": "100%"})
        svgObj.current!.viewbox(0, 0, canvasWidth, canvasHeight)

        return {x: props.handler.sequence.width, ys: ys};
    }

    function Add90() {
        var dim = ConstructSequence("\nc.pulse90()");
        setButtonX(dim.x * props.zoom + BUTTON_PAD[0]);
        setButtonYs(dim.ys.map((n) => n * props.zoom + BUTTON_PAD[1]));
    }


    return (
        <>
            <div id={"canvasDiv"} style={{minHeight: 400}}>
                <button style={{top: `${buttonYs[0]}px`, left: `${buttonX}px`, position: "absolute"}} onClick={() => Add90()}>+</button>
            </div>
        </>
    )
}