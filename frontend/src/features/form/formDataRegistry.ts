
import { DEFAULT_BAR } from "../../logic/default/bar";
import { DEFAULT_CHANNEL_TEXT } from "../../logic/default/defaultChannelLabel";
import { defaultChannel, defaultDiagram, defaultLabel, defaultRectElement, defaultSpace, defaultText, defaultVisual } from "../../logic/default/index";
import { DEFAULT_LABEL } from "../../logic/default/label";
import { DEFAULT_SEQUENCE } from "../../logic/default/sequence";
import { DEFAULT_180H } from "../../logic/default/simplePulse/180pulse";
import { DEFAULT_180S } from "../../logic/default/svgPulse/180Soft";
import { DEFAULT_TEXT } from "../../logic/default/text";
import { ILabel } from "../../logic/hasComponents/label";
import { AllComponentTypes } from "../../logic/point";
import { IRectElement } from "../../logic/rectElement";
import { ISpace } from "../../logic/space";
import { IText } from "../../logic/text";
import { IVisual } from "../../logic/visual";
import ChannelForm from "./ChannelForm";
import { GridForm } from "./GridForm";
import LabelForm from "./LabelForm";
import RectElementForm from "./RectForm";
import SVGElementForm from "./SVGElementForm";
import TextForm from "./TextForm";
import VisualForm from "./VisualForm";


export interface RoleSchema {
	displayName: string;
	elementType: AllComponentTypes;
	mandatory?: boolean;
	defaultValues?: Partial<IVisual>;
}

export interface FormBundle<T extends IVisual = IVisual> {
	form: React.FC;
	defaults: T;
	allowLabels: boolean;
	/** When role children are added, wrap this element in this container type */
	roles?: Record<string, RoleSchema>;
}

export const FORM_DEFAULTS: Partial<Record<AllComponentTypes, FormBundle>> = {
	"visual": {
		form: VisualForm,
		defaults: defaultVisual as IVisual,
		allowLabels: false
	},
	"svg": {
		form: SVGElementForm,
		defaults: DEFAULT_180S,
		allowLabels: true,
	},
	"text": {
		form: TextForm,
		defaults: defaultText as IText,
		allowLabels: false
	},
	"space": {
		form: VisualForm,
		defaults: defaultSpace as ISpace,
		allowLabels: true,
	},
	"rect": {
		form: RectElementForm,
		defaults: defaultRectElement as IRectElement,
		allowLabels: true,
	},
	"label-group": {
		form: GridForm,
		defaults: defaultVisual,
		allowLabels: false,
		roles: {
			"labelTop": { displayName: "Top", elementType: "label" },
			"labelBottom": { displayName: "Bottom", elementType: "label" },
			"labelRight": { displayName: "Right", elementType: "label" },
			"labelLeft": { displayName: "Left", elementType: "label" }
		}
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
		allowLabels: false,
		roles: {
			"label": { displayName: "Label", elementType: "text", 
				mandatory: true, 
				defaultValues: DEFAULT_CHANNEL_TEXT  },
			"bar": { displayName: "Bar", elementType: "rect",
				mandatory: true,
				defaultValues: DEFAULT_BAR
			 }
		}
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
	},
	"sequence": {
		form: VisualForm,
		defaults: DEFAULT_SEQUENCE,
		allowLabels: false
	}
}