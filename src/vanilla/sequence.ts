import { Element, IElement } from "./element";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Positional, { Orientation } from "./positional";
import { Position, ILabel } from "./label";
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
import { ILine, Line } from "./line";
import { Grid, IGrid } from "./grid";
import Spacial, { Dimensions } from "./spacial";
import Collection from "./collection";
import PaddedBox from "./paddedBox";


interface sequenceInterface {
    padding: number[],
    grid: IGrid,
    bracket: IBracket
}


export default class Sequence extends PaddedBox {
    static defaults: {[key: string]: sequenceInterface} = {"empty": {...<any>defaultSequence}}

    channelsDic: {[name: string]: Channel;} = {};
    get channels(): Channel[] {return Object.values(this.channelsDic)}
    get channelNames(): string[] {return Object.keys(this.channelsDic)}

    freeLabels: Label[] = [];
    brackets: {bracketObj: Bracket, startChannel: string, timestamp: number, endChannel?: string}[] = [];

    channelWidths: number[]=[];

    grid: Grid;

    get sectionWidths(): {[channelName: string]: number[]} {
        var result: {[channelName: string]: number[]} = {};
        var widths: number[][] = Object.values(this.channelsDic).map((c) => c.sectionWidths);
        this.channelNames.forEach((name, i) => {
            result[name] = widths[i];
        })
        return result;
    }  // channelName: sectionWidths
    maxColumnX: number[] = [];
    maxChannelX: number = 0;

    private _maxSectionWidths: number[] = [];  // Section widths
    get maxColumnWidths() { return this._maxSectionWidths }
    set maxColumnWidths(w: number[]) {
        this._maxSectionWidths = w;
    }

    positionalColumns: Spacial[];
    channelLabelColumn: Spacial;

    constructor(params: sequenceInterface) {
        super([0, 0], 0, 0, 0);
        this.grid = new Grid(params.grid);

        this.contentWidth = 0;
        this.contentHeight = 0;

        this.channelsDic = {};  // Wierdest bug ever happening here

        

        this.channelLabelColumn = new Spacial(0, undefined, 0, undefined, "channelLabelColumn");
        this.bind(this.channelLabelColumn, Dimensions.X, "here", "here");

        this.positionalColumns = [new Spacial(0, undefined, 0, undefined, "initial positional column")];
        this.channelLabelColumn.bind(this.positionalColumns[0], Dimensions.X, "far", "here");
    }

    reset() {
        this.channelsDic = {};
        
    }

    resolveDimensions(): {width: number, height: number} {
        var height = 0;
        this.channels.forEach((c) => {
            height += c.height;
        })

        var width = Math.max(...this.channelWidths);
        var h1 = height;

        return {width: width, height: h1}
    }

    draw(surface: Svg): {width: number, height: number} {
        this.channels.forEach((channel) => {
            channel.draw(surface);
        })
        
        this.freeLabels.forEach((label) => {
            label.draw(surface);
        })

        this.brackets.forEach((brackSpec) => {
            this.positionBracket(brackSpec.startChannel, brackSpec.bracketObj, brackSpec.timestamp)
            brackSpec.bracketObj.draw(surface);
        })

        if (this.grid.gridOn) {
            this.grid.draw(surface, this.maxColumnX, this.height);
        }

        
        // what?
        return {width: 0, height: 0}
    } 

    // ------ MOVE STACK ------
    challengeWidth(width: number, index: number) {
        var existingWidth = this.positionalColumns[index].contentWidth;
        if (width > (existingWidth !== undefined ? existingWidth : 0)) {
            this.positionalColumns[index].contentWidth = width;
        }
    }

    challengeLabelWidth(width: number) {
        if (width > this.channelLabelColumn.width) {
            this.channelLabelColumn.contentWidth = width;
        }
    }

    insertColumn(index: number, width: number) {
        var newColumn: Spacial;
        if (this.positionalColumns.length === 1) {
            newColumn = this.positionalColumns.pop()!;
        } else {
            newColumn = new Spacial(x, undefined, width, undefined);
        }
        
        var preColumn: Spacial | undefined = this.positionalColumns[index - 1];
        var postColumn: Spacial | undefined = this.positionalColumns[index];

        var x;

        if (!preColumn) { // insert at start, bind to channelLabelColumn
            this.channelLabelColumn.bind(newColumn, Dimensions.X, "far", "here");
        } else {
            preColumn.bind(newColumn, Dimensions.X, "far", "here");
        }

        if (postColumn) {
            newColumn.bind(postColumn, Dimensions.X, "far", "far");
        }

        this.enforceBinding();

        this.positionalColumns.splice(index, 0, newColumn);
    }
    // ------------

    // Content Commands
    addChannel(name: string, channel: Channel) {
        if (this.channels.length > 0) {  // If second channel or more, bind to channel abve.
            var channelAbove = this.channels[this.channels.length-1];

            // BIND Y
            channelAbove.bind(channel, Dimensions.Y, "far", "here");
        } else {
            console.log("bound to the sequence")
            this.bind(channel, Dimensions.Y, "here", "here");
        }  // Or bind to top (PADDING DOES NOT WORK HERE, need to bind to content height...)
        this.bind(channel, Dimensions.X, "here", "here");  // Or bind to channelLabelColumn?
        

        this.channelsDic[name] = channel;  // Set
        channel.columnRef = this.positionalColumns;  // And apply the column ref
        channel.labelColumn = this.channelLabelColumn;

        this.challengeLabelWidth(channel.label ? channel.label.width : 0);
        this.enforceBinding();
    }

    addPositional(channelName: string, obj: Positional<Element>, index?: number | undefined, insert: boolean=false) {
        
        console.log(index)  // Work needs doing here.
        if (index !== undefined) {
            if (insert) {
                this.insertColumn(index, obj.element.width);
            } 
        } else {  // Auto index
            index = this.channelsDic[channelName].elementCursor + 1;

            if (insert) {
                this.insertColumn(index, obj.element.width);
            }  else {  
                if (index >= this.positionalColumns.length) {  // Add to end
                    this.insertColumn(index, obj.element.width);
                }
            }
        }

        console.log(index)

        
        // Bind first
        this.channelsDic[channelName].addPositional(obj, index);

        this.challengeWidth(obj.element.width, index);
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
        
        var x: number = this.maxColumnX[timestamp];

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

