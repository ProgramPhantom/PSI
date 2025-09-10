import { Element } from '@svgdotjs/svg.js'
import { FormBundle } from '../features/form/LabelGroupComboForm'
import VisualForm from '../features/form/VisualForm'
import { defaultVisual } from './default/data'
import LabelGroup from './labelGroup'
import Mountable, { IMountable } from './mountable'
import { ID } from './point'
import { posPrecision } from './util'


type Padding = number | [number, number] | [number, number, number, number]
export type Offset = [number, number]


export type Display = "none" | "block"


export interface IVisual extends IMountable {
    offset: [number, number],
}

export interface IDraw {
    draw: (surface: Element) => void
    erase: () => void
}

export function doesDraw(object: any): object is IDraw {
    return "draw" in object
}


export abstract class Visual extends Mountable implements IVisual {
    static namedElements: {[name: string]: IVisual} = {"default": <any>defaultVisual, "form-default": <any>defaultVisual}
    static formData: FormBundle = {form: VisualForm, defaults: Visual.namedElements["form-defaults"], allowLabels: false};

    get state(): IVisual { return {
        offset: this.offset,
        ...super.state
    }}
    get allElements(): Record<ID, Visual> {
        return {[this.id]: this};
    }

    offset: [number, number];

    svg?: Element;

    private _dirty: boolean = true
    public get dirty(): boolean {
        return this._dirty
    }
    public set dirty(value: boolean) {
        this._dirty = value
    }

    constructor(params: IVisual) {
        super(params); 

        this.offset = params.offset;  // Fixed for some reason
    }


    abstract draw(surface: Element): void 
    erase(): void {
        this.svg?.remove();
    }

    verticalFlip() {
        // TODO: this is slightly problematic
        this.offset = [this.offset[0], -Math.abs(this.offset[1])];  // Strange entanglement error was happening here
			
        this.svg?.children().forEach((c) => {
        
            c.transform({flip: "y", })
        })

        this.padding = [this.padding[2], this.padding[1], this.padding[0], this.padding[3]]
    }


    // Construct and SVG with children positioned relative to (0, 0)
    getInternalRepresentation(): Element | undefined {
        
        return this.svg
    }

    override set x(val: number) {
        if (val !== this._x) {
            this.dirty = true;
            this._x = posPrecision(val);
            this.enforceBinding();
            this.notifyChange();
        }
    }  // OVERRIDING SETTER REQUIRES GETTER TO BE REDEFINED???
    override get x(): number {
        if (this._x !== undefined) {
            return this._x;
        }
        throw new Error(`x unset in ${this.ref}`);
    }
    override set y(val: number) {
        if (this.ref === "text in label" && val === 25) {
            console.log()
        }
        if (val !== this._y) {
            this.dirty = true;
            this._y = posPrecision(val);
            this.enforceBinding();
            this.notifyChange();
        }
    }
    override get y(): number {
        if (this._y !== undefined) {
            return this._y;
        }
        throw new Error(`y unset in ${this.ref}` );
    }

    override get contentWidth() : number | undefined {
        return this._contentWidth;
    }
    override set contentWidth(v : number | undefined) {
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
    override set contentHeight(v : number | undefined) {
        if (v !== this._contentHeight) {
            this.dirty = true;
            this._contentHeight = v;
            this.enforceBinding();
            this.notifyChange();
        }
    }

    get drawX(): number {
        return this.contentX + this.offset[0];
    }
    get drawY(): number {
        return this.contentY + this.offset[1];
    }

    static isLabelGroup(val: Visual): val is LabelGroup {
        return (val as LabelGroup).labels !== undefined
    }


}