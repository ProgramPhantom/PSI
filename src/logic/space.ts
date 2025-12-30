import { Element } from "@svgdotjs/svg.js";
import { UserComponentType } from "./point";
import Visual, { IDraw, IVisual } from "./visual";

console.log("Load module space")

export interface ISpace extends IVisual {}

export default class Space extends Visual implements ISpace, IDraw {
	get state(): ISpace { return super.state }
	static ElementType: UserComponentType = "space";

	constructor(params: ISpace) {
		super(params);
	}

	draw(surface: Element) {}
	erase() {}
}
