import { Svg, SVG } from "@svgdotjs/svg.js";
import { Element } from "./drawable";
import { labelable } from "./temporal";
import * as defaultArrow from "./default/data/arrow.json"
import { UpdateObj } from "./util";

interface Dim {
  width: number,
  height: number
}

interface Bounds {
  top: number,
  bottom: number,
  left: number,
  right: number

  width: number,
  height: number,
}

export enum HeadStyle {
    default="default",
    thin="thin"
}

export enum ArrowPosition {
  bottom="bottom",
  inline="inline",
  top="top"
}

export interface arrowInterface {
    padding: number[],
    position: ArrowPosition,
    style: arrowStyle,
}

export interface arrowStyle {
    thickness: number,
    headStyle: HeadStyle,
    stroke: string,
}


export default class Arrow extends Element {
  static defaults: {[key: string]: arrowInterface} = {"arrow": {...<any>defaultArrow}}

  x2: number;
  y2: number;

  style: arrowStyle;
  padding: number[];
  position: ArrowPosition;

  constructor(params: arrowInterface=Arrow.defaults["arrow"], 
              offset: number[]=[0, 0]) {
      super(0, 0, offset)

      this.x2 = 0;
      this.y2 = 0;

      this.style = params.style;
      this.padding = params.padding;
      this.position = params.position;

      this.dim = {height: this.style.thickness, width: 0}
  }

  public set(x1: number, y1: number, x2: number, y2: number) {
    this.x = x1;
    this.y = y1;

    this.x2 = x2;
    this.y2 = y2;

    this.dim = {height: this.style.thickness, width: x2 - x1}
  }

  public draw(surface: Svg): void {
    const def = `
    <defs>
        <marker 
          id='head' 
          viewBox="0 0 20 20"
          refX="0"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" />
        </marker>
      </defs>
    `

    // Could do some maths to automatically scale arrow head
    // to thickness but not now
  
    const arbiraryAdjustment = 5;
    var arrowSVG = `<svg>
          ${def}
        <path
          id='arrow-line'
          marker-start='url(#head)'
          marker-end='url(#head)'
          stroke-width='${this.style.thickness}'
          stroke='${this.style.stroke}'  
          d='M${this.x + arbiraryAdjustment},${this.y}, ${this.x2 -  arbiraryAdjustment} ${this.y2}'
        />
              
      </svg>`

      

      var svgObj = SVG(arrowSVG);
      surface.add(svgObj);
  }
}