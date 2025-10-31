import { Element } from "@svgdotjs/svg.js";
import { defaultSpace } from "./default/index";
import { UserComponentType } from "./point";
import Visual, { IDraw, IVisual } from "./visual";

console.log("Load module space")

export interface ISpace extends IVisual {}

export default class Space extends Visual implements ISpace, IDraw {
	static defaults: {[key: string]: ISpace} = {default: <any>defaultSpace};
	get state(): ISpace { return super.state }
	static ElementType: UserComponentType = "space";

	constructor(params: ISpace) {
		super(params);
	}

	draw(surface: Element) {}
	erase() {}
}
