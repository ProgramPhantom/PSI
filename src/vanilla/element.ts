import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'
import Point, { BinderSetFunction, } from './point'
import Spacial from './spacial'
import PaddedBox, { IPaddedBox } from './paddedBox'
import { IAnnotation } from './annotation'



interface Shift {
    dx?: number,
    dy?: number,
}

interface Place {
    x?: number,
    y?: number
}





type Padding = number | [number, number] | [number, number, number, number]
export type Offset = [number, number]



export interface IElement extends IPaddedBox {
    width: number,
    height: number,
    offset: [number, number],
}


export abstract class Element extends PaddedBox {

    offset: number[];

    id: string;
    dirty: boolean = true;

    protected override _contentWidth: number;
    protected override _contentHeight: number;

    constructor(params: IElement, refName: string="element") {
        super(params.offset, params.padding, undefined, undefined, undefined, undefined, refName);  // Will make dirty??

        this.offset = params.offset;  // Fixed for some reason

        this.id = Math.random().toString(16).slice(2);
        
        // var dim = this.resolveDimensions();
        this._contentWidth = params.width;
        this._contentHeight = params.height;
    }


    abstract draw(surface: Svg, ...args: any[]): void

    override set x(val: number) {
        this.dirty = true;
        this._x = val;
        this.enforceBinding();
    }  // OVERRIDING SETTER REQUIRES GETTER TO BE REDEFINED???
    override get x(): number {
        if (this._x !== undefined) {
            return this._x;
        }
        throw new Error(`x unset in ${this.refName}`);
    }
    override set y(val: number) {
        this.dirty = true;
        this._y = val;
        this.enforceBinding()
    }
    override get y(): number {
        if (this._y !== undefined) {
            return this._y;
        }
        throw new Error(`y unset in ${this.refName}` );
    }

    override get contentWidth() : number {
        return this._contentWidth;
    }
    override set contentWidth(v : number) {
        this.dirty = true;
        this._contentWidth = v;
        this.enforceBinding();
    }

    override get contentHeight() : number {
        return this._contentHeight;
        
    }
    override set contentHeight(v : number) {
        this.dirty = true;
        this._contentHeight = v;
        this.enforceBinding();
    }

}