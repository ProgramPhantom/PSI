import { Element, IDraw, IElement } from "./element";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { ILabel, Position } from "./label";
import { PartialConstruct, UpdateObj } from "./util";
import Arrow, { ArrowPosition, IArrow } from "./arrow";
import { H } from "mathjax-full/js/output/common/FontData";
import Annotation, { IAnnotation } from "./annotation";
import PaddedBox from "./paddedBox";

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

type Index = [number, number]

export enum Orientation { top=<any>"top", bottom=<any>"bottom", both=<any>"both" }

export enum Alignment {Left=<any>"left", Centre=<any>"centre", Right=<any>"right"}

export interface labelable {
    label?: Label,
    posDrawDecoration(surface: Svg): number[],
}

export interface IHostLabel {
    label?: Label,
}

export interface positionalConfig {
    index?: number,

    orientation: Orientation,
    alignment: Alignment,
    overridePad: boolean
    inheritWidth: boolean,
    noSections: number,
}

export interface IPositional extends IAnnotation, IElement {
    config: positionalConfig,
}

export interface IDefaultConstruct<I> {
}

export default abstract class Positional extends PaddedBox implements IDraw {
    // An element that relates to a point in time
    private _index?: Index;

    config: positionalConfig;
    barThickness: number = 3;
    decoration: Annotation;

    
    constructor(params: IPositional) {
        super(params.offset, params.padding);
        // PartialConstruct<typeof Positional>(Positional, {padding: [1, 2,3 ,4]});

        this.config = params.config;

        if (this.config.index) { this.index = this.config.index; }

        this.decoration = PartialConstruct(Annotation, {labelOn: params.labelOn, label: params.label, arrowOn: params.arrowOn, arrow: params.arrow}, Annotation.defaults["spanlabel"])

    }

    verticalProtrusion(channelThickness: number) : number[] {
        var dimensions: number[] = [];

        switch (this.config.orientation) {
            case Orientation.top:
                dimensions = [this.height, 0];
                break;

            case Orientation.bottom:
                dimensions = [0, this.height];
                break;

            case Orientation.both:
                dimensions = [this.height/2 - channelThickness/2, 
                this.height/2 - channelThickness/2];    
                break;

            default:
                throw Error(`Unknown orientation: '${this.config.orientation}'`)
        }

      
        var labelPro = this.labelVerticalProtrusion(channelThickness);  // 0, 0 if no label
        dimensions[0] += labelPro[0];
        dimensions[1] += labelPro[1];
        
        return dimensions;
    }

    labelVerticalProtrusion(channelThickness: number): number[] {
        // top, below
        var dimensions: number[] = [0, 0];
        channelThickness

        if (this.decoration.label) {
            switch (this.decoration.label.position) {
                case Position.top:
                    dimensions[0] += this.decoration.label.height;
                    break;
                case Position.bottom:
                    dimensions[1] += this.decoration.label.height;
                    break;
                case Position.centre:
                    // No protrusion
                    break;
                default:
                    dimensions[0] += this.decoration.label.height;

            }
        }

        if (this.decoration.arrow) {
            if (this.decoration.arrow.position === ArrowPosition.top) {
                dimensions[0] += this.decoration.arrow.height;
                console.warn("this might not work")
            } else if (this.decoration.arrow.position === ArrowPosition.bottom) {
                dimensions[1] += this.decoration.arrow.height;
                console.warn("this might not work")
            }
        }

        return dimensions;
    }

    positionVertically(y: number, channelThickness: number) : number[] {
        // CALCULATES Y OF POSITIONAL

        var protrusion = this.verticalProtrusion(channelThickness); 
        
        switch (this.config.orientation) {
            case Orientation.top:
                this.y = y - this.height;
                break;

            case Orientation.bottom:
                this.y = y + channelThickness;
                break;

            case Orientation.both:
                this.y = y + channelThickness/2 - this.contentHeight/2;
                
                break;
        }

       return protrusion;
    }

    positionDecoration() {
        if (this.decoration.arrowOn && this.decoration.arrow) {
            this.decoration.arrow.set(0, 0, this.contentWidth, 0);  // Position arrow

            // Centers the arrow horizontally on the positional
            this.decoration.x = this.x + this.width/2 - this.decoration.contentWidth/2;

            switch (this.decoration.arrow.position) {
                case ArrowPosition.top:
                    this.decoration.y = this.y - this.decoration.height;
                    break;
                case ArrowPosition.bottom:
                    this.decoration.y = this.y + this.contentHeight + this.barThickness;
                    break;
                default:
                    console.warn("Inline not allowed when no label"); // TODO: Just allow it bro
                    this.decoration.y = this.y - this.decoration.height;
                    break;
            }
        }

        if (this.decoration.labelOn && this.decoration.label) {
            this.decoration.x = this.x + this.width/2 - this.decoration.contentWidth/2;
            
            switch (this.decoration.label.position) {
                case Position.top:
                    this.decoration.y = this.y - this.decoration.height;
                    break;
                case Position.bottom:
                    this.decoration.y = this.y + this.contentHeight + this.barThickness;
                    break;
                case Position.centre:
                    this.decoration.y = this.y + this.contentHeight/2 - this.decoration.contentHeight/2;
                    break;
            }
        }
    }

    centreXPos(x: number) {
        this.x = x - this.contentWidth/2;
    }

    abstract draw(surface: Svg): void

    get index(): Index {
        if (this._index !== undefined) {
            return this._index;
        }
        throw new Error("Timestamp not initialised")
    }
    set index(t: number) {
        this._index = [t, t + this.config.noSections - 1];
    }
}