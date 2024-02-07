import { Svg, SVG } from "@svgdotjs/svg.js";
import { Drawable } from "./drawable";
import { labelable } from "./temporal";
import * as defaultArrow from "./default/arrrow.json"


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
            orient="auto-start-reverse" 
            markerWidth='2' 
            markerHeight='4' 
            refX='0.1' 
            refY='2'
            >
            <path d='M0,0 V4 L2,2 Z' fill="${this.style.stroke}" />
          </marker>
        </defs>
      `

      var arrowSVG = `<svg>
            ${def}
          <path
            id='arrow-line'
            marker-start='url(#head)'
            marker-end='url(#head)'
            stroke-width='${this.style.thickness}'
            stroke='${this.style.stroke}'  
            d='M${this.x},${this.y}, ${this.x2} ${this.y2}'
          />
                
        </svg>`

        console.log(this.x, this.y, this.x2, this.y2)
        
        var svgObj = SVG(arrowSVG);
        surface.add(svgObj);
    }
}