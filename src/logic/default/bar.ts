import { IRectElement } from "../rectElement";

export const DEFAULT_BAR: IRectElement = {
	"ref": "DEFAULT_BAR",
	"contentWidth": 0,
	"contentHeight": 3,
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"placementMode": {"type": "managed"},
	"sizeMode": {"x": "grow", "y": "fixed"},

	"style": {
		"fill": "#000000",
		"stroke": "black",
		"strokeWidth": 0
	}
}

var bar: IRectElement = {
  padding: [
    0,
    4,
    0,
    4,
  ],
  offset: [
    0,
    0,
  ],
  contentWidth: 7,
  contentHeight: 50,
  placementMode: {
    type: "grid",
    gridConfig: {
      coords: {
        row: 1,
        col: 1,
      },
      alignment: {
        x: "here",
        y: "here",
      },
      gridSize: {
        noRows: 1,
        noCols: 1,
      },
    },
  },
  
  style: {
    fill: "#000000",
    stroke: "black",
    strokeWidth: 0,
  },
  ref: "bar",
}