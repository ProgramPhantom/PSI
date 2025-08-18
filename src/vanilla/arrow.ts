import { Svg, SVG } from "@svgdotjs/svg.js";
import { Visual, IVisual } from "./visual";
import defaultArrow from "./default/data/arrow.json"
import { FillObject, RecursivePartial, UpdateObj } from "./util";
import { ILine, Line } from "./line";


export enum HeadStyle {
    default="default",
    thin="thin",
    none="none"
}

export interface IArrowStyle {
    headStyle: HeadStyle,
}

export interface IArrow extends ILine {
    arrowStyle: IArrowStyle,
}


export default class Arrow extends Line {
  static defaults: {[key: string]: IArrow} = {"default": {...<any>defaultArrow}}
  static def: string = `
    <defs>
        <marker 
          id='head' 
          viewBox="0 0 20 20"
          refX="4"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" />
        </marker>
      </defs>
    `
  static arbitraryAdjustment: number = 1;
  get state(): IArrow { return {
    x: this._x,
    y: this._y,
    contentWidth: this._contentWidth,
    contentHeight: this._contentHeight,
    padding: this.padding,
    offset: this.offset,
    ref: this.ref,
    style: this.style,
    adjustment: this.adjustment,
    orientation: this.orientation,
    arrowStyle: this.arrowStyle
  }}

  arrowStyle: IArrowStyle;
 
  constructor(params: RecursivePartial<IArrow>, templateName: string="default") {
    var fullParams: IArrow = FillObject(params, Arrow.defaults[templateName])
    super(fullParams);

    this.arrowStyle = fullParams.arrowStyle;
    this.sizeSource.x = "inherited"; this.sizeSource.y = "inherited"
  }


  public override draw(surface: Svg): void {
    if (this.dirty) {
      // Clear old svg
      if (this.svg) {
          this.svg.remove();
      }

      this.svg = SVG(`<svg>
          ${Arrow.def}
        <path
          id='arrow-line'
          ${ this.arrowStyle.headStyle !== HeadStyle.none ? "marker-start='url(#head)' marker-end='url(#head)'" : ''}
          stroke-width='${this.style.thickness}'
          stroke='${this.style.stroke}'
          stroke-linecap="butt"
          d='M${this.x}, ${this.y}, ${this.x2} ${this.y2}'
        />
      </svg>`)
      
      surface.add(this.svg)
    }
  }
}