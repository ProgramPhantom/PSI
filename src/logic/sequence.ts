import Aligner from "./aligner";
import Channel, { IChannel } from "./channel";
import Collection, { ICollection } from "./collection";
import defaultSequence from "./default/sequence.json";
import { AllComponentTypes, IHaveStructure } from "./diagramHandler";
import logger, { Operations, Processes } from "./log";
import Point from "./point";
import Space from "./space";
import { FillObject, RecursivePartial } from "./util";
import { Visual } from "./visual";

export interface ISequence extends ICollection {
    channels: IChannel[]
}

export type OccupancyStatus = Visual | "." | undefined


export type SequenceNamedStructures =  "channel column" | "label column" | "label col | pulse columns"| "pulse columns"


export default class Sequence extends Collection implements IHaveStructure {
    static defaults: {[key: string]: ISequence} = {"default": {...<any>defaultSequence}}
    static ElementType: AllComponentTypes = "sequence";
    get state(): ISequence {
        return {
            channels: this.channels.map((c) => c.state),

            ...super.state
        }
    }

    channelsDict: {[name: string]: Channel;} = {};
    get channels(): Channel[] {return Object.values(this.channelsDict)}
    get channelIDs(): string[] {return Object.keys(this.channelsDict)}

    structure: Record<SequenceNamedStructures, Point>;

    channelColumn: Aligner<Channel>;

    pulseColumns: Aligner<Aligner<Visual>>;
    labelColumn: Aligner<Visual>;

    columns: Aligner<Aligner<Visual>>;

    elementMatrix: OccupancyStatus[][] = [];

    get allPulseElements(): Visual[] {
        var elements: Visual[] = [];
        this.channels.forEach((c) => {
            elements.push(...c.mountedElements)
        })
        return elements;
    }

    constructor(pParams: RecursivePartial<ISequence>, templateName: string="default") {
        var fullParams: ISequence = FillObject(pParams, Sequence.defaults[templateName]);
        super(fullParams, templateName);
        logger.processStart(Processes.INSTANTIATE, ``, this);

        // ----- Create structure ----
        // Channel column
        this.channelColumn = new Aligner<Channel>(
            {bindMainAxis: true, axis: "y", alignment: "here", ref: "channel column"}, "default", );
        this.add(this.channelColumn, undefined, true);

        // All columns
        this.columns = new Aligner({axis: "x", bindMainAxis: true, alignment: "here", ref: "label col | pulse columns"}, "default");
        this.add(this.columns, undefined, true);
        
        // Label column
        this.labelColumn = new Aligner<Visual>({axis: "y", bindMainAxis: false, 
                                                        alignment: "here", y: 0, ref: "label column"}, "default",);
        this.columns.add(this.labelColumn);

        // Pulse columns
        this.pulseColumns = new Aligner<Aligner<Visual>>({bindMainAxis: true, axis: "x", y: 0, ref: "pulse columns"}, "default", );
        this.columns.add(this.pulseColumns);

        this.structure = {
            "channel column": this.channelColumn,
            "label col | pulse columns": this.columns,
            "label column": this.labelColumn,
            "pulse columns": this.pulseColumns,
        }
        // --------------------------


        this.channelsDict = {};  
        fullParams.channels.forEach((c) => {
            var newChan = new Channel(c);
            this.addChannel(newChan);
        })
        
        logger.processEnd(Processes.INSTANTIATE, ``, this);
    }

    reset() {
        this.channelsDict = {};
    }

    
    clearEmptyColumns() {
        this.pulseColumns.children.forEach((c) => {
            if (c.children.length === 0) {
                this.pulseColumns.remove(c);
                console.warn("Clearing empty columns. Delete has not cleared up properly")
            }
        })
    }

    checkMultiElementSplit(index: number): boolean {
        var split: boolean = false;
        var splitElements: Visual[] = [];
        for (var channel of this.elementMatrix) {
            var currChannel: OccupancyStatus[] = channel;

            if (currChannel[index-1] === undefined && currChannel[index] === undefined) {
                continue
            }
            if (currChannel[index-1] instanceof Visual && currChannel[index] === "." ||
                currChannel[index-1] === "." && currChannel[index] === "."
            ) {
                split = true;
                
                // Find element
                var elementSearch: OccupancyStatus = currChannel[index]
                while (typeof elementSearch !== typeof Visual) {
                    index -= 1
                    elementSearch = currChannel[index]
                }
                splitElements.push(elementSearch as Visual)
            }
        }
        return split;
    }


