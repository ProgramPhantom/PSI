import defaultChannel from "./default/data/channel.json"
import { Visual, IVisual } from "./visual";
import { Number, SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Positional, { Alignment, IConfig, Orientation, labelable } from "./positional";
import Label, { ILabel, Position } from "./label";
import Span from "./span";
import Abstract from "./abstract";
import AnnotationLayer from "./annotationLayer";
import Bracket, { IBracket } from "./bracket";
import Section from "./section";
import Annotation from "./annotation";
import { PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import PaddedBox from "./paddedBox";
import Collection, { ICollection } from "./collection";
import Point from "./point";
import Spacial, { Dimensions } from "./spacial";
import RectElement, { IRectStyle } from "./rectElement";
import Aligner from "./aligner";
 
interface Dim {
    width: number,
    height: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number

    width: number,
    height: number,
}


export interface IChannel extends ICollection {
    positionalElements: Positional<Visual>[],
    identifier: string;

    style: IChannelStyle;

    labelOn: boolean;
    label: ILabel;
    
    annotationStyle: channelAnnotation,
}


export interface IChannelStyle {
    thickness: number,
    barStyle: IRectStyle
}

export interface channelAnnotation {
    padding: [number, number, number, number]
}


export default class Channel extends Collection {
    static defaults: {[name: string]: IChannel} = {"default": <any>defaultChannel}

    style: IChannelStyle;
    identifier: string;

    // Upper and Lower aligners are responsible for binding the elements to the bar,
    // and carrying a height used to structure the channel.
    public upperAligner: Aligner<Visual>;
    public lowerAligner: Aligner<Visual>;

    bar: RectElement;

    annotationLayer?: AnnotationLayer;

    // A column for containing the channel label and binding the bar and positional columns
    private _labelColumn?: Aligner<Visual>;
    set labelColumn(v: Aligner<Visual>) {  // When the label column is set, apply binding to the label.
        this._labelColumn = v;

        this._labelColumn.bind(this.bar, Dimensions.X, "far", "here");  // Bind X of bar

        this.labelColumn.bind(this.upperAligner, Dimensions.X, "here", "here", undefined, `LABEL COL X> UPPER ALIGNER`);
        this.labelColumn.bind(this.lowerAligner, Dimensions.X, "here", "here", undefined, `LABEL COL X> LOWER ALIGNER`);

        if (this.label) {
            this._labelColumn.add(this.label)
        }
    }
    get labelColumn(): Aligner<Visual> {
        if (this._labelColumn !== undefined) {
            return this._labelColumn;
        }
        throw new Error(`Label column has not been set for channel ${this.identifier}`)
    }
    
    // A collection of columns to align this channel's positionals to
    private _positionalColumns?: Aligner<Aligner<Visual>>;
    public get positionalColumns(): Aligner<Aligner<Visual>> {
        if (this._positionalColumns !== undefined) {
            return this._positionalColumns;
        }
        throw new Error(`Positional Columns have not been set for channel: ${this.identifier}`)
    }
    public set positionalColumns(value: Aligner<Aligner<Visual>>) {
        this._positionalColumns = value;
        this._positionalColumns.bindSize(this.bar, Dimensions.X);
    }

    private _positionalOccupancy?: (Positional<Visual> | undefined)[];
    public get positionalOccupancy(): (Positional<Visual> | undefined)[] {
        if (this._positionalOccupancy === undefined) {
            throw Error("Positional occupancy not set");
        }
        return this._positionalOccupancy;
    }
    public set positionalOccupancy(val: (Positional<Visual> | undefined)[]) {
        this._positionalOccupancy = val;
    }

    labelOn: boolean;
    label?: Label;

    public get positionalElements(): Positional<Visual>[] { // All positional elements on this channel
        return this.positionalOccupancy.filter(p => p !== undefined);
    };  


    constructor(params: RecursivePartial<IChannel>, templateName: string="default", refName: string="channel") {
        var fullParams: IChannel = params ? UpdateObj(Channel.defaults[templateName], params) : Channel.defaults[templateName];
        super(fullParams, templateName, refName);

        this.style = fullParams.style;
        this.padding = fullParams.padding;
        // SIDE PADDING is not permited for channels as it would break alignment

        this.identifier = fullParams.identifier;

        this.upperAligner = new Aligner({axis: Dimensions.X, alignment: Alignment.far, minCrossAxis: 30}, "default", `top aligner`);
        this.bind(this.upperAligner, Dimensions.Y, "here", "here", undefined, `CHANNEL Y> UPPER ALGINER`);
        
        this.bar = new RectElement({contentHeight: this.style.thickness, style: this.style.barStyle}, "bar");
        this.upperAligner.bind(this.bar, Dimensions.Y, "far", "here", undefined, `UPPER ALIGNER Y> BAR`);

        this.lowerAligner = new Aligner({axis: Dimensions.X, alignment: Alignment.here, minCrossAxis: 20}, "default", "bottom aligner");
        this.bar.bind(this.lowerAligner, Dimensions.Y, "far", "here", undefined, `BAR Y> LOWER ALGINER`);
        
        this.add(this.upperAligner);
        this.add(this.lowerAligner);
        this.add(this.bar);
        // this.positionalElements = [...fullParams.positionalElements];  // please please PLEASE do this (list is ref type)
        
        this.labelOn = fullParams.labelOn;
        if (fullParams.label) {
            this.label = new Label(fullParams.label);

            this.bar.bind(this.label, Dimensions.Y, "centre", "centre", undefined, `BAR Y> LABEL`);

            this.add(this.label);
        }
    }


    // Position positional elements on the bar
    addPositional(positional: Positional<Visual>, index?: number, insert: boolean=false): void {
        var Index: number = index !== undefined ? index : 0;

        positional.index = Index;
        positional.channel = this;

        var element: Visual = positional.element;  // Extract element from positional framework
        var config: IConfig = positional.config;


        // ---- Bind to the upper and lower aligners for Y ONLY
        switch (config.orientation) {
            case Orientation.top:
                this.upperAligner.add(element);
                break;
            case Orientation.both:
                throw new Error("Not implemented");
            case Orientation.bottom:
                this.lowerAligner.add(element);
                break;
        }

        positional.config.index = Index;  // Update internal index property
    }

    removePositional(positional: Positional<Visual>) {
        // Remove from children of this channel (positional elements should be property taking positionals from children)
        this.remove(positional.element);

        // Remove from the column
        if (positional.index === undefined) {
            throw new Error(`Trying to remove positional with uninitialised index`)
        }

        // Remove from aligner (yes one of these is reduntant)
        this.upperAligner.remove(positional.element);
        this.lowerAligner.remove(positional.element);
        
        positional.element.erase();
    }

    shiftIndices(from: number, n: number=1): void {
        this.positionalOccupancy.forEach((pos, i) => {
            if (i >= from && pos !== undefined && pos.index !== undefined) {
                pos.index = pos.index + n;
            }
        })
    }

}
