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



export interface IVisual extends IPaddedBox {
    contentWidth?: number,
    contentHeight?: number,
    offset: [number, number],
}



export abstract class Visual extends PaddedBox implements IVisual {
    
    offset: [number, number];

    svg?: Element;

    private _dirty: boolean = true
    public get dirty(): boolean {
        return this._dirty
    }
    public set dirty(value: boolean) {
        this._dirty = value
    }

    constructor(params: IVisual, refName: string="element") {
        super(params.padding, params.x, params.y, params.contentWidth, params.contentHeight, refName);  // Will make dirty??

        this.offset = params.offset;  // Fixed for some reason
    }


    abstract draw(surface: Svg, ...args: any[]): void
    erase(): void {
        this.svg?.remove();
    }

    verticalFlip() {
        // this.offset[1] = -Math.abs(this.offset[1]);
			
        this.svg?.children().forEach((c) => {

            c.transform({flip: "y", origin: "bottom left"})
            c.translate(0, -<number>this.svg?.height())
        })
    }

    override set x(val: number) {
        if (val !== this._x) {
            this.dirty = true;
            this._x = val;
            this.enforceBinding();
            this.notifyChange();
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
            this.enforceBinding();
            this.notifyChange();
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
            this.notifyChange();
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
            this.notifyChange();
        }
    }


}