import { Svg, SVG } from "@svgdotjs/svg.js";
import { Drawable } from "./drawable";
import { labelable } from "./temporal";
import * as defaultArrow from "./default/data/arrow.json"


export enum headStyle {
    Default="default",
    Thin="thin"
}
export const headStyleEval: {[name: string]: headStyle} = {
    "default": headStyle.Default,
    "thin": headStyle.Thin,
}

export interface arrowInterface {
    x: number,
    y: number,
    x2: number,
    y2: number,
    style: arrowStyle,
}

export interface arrowStyle {
    thickness: number,
    headStyle: headStyle,
    stroke: string,
}


export default class Arrow extends Drawable {
    static defaults: arrowInterface = {
        x: defaultArrow.x,
        y: defaultArrow.y,
        x2: defaultArrow.x2,
        y2: defaultArrow.y2,
        style: {
            thickness: defaultArrow.style.thickness, 
            headStyle: headStyleEval[defaultArrow.style.headStyle], 
            stroke: defaultArrow.style.stroke,
        },
    }

    x2: number;
    y2: number;

    style: arrowStyle;

    constructor(x: number=Arrow.defaults.x, 
                y: number=Arrow.defaults.y, 
                x2: number=Arrow.defaults.x2, 
                y2: number=Arrow.defaults.y2, 
                arrowStyle: arrowStyle=Arrow.defaults.style, 
                offset: number[]=[0, 0]) {
        super(x, y, offset)

        this.x2 = x2;
        this.y2 = y2;

        this.style = arrowStyle;
    }

    public draw(surface: Svg): void {
      const def = `
      <defs>
          <marker 
            id='head' 
            viewBox="0 0 20 20"
            refX="0"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 0 L 8 3 L 0 6 z" />
          </marker>
        </defs>
      `

      // Could do some maths to automatically scale arrow head
      // to thickness but not now
    
      const arbiraryAdjustment = 13;
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