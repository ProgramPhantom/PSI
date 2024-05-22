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
import { ILine } from "./line";


interface sequenceInterface {
    padding: number[],
    grid: gridInterface,
    bracket: IBracket
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
            
            this.height += channel.height;
            this.channelWidths.push(channel.width);
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

        var y = channel.y + bracket.style.strokeWidth;
        var y2 = channel.barY + channel.style.thickness;
        
        bracket.set(x, y, x, y2);
    }

    addBracket(channelName: string, bracket: Bracket, index?: number) {
        // Put this here to expand later for multi channel bracket
        var channel = this.channelsDic[channelName];
        var pos = index ? index : channel.elementCursor+1;
        

        this.brackets.push({bracketObj: bracket, startChannel: channelName, timestamp: pos});
    }
}

