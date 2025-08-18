import { Visual, IVisual } from "./visual";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import { Position, IText } from "./text";
import Channel, { IChannel } from "./channel"
import Text from "./text";
import { json } from "stream/consumers";
import Arrow, { HeadStyle } from "./arrow";
import Abstract from "./abstract";
import defaultSequence from "./default/data/sequence.json"
import SequenceHandler from "./sequenceHandler";
import { NumberAlias } from "svg.js";
import { FillObject, PartialConstruct, RecursivePartial } from "./util";
import { ILine, Line } from "./line";
import { Grid, IGrid } from "./grid";
import Spacial, { Dimensions } from "./spacial";
import Collection, { ICollection } from "./collection";
import PaddedBox from "./paddedBox";
import Aligner from "./aligner";
import logger, { Operations, Processes } from "./log";
import { defaultNewIndexGetter } from "@dnd-kit/sortable";
import { Alignment } from "./mountable";

interface ISequence extends ICollection {
    grid: IGrid,
    bracket: undefined
}


export default class Sequence extends Collection {
    static defaults: {[key: string]: ISequence} = {"default": {...<any>defaultSequence}}

    channelsDic: {[name: string]: Channel;} = {};
    get channels(): Channel[] {return Object.values(this.channelsDic)}
    get channelIDs(): string[] {return Object.keys(this.channelsDic)}


    grid: Grid;


    private _maxSectionWidths: number[] = [];  // Section widths
    get maxColumnWidths() { return this._maxSectionWidths }
    set maxColumnWidths(w: number[]) {
        this._maxSectionWidths = w;
    }

    channelColumn: Aligner<Channel>;

    pulseColumns: Aligner<Aligner<Visual>>;
    labelColumn: Aligner<Visual>;

    columns: Aligner<Aligner<Visual>>;

    elementMatrix: (Visual | undefined)[][] = [];

