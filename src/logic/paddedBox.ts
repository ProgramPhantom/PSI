import { ID } from "./point";
import Spacial, { ISpacial, PlacementConfiguration, PlacementControl, Size, SizeConfiguration } from "./spacial";


type Padding = number | [number, number] | [number, number, number, number];

export interface IPaddedBox extends ISpacial {
	padding: [number, number, number, number];
}

// After inheriting from this class, x and y are now located away from the actual content, defined by this.padding.
export default abstract class PaddedBox extends Spacial implements IPaddedBox {
	get state(): IPaddedBox {
		return {
			padding: this.padding,
			...super.state
		};
	}

	padding: [number, number, number, number] = [0, 0, 0, 0];

	constructor(
		padding: Padding = 0,
		x?: number,
		y?: number,
		width?: number,
		height?: number,
		placementMode?: PlacementConfiguration,
		placementControl?: PlacementControl,
		sizeMode?: SizeConfiguration,
		ref: string = PaddedBox.defaults["default"].ref,
		id: ID | undefined = undefined
	) {
		super(x, y, width, height, placementMode, placementControl, sizeMode, ref, id);

		if (typeof padding === "number") {
			this.padding = [padding, padding, padding, padding];
		} else if (typeof this.padding === "object") {
			if (padding.length === 2) {
				this.padding = [padding[0], padding[1], padding[0], padding[1]];
			} else {
				this.padding = padding;
			}
		}
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
