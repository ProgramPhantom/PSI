import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import { Position, labelInterface } from "./label";
import Pulse90 from "./default/classes/pulse90";
import Pulse180 from "./default/classes/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import Channel, { channelInterface } from "./channel"
import ImagePulse from "./pulses/image/imagePulse";
import Aquire from "./default/classes/aquire";
import Label from "./label";
import { json } from "stream/consumers";
import Arrow, { HeadStyle } from "./arrow";
import Span from "./span";
import ChirpLoHi from "./default/classes/chirpLoHi";
import Abstract from "./abstract";
import * as defaultSequence from "./default/data/sequence.json"
import ChirpHiLo from "./default/classes/chirpHiLo";
import SaltireLoHi from "./default/classes/saltireLoHi";
import SaltireHiLo from "./default/classes/saltireHiLo";
import HalfSine from "./default/classes/halfsine";
import SequenceHandler from "./sequenceHandler";
import Bracket from "./bracket";
import { NumberAlias } from "svg.js";

enum SyntaxErrorType {
    INVALID_COMMAND_CHARACTER = "INVALID_CHANNEL_IDENTIFIER" ,
    INVALID_CHANNEL_IDENTIFIER = "INVALID_COMMAND_CHARACTER",
    INVALID_CHANNEL_COMMAND = "INVALID_CHANNEL_COMMAND",
    CHANNEL_IDENTIFIER_UNDEFINED = "CHANNEL_IDENTIFIER_UNDEFINED",
    TEX_TAG_NOT_CLOSED = "TEX_TAG_NOT_CLOSED",
    MISSING_BRACKETS = "MISSING_BRACKETS",
    ARGUMENT_ERROR = "ARGUMENT_ERROR",
    EXPRESSION_NO_EFFECT = "EXPRESSION_NO_EFFECT",
    NULL_LINE="NULL_LINE",
}


export class ScriptSyntaxError extends Error {
    errType: SyntaxErrorType;
    cause: any;

    constructor(errType: SyntaxErrorType, message: string, cause?: any) {
        super(message);
        this.errType = errType;
        this.cause = cause;
    }
}

export enum GridPositioning {start="start", centre="centre"}

interface sequenceInterface {
    padding: number[],
    grid: gridInterface
}
interface gridInterface {
    gridOn: boolean,
    gridPositioning: GridPositioning,
    lineStyle: Line,
}

export interface Line {
    stroke: string,
    strokeWidth: number,
    dashing: number[]
}

export class Grid {
    gridOn: boolean;
    vLines: {[timestamp: number]: Line} = {};
    style: Line;
    gridPositioning: GridPositioning;

    constructor(params: gridInterface) {
        this.gridOn = params.gridOn;
        this.style = params.lineStyle;
        this.gridPositioning = params.gridPositioning;
        
    }

    draw(surface: Svg, timestampX: number[], height: number) {
        var attr: any;

       

        switch (this.gridPositioning) {
            case GridPositioning.start:
                var cursX = timestampX[0];
                
                for (const [timestamp, line] of Object.entries(this.vLines)) {
                    attr = {"stroke-width": line.strokeWidth,
                            "stroke-dasharray": line.dashing,
                            "stroke": line.stroke}

                    cursX = timestampX[parseInt(timestamp)];
                        
                    surface.line(cursX, 0, cursX, height)
                    .attr(attr);
                    
                    
                }
                
                break;
            case GridPositioning.centre:
                var cursX = timestampX[0];

                for (const [timestamp, line] of Object.entries(this.vLines)) {
                    attr = {"stroke-width": line.strokeWidth,
                            "stroke-dasharray": line.dashing,
                            "stroke": line.stroke}

                    cursX = timestampX[parseInt(timestamp)];
                    var width = timestampX[parseInt(timestamp)+1] - timestampX[parseInt(timestamp)];
                        
                    cursX += width/2;
                    surface.line(cursX, 0, cursX, height)
                    .attr({...line});
                   
                }

                break;
            default: 
                
                throw Error;
            }
    }
}

