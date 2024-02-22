import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import { LabelPosition } from "./label";
import Pulse90 from "./default/classes/pulse90";
import Pulse180 from "./default/classes/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import Channel from "./channel"
import ImagePulse from "./pulses/image/imagePulse";
import Aquire from "./default/classes/aquire";
import Label from "./label";
import { json } from "stream/consumers";
import Arrow, { headStyle } from "./arrow";
import Span from "./span";
import ChirpLoHi from "./default/classes/chirpLoHi";
import Abstraction from "./abstraction";
import * as defaultSequence from "./default/data/sequence.json"
import ChirpHiLo from "./default/classes/chirpHiLo";
import SaltireLoHi from "./default/classes/saltireLoHi";
import SaltireHiLo from "./default/classes/saltireHiLo";
import HalfSine from "./default/classes/halfsine";
import SequenceHandler from "./sequenceHandler";

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

export enum gridPositioning {start="start", centre="centre"}
export interface sequenceConfig {
    gridOn: boolean,
    gridStyle: gridStyle
}

interface gridStyle {
    gridPositioning: gridPositioning,
    stroke: string,
    strokeWidth: number,
    dashing: number[] | null
}

export default class Sequence {
    static defaults: sequenceConfig = {...<any>defaultSequence}

    static specialCharacters: string[] = ["#", "~", "/", ">"]
                         
    nmrScript: string;
    surface: Svg;
    channels: {[name: string]: Channel;} = {};
    freeLabels: Label[] = [];

    errors: ScriptSyntaxError[];

    width: number;
    height: number;  // Excludes padding

    padding: number[];
    conf: sequenceConfig;

    temporalSections: {[channelName: string]: number[]} = {};
    maxTimespans: number[] = [];

    constructor(mnrScript: string, surface: Svg, conf: sequenceConfig=Sequence.defaults) {
        this.width = 0;
        this.height = 0;
        this.padding = [0, 0, 0, 0];
        this.conf = conf;

        this.nmrScript = mnrScript;
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
            this.width += channel.width;
        })
        this.freeLabels.forEach((label) => {
            label.draw(this.surface);
        })

        if (this.conf.gridOn) {
            this.drawGrid();
        }
        

        // what?
        return {width: 0, height: 0}
    } 

    defineChannel(name: string, args: any) {
        var newChannel = new Channel(args, [0, 0]);

        newChannel.label = Label.anyArgConstruct(args.label);

        this.channels[name] = newChannel;
    }

    syncChannels(reference: string, targets: any) {
        var referenceChan = this.channels[reference];
        var referenceCurs = referenceChan.elementCursor;

        if (!targets.targets) {
            // Sync all
            Object.keys(this.channels).forEach((val) => {
                if (val !== reference) {
                    this.channels[val].jumpTimespan(referenceCurs-1);
                }
            })
        }
    }

    computeTimespans() {
        var max: number[] = [];

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

    drawGrid() {
        // Line style: 
        var attr = {...this.conf.gridStyle, "stroke-dasharray": this.conf.gridStyle.dashing,
                    "stroke-width": this.conf.gridStyle.strokeWidth}
        
        switch (this.conf.gridStyle.gridPositioning) {
            case gridPositioning.start:
                var cursX = Object.values(this.channels)[0] === undefined ? 10 : Object.values(this.channels)[0].barX;
                this.surface.line(cursX, 0, cursX, this.height)
                    .attr(attr);
                
                // Vertical Lines
                this.maxTimespans.forEach(span => {
                    cursX += span;
                    this.surface.line(cursX, 0, cursX, this.height)
                    .attr(attr);
                    
                });
                break;
            case gridPositioning.centre:
                var cursX = Object.values(this.channels)[0] === undefined ? 10 : Object.values(this.channels)[0].barX;

                // Vertical Lines
                this.maxTimespans.forEach(span => {
                    cursX += span/2;
                    this.surface.line(cursX, 0, cursX, this.height)
                    .attr(attr);
                    // MAKE IT NOT GO THROUGH ELEMENTS
                    cursX += span/2;
                });
                break;
        }
        
    }

    addTemporal(channelName: string, obj: Temporal) {
        var widths = this.channels[channelName].addTemporal(obj);
        this.temporalSections[channelName] = widths;
        
        this.computeTimespans();
    }
}
