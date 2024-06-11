import defaultChannel from "./default/data/channel.json"
import { Visual, IElement } from "./visual";
import { Number, SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Positional, { Alignment, Orientation, labelable } from "./positional";
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

    private _maxTopProtrusion : number = 0;
    private _maxBottomProtrusion : number = 0;

    bar: RectElement;
    get barWidth() {
        var width = 0;
        this.columnRef.forEach((c) => width += c.width);
        return width;
    }

    annotationLayer?: AnnotationLayer;

    private _columnRef: Spacial[] = [];
    public get columnRef(): Spacial[] {
        return this._columnRef;
    }
    public set columnRef(value: Spacial[]) {
        this._columnRef = value;
        this._columnRef[0].bind(this.bar, Dimensions.X, "here", "here");
    }

    private _labelColumn: Spacial = new Spacial(0, undefined, undefined, undefined);
    set labelColumn(v: Spacial) {  // When the label column is set, apply binding to the label.
        this._labelColumn = v;
        if (this.label) {
            this.labelColumn.bind(this.label, Dimensions.X, "here", "here", this.label.padding[3]);
        }
    }
    get labelColumn(): Spacial {
        return this._labelColumn;
    }

    intrinsicWidths: number[] = []; // Widths of positional elements
    sectionWidths: number[] = [];  // List of widths of each section along the sequence
    occupancy: boolean[] = [];  // 
    sectionXs: number[] = [];  // X coords of the leftmost of each section (including end) taken from sequence
    elementCursor: number = -1;

    labelOn: boolean;
    label?: Label;
    position: Position=Position.left;

    positionalElements: Positional<Visual>[] = [];

    constructor(params: RecursivePartial<IChannel>, templateName: string="default", refName: string="channel") {
        var fullParams: IChannel = params ? UpdateObj(Channel.defaults[templateName], params) : Channel.defaults[templateName];
        super(fullParams, templateName, refName);

        this.style = fullParams.style;
        this.padding = fullParams.padding;

        this.identifier = fullParams.identifier;

        this.bar = new RectElement({height: this.style.thickness}, "bar");
        this.bar.y = 0;
        
        this.add(this.bar);

        // this.positionalElements = [...fullParams.positionalElements];  // please please PLEASE do this (list is ref type)
        
        this.labelOn = fullParams.labelOn;

        if (fullParams.label) {
            this.label = new Label(fullParams.label);

            this.bar.bind(this.label, Dimensions.Y, "centre", "centre");

            this.add(this.label);
        }
    }

    draw(surface: Svg) {
        // Add annotation
       //  var annotationHeight = 0;
       //  if (this.annotationLayer) {
       //      this.annotationLayer.draw(surface, indexWidths, this.barX, this.y);
       //      yCursor += this.annotationLayer.height;
       //      annotationHeight = this.annotationLayer.height;
       //  }

        this.label?.draw(surface);
        
        this.positionalElements.forEach(p => {
           
            p.element.draw(surface);
            
        });
        this.bar.draw(surface);
    }

    resolveDimensions(): {width: number, height: number} {
        var cHeight = this.maxTopProtrusion + this.bar.height + this.maxBottomProtrusion;
        var length = this.barLength + (this.label ? this.label.width : 0);

        return {width: length, height: cHeight}
    }

    
    checkHeight(obj: Positional<Visual>) {
        switch (obj.config.orientation) {
            case Orientation.top:
                if (obj.element.height > this.maxTopProtrusion) {
                    this.maxTopProtrusion = obj.element.height;
                }
                break;
            case Orientation.bottom:
                if (obj.element.height > this.maxBottomProtrusion) {
                    this.maxBottomProtrusion = obj.element.height;
                }
                break;
            case Orientation.both:
                if (obj.element.height/2 - this.bar.height/2 > this.maxBottomProtrusion) {
                    this.maxBottomProtrusion = obj.element.height/2 - this.bar.height/2;
                }
                if (obj.element.height/2 - this.bar.height/2 > this.maxTopProtrusion) {
                    this.maxTopProtrusion = obj.element.height/2 - this.bar.height/2;
                }
        }
    }

    // addPositional -> checkHeight -> set maxTopProtrusion ->
    positionBar() {
        this.bar.contentWidth = this.barWidth;  // Inefficient

        this.bind(this.bar, Dimensions.Y, "here", "here", this.maxTopProtrusion);
        
        this.enforceBinding();
    }

    // Position positional elements on the bar
    addPositional(positional: Positional<Visual>, index?: number | undefined, insert: boolean=false): void {
        this.elementCursor += 1;  // Keep this here.

        var Index: number = index ? index : this.elementCursor;

        var element: Visual = positional.element;

        if (!positional.config.index) {
            positional.config.index = Index;
            this.elementCursor += positional.config.noSections - 1;  // Multi column element
        }

        //var sections = new Array<number>(positional.config.noSections);
        //sections.fill(positional.element.width / positional.config.noSections);
//
        //this.positionalElements.push(positional);
        //this.sectionWidths.push(...sections);

        this.intrinsicWidths[Index] = element.width;

        var column: Spacial = this.columnRef[Index];

        // TODO: figure out inherit width and multi section element

        // Bind X
        switch (positional.config.alignment) {
            case Alignment.Left:
                column.bind(element, Dimensions.X, "here", "here");
                break;
            case Alignment.Centre:
                column.bind(element, Dimensions.X, "centre", "centre");
                break;
            case Alignment.Right:
                column.bind(element, Dimensions.X, "far", "far");
                break;
            case Alignment.Padded:
                column.bind(element, Dimensions.X, "here", "here");
                break;
        }

        // Bind Y
        switch (positional.config.orientation) {
            case Orientation.top:
                this.bar.bind(element, Dimensions.Y, "here", "far");
                break;
            case Orientation.both:
                this.bar.bind(element, Dimensions.Y, "centre", "centre");
                break;
            case Orientation.bottom:
                this.bar.bind(element, Dimensions.Y, "far", "here");
                break;
        }

        positional.config.index = Index;

        this.checkHeight(positional);
        this.positionBar();

        this.add(positional.element);
        this.positionalElements.push(positional);

        
        if (Index > this.occupancy.length-1) {
            for (var i = 1; i <= this.occupancy.length-1-Index; i++ ) {
                this.occupancy.push(false);
            }

            this.occupancy[Index] = true;
        } else if (insert) {
            this.occupancy.splice(Index, 0, true);
        }
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


    public get maxTopProtrusion() : number {
        return this._maxTopProtrusion;
    }
    public set maxTopProtrusion(v : number) {
        this._maxTopProtrusion = v;
        this.positionBar();
    }

    public get maxBottomProtrusion() : number {
        return this._maxBottomProtrusion;
    }
    public set maxBottomProtrusion(v : number) {
        this._maxBottomProtrusion = v;
        this.positionBar();
    }

    get barLength() {
        var length = 0;
        this.positionalElements.forEach((p) => {
            length + p.element.width;
        })
        return length;
    }

}
