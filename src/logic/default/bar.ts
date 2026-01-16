import { IRectElement } from "../rectElement";

export const DEFAULT_BAR: IRectElement = {
  "ref": "DEFAULT_BAR",
  "contentWidth": 0,
  "contentHeight": 3,
  "padding": [0, 0, 0, 0],
  "offset": [0, 0],

  "sizeMode": { "x": "grow", "y": "fixed" },
  "placementControl": "auto",

  "style": {
    "fill": "#000000",
    "stroke": "black",
    "strokeWidth": 0
  },
  "type": "rect"
}