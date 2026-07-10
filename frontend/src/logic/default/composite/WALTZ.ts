import { ILabelGroup } from "../../hasComponents/labelGroup";
import { ILaTeX } from "../../latex";
import { IRectElement } from "../../rectElement";


export const WALTZ: ILabelGroup = {
    "padding": [0, 0, 0, 0],
    "offset": [0, 0],
    "contentWidth": 120,
    "contentHeight": 30,

    "pulseLayoutConfig": {
        "alignment": { "x": "centre", "y": "far" },
        "orientation": "top",
        "noSections": 1,
    },

    "pulseData": {
        "pulseType": { "category": "shape", "type": "Composite" }
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
            "ref": "WALTZ",
            "type": "rect"
        } as IRectElement,
        {

            "contentWidth": 30,
            "contentHeight": 30,

            "text": "\\text{WALTZ}",
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

    "ref": "WALTZ",
    "type": "label-group"
}
