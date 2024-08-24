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
import RectElement from "./rectElement";
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

    style: channelStyle;

    labelOn: boolean;
    label: ILabel;
    
    annotationStyle: channelAnnotation,
}


export interface channelStyle {
    thickness: number,
    fill: string,
    stroke?: string | null,  
    strokeWidth?: number | null
}

export interface channelAnnotation {
    padding: [number, number, number, number]
}


export default class Channel extends Collection {
    static defaults: {[name: string]: IChannel} = {"default": <any>defaultChannel}

    style: channelStyle;
    identifier: string;

    public upperAligner: Aligner<Visual>;
    public lowerAligner: Aligner<Visual>;

    bar: RectElement;
    get barWidth() {
        var width = 0;
        this.positionalColumns.children.forEach((c) => width += c.width);
        return width;
    }

    annotationLayer?: AnnotationLayer;

    // A column for containing the channel label and binding the bar and positional columns
    private _labelColumn?: Aligner<Visual>;
    set labelColumn(v: Aligner<Visual>) {  // When the label column is set, apply binding to the label.
        this._labelColumn = v;

        this._labelColumn.bind(this.bar, Dimensions.X, "far", "here");  // Bind X of bar

        this.labelColumn.bind(this.upperAligner, Dimensions.X, "here", "here", undefined, true);
        this.labelColumn.bind(this.lowerAligner, Dimensions.X, "here", "here", undefined, true);

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


    intrinsicWidths: number[] = []; // Widths of positional elements
    sectionWidths: number[] = [];  // List of widths of each section along the sequence
    occupancy: boolean[] = [];  // 
    sectionXs: number[] = [];  // X coords of the leftmost of each section (including end) taken from sequence
    elementCursor: number = -1;

    labelOn: boolean;
    label?: Label;

    positionalElements: Positional<Visual>[] = [];

    constructor(params: RecursivePartial<IChannel>, templateName: string="default", refName: string="channel") {
        var fullParams: IChannel = params ? UpdateObj(Channel.defaults[templateName], params) : Channel.defaults[templateName];
        super(fullParams, templateName, refName);

        this.style = fullParams.style;
        this.padding = fullParams.padding;

        this.identifier = fullParams.identifier;

        this.upperAligner = new Aligner({axis: Dimensions.X, alignment: Alignment.far, height: 20}, "default", `top aligner`);
        this.bind(this.upperAligner, Dimensions.Y, "here", "here", undefined, true);
        
        
        this.bar = new RectElement({height: this.style.thickness}, "bar");
        this.upperAligner.bind(this.bar, Dimensions.Y, "far", "here");

        this.lowerAligner = new Aligner({axis: Dimensions.X, alignment: Alignment.here}, "default", "bottom aligner");
        this.bar.bind(this.lowerAligner, Dimensions.Y, "far", "here");
        
        
        
        this.add(this.bar);

        // this.positionalElements = [...fullParams.positionalElements];  // please please PLEASE do this (list is ref type)
        
        this.labelOn = fullParams.labelOn;
        if (fullParams.label) {
            this.label = new Label(fullParams.label);

            this.bar.bind(this.label, Dimensions.Y, "centre", "centre");

            this.add(this.label);
        }
    }


    // Position positional elements on the bar
    addPositional(positional: Positional<Visual>, index?: number, insert: boolean=false): void {
        this.elementCursor += 1;  // Keep this here.

        var Index: number = index !== undefined ? index : this.elementCursor;

        var element: Visual = positional.element;  // Extract element from positional framework
        var config: IConfig = positional.config;

        if (!config.index) {
            config.index = Index;
            this.elementCursor += config.noSections - 1;  // Multi column element
        }

        this.intrinsicWidths[Index] = element.width;
        

        // --- Bindings ---
        // Bind X
        // switch (positional.config.alignment) {
        //     case Alignment.here:
        //         column.bind(element, Dimensions.X, "here", "here");
        //         break;
        //     case Alignment.centre:
        //         column.bind(element, Dimensions.X, "centre", "centre");
        //         break;
        //     case Alignment.far:
        //         column.bind(element, Dimensions.X, "far", "far");
        //         break;
        //     case Alignment.none:
        //         column.bind(element, Dimensions.X, "here", "here");
        //         break;
        // }

        // Bind Y
        // switch (positional.config.orientation) {
        //     case Orientation.top:
        //         this.bar.bind(element, Dimensions.Y, "here", "far");
        //         break;
        //     case Orientation.both:
        //         this.bar.bind(element, Dimensions.Y, "centre", "centre");
        //         break;
        //     case Orientation.bottom:
        //         this.bar.bind(element, Dimensions.Y, "far", "here");
        //         break;
        // }
        // --- Bindings ---

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

        this.positionalElements.push(positional);
        this.add(positional.element);

        this.occupancy[Index] = true;
    }

    addAnnotationLabel(lab: Span) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer({}, )
        }
        var index;
        
        if (lab.index !== undefined) {
            index = lab.index;
        } else {
            index = this.elementCursor;
        }

        if (index == -1) {
            return;
        }

        this.annotationLayer.annotateLabel(lab);
    }

    addSection(section: Section) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer({}, );
        }

        var indexStart: number;
        var indexEnd: number;
        
        if (section.indexRange === undefined) {
            indexStart = 0;
            indexEnd = 1;
        } else {
            indexStart = section.indexRange[0];
            indexEnd = section.indexRange[1];
        }


        var range: [number, number] = section.indexRange ? section.indexRange : [indexStart, indexEnd];

        if (range[0] < 0) {range[0] = 0;}
        if (range[1] > this.sectionWidths.length+1) {range[1] = this.sectionWidths.length+1}
        if (range[0] > range[1]) {range = [0, 1]}


        section.indexRange = range;
        this.annotationLayer.annotateLong(section);
    }

    
    // Index related

    jumpTimespan(newCurs: number) {
        for (var empty = this.elementCursor; empty < newCurs; empty++) {
            this.sectionWidths.push(0);
        }
        this.elementCursor = newCurs
    }



}
