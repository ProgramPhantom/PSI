import { Svg, SVG } from "@svgdotjs/svg.js";
import { Element, IElement } from "./element";
import { labelable } from "./positional";
import * as defaultArrow from "./default/data/arrow.json"
import { FillObject, UpdateObj } from "./util";
import LineElement, { ILineLike } from "./lineElement";

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

export interface IArrow extends ILineLike {
    position: ArrowPosition,
    style: arrowStyle,
}

export interface arrowStyle {
    thickness: number,
    headStyle: HeadStyle,
    stroke: string,
}


export default class Arrow extends LineElement {
  static defaults: {[key: string]: IArrow} = {"arrow": {...<any>defaultArrow}}

  style: arrowStyle;
  position: ArrowPosition;
 
  constructor(params: Partial<IArrow>, templateName: string="arrow") {
    var fullParams: IArrow = FillObject(params, Arrow.defaults[templateName])
    super(fullParams);

    this.style = fullParams.style;
    this.padding = fullParams.padding;
    this.position = fullParams.position;
  }


  public draw(surface: Svg): void {
    if (!this.dirty) {
      return
    }
    this.dirty = false;

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