    constructor(params: RecursivePartial<ISequence>, templateName: string="default") {
        var fullParams: ISequence = FillObject(params, Sequence.defaults[templateName]);
        super(fullParams, templateName);
        logger.processStart(Processes.INSTANTIATE, ``, this);

        this.grid = new Grid(fullParams.grid);
        this.channelsDic = {};  // Wierdest bug ever happening here

        // c
        // c
        // c
        this.channelColumn = new Aligner<Channel>(
            {bindMainAxis: true, axis: "y", alignment: Alignment.here, ref: "channel column"}, "default", );
        // this.bind(this.channelColumn, "y", "here", "here", undefined, "SEQ Y-> CHAN COL");
        // this.bind(this.channelColumn, "x", "here", "here", undefined, "SEQ X-> CHAN COL");
        this.add(this.channelColumn, undefined, true);

        // | h | |p|p|p|p|
        this.columns = new Aligner({axis: "x", bindMainAxis: true, alignment: Alignment.here, ref: "label col | pulse columns"}, "default");
        // this.bind(this.columns, "y", "here", "here", undefined, "SEQ Y-> COL");
        // this.bind(this.columns, "x", "here", "here", undefined, "SEQ X-> COL");
        this.add(this.columns, undefined, true);
        


        // | h |
        this.labelColumn = new Aligner<Visual>({axis: "y", bindMainAxis: false, 
                                                        alignment: Alignment.centre, y: 0, ref: "label column"}, "default",);
        this.columns.add(this.labelColumn);


        // |p|p|p|p|
        this.pulseColumns = new Aligner<Aligner<Visual>>({bindMainAxis: true, axis: "x", y: 0, ref: "pulse columns"}, "default", );
        this.columns.add(this.pulseColumns);
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
        var newColumn: Aligner<Visual> = new Aligner<Visual>({axis: "y", bindMainAxis: false, alignment: Alignment.centre,
                                                              ref: `column at ${index}`, minCrossAxis: 50}, "default", );

        // Add to positional columns
        this.pulseColumns.add(newColumn, index);
        this.pulseColumns.children.forEach((c, i) => {
            c.ref = `column at ${i}`
        })

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

        if (ifEmpty === true) {  // Removing column ONLY if it's empty now
            if (this.pulseColumns.children[index].children.length === 0) {
                this.pulseColumns.removeAt(index);

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
        } else {  // Remove column (regardless of if it's empty)
            this.pulseColumns.removeAt(index);

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
    addChannel(channel: Channel) {
        this.channelColumn.add(channel);
        
        // Set and initialise channel
        this.channelsDic[channel.id] = channel; 

        var index = this.channels.length - 1;
        channel.mountColumns = this.pulseColumns;  // And apply the column ref
        channel.labelColumn = this.labelColumn;
        

        this.elementMatrix.splice(this.elementMatrix.length, 0, []);

        channel.mountOccupancy = this.elementMatrix[index];
    }

    public addElement(element: Visual) {
        if (element.isMountable) {
            element.mountConfig!.mountOn = false;
        }

        // Add
    }

    // @isMountable...
    public mountElement(element: Visual, insert: boolean=false) {
        logger.operation(Operations.ADD, `------- ADDING POSITIONAL ${element.ref} -------`, this);
        if (element.mountConfig === undefined) {
            throw new Error("Cannot mount element without mount config")
        }
        element.mountConfig.mountOn = true;

        var targetChannel: Channel = this.channelsDic[element.mountConfig.channelID];
        var numColumns = this.pulseColumns.children.length;
        
        var INDEX = element.mountConfig.index;
        if (INDEX === undefined) {
            INDEX = numColumns;
        }

        // INDEX limiting (decreases index when index is too high)
        if (insert) {
            INDEX = Math.min(INDEX, numColumns)
        } else {
            INDEX = Math.max(Math.min(INDEX, numColumns-1), 0)  // Max stops going below 0
        }
        element.mountConfig.index = INDEX;

        // Need to insert a new column
        if (this.pulseColumns.children[INDEX] === undefined  || insert) {
            this.insertColumn(INDEX);
            // This stops you adding a column at 1 when there are 0 columns for instance.
            
        } else if (insert === false) {
            // Check element is already there
            if (targetChannel.mountOccupancy[INDEX] !== undefined) {
                throw new Error(`Cannot place element ${element.ref} at index ${element.mountConfig.index} as it is already occupied.`)
            }
        }
        
        // TODO: figure out inherit width and multi section element (hard)

        // Add the element to the sequence's column collection, this should trigger resizing of bars
        this.pulseColumns.children[INDEX].add(element, undefined, false, element.mountConfig.alignment);
        // This will set the X of the child ^^^ (the column should gain width immediately.)

        // TODO TOMORROW: WHen moving the Labellable<> to position, does not move the parent element.

        // Add element to channel
        targetChannel.mountElement(element);
        // This should set the Y of the element ^^^

        // SET X of element
        this.pulseColumns.children[INDEX].enforceBinding();
        // NOTE: new column already has x set from this.insert column, meaning using this.positionalColumnCollection.children[0]
        // Does not update position of new positional because of the change guards  // TODO: add "force bind" flag


        var channelIndex = this.channels.indexOf(targetChannel);
        this.elementMatrix[channelIndex][INDEX] = element;
    }

    // @isMounted
    // Remove column is set to false when modifyPositional is called.
    deleteMountedElement(target: Visual, removeColumn: boolean=true): boolean {
        var channelID: string = target.mountConfig!.channelID;
        var channel: Channel | undefined = this.channelsDic[channelID]
        var channelIndex: number = this.channels.indexOf(channel);
        var index: number;

        if (target.mountConfig!.index === undefined ) {
            throw new Error("Index not initialised");
        }
        index = target.mountConfig!.index;

        if (channelID === undefined) {
            throw new Error(`No channel owner found when deleting ${target.ref}`)
        }

        channel.removeMountable(target);

        this.elementMatrix[channelIndex][index] = undefined;

        // Remove target from columns 
        try {
            this.pulseColumns.children[index].remove(target);
        } catch {
            throw new Error(`Cannot remove pulse column at index ${index}`)
        }

        let removed = false;
        if (removeColumn === true) {
            removed = this.deleteColumn(index, true);
        }

        return removed;
    }
}