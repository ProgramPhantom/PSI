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
import logger, { Operations, Processes } from "./log";

interface ISequence extends ICollection {
    grid: IGrid,
    bracket: IBracket
}


export default class Sequence extends Collection {
    static defaults: {[key: string]: ISequence} = {"default": {...<any>defaultSequence}}

    channelsDic: {[name: string]: Channel;} = {};
    get channels(): Channel[] {return Object.values(this.channelsDic)}
    get channelNames(): string[] {return Object.keys(this.channelsDic)}


    grid: Grid;


    private _maxSectionWidths: number[] = [];  // Section widths
    get maxColumnWidths() { return this._maxSectionWidths }
    set maxColumnWidths(w: number[]) {
        this._maxSectionWidths = w;
    }

    channelColumn: Aligner<Channel>;

    positionalColumns: Aligner<Aligner<Visual>>;
    labelColumn: Aligner<Visual>;

    columns: Aligner<Aligner<Visual>>;

    elementMatrix: (Positional<Visual> | undefined)[][] = [];

    constructor(params: RecursivePartial<ISequence>, templateName: string="default", refName: string="sequence") {
        var fullParams: ISequence = FillObject(params, Sequence.defaults[templateName]);
        super(fullParams, templateName, refName);
        logger.processStart(Processes.INSTANTIATE, ``, this);

        this.grid = new Grid(fullParams.grid);
        this.channelsDic = {};  // Wierdest bug ever happening here

        // c
        // c
        // c
        this.channelColumn = new Aligner<Channel>(
            {bindMainAxis: true, axis: Dimensions.Y, alignment: Alignment.here}, "default", "channel column");
        this.bind(this.channelColumn, Dimensions.Y, "here", "here", undefined, "SEQ Y-> CHAN COL");
        this.bind(this.channelColumn, Dimensions.X, "here", "here", undefined, "SEQ X-> CHAN COL");
        this.add(this.channelColumn);

        // | h | |p|p|p|p|
        this.columns = new Aligner({axis: Dimensions.X, bindMainAxis: true, alignment: Alignment.here}, "default", "label col | pos cols");
        this.bind(this.columns, Dimensions.Y, "here", "here", undefined, "SEQ Y-> COL");
        this.bind(this.columns, Dimensions.X, "here", "here", undefined, "SEQ X-> COL");
        this.add(this.columns);
        


        // | h |
        this.labelColumn = new Aligner<Visual>({axis: Dimensions.Y, bindMainAxis: false, 
                                                        alignment: Alignment.centre, y: 0}, "default", "label column");
        this.columns.add(this.labelColumn);


        // |p|p|p|p|
        this.positionalColumns = new Aligner<Aligner<Visual>>({bindMainAxis: true, axis: Dimensions.X, y: 0}, "default", "pos col collection");
        this.columns.add(this.positionalColumns);
        logger.processEnd(Processes.INSTANTIATE, ``, this);
    }

    reset() {
        this.channelsDic = {};
    }

    draw(surface: Svg): void {
        this.channels.forEach((channel) => {
            channel.draw(surface);
        })
    } 

    insertColumn(index: number) {
        var newColumn: Aligner<Visual> = new Aligner<Visual>({axis: Dimensions.Y, bindMainAxis: false, alignment: Alignment.centre}, 
                                                            "default", `column at ${index}`);

        // Add to positional columns
        this.positionalColumns.add(newColumn, index);

        // Update indices after this new column:
        // Update internal indexes of Positional elements in pos col:
        this.channels.forEach((channel) => {
            channel.shiftIndices(index, 1);
        })

        this.elementMatrix.forEach((c) => {
            c.splice(index, 0, undefined)
        })
    }

    deleteColumn(index: number, ifEmpty: boolean=false): boolean {
        // Update positional indices of elements after this 

        if (ifEmpty === true) {
            if (this.positionalColumns.children[index].children.length === 0) {
                this.positionalColumns.removeAt(index);

                this.channels.forEach((channel) => {
                    channel.shiftIndices(index, -1);
                })
                this.elementMatrix.forEach((c) => {
                    c.splice(index, 1)
                })
                return true
            } else {
                return false
            }
        } else {
            this.positionalColumns.removeAt(index);

            this.channels.forEach((channel) => {
                channel.shiftIndices(index, -1);
            })

            this.elementMatrix.forEach((c) => {
                c.splice(index, 1)
            })
            return true
        }
    }
    // ------------------------

    // Content Commands
    addChannel(name: string, channel: Channel) {
        this.channelColumn.add(channel);
        
        // Set and initialise channel
        this.channelsDic[name] = channel; 

        var index = this.channels.length - 1;
        channel.positionalColumns = this.positionalColumns;  // And apply the column ref
        channel.labelColumn = this.labelColumn;
        

        this.elementMatrix.splice(this.elementMatrix.length, 0, []);

        channel.positionalOccupancy = this.elementMatrix[index];
    }

    addPositional(channelName: string, obj: Positional<Visual>, index?: number, insert: boolean=false) {
        logger.operation(Operations.ADD, `------- ADDING POSITIONAL ${obj.element.refName} -------`, this)

        if (index === undefined) {
            throw new Error("Undefined index undefined");
        }

        var targetChannel: Channel = this.channelsDic[channelName];

        // Need to insert a new column
        if (this.positionalColumns.children[index] === undefined || insert) {
            this.insertColumn(index);
        } else if (insert === false) {
            // Check element is already there
            if (targetChannel.positionalOccupancy[index] !== undefined) {
                throw new Error(`Cannot place element ${obj.element.refName} at index ${index} as it is already occupied.`)
            }
        }
        

        // TODO: figure out inherit width and multi section element (hard)

        // Add the element to the sequence's column collection, this should trigger resizing of bars
        this.positionalColumns.children[index].add(obj.element, undefined, obj._config.alignment);
        // This will set the X of the child ^^^

        // Add element to channel
        targetChannel.addPositional(obj, index, insert);
        // This should set the Y of the element ^^^

        // SET X of element
        this.positionalColumns.children[index].enforceBinding();
        // NOTE: new column already has x set from this.insert column, meaning using this.positionalColumnCollection.children[0]
        // Does not update position of new positional because of the change guards  // TODO: add "force bind" flag


        var channelIndex = this.channels.indexOf(targetChannel);
        this.elementMatrix[channelIndex][index] = obj;
    }

    // Remove column is set to false when modifyPositional is called.
    deletePositional(target: Positional<Visual>, removeColumn: boolean=true): void {
        var channel: Channel | undefined = target.channel;
        var channelIndex: number = this.channels.indexOf(channel);
        var index: number;

        if (target.index === undefined ) {
            throw new Error("Index not initialised");
        }
        index = target.index;

        if (channel === undefined) {
            console.warn("positinal not connected to channel")
            return undefined
        }

        channel.removePositional(target);

        this.elementMatrix[channelIndex][index] = undefined;

        // Remove target from columns 
        try {
            this.positionalColumns.children[target.index!].remove(target.element);
        } catch {
            
        }


        let removed;
        if (removeColumn === true) {
            removed = this.deleteColumn(index, true);
        } 

        if (removed === false) {
            this.elementMatrix[channelIndex][index] = undefined;
        }
    }
}