    addColumns(index: number, quantity: number=1) {
        // Check if addition of column will split a multi-column element (not allowed currently)
        var split: boolean = this.checkMultiElementSplit(index);
        if (split) {console.warn(`Splitting element`);}

        // Calculate gap from index to leftmost column
        var numColumns: number = this.pulseColumns.children.length;
        var diff: number = Math.max(index - numColumns, 0);

        var columnsToAdd: Aligner<Visual>[] = [];

        // ----- Catch up columns to index -----
        for (var i=0; i<diff; i++) {
            this.addColumn(numColumns + i);
        }
        
        // ----- Add additional columns defined by quantity (this adds index column) ----- 
        for (var i=0; i<quantity; i++) {
            this.addColumn(index + i)
        }


    }

    addColumn(index: number) {
        var INDEX: number = index;

        var newColumn: Aligner<Visual> = new Aligner<Visual>({axis: "y", bindMainAxis: false, alignment: "centre",
                                                          ref: `column at ${INDEX}`, minCrossAxis: 10}, "default", );

        // Add to positional columns
        this.pulseColumns.add(newColumn, INDEX);

        // Update indices after this new column:
        // Update internal indexes of Positional elements in pos col:
        this.channels.forEach((channel) => {
            channel.shiftIndices(index, 1);
        })

        // Update element matrix
        this.elementMatrix.forEach((c) => {
            c.splice(index, 0, ...Array<Visual | undefined>(1).fill(undefined))
        })
    }

    deleteColumns(index: number, ifEmpty: boolean=false, quantity: number=1): boolean {
        // Update positional indices of elements after this 
        var columnsRemoved: number = 0;
        var targets: (Aligner<Visual> | undefined)[] = this.pulseColumns.children.slice(index, index+quantity);

        targets.forEach((t, i) => {
            if (t && ((ifEmpty && t.children.length === 0) || !ifEmpty)) {
                var INDEX: number = this.pulseColumns.children.indexOf(t);
                this.pulseColumns.remove(t);
                columnsRemoved += 1
                
                this.channels.forEach((channel) => {
                    channel.shiftIndices(INDEX, -1);
                })
                this.elementMatrix.forEach((c) => {
                    c.splice(INDEX, 1)
                })
            }
        })

        if (columnsRemoved > 0) {return true}
        return false
    }
    // ------------------------

    // Content Commands
    addChannel(channel: Channel) {
        this.channelColumn.add(channel);
        
        // Set and initialise channel
        this.channelsDict[channel.id] = channel; 

        var index = this.channels.length - 1;
        channel.mountColumns = this.pulseColumns;  // And apply the column ref
        channel.labelColumn = this.labelColumn;
        

        this.elementMatrix.splice(this.elementMatrix.length, 0, []);

        channel.mountOccupancy = this.elementMatrix[index];
    }

