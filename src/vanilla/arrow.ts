import { Svg, SVG } from "@svgdotjs/svg.js";
import { Visual, IVisual } from "./visual";
import defaultArrow from "./default/data/arrow.json"
import { FillObject, RecursivePartial, UpdateObj } from "./util";
import { ILine, Line } from "./line";
import { Element } from "@svgdotjs/svg.js";
import { Defs } from "@svgdotjs/svg.js";
import { Marker } from "@svgdotjs/svg.js";
import { CoreAttr } from "@svgdotjs/svg.js";
import { Path } from "@svgdotjs/svg.js";
import { UserComponentType } from "./diagramHandler";


type HeadStyle = "default" | "thin" |"none"

export interface IArrowStyle {
    headStyle: HeadStyle,
}

export interface IArrow extends ILine {
    arrowStyle: IArrowStyle,
}


export default class Arrow extends Line {
  static defaults: {[key: string]: IArrow} = {"default": {...<any>defaultArrow}}
  static ElementType: UserComponentType = "arrow";

  static arbitraryAdjustment: number = 1;
  get state(): IArrow { return {
    arrowStyle: this.arrowStyle,
    ...super.state
  }}

  arrowStyle: IArrowStyle;
 
  constructor(params: RecursivePartial<IArrow>, templateName: string="default") {
    var fullParams: IArrow = FillObject(params, Arrow.defaults[templateName])
    super(fullParams);

    this.arrowStyle = fullParams.arrowStyle;
    this.sizeSource.x = "inherited"; this.sizeSource.y = "inherited"
  }


  public override draw(surface: Element): void {
    if (this.dirty) {
      // Clear old svg
      if (this.svg) {
          this.svg.remove();
      }

      var markerLength = 3;
      var markerWidth = 3;
      var markerPath = new Path().attr({"d": `M 0 0 L ${markerLength} ${markerWidth/2} L 0 ${markerWidth} z`})
      var marker = new Marker().id("head").attr({
              "refX": "0",
              "refY": markerWidth/2,
              "markerWidth": markerLength,
              "markerHeight": markerLength,
              "orient": "auto-start-reverse",
      }).add(markerPath);
      var markerDefs = new Defs().add(marker);

      
      var dy = Math.sin(this.angle!) * markerLength
      var dx = Math.cos(this.angle!) * markerLength

      var pathData: string = `M${this.x + dx}, ${this.y + dy}, ${this.x2 - dx} ${this.y2 - dy}`;

      var newArrow = SVG().path().id("arrow-line")
                     .attr({strokeWidth: `${this.style.thickness}`,
                            stroke: `${this.style.stroke}`,
                            strokeLinecap: "butt",
                            d: pathData,
                            "marker-start": 'url(#head)',
                            "marker-end": 'url(#head)',
                            "stroke-dasharray": `${this.style.dashing[0]} ${this.style.dashing[1]}`,
                            "stroke-width": `${this.style.thickness}`})
                      
      
      this.svg = newArrow;

      
      surface.add(this.svg)
      surface.add(markerDefs)
    }
  }
}