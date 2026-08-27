import { IconName } from "@blueprintjs/core";
import { DEFAULT_BAR } from "../../logic/default/bar";
import { DEFAULT_CHANNEL_TEXT } from "../../logic/default/defaultChannelLabel";
import { defaultChannel, defaultDiagram, defaultLabel, defaultLaTeX, defaultLine, defaultRectElement, defaultSpace, defaultText, defaultVisual } from "../../logic/default/index";
import { DEFAULT_SEQUENCE } from "../../logic/default/sequence";
import { DEFAULT_180S } from "../../logic/default/svgPulse/180Soft";
import { ILabel } from "../../logic/hasComponents/label";
import { ILaTeX } from "../../logic/latex";
import { AllComponentTypes } from "../../logic/point";
import { IRectElement } from "../../logic/rectElement";
import { ISpace } from "../../logic/space";
import { IText } from "../../logic/text";
import { IVisual } from "../../logic/visual";
import ArrowForm from "./ArrowForm";
import ChannelForm from "./ChannelForm";
import { GridForm } from "./GridForm";
import LabelForm from "./LabelForm";
import LaTeXForm from "./LaTeXForm";
import RectElementForm from "./RectForm";
import SVGElementForm from "./SVGElementForm";
import TextForm from "./TextForm";
import VisualForm from "./VisualForm";



import { FormRequirements } from "./FormBase";

export interface RoleSchema {
	displayName: string;
	elementType: AllComponentTypes;
	icon?: IconName;
	mandatory?: boolean;
	defaultValues?: Partial<IVisual>;
}

export interface FormBundle<T extends IVisual = IVisual> {
	form: React.FC<FormRequirements>;
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
	"latex": {
		form: LaTeXForm,
		defaults: defaultLaTeX as ILaTeX,
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
			"labelTop": { displayName: "Top", elementType: "label", icon: "tag" },
			"labelBottom": { displayName: "Bottom", elementType: "label", icon: "tag" },
			"labelRight": { displayName: "Right", elementType: "label", icon: "tag" },
			"labelLeft": { displayName: "Left", elementType: "label", icon: "tag" },
			"labelCentre": { displayName: "Centre", elementType: "label", icon: "tag" }
		}
	},
	"simple-label-group": {
		form: GridForm,
		defaults: defaultVisual,
		allowLabels: false,
		roles: {
			"labelTop": { displayName: "Top", elementType: "label", icon: "tag" },
			"labelBottom": { displayName: "Bottom", elementType: "label", icon: "tag" }
		}
	},
	"line": {
		form: ArrowForm,
		defaults: defaultLine,
		allowLabels: false
	},
	"label": {
		form: LabelForm,
		defaults: defaultLabel as ILabel,
		allowLabels: false,
		roles: {
			"text": {
				displayName: "Text",
				elementType: "latex",
				icon: "function",
				mandatory: true,
				defaultValues: (defaultLabel.children?.find(c => c.role === "text")) ?? defaultLaTeX
			},
			"line": {
				displayName: "Arrow",
				elementType: "line",
				icon: "arrows-horizontal",
				mandatory: true,
				defaultValues: (defaultLabel.children?.find(c => c.role === "line")) ?? defaultLine
			}
		}
	},
	// "diagram": {
	// 	form: Diagram
	// }
	"channel": {
		form: ChannelForm,
		defaults: defaultChannel,
		allowLabels: false,
		roles: {
			"label": {
				displayName: "Label",
				elementType: "latex",
				icon: "function",
				mandatory: true,
				defaultValues: DEFAULT_CHANNEL_TEXT
			},
			"bar": {
				displayName: "Bar",
				elementType: "rect",
				icon: "square",
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