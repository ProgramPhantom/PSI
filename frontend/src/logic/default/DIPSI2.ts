import { ILabelGroup } from "../hasComponents/labelGroup"
import { IRectElement } from "../rectElement"
import { ILaTeX } from "../latex"
import { DEFAULT_LABEL } from "./label"

export const DISPSI2: ILabelGroup = {
    "padding": [0, 0, 0, 0],
    "offset": [0, 0],
    "contentWidth": 120,
    "contentHeight": 30,

    "pulseLayoutConfig": {
        "alignment": { "x": "centre", "y": "far" },
        "orientation": "top",
        "noSections": 1,
    },


    "children": [
        {
            "contentWidth": 120,
            "contentHeight": 30,
            "padding": [0, 0, 0, 0],
            "offset": [0, 0],

            "style": {
                "fill": "#000000",
                "stroke": "black",
                "strokeWidth": 0
            },

            "role": "coreChild",
            "ref": "DIPSI2",
            "type": "rect"
        } as IRectElement,
        {

            "contentWidth": 30,
            "contentHeight": 30,

            "text": "\\text{DIPSI-2}",
            "padding": [0, 0, 0, 0],
            "offset": [0, 0],

            "style": {
                "fontSize": 34,
                "colour": "white",
                "background": null,
                "display": "block"
            },
            "ref": "label-text",
            "type": "latex",

            "role": "labelCentre"
        } as ILaTeX
    ],

    "ref": "DIPSI2",
    "type": "label-group"
}