export default class Sequence {
    static defaults: {[key: string]: sequenceInterface} = {"empty": {...<any>defaultSequence}}

    surface: Svg;
    channels: {[name: string]: Channel;} = {};
    freeLabels: Label[] = [];

    errors: ScriptSyntaxError[];

    width: number;
    height: number;  // Excludes padding

    channelWidths: number[]=[];

    padding: number[];
    grid: Grid;

    temporalSections: {[channelName: string]: number[]} = {};
    maxTimespans: number[] = [];
    timestampX: number[] = [];

    constructor(surface: Svg, params: sequenceInterface) {
        this.width = 0;
        this.height = 0;

        this.padding = params.padding;
        
        this.grid = new Grid(params.grid);

        this.surface = surface; 
        this.channels = {};  // Wierdest bug ever happening here

        this.errors = [];
    }
    

    draw(): {width: number, height: number} {
        var yCurs = 0;
        var dim = {width: 0, height: 0}

        Object.values(this.channels).forEach((channel) => {
            channel.draw(this.surface, this.maxTimespans, yCurs);
            yCurs = channel.bounds.bottom;
            
            this.height += channel.height;
            this.channelWidths.push(channel.width);

        })
        this.freeLabels.forEach((label) => {
            label.draw(this.surface);
        })

        this.width = Math.max(...this.channelWidths);

        var xBar = Object.values(this.channels)[0] === undefined ? 10 : Object.values(this.channels)[0].barX;
        
        this.timestampX.push(xBar);
        this.maxTimespans.forEach((t, i) => {
            this.timestampX.push(t + this.timestampX[i])
        })

        if (this.grid.gridOn) {
            
            this.grid.draw(this.surface, this.timestampX, this.height);
        }

        // what?
        return {width: 0, height: 0}
    } 

    defineChannel(name: string, args: any) {
        var newChannel = new Channel(args, [0, 0]);

        newChannel.label = Label.anyArgConstruct(Label.defaults["label"], args.label);

        this.channels[name] = newChannel;
    }

    syncOn(reference: string, targets: any) {
        var referenceChan = this.channels[reference];
        var referenceCurs = referenceChan.elementCursor;

        

        if (!targets) {
            // Sync all
            Object.keys(this.channels).forEach((val) => {
                if (val !== reference) {
                    this.channels[val].jumpTimespan(referenceCurs-1);
                }
            })
        }
    }

    syncNext(reference: string, targets: any) {
        var referenceChan = this.channels[reference];
        var referenceCurs = referenceChan.elementCursor;

        

        if (!targets) {
            // Sync all
            Object.keys(this.channels).forEach((val) => {
                if (val !== reference) {
                    this.channels[val].jumpTimespan(referenceCurs);
                }
            })
        }
    }

    computeTimespans() {
        var max: number[] = [];
        var xBar = 0;

        for (const currChannel of Object.values(this.temporalSections)) {
            
            for (var i = 0; i < currChannel.length; i++) {
                if (i < max.length) { // If this isn't new territory
                    if (currChannel[i] > max[i]) {
                        max[i] = currChannel[i];
                    }
                } else {
                    max.push(currChannel[i]);
                }
            }
        }

        this.maxTimespans = max;

        
        

    }

    addTemporal(channelName: string, obj: Temporal) {
        var widths = this.channels[channelName].addTemporal(obj);
        this.temporalSections[channelName] = widths;

        this.computeTimespans()
        console.log(this.temporalSections)
    }

    addLabel(channelName: string, obj: Label) {
        this.channels[channelName].addAnnotationLabel(obj);
    }

    addAnnotationLong(channelName: string, obj: Bracket) {
        
        this.channels[channelName].addAnnotationLong(obj);
    }

    addVLine(channelName: string, obj: Line) {
        var channel: Channel = this.channels[channelName];

        

        this.grid.vLines[channel.elementCursor+1] = obj;
    }
}
