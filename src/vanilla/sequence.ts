import { Element, IElement } from "./element";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Positional, { Orientation } from "./positional";
import { Position, ILabel } from "./label";
import SimplePulse, { ISimplePulse } from "./pulses/simple/simplePulse";
import Channel, { IChannel } from "./channel"
import Label from "./label";
import { json } from "stream/consumers";
import Arrow, { HeadStyle } from "./arrow";
import Span from "./span";
import Abstract from "./abstract";
import * as defaultSequence from "./default/data/sequence.json"
import SequenceHandler from "./sequenceHandler";
import Bracket, { Direction, IBracket } from "./bracket";
import { NumberAlias } from "svg.js";
import Section from "./section";
import { FillObject, PartialConstruct } from "./util";
import * as defaultLine from "./default/data/line.json";


interface sequenceInterface {
    padding: number[],
    grid: gridInterface,
    bracket: IBracket
}
export enum GridPositioning {start="start", centre="centre"}

interface gridInterface {
    gridOn: boolean,
    gridPositioning: GridPositioning,
    lineStyle: ILine,
    
}

export interface ILine extends IElement {
    stroke: string,
    strokeWidth: number,
    dashing: [number, number]
}

export class Line extends Element {
    static defaults: {[name: string]: ILine} = {"default": <ILine>defaultLine}

    stroke: string;
    strokeWidth: number;
    dashing: [number, number];

    constructor(params: Partial<ILine>, templateName: string="default") {
        var fullParams: ILine = FillObject(params, Line.defaults[templateName]);
        super(0, 0, fullParams.offset, fullParams.padding)

        this.stroke = fullParams.stroke;
        this.strokeWidth = fullParams.strokeWidth;
        this.dashing = fullParams.dashing;
    }
}

export class Grid {
    gridOn: boolean;
    vLines: {[timestamp: number]: Line} = {};
    style: ILine;
    gridPositioning: GridPositioning;

    constructor(params: gridInterface) {
        this.gridOn = params.gridOn;
        this.style = params.lineStyle;
        this.gridPositioning = params.gridPositioning;
    }

    addLine(line: Line, index: number) {
        this.vLines[index] = line;
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

    channelsDic: {[name: string]: Channel;} = {};
    get channels(): Channel[] {return Object.values(this.channelsDic)}
    get channelNames(): string[] {return Object.keys(this.channelsDic)}

    freeLabels: Label[] = [];
    brackets: {bracketObj: Bracket, startChannel: string, timestamp: number, endChannel?: string}[] = [];

    width: number;
    height: number;  // Excludes padding

    channelWidths: number[]=[];

    padding: number[];
    grid: Grid;

    get sectionWidths(): {[channelName: string]: number[]} {
        var result: {[channelName: string]: number[]} = {};
        var widths: number[][] = Object.values(this.channelsDic).map((c) => c.sectionWidths);
        this.channelNames.forEach((name, i) => {
            result[name] = widths[i];
        })
        return result;
    }  // channelName: sectionWidths
    maxSectionWidths: number[] = [];  // Section widths
    maxTimestampX: number[] = [];
    maxChannelX: number = 0;

    constructor(params: sequenceInterface) {
        this.width = 0;
        this.height = 0;

        this.padding = params.padding;
        
        this.grid = new Grid(params.grid);

        this.channelsDic = {};  // Wierdest bug ever happening here
    }

    reset() {
        Object.values(this.channelsDic).forEach((channel) => {
            channel.positionalElements = []
        })
        
    }

    draw(surface: Svg): {width: number, height: number} {
        var yCurs = 0;
        this.width = 0;
        this.height = 0;

        this.maxChannelX = Math.max(...Object.values(this.channelsDic).map((c) => c.barX))  // The x where all the channels will start

        this.channels.forEach((channel) => {
            channel.draw(surface, this.maxChannelX, this.maxSectionWidths, yCurs);
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
            this.grid.draw(surface, this.maxTimestampX, this.height);
        }

        

        // what?
        return {width: 0, height: 0}
    } 

    addChannel(name: string, channel: Channel) {
        this.channelsDic[name] = channel;

        this.maxChannelX = Math.max(...Object.values(this.channelsDic).map((c) => c.barX))
    }

    // Find the maxSectionWidths and maxTimestampX by comparing maxSections of all channels
    computeSectionDimensions() {
        var max: number[] = [];
        var xBar = this.maxChannelX;
        

        for (const currChannel of Object.values(this.sectionWidths)) {
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

        this.maxSectionWidths = max;

        this.maxTimestampX = [xBar];
        this.maxSectionWidths.forEach((w, i) => {
            this.maxTimestampX.push(w + this.maxTimestampX[i]);
        })

        // 
    }

    addPositional(channelName: string, obj: Positional, index?: number) {
        this.channelsDic[channelName].addPositional(obj, index);

        this.computeSectionDimensions()
    }

    addLabel(channelName: string, obj: Span) {
        this.channelsDic[channelName].addAnnotationLabel(obj);
    }

    addSection(channelName: string, obj: Section, indexRange?: [number, number]) {
        if (indexRange) {obj.indexRange = indexRange};  // Could I not apply this for positionals?

        this.channelsDic[channelName].addSection(obj);
    }

    addVLine(channelName: string, obj: Line, index?: number) {
        var channel: Channel = this.channelsDic[channelName];
        var pos = index ? index : channel.elementCursor + 1;

        this.grid.addLine(obj, pos);
    }

    positionBracket(channelRef: string, bracket: Bracket, timestamp: number) {
        var channel = this.channelsDic[channelRef]
        
        var x: number = this.maxTimestampX[timestamp];
        
        bracket.x = x;
        bracket.y = channel.y;

        bracket.x1 = x;
        bracket.x2 = x;

        bracket.y1 = channel.y + bracket.style.strokeWidth;
        bracket.y2 = channel.barY + channel.style.thickness;
        
    }

    addBracket(channelName: string, bracket: Bracket, index?: number) {
        // Put this here to expand later for multi channel bracket
        var channel = this.channelsDic[channelName];
        var pos = index ? index : channel.elementCursor+1;
        

        this.brackets.push({bracketObj: bracket, startChannel: channelName, timestamp: pos});
    }
}

