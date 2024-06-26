import { Visual, IVisual } from "./visual";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Positional, { Orientation } from "./positional";
import { Position, ILabel } from "./label";
import Channel, { IChannel } from "./channel"
import Label from "./label";
import { json } from "stream/consumers";
import Arrow, { HeadStyle } from "./arrow";
import Span from "./span";
import Abstract from "./abstract";
import defaultSequence from "./default/data/sequence.json"
import SequenceHandler from "./sequenceHandler";
import Bracket, { Direction, IBracket } from "./bracket";
import { NumberAlias } from "svg.js";
import Section from "./section";
import { FillObject, PartialConstruct, RecursivePartial } from "./util";
import { ILine, Line } from "./line";
import { Grid, IGrid } from "./grid";
import Spacial, { Dimensions } from "./spacial";
import Collection, { ICollection } from "./collection";
import PaddedBox from "./paddedBox";
import { Alignment } from "@blueprintjs/core";
import Aligner from "./aligner";


interface ISequence extends ICollection {
    grid: IGrid,
    bracket: IBracket
}


export default class Sequence extends Collection {
    static defaults: {[key: string]: ISequence} = {"default": {...<any>defaultSequence}}

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

    columnCollection: Aligner<Aligner<Visual>> = new Aligner({bindChildren: true, dimension: Dimensions.X}, "default", "pos col collection");

    channelLabelColumn: Spacial;

    constructor(params: RecursivePartial<ISequence>, templateName: string="default", refName: string="sequence") {
        
        var fullParams: ISequence = FillObject(params, Sequence.defaults[templateName]);
        super(fullParams, templateName, refName);

        this.grid = new Grid(fullParams.grid);


        this.channelsDic = {};  // Wierdest bug ever happening here

    
        this.channelLabelColumn = new Spacial(0, undefined, 0, undefined, "channelLabelColumn");
        this.bind(this.channelLabelColumn, Dimensions.X, "here", "here");

        this.columnCollection.add(new Aligner<Visual>({width: 0}, "default", "initial pos column"));   // Initial column
        this.channelLabelColumn.bind(this.columnCollection.children[0], Dimensions.X, "far", "here");
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
    // challengeWidth(width: number, index: number) {
    //     var existingWidth = this.columnCollection.children[index].contentWidth;
    //     if (width > (existingWidth !== undefined ? existingWidth : 0)) {
    //         this.columnCollection.children[index].contentWidth = width;
    //     }
    // }

    challengeLabelWidth(width: number) {
        if (width > this.channelLabelColumn.width) {
            this.channelLabelColumn.contentWidth = width;
        }
    }

    insertColumn(index: number) {

        var newColumn: Aligner<Visual>;
        //if (this.columnCollection.children.length === 1 && index === 0) {  // Inserting at 0
        //    newColumn = this.columnCollection.children.pop()!;
        //} else {
            newColumn = new Aligner<Visual>({dimension: Dimensions.Y}, "default", `column at ${index}`);
        //}
        
        var preColumn: Spacial | undefined = this.columnCollection.children[index - 1];
        var postColumn: Spacial | undefined = this.columnCollection.children[index];


        if (!preColumn) { // insert at start, bind to channelLabelColumn
            this.channelLabelColumn.bind(newColumn, Dimensions.X, "far", "here");
            this.channelLabelColumn.enforceBinding();
        } else {  // There is a column infront of this column (to the right)
            preColumn.bind(newColumn, Dimensions.X, "far", "here");
            preColumn.enforceBinding();
        }

        if (postColumn) {
            newColumn.bind(postColumn, Dimensions.X, "far", "here");
            newColumn.enforceBinding();
        }


        this.columnCollection.add(newColumn, index);
    }
    // ------------------------

    // Content Commands
    addChannel(name: string, channel: Channel) {
        // Bindings for Y:
        if (this.channels.length > 0) {  // If second channel or more, bind to channel abve.
            var channelAbove = this.channels[this.channels.length-1];

            // BIND Y
            channelAbove.bind(channel, Dimensions.Y, "far", "here");
            channelAbove.enforceBinding();
        } else {
            
            this.bind(channel, Dimensions.Y, "here", "here");
        }  // Or bind to top (PADDING DOES NOT WORK HERE, need to bind to content height...)

        // Bind channel (is this needed?)
        this.bind(channel, Dimensions.X, "here", "here");  // Or bind to channelLabelColumn?
        this.enforceBinding();
        
        // Set and initialise channel
        this.channelsDic[name] = channel;  
        channel.posColumnCollection = this.columnCollection;  // And apply the column ref
        channel.labelColumn = this.channelLabelColumn;

        this.challengeLabelWidth(channel.label ? channel.label.width : 0);
        

        this.add(channel);
    }

    addPositional(channelName: string, obj: Positional<Visual>, index?: number | undefined, insert: boolean=false) {
        
        if (index !== undefined) {
            if (insert) {
                this.insertColumn(index);
            } 
        } else {  // Auto index
            index = this.channelsDic[channelName].elementCursor + 1;

            if (insert) {
                this.insertColumn(index);
            }  else {  
                if (index > this.columnCollection.children.length-1) {  // Add to end
                    this.insertColumn(index);  // Not needed if index already has columns set up for it.
                }
            }
        }

        // Add the element to the sequence's column collection, this should trigger resizing of bars
        this.columnCollection.children[index].add(obj.element);

        // Add element to channel
        this.channelsDic[channelName].addPositional(obj, index, insert);

        // SET X of element
        this.columnCollection.children[index].enforceBinding();
        // NOTE: new column already has x set from this.insert column, meaning using this.positionalColumnCollection.children[0]
        // Does not update position of new positional because of the change guards  // TODO: add "force bind" flag
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

