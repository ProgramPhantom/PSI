import { Svg, SVG } from "@svgdotjs/svg.js";
import { Drawable } from "./drawable";
import { labelable } from "./temporal";
import * as defaultBracket from "./default/data/bracket.json"
import Label, { labelInterface, Position } from "./label";
import { UpdateObj } from "./util";


export enum bracketType {
    curly="curly",
    square="square"
}

export enum Side {
    top="top",
    bottom="bottom",
    left="left",
    right="right",
}

export interface bracketInterface {
    side: Side,
    protrusion: number,
    style: bracketStyle,
    label: labelInterface,

    timespan?: number[],
}

export interface bracketStyle {
    strokeWidth: number,
    bracketType: bracketType,
    expression: number,
    stroke: string,
}



export default class Bracket extends Drawable implements labelable {
    static defaults: {[key: string]: bracketInterface} = {"horizontal": {...<any>defaultBracket}}

    public static anyArgConstruct(defaultArgs: bracketInterface, args: bracketInterface): Bracket {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        return new Bracket(
            {protrusion: options.protrusion,
             side: options.side,
             style: options.style,
             label: options.label,
             timespan: options.timespan}
        )
    }


    x1: number;
    y1: number;
    x2: number;
    y2: number;

    style: bracketStyle;

    protrusion: number;
    bracketProtrusion: number;
    totalProtrusion: number;

    side: Side;

    label?: Label;
    timespan?: number[];

    constructor(params: bracketInterface,
                offset: number[]=[0, 0]) {

        super(0, 0, offset)

        this.x1 = 0;
        this.y1 = 40;
        this.x2 = 50;
        this.y2 = 40;

        this.style = params.style;
        
        this.side = params.side;
        this.bracketProtrusion = Math.abs(params.protrusion);
        this.totalProtrusion = 0;
        
        switch (this.side) {
            case Side.top:
                this.protrusion = -params.protrusion;
                break;
            case Side.right:
                this.protrusion = -params.protrusion;
                break;
            case Side.left:
                this.protrusion = params.protrusion;
                break;
            case Side.bottom:
                this.protrusion = params.protrusion;
                break;
        }

        if (params.label) {
            this.label = Label.anyArgConstruct(Label.defaults["label"], params.label);
        }
        this.timespan = params.timespan;
        
        this.computeTotalProtrusion();
    }

    public draw(surface: Svg): void {
        // Position the bracket and the label:


        switch (this.side) {
            case Side.top:
                var width = this.x2 - this.x1;

                // Label on top
                if (this.label) {
                    // If centre:
                    this.label.x = this.x + width/2 - this.label.width/2;
                    this.label.y = this.y + this.label.padding[0];
                    var pro = this.drawLabel(surface);
                } else {
                    var pro = [0, 0];
                }
                this.y1 = this.y + this.bracketProtrusion + pro[1];
                this.y2 = this.y + this.bracketProtrusion + pro[1];
                break;
            case Side.bottom:
                var width = this.x2 - this.x1;

                if (this.label) {
                    this.label.x = this.x + width/2 - this.label.width/2;
                    this.label.y = this.y + this.bracketProtrusion;
                    var pro = this.drawLabel(surface);
                } else {
                    var pro = [0, 0];
                }

                this.y1 = this.y;
                this.y2 = this.y;
                
                break;
        }
        
        
        switch (this.style.bracketType) {
            case bracketType.curly:
                var path = this.createPath(this.x1, this.y1, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${path}">`;
                break;
            default:
                var path = this.createPath(this.x1, this.y1, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${path}">`; 
                break;
        }


        var svgObj = SVG(svgString);

        svgObj.attr({
            "stroke": this.style.stroke,
            "stroke-width": this.style.strokeWidth,
            "fill": "none"
        })

        surface.add(svgObj);


    }

    positionFlat(surface: Svg) {
        
    }

    // https://gist.github.com/alexhornbake/6005176
    //returns path string d for <path d="This string">
	//a curly brace between x1,y1 and x2,y2, w pixels wide 
	//and q factor, .5 is normal, higher q = more expressive bracket 
    createPath(x1: number, y1: number,x2: number,y2: number, w: number, q: number) {
		//Calculate unit vector
			var dx = x1-x2;
			var dy = y1-y2;
			var len = Math.sqrt(dx*dx + dy*dy);
			dx = dx / len;
			dy = dy / len;

			//Calculate Control Points of path,
			var qx1 = x1 + q*w*dy;
			var qy1 = y1 - q*w*dx;
			var qx2 = (x1 - .25*len*dx) + (1-q)*w*dy;
			var qy2 = (y1 - .25*len*dy) - (1-q)*w*dx;
			var tx1 = (x1 -  .5*len*dx) + w*dy;
			var ty1 = (y1 -  .5*len*dy) - w*dx;
			var qx3 = x2 + q*w*dy;
			var qy3 = y2 - q*w*dx;
			var qx4 = (x1 - .75*len*dx) + (1-q)*w*dy;
			var qy4 = (y1 - .75*len*dy) - (1-q)*w*dx;

    	return ( "M " +  x1 + " " +  y1 +
         		" Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 + 
          		" T " + tx1 + " " + ty1 +
          		" M " +  x2 + " " +  y2 +
          		" Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 + 
          		" T " + tx1 + " " + ty1 );
	}

    drawLabel(surface: Svg): number[] {
        if (!this.label) {
            return [0, 0];
        }

        this.label?.draw(surface);

        this.label.actualBounds = {
            width: this.label.width + this.label.padding[3] + this.label.padding[1],
            height: this.label.height + this.label.padding[0] + this.label.padding[2] 
        }

        return [this.label.actualWidth, this.label.actualHeight];
    }

    computeTotalProtrusion() {
        var totalProtrusion = this.bracketProtrusion;

        if (this.label) {
            switch(this.side) {
                case Side.top:
                case Side.bottom:
                    totalProtrusion += this.label.height + this.label.padding[0] + this.label.padding[2] ;
                    break;
                case Side.left:
                case Side.right:
                    totalProtrusion += this.label.width + this.label.padding[3] + this.label.padding[1];
                    break;
            }
        }
        
        this.totalProtrusion = totalProtrusion;
    }
}