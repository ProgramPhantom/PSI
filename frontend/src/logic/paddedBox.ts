import { ID } from "./point";
import Spacial, { ISpacial, PlacementConfiguration, PlacementControl, Size, SizeConfiguration } from "./spacial";


type Padding = number | [number, number] | [number, number, number, number];

export interface IPaddedBox extends ISpacial {
	padding: [number, number, number, number];
}

// After inheriting from this class, x and y are now located away from the actual content, defined by this.padding.
export default class PaddedBox extends Spacial implements IPaddedBox {
	static override CreateUnion(...rects: (PaddedBox | Spacial)[]): PaddedBox {
		if (rects.length === 0) {
			return new PaddedBox();
		}

		let top = Infinity;
		let left = Infinity;
		let bottom = -Infinity;
		let right = -Infinity;

		let ctop = Infinity;
		let cleft = Infinity;
		let cbottom = -Infinity;
		let cright = -Infinity;

		rects.forEach((r) => {
			top = Math.min(top, r.y);
			bottom = Math.max(bottom, r.y2);
			left = Math.min(left, r.x);
			right = Math.max(right, r.x2);

			let rCy = r instanceof PaddedBox ? r.cy : r.y;
			let rCy2 = r instanceof PaddedBox ? r.cy2 : r.y2;
			let rCx = r instanceof PaddedBox ? r.cx : r.x;
			let rCx2 = r instanceof PaddedBox ? r.cx2 : r.x2;

			ctop = Math.min(ctop, rCy);
			cbottom = Math.max(cbottom, rCy2);
			cleft = Math.min(cleft, rCx);
			cright = Math.max(cright, rCx2);
		});

		let padTop = Math.max(0, ctop - top);
		let padBottom = Math.max(0, bottom - cbottom);
		let padLeft = Math.max(0, cleft - left);
		let padRight = Math.max(0, right - cright);

		let contentWidth = Math.max(0, cright - cleft);
		let contentHeight = Math.max(0, cbottom - ctop);

		return new PaddedBox({
			x: left,
			y: top,
			contentWidth,
			contentHeight,
			padding: [padTop, padRight, padBottom, padLeft],
			placementMode: { type: "free" },
			ref: "union",
			type: "lower-abstract"
		});
	}


	get state(): IPaddedBox {
		return {
			padding: this.padding,
			...super.state
		};
	}

	padding: [number, number, number, number] = [0, 0, 0, 0];

	constructor(
		params: IPaddedBox = {
			padding: [0, 0, 0, 0],
			contentWidth: 0,
			contentHeight: 0,
			placementMode: { type: "free" },
			placementControl: "user",
			sizeMode: { x: "fixed", y: "fixed" },
			ref: "padded-box",
			type: "lower-abstract",
		}
	) {
		super(params);

		this.padding = [params.padding[0], params.padding[1], params.padding[2], params.padding[3]];
	}

	public get cx(): number {
		return this.x + this.padding[3];
	}
	public set cx(v: number) {
		this.x = v - this.padding[3];
	}

	public get cy(): number {
		return this.y + this.padding[0];
	}
	public set cy(v: number) {
		this.y = v - this.padding[0];
	}

	public get cx2(): number {
		return this.x2 - this.padding[1];
	}
	public set cx2(v: number) {
		this.x2 = v + this.padding[1];
	}

	public get cy2(): number {
		return this.y2 - this.padding[2];
	}
	public set cy2(v: number) {
		this.y2 = v + this.padding[2];
	}

	override get width(): number {
		return this.padding[3] + this.contentWidth + this.padding[1];
	}
	override set width(v: number) {
		var newContentWidth: number = v - this.padding[1] - this.padding[3];

		if (newContentWidth < 0) {
			// Don't allow content height to go below 0
			this.contentWidth = 0;
		} else {
			this.contentWidth = newContentWidth;
		}
	}

	override get height(): number {
		return this.padding[0] + this.contentHeight + this.padding[2];
	}
	override set height(v: number) {
		var newContentHeight: number = v - this.padding[0] - this.padding[2];

		if (newContentHeight < 0) {
			// Don't allow content height to go below 0
			this.contentHeight = 0;
		} else {
			this.contentHeight = newContentHeight;
		}
	}

	public get contentSize(): Size {
		return { width: this.contentWidth, height: this.contentHeight }
	}
}
