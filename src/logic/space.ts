import { Element } from "@svgdotjs/svg.js";
import { FormRequirements } from "../features/form/FormDiagramInterface";
import VisualForm from "../features/form/VisualForm";
import { defaultSpace } from "./default/index";
import { UserComponentType } from "./diagramHandler";
import { FillObject, RecursivePartial } from "./util";
import { IDraw, IVisual, Visual } from "./visual";

export interface ISpace extends IVisual {}

export default class Space extends Visual implements ISpace, IDraw {
	static defaults: {[key: string]: ISpace} = {default: <any>defaultSpace};
	get state(): ISpace {
		return {
			x: this.x,
			y: this.y,
			contentWidth: this.contentWidth,
			contentHeight: this.contentHeight,
			padding: this.padding,
			ref: this.ref,
			offset: this.offset,
			mountConfig: this.mountConfig
		};
	}
	static ElementType: UserComponentType = "space";
	static form: React.FC<FormRequirements> = VisualForm;

	constructor(params: RecursivePartial<ISpace>, templateName: string = "default") {
		var fullParams: ISpace = FillObject(params, Space.defaults[templateName]);
		super(fullParams);
	}

	draw(surface: Element) {}
	erase() {}
}
