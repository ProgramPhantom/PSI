
import { defaultChannel, defaultLabel, defaultRectElement, defaultSpace, defaultSvgElement, defaultText, defaultVisual } from "../../logic/default/index";
import { IChannel } from "../../logic/hasComponents/channel";
import { ILabel } from "../../logic/hasComponents/label";
import { AllComponentTypes } from "../../logic/point";
import { IRectElement } from "../../logic/rectElement";
import { ISpace } from "../../logic/space";
import { ISVGElement } from "../../logic/svgElement";
import { IText } from "../../logic/text";
import { IVisual } from "../../logic/visual";
import ChannelForm from "./ChannelForm";
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
		defaults: defaultChannel as IChannel,
		allowLabels: false
	}
}