    deleteChannel(channel: Channel) {
        if (!this.channels.includes(channel)) {
            throw new Error(`Channel '${channel.ref}' does not belong to ${this.ref}`);
        }
        // The order is very important here
        var index = this.channels.indexOf(channel);
        

        if (channel.label) {
            this.labelColumn.remove(channel.label)
        }

        channel.remove(channel.bar);

        for (var element of channel.mountedElements) {
            if (element.mountConfig) {
                this.deleteMountedElement(element);
            }
        }

        this.channelColumn.remove(channel);

        this.elementMatrix.splice(index, 1);
        delete this.channelsDict[channel.id];
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

        var targetChannel: Channel = this.channelsDict[element.mountConfig?.channelID!];
        if (targetChannel === undefined) {
            throw new Error(`Cannot find channel width ID ${element.mountConfig.channelID}`)
        }

        var numColumns = this.pulseColumns.children.length;
        
        var INDEX = element.mountConfig.index;
        if (INDEX === undefined) {
            INDEX = numColumns;  // What?
        }

        // INDEX limiting (decreases index when index is too high)
        if (insert) {
            INDEX = Math.min(INDEX, numColumns)
        } else {
            // Trying to place on non-existant column, behaviour is to insert at end
            // if (INDEX > numColumns-1) {  
            //     INDEX = numColumns;
            //     insert = true
            // }
            // INDEX = Math.max(Math.min(INDEX, numColumns-1), 0)  // Max stops going below 0
        }
        element.mountConfig.index = INDEX;
        var endINDEX: number = INDEX + element.mountConfig.noSections - 1;

        // Calculate how many columns to insert
        var targetedOccupancy: OccupancyStatus[] = targetChannel.mountOccupancy.slice(INDEX, endINDEX+1);
        var targetedColumns: Aligner<Visual>[] = this.pulseColumns.children.slice(INDEX, endINDEX+1);

        var columnsToAdd: number = element.mountConfig.noSections;
        for (var i=0; i < targetedColumns.length; i++) {
            var presence: Visual | "." | undefined = targetedOccupancy[i];

            if (!presence) {
                columnsToAdd -= 1
            } else {
                break;
            }
        }
        if (insert && columnsToAdd === 0) {columnsToAdd += 1}

        if (element.ref === "180") {
            console.log()
        }
        // Insert columns
        if (columnsToAdd > 0 || insert) {
            this.addColumns(INDEX, columnsToAdd);
        } else if (insert === false) {
            // Check element is already there
            if (targetChannel.mountOccupancy[INDEX] !== undefined) {
                throw new Error(`Cannot place element ${element.ref} at index ${element.mountConfig.index} as it is already occupied.`)
            }
        }

        if (element.mountConfig.noSections > 1) {
            // Add dummies
            // var width: number = element.width / element.mountConfig.noSections;

            for (var i = 0; i<element.mountConfig.noSections; i++) {
                var newSpace = new Space({contentHeight: 0, contentWidth: 10, padding: [0, 0, 0, 0]})

                this.pulseColumns.children[INDEX+i].add(newSpace, undefined, false, true, element.mountConfig.alignment);
                element.dummies.push(newSpace);
            }

            var startColumn: Aligner<Visual> = this.pulseColumns.children[INDEX];
            var endColumn: Aligner<Visual> = this.pulseColumns.children[endINDEX];
            // Stretch element
            startColumn.bind(element, "x", "here", "here")
            endColumn.bind(element, "x", "far", "far")
        } else {
            // Add the element to the sequence's column collection, this should trigger resizing of bars
            this.pulseColumns.children[INDEX].add(element, undefined, false, false, element.mountConfig.alignment);
            // This will set the X of the child ^^^ (the column should gain width immediately.)
        }

        // Add element to channel
        targetChannel.mountElement(element);
        // This should set the Y of the element ^^^

        // When an element is modified to have less sections, the optimisation to not delete the column means that
        // the unused column is not removed. 
        // this.clearEmptyColumns();  // TODO: this shouldn't be needed

        // SET X of element
        this.pulseColumns.children[INDEX].enforceBinding();
        // NOTE: new column already has x set from this.insert column, meaning using this.positionalColumnCollection.children[0]
        // Does not update position of new positional because of the change guards  // TODO: add "force bind" flag

        // This makes sure multi-column elements correctly bind far to the endColumn. For some reason they don't if this isn't here
        this.pulseColumns.children[endINDEX].enforceBinding();


        var channelIndex = this.channels.indexOf(targetChannel);
        this.elementMatrix[channelIndex][INDEX] = element;
        this.elementMatrix[channelIndex].fill(".", INDEX+1, endINDEX+1);
    }

    // @isMounted
    // Remove column is set to false when modifyPositional is called.
    public deleteMountedElement(target: Visual, removeColumn: boolean=true): boolean {
        var channelID: string = target.mountConfig?.channelID!;
        var channel: Channel | undefined = this.channelsDict[channelID]
        var channelIndex: number = this.channels.indexOf(channel);
        var INDEX: number;
        var endINDEX: number

        if (target.mountConfig === undefined) {
            throw new Error(`Cannot demount element ${target.ref} as it is not mountable`)
        }
        if (target.mountConfig!.index === undefined ) {
            throw new Error("Index not initialised");
        }
        if (channelID === undefined || channelID === null) {
            throw new Error(`No channel owner found when deleting ${target.ref}`)
        }


        INDEX = target.mountConfig!.index;
        endINDEX = INDEX + target.mountConfig.noSections-1;

        var startColumn: Aligner<Visual> = this.pulseColumns.children[INDEX];
        var endColumn: Aligner<Visual> = this.pulseColumns.children[endINDEX];

        startColumn.clearBindsTo(target, "x")
        endColumn.clearBindsTo(target, "x")

        channel.removeMountable(target);

        this.elementMatrix[channelIndex].fill(undefined, INDEX, INDEX+target.mountConfig.noSections);

        // Remove target from columns (and remove dummies if necessary)
        try {
            if (target.mountConfig.noSections > 1) {
                for (var i=0; i<target.mountConfig.noSections; i++) {
                    var selectedColumn = this.pulseColumns.children[INDEX + i];

                    selectedColumn.children.forEach((c) => {
                        if (target.dummies.includes(c)) {
                            selectedColumn.remove(c);
                        }
                    })
                }
                target.dummies = [];
            } else {
                this.pulseColumns.children[INDEX].remove(target);
            }
            
        } catch {
            throw new Error(`Cannot remove pulse column at index ${INDEX}`)
        }


        // Remove columns
        let removed = false;
        if (removeColumn === true) {
            removed = this.deleteColumns(INDEX, true, target.mountConfig.noSections);  // True indicates only if empty.
        } else {
            removed = this.deleteColumns(INDEX+1, true, target.mountConfig.noSections-1)
            // Delete trailing columns (could be more efficient but this is elegant)
        }

        return removed;
    }
}