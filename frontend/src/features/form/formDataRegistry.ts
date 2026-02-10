
import { defaultChannel, defaultDiagram, defaultLabel, defaultRectElement, defaultSpace, defaultSvgElement, defaultText, defaultVisual } from "../../logic/default/index";
import { ILabel } from "../../logic/hasComponents/label";
import { AllComponentTypes } from "../../logic/point";
import { IRectElement } from "../../logic/rectElement";
import { ISpace } from "../../logic/space";
import { ISVGElement } from "../../logic/svgElement";
import { IText } from "../../logic/text";
import Visual, { IVisual } from "../../logic/visual";
import ChannelForm from "./ChannelForm";
import { GridForm } from "./GridForm";
import LabelForm from "./LabelForm";
import RectElementForm from "./RectForm";
import SVGElementForm from "./SVGElementForm";
import TextForm from "./TextForm";
import VisualForm from "./VisualForm";


export interface FormBundle<T extends IVisual = IVisual> {
	form: React.FC;
	defaults: T;
	allowLabels: boolean;
}

export const FORM_DEFAULTS: Partial<Record<AllComponentTypes, FormBundle>> = {
	"visual": {
		form: VisualForm,
		defaults: defaultVisual as IVisual,
		allowLabels: false
	},
	"svg": {
		form: SVGElementForm,
		defaults: defaultSvgElement as ISVGElement,
		allowLabels: true
	},
	"text": {
		form: TextForm,
		defaults: defaultText as IText,
		allowLabels: false
	},
	"space": {
		form: VisualForm,
		defaults: defaultSpace as ISpace,
		allowLabels: true
	},
	"rect": {
		form: RectElementForm,
		defaults: defaultRectElement as IRectElement,
		allowLabels: true
	},
	"label-group": {
		form: GridForm,
		defaults: defaultVisual,
		allowLabels: false
	},
	// "line": {
	// 	form: LineFo
	// }
	"label": {
		form: LabelForm,
		defaults: defaultLabel as ILabel,
		allowLabels: false
	},
	// "diagram": {
	// 	form: Diagram
	// }
	"channel": {
		form: ChannelForm,
		defaults: defaultChannel,
		allowLabels: false
	},
	"diagram": {
		form: VisualForm,
		defaults: defaultDiagram,
		allowLabels: false
	},
	"subgrid": {
		form: VisualForm,
		defaults: defaultVisual,
		allowLabels: false
	},
	"grid": {
		form: VisualForm,
		defaults: defaultVisual,
		allowLabels: false
	}
}