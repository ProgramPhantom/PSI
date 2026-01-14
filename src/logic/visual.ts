import { Element, Mask } from "@svgdotjs/svg.js";
import PaddedBox, { IPaddedBox } from "./paddedBox";
import { BAR_MASK_ID, ID, UserComponentType } from "./point";
import { IAlignerConfig, IGridConfig, IPulseConfig, isPulse, Size } from "./spacial";
import { Rect } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";


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

export type PulseElement<T extends Visual = Visual> = T & { placementMode: { type: "pulse"; config: IPulseConfig } };
export type GridElement<T extends Visual = Visual> = T & { placementMode: { type: "grid"; config: IGridConfig } };
export type AlignerElement<T extends Visual = Visual> = T & { placementMode: { type: "aligner"; config: IAlignerConfig } };
export type FreeElement<T extends Visual = Visual> = T & { placementMode: { type: "free" } };
export type BindsElement<T extends Visual = Visual> = T & { placementMode: { type: "binds"; bindings: undefined } };

export default abstract class Visual extends PaddedBox implements IVisual {
	static ElementType: UserComponentType = "rect";
	get state(): IVisual {
		return {
			offset: this.offset,
			...super.state
		};
	}
	get allElements(): Record<ID, Visual> {
		return { [this.id]: this };
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
	maskId?: string;
	maskBlock?: Rect;

	flipped: boolean = false;

	constructor(params: IVisual) {
		super(params);

		this.offset = params.offset;
	}

	draw(surface: Element): void {
		// Add mask
		if (this.maskId !== undefined) {
			this.svg?.attr({ "mask": `url(#${this.maskId})` })
		}

		// Add to mask
		if (isPulse(this) && this.pulseData.clipBar) {
			// Find (or create) the mask
			var mask = surface.root().findOne("#" + BAR_MASK_ID) as Mask;
			if (!mask) {
				mask = surface.root().mask().id(BAR_MASK_ID);
				// Add a white rectangle to the mask to allow everything ELSE to show
				// This white rect must be large enough to cover the whole canvas
				// We can try adding a very large rect? Or wait for channel to init it?
				// Assuming channel/canvas setup handles the "base" white mask or we add a large white rect here.
				// Based on "indiscriminately clips everything under its self", standard SVG mask behavior:
				// White = show, Black = hide.
				// So we need a white background.
				mask.add(surface.root().rect(100000, 100000).move(-50000, -50000).fill("#fff"));
			}

			let block: Rect | undefined = this.maskBlock;
			if (block === undefined) {
				// Add SELF to the mask as BLACK to hide bar under self.
				// Clone internal rep	
				let blockedArea = new Rect().size(this.width, this.height).move(this.drawX, this.drawY)
					.attr({ fill: "#000", opacity: 1, stroke: "none" }).id(`mask-${this.id}`);
				// Not allowed query selectors that start with a digit.


				this.maskBlock = blockedArea;
				mask.add(this.maskBlock)
			} else {
				block.size(this.width, this.height).move(this.drawX, this.drawY)
			}
		}
	}

	erase(): void {
		this.svg?.remove();
	}

	public computeSize(): Size {
		return super.computeSize();
		// Pass
	}

	public computePositions(root: { x: number, y: number }) {
		super.computePositions(root);

		if (isPulse(this)) {
			if (this.pulseData.orientation === "bottom") {
				this.setVerticalFlip(true);
			} else {
				this.setVerticalFlip(false)
			}
		}

		return
	}

	protected computeSelf() {
		this.computeSize();
		this.growElement(this.size);
		this.computePositions({ x: 0, y: 0 });
	}

	protected setVerticalFlip(flipped: boolean) {
		if (this.flipped === flipped) {
			return
		}

		// TODO: this is slightly problematic
		this.offset = [this.offset[0], -Math.abs(this.offset[1])]; // Strange entanglement error was happening here

		this.svg?.children().forEach((c) => {
			c.transform({ flip: "y" });
		});

		this.padding = [this.padding[2], this.padding[1], this.padding[0], this.padding[3]];

		this.flipped = flipped;
	}

	// Construct and SVG with children positioned relative to (0, 0)
	getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined) { return undefined }
		var cloned: Element = this.svg.clone(true, true);
		cloned.move(0, 0);

		return cloned;
	}

	public get drawCX(): number {
		return this.cx + this.offset[0];
	}
	public get drawCY(): number {
		return this.cy + this.offset[1];
	}

	public get drawX(): number {
		return this.x + this.offset[0];
	}
	public get drawY(): number {
		return this.y + this.offset[1];
	}

	public getHitbox(): Rect {
		var hitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({ "data-editor": "hitbox", key: this.ref });

		hitbox.size(this.width, this.height);
		hitbox.move(this.drawX, this.drawY);
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}
}
