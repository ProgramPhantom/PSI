import { ISimpleLabelGroup } from "../hasComponents/SimpleLabelGroup";
import { IRectElement } from "../rectElement";
import { ILabel } from "../hasComponents/label";
import { ILaTeX } from "../latex";
import { DEFAULT_180S } from "./svgPulse/180Soft";

export const DEFAULT_SIMPLE_LABEL_GROUP: ISimpleLabelGroup = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"contentWidth": 120,
	"contentHeight": 30,

	"children": [
		{
			...DEFAULT_180S,
			"role": "coreChild"
		},
		{
			"offset": [0, 0],
			"padding": [0, 0, 2, 0],
			"sizeMode": { x: "fit", y: "fit" },
			"mainAxis": "y",
			"placementMode": { "type": "free" },
			"ref": "top-label",
			"labelConfig": {
				"textPosition": "top"
			},
			"role": "labelTop",
			"type": "label",
			"children": [
				{
					"contentWidth": 10,
					"contentHeight": 10,
					"text": "\\tau_1",
					"padding": [0, 0, 2, 0],
					"offset": [0, 0],
					"style": {
						"fontSize": 35,
						"colour": "black",
						"background": null,
						"display": "block"
					},
					"ref": "top-label-text",
					"type": "latex",
					"role": "text"
				} as ILaTeX
			]
		} as ILabel,
		{
			"offset": [0, 0],
			"padding": [0, 0, 2, 0],
			"sizeMode": { x: "fit", y: "fit" },
			"mainAxis": "y",
			"placementMode": { "type": "free" },
			"ref": "bottom-label",
			"labelConfig": {
				"textPosition": "bottom"
			},
			"role": "labelBottom",
			"type": "label",
			"children": [
				{
					"contentWidth": 10,
					"contentHeight": 10,
					"text": "\\tau_1",
					"padding": [0, 0, 2, 0],
					"offset": [0, 0],
					"style": {
						"fontSize": 35,
						"colour": "black",
						"background": null,
						"display": "block"
					},
					"ref": "bottom-label-text",
					"type": "latex",
					"role": "text"
				} as ILaTeX
			]
		} as ILabel
	],
	"ref": "SimpleLabelGroupTest",
	"type": "simple-label-group"
};
