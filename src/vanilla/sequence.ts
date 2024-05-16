import { Element } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import { Position, labelInterface } from "./label";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import Channel, { channelInterface } from "./channel"
import Label from "./label";
import { json } from "stream/consumers";
import Arrow, { HeadStyle } from "./arrow";
import Span from "./span";
import Abstract from "./abstract";
import * as defaultSequence from "./default/data/sequence.json"
import SequenceHandler from "./sequenceHandler";
import Bracket, { Direction, bracketInterface } from "./bracket";
import { NumberAlias } from "svg.js";
import Section from "./section";
import { PartialConstruct } from "./util";


interface sequenceInterface {
    padding: number[],
    grid: gridInterface,
    bracket: bracketInterface
}
export enum GridPositioning {start="start", centre="centre"}

interface gridInterface {
    gridOn: boolean,
    gridPositioning: GridPositioning,
    lineStyle: lineInterface,
    
}

export interface lineInterface {
    stroke: string,
    strokeWidth: number,
    dashing: number[]
}

export class Grid {
    gridOn: boolean;
    vLines: {[timestamp: number]: lineInterface} = {};
    style: lineInterface;
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

                    cursX = timestampX[parseInt(timestamp)] ;
                        
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

    channels: {[name: string]: Channel;} = {};

    freeLabels: Label[] = [];
    brackets: {bracketObj: Bracket, startChannel: string, timestamp: number, endChannel?: string}[] = [];

    width: number;
    height: number;  // Excludes padding

    channelWidths: number[]=[];

    padding: number[];
    grid: Grid;


    temporalSections: {[channelName: string]: number[]} = {};
    globalSectionWidths: number[] = [];  // Section widths
    timestampX: number[] = [];

    constructor(params: sequenceInterface) {
        this.width = 0;
        this.height = 0;

        this.padding = params.padding;
        
        this.grid = new Grid(params.grid);

        this.channels = {};  // Wierdest bug ever happening here
    }

    reset() {
        Object.values(this.channels).forEach((channel) => {
            channel.temporalElements = []
        })
        
    }

    draw(surface: Svg): {width: number, height: number} {
        var yCurs = 0;
        this.width = 0;
        this.height = 0;
        

        Object.values(this.channels).forEach((channel) => {
            channel.draw(surface, this.globalSectionWidths, yCurs);
            yCurs = channel.pbounds.bottom;
            
            this.height += channel.pheight;
            this.channelWidths.push(channel.pwidth);
        })
        
        this.freeLabels.forEach((label) => {
            label.draw(surface);
        })
        this.brackets.forEach((brackSpec) => {
            this.positionBracket(brackSpec.startChannel, brackSpec.bracketObj, brackSpec.timestamp)
            brackSpec.bracketObj.draw(surface);
        })

        this.width = Math.max(...this.channelWidths);

        if (this.grid.gridOn) {
            this.grid.draw(surface, this.timestampX, this.height);
        }

        

        // what?
        return {width: 0, height: 0}
    } 

    defineChannel(name: string, args: any) {
        var newChannel = new Channel(args, [0, 0]);

        newChannel.label = PartialConstruct(Label, args.label, Label.defaults["label"]);

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
        var xBar = Object.values(this.channels)[0] === undefined ? 10 : Object.values(this.channels)[0].barX;

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

        this.globalSectionWidths = max;

        
        this.timestampX = [xBar];
        this.globalSectionWidths.forEach((w, i) => {
            this.timestampX.push(w + this.timestampX[i]);
        })
    }

    addTemporal(channelName: string, obj: Temporal) {
        
        var widths = this.channels[channelName].addTemporal(obj);
        this.temporalSections[channelName] = widths;

        this.computeTimespans()
        
    }

    addLabel(channelName: string, obj: Span) {
        this.channels[channelName].addAnnotationLabel(obj);
    }

    addAnnotationLong(channelName: string, obj: Section) {
        
        this.channels[channelName].addAnnotationLong(obj);
    }

    addVLine(channelName: string, obj: lineInterface) {
        var channel: Channel = this.channels[channelName];
        this.grid.vLines[channel.elementCursor+1] = obj;
    }

    positionBracket(channelRef: string, bracket: Bracket, timestamp: number) {
        var channel = this.channels[channelRef]
        
        var x: number = this.timestampX[timestamp];
        
        bracket.x = x;
        bracket.y = channel.y;

        bracket.x1 = x;
        bracket.x2 = x;

        bracket.y1 = channel.y + bracket.style.strokeWidth;
        bracket.y2 = channel.barY + channel.style.thickness;
        
    }

    addBracket(channelName: string, bracket: Bracket, direction: Direction) {
        // Put this here to expand later for multi channel bracket
        var channel = this.channels[channelName];
        bracket.direction = direction;

        this.brackets.push({bracketObj: bracket, startChannel: channelName, timestamp: channel.elementCursor+1});
    }
}

