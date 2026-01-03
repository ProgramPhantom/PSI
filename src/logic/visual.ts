import { Element } from "@svgdotjs/svg.js";
import PaddedBox, { IPaddedBox } from "./paddedBox";
import { ID, UserComponentType } from "./point";
import { Size } from "./spacial";


export type Offset = [number, number];

export type Display = "none" | "block";

export interface IVisual extends IPaddedBox {
	offset: [number, number];
}

export interface IDraw {
	draw: (surface: Element) => void;
	erase: () => void;
}

export function doesDraw(object: any): object is IDraw {
	return "draw" in object;
}

export default abstract class Visual extends PaddedBox implements IVisual {
	static ElementType: UserComponentType = "rect";
	get state(): IVisual {
		return {
			offset: this.offset,
			...super.state
		};
	}
	get allElements(): Record<ID, Visual> {
		return {[this.id]: this};
	}

	private _dirty: boolean = true;
	public get dirty(): boolean {
		return this._dirty;
	}
	public set dirty(value: boolean) {
		this._dirty = value;
	}

	offset: [number, number];
	svg?: Element;

	flipped: boolean = false;

	constructor(params: IVisual) {
		super(params.padding, params.x, params.y, 
			params.contentWidth, params.contentHeight, params.placementMode, params.sizeMode, params.ref, params.id);

		this.offset = params.offset;
	}

	abstract draw(surface: Element): void;

	erase(): void {
		this.svg?.remove();
	}

	public computeSize(): Size {
		return super.computeSize();
		// Pass
	}

	public computePositions(root: {x: number, y: number}) {
		super.computePositions(root);

		if (this.placementMode.type === "pulse") {
			if (this.placementMode.config.orientation === "bottom") {
				this.setVerticalFlip(true);
			} else {
				this.setVerticalFlip(false)
			}
		}

		return
	}

	protected setVerticalFlip(flipped: boolean) {
		if (this.flipped === flipped) {
			return
		}

		// TODO: this is slightly problematic
		this.offset = [this.offset[0], -Math.abs(this.offset[1])]; // Strange entanglement error was happening here

		this.svg?.children().forEach((c) => {
			c.transform({flip: "y"});
		});

		this.padding = [this.padding[2], this.padding[1], this.padding[0], this.padding[3]];

		this.flipped = flipped;
	}

	// Construct and SVG with children positioned relative to (0, 0)
	getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined ) {return undefined}
		var cloned: Element = this.svg.clone(true, true);
		cloned.move(0, 0);

		return cloned;
	}

	get drawX(): number {
		return this.cx + this.offset[0];
	}
	get drawY(): number {
		return this.cy + this.offset[1];
	}
}
