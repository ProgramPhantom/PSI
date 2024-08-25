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
import Aligner from "./aligner";
import { Alignment } from "./positional";

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

    channelColumn: Aligner<Channel>;

    positionalColumns: Aligner<Aligner<Visual>>;
    labelColumn: Aligner<Visual>;

    columns: Aligner<Aligner<Visual>>;

    constructor(params: RecursivePartial<ISequence>, templateName: string="default", refName: string="sequence") {
        var fullParams: ISequence = FillObject(params, Sequence.defaults[templateName]);
        super(fullParams, templateName, refName);

        this.grid = new Grid(fullParams.grid);
        this.channelsDic = {};  // Wierdest bug ever happening here

        // c
        // c
        // c
        this.channelColumn = new Aligner<Channel>(
            {bindMainAxis: true, axis: Dimensions.Y, alignment: Alignment.here}, "default", "channel column");
        this.bind(this.channelColumn, Dimensions.Y, "here", "here", undefined, true);
        this.bind(this.channelColumn, Dimensions.X, "here", "here", undefined, true);
        this.add(this.channelColumn);

        // | h | |p|p|p|p|
        this.columns = new Aligner({axis: Dimensions.X, bindMainAxis: true}, "default", "label col | pos cols");
        this.bind(this.columns, Dimensions.Y, "here", "here", undefined, true);
        this.bind(this.columns, Dimensions.X, "here", "here", undefined, true);
        this.add(this.columns);


        // | h |
        this.labelColumn = new Aligner<Visual>({axis: Dimensions.Y, bindMainAxis: false, 
                                                        alignment: Alignment.centre}, "default", "label column");
        this.columns.add(this.labelColumn);


        // |p|p|p|p|
        this.positionalColumns = new Aligner<Aligner<Visual>>({bindMainAxis: true, axis: Dimensions.X}, "default", "pos col collection");
        this.columns.add(this.positionalColumns);
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

        if ("dev mode" === "dev mode" && this.channels.length >= 1) {
            // this.labelColumn.devDraw(surface);
            // // this.positionalColumns.devDraw(surface);
// 
            this.positionalColumns.children.forEach((c) => {
                c.devDraw(surface, "green")
            })

            // this.channels.forEach((c) => {
            //     c.upperAligner.devDraw(surface, "orange");
            //     c.lowerAligner.devDraw(surface, "orange");
            // })

            this.devDraw(surface, "cyan");

            this.channels.forEach((c) => {
                c.devDraw(surface, "amber")
            })
        }
        
        // what?
        return {width: 0, height: 0}
    } 

    insertColumn(index: number) {
        console.log(`column at ${index}`)
        var newColumn: Aligner<Visual> = new Aligner<Visual>({axis: Dimensions.Y, bindMainAxis: false, alignment: Alignment.centre}, 
                                                            "default", `column at ${index}`);

        this.positionalColumns.add(newColumn, index);

        // Shift occupancy
        this.channels.forEach((c) => {
            c.occupancy.splice(index, 0, false);
        })
    }
    // ------------------------

    // Content Commands
    addChannel(name: string, channel: Channel) {
        this.channelColumn.add(channel);
        
        // Set and initialise channel
        this.channelsDic[name] = channel; 
        channel.positionalColumns = this.positionalColumns;  // And apply the column ref
        channel.labelColumn = this.labelColumn;
    }

    addPositional(channelName: string, obj: Positional<Visual>, index?: number | undefined, insert: boolean=false) {
        
        if (index !== undefined) {
            if (insert) {
                this.insertColumn(index);
            } 
        } else {  // Auto index
            index = this.channelsDic[channelName].elementCursor + 1;

            if (insert) {
                this.insertColumn(index);  // Insert at end 
            }  
            else {  
                if (index > this.positionalColumns.children.length-1) {  // Add to end
                    this.insertColumn(index);  // Not needed if index already has columns set up for it.
                }
            }
        }

        // TODO: figure out inherit width and multi section element (hard)

        // Add the element to the sequence's column collection, this should trigger resizing of bars
        this.positionalColumns.children[index].add(obj.element, undefined, obj.config.alignment);

        // Add element to channel
        this.channelsDic[channelName].addPositional(obj, index, insert);

        // SET X of element
        this.positionalColumns.children[index].enforceBinding();
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

