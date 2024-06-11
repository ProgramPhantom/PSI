import { Element, SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'
import Point, { BinderSetFunction, } from './point'
import Spacial from './spacial'
import PaddedBox, { IPaddedBox } from './paddedBox'
import { IAnnotation } from './annotation'
import Positional from './positional'



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
    width?: number,
    height?: number,
    offset: [number, number],
}


export abstract class Visual extends PaddedBox {

    offset: number[];

    svg?: Element;

    private _dirty: boolean = true
    public get dirty(): boolean {
        return this._dirty
    }
    public set dirty(value: boolean) {
        this._dirty = value
    }

    constructor(params: IElement, refName: string="element") {
        super(params.padding, params.x, params.y, params.width, params.height, refName);  // Will make dirty??

        this.offset = params.offset;  // Fixed for some reason
        
    }


    abstract draw(surface: Svg, ...args: any[]): void

    override set x(val: number) {
        if (val !== this._x) {
            this.dirty = true;
            this._x = val;
            this.enforceBinding();
        }
    }  // OVERRIDING SETTER REQUIRES GETTER TO BE REDEFINED???
    override get x(): number {
        if (this._x !== undefined) {
            return this._x;
        }
        throw new Error(`x unset in ${this.refName}`);
    }
    override set y(val: number) {
        if (val !== this._y) {
            this.dirty = true;
            this._y = val;
            this.enforceBinding()
        }
    }
    override get y(): number {
        if (this._y !== undefined) {
            return this._y;
        }
        throw new Error(`y unset in ${this.refName}` );
    }

    override get contentWidth() : number | undefined {
        return this._contentWidth;
    }
    override set contentWidth(v : number) {
        if (v !== this._contentWidth) {
            this.dirty = true;
            this._contentWidth = v;
            this.enforceBinding();
        }
    }

    override get contentHeight() : number | undefined {
        return this._contentHeight;
        
    }
    override set contentHeight(v : number) {
        if (v !== this._contentHeight) {
            this.dirty = true;
            this._contentHeight = v;
            this.enforceBinding();
        }
    }

}