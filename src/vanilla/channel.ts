import defaultChannel from "./default/data/channel.json"
import { Visual, IVisual } from "./visual";
import { Number, SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Text, { IText, Position } from "./text";
import Span from "./span";
import Abstract from "./abstract";
import AnnotationLayer from "./annotationLayer";
import Annotation from "./annotation";
import { PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import PaddedBox from "./paddedBox";
import Collection, { ICollection } from "./collection";
import Point, { ElementTypes } from "./point";
import Spacial, { Dimensions } from "./spacial";
import RectElement, { IRectStyle } from "./rectElement";
import Aligner from "./aligner";
import { Alignment, IMountable, IMountConfig, Orientation } from "./mountable";
import Labellable from "./labellable";
 
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
    positionalElements: IVisual[],

    style: IChannelStyle;

    channelSymbol: IText;
    
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
    static ElementType: ElementTypes = "channel"; 

    style: IChannelStyle;

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
        throw new Error(`Label column has not been set for channel ${this.id}`)
    }
    
    // A collection of columns to align this channel's positionals to
    private _mountColumns?: Aligner<Aligner<Visual>>;
    public get mountColumns(): Aligner<Aligner<Visual>> {
        if (this._mountColumns !== undefined) {
            return this._mountColumns;
        }
        throw new Error(`Positional Columns have not been set for channel: ${this.id}`)
    }
    public set mountColumns(value: Aligner<Aligner<Visual>>) {
        this._mountColumns = value;
        // this._mountColumns.bindSize(this.bar, Dimensions.X);

        this._mountColumns.bind(this.bar, Dimensions.X, "far", "far")
        this.bar.contentWidth = this._mountColumns.width; 
        // This means when adding a new channel the bar is already as long as image
    }

    private _mountOccupancy?: (Visual | undefined)[];
    public get mountOccupancy(): (Visual | undefined)[] {
        if (this._mountOccupancy === undefined) {
            throw Error("Positional occupancy not set");
        }
        return this._mountOccupancy;
    }
    public set mountOccupancy(val: (Visual | undefined)[]) {
        this._mountOccupancy = val;
    }

    label?: Text;

    public get mountedElements(): Visual[] { // All positional elements on this channel
        return this.mountOccupancy.filter(p => p !== undefined);
    };  


    constructor(params: RecursivePartial<IChannel>, templateName: string="default") {
        var fullParams: IChannel = params ? UpdateObj(Channel.defaults[templateName], params) : Channel.defaults[templateName];
        super(fullParams, templateName);

        this.style = fullParams.style;
        this.padding = fullParams.padding;
        // SIDE PADDING is not permitted for channels as it would break alignment

        this.upperAligner = new Aligner({axis: Dimensions.X, alignment: Alignment.far, minCrossAxis: 30, ref: `top aligner`}, "default");
        // this.bind(this.upperAligner, Dimensions.Y, "here", "here", undefined, `CHANNEL Y> UPPER ALIGNER`);
        this.add(this.upperAligner, undefined, true)
        
        this.bar = new RectElement({contentHeight: this.style.thickness, style: this.style.barStyle, ref: "bar"}, "bar");
        this.upperAligner.bind(this.bar, Dimensions.Y, "far", "here", undefined, `UPPER ALIGNER Y> BAR`);
        this.bar.stretchy = true;
        this.add(this.bar);

        this.lowerAligner = new Aligner({axis: Dimensions.X, alignment: Alignment.here, minCrossAxis: 20, ref: "bottom aligner"}, "default");
        this.bar.bind(this.lowerAligner, Dimensions.Y, "far", "here", undefined, `BAR Y> LOWER ALIGNER`);
        this.add(this.lowerAligner);
        
        
        // this.positionalElements = [...fullParams.positionalElements];  // please please PLEASE do this (list is ref type)
        
        if (fullParams.channelSymbol !== undefined) {
            this.label = new Text(fullParams.channelSymbol);

            this.bar.bind(this.label, Dimensions.Y, "centre", "centre", undefined, `BAR Y> LABEL`);

            this.add(this.label);
        }
    }


    // Position positional elements on the bar
    mountElement(element: Visual): void {
        if (element.mountConfig === undefined) {
            throw new Error("Cannot mount element with uninitialised mount config.")
        } 
        element.mountConfig.channelID = this.id;

        var element: Visual = element;  // Extract element from positional framework
        var config: IMountConfig = element.mountConfig!;


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
    }

    removeMountable(element: Visual) {
        // Remove from children of this channel (positional elements should be property taking positionals from children)
        this.remove(element);

        // Remove from the column (?)
        if (element.mountConfig!.index === undefined) {
            throw new Error(`Trying to remove positional with uninitialised index`)
        }

        // Remove from aligner (yes one of these is redundant)
        this.upperAligner.remove(element);
        this.lowerAligner.remove(element);
        
        element.erase();
    }

    // 
    shiftIndices(from: number, n: number=1): void {
        this.mountOccupancy.forEach((pos, i) => {
            if (i >= from && pos !== undefined && pos.mountConfig!.index !== undefined) {
                pos.mountConfig!.index = pos.mountConfig!.index + n;
            }
        })
    }

}
