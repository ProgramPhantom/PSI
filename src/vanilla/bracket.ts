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

export enum Direction {
    down="down",
    up="up",
    left="left",
    right="right",
}

export interface bracketInterface {
    protrusion: number,
    style: bracketStyle,
    label: labelInterface,
    adjustment: number[],
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
             adjustment: options.adjustment,
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

    direction: Direction = Direction.down;
    adjustment: number[];

    label?: Label;
    timespan?: number[];

    constructor(params: bracketInterface,
                offset: number[]=[-1, 0]) {

        super(0, 0, offset)

        this.x1 = 0;
        this.y1 = 40;
        this.x2 = 50;
        this.y2 = 40;

        this.style = params.style;
        this.adjustment = params.adjustment;
        
        this.bracketProtrusion = Math.abs(params.protrusion);
        this.totalProtrusion = 0;
        
        switch (this.direction) {
            case Direction.down:
                this.protrusion = -params.protrusion;
                break;
            case Direction.right:
                this.protrusion = -params.protrusion;
                break;
            case Direction.left:
                this.protrusion = params.protrusion;
                break;
            case Direction.up:
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


        switch (this.direction) {
            case Direction.down:
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
            case Direction.up:
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
            case Direction.right:
                if (this.label) {
                    switch (this.label.position) {
                        case Position.top:
                            this.label.x = this.x + this.label.padding[3];
                            this.label.y = this.y + this.label.padding[0];
                            console.log(this.y, this.label.height)
                            break;
                        case Position.bottom:
                            this.label.x = this.x;
                            this.label.y = this.y2 - this.adjustment[1] + this.label.padding[0];
                            break;
                        default:
                            throw new Error("Can only use bottom or top for vertical bracket label");
                    }

                    this.drawLabel(surface);
                }
                break;
            case Direction.left:
                if (this.label) {
                    switch (this.label.position) {
                        case Position.top:
                            this.label.x = this.x + this.label.padding[3] + this.bracketProtrusion;
                            this.label.y = this.y + this.label.padding[0];
                            console.log(this.y, this.label.height)
                            break;
                        case Position.bottom:
                            this.label.x = this.x + this.label.padding[3] + this.bracketProtrusion;
                            this.label.y = this.y2 - this.adjustment[1] + this.label.padding[0];
                            break;
                        default:
                            throw new Error("Can only use bottom or top for vertical bracket label");
                    }

                    this.drawLabel(surface);
                }
                break;
        }
        
        console.log(this.x1, this.y1, this.x2, this.y2)
        switch (this.style.bracketType) {
            case bracketType.curly:
                var d = this.curlyPath(this.x1, this.y1, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${d}">`;
                break;
            case bracketType.square:
                var d = this.squarePath(this.x1, this.y1, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${d}">`; 
                
                break;
            default:
                var d = this.curlyPath(this.x1, this.y1, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${d}">`; 
                break;
        }
        console.log(svgString)

        var svgObj = SVG(svgString);

        svgObj.attr({
            "stroke": this.style.stroke,
            "stroke-width": this.style.strokeWidth,
            "fill": "none"
        })

        surface.add(svgObj);


    }

    // https://gist.github.com/alexhornbake/6005176
    //returns path string d for <path d="This string">
	//a curly brace between x1,y1 and x2,y2, w pixels wide 
	//and q factor, .5 is normal, higher q = more expressive bracket 
    curlyPath(x1: number, y1: number, x2: number,y2: number, w: number, q: number) {
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

    squarePath(x1: number, y1: number, x2: number,y2: number, w: number, q: number) {
        var grad = (y2 - y1)/(x2-x1);
        var theta = Math.atan(-1/grad);

        var deltaX = w * Math.cos(theta);
        var deltaY = w * Math.sin(theta);

        switch (this.direction) {
            case Direction.down:
            case Direction.left:
                var vertex1 = [x1 - deltaX, y1 - deltaY];
                var vertex2 = [x2 - deltaX, y2 - deltaY];
                break;
            case Direction.right:
            case Direction.up:
                var vertex1 = [x1 + deltaX, y1 + deltaY];
                var vertex2 = [x2 + deltaX, y2 + deltaY];
                break;
            default:
                throw new Error("unkown bracket direction!");
        }


        var d = `M ${x1} ${y1} L${vertex1[0]} ${vertex1[1]} L${vertex2[0]} ${vertex2[1]} L${x2} ${y2}`
        return d;
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
            switch(this.direction) {
                case Direction.down:
                case Direction.up:
                    totalProtrusion += this.label.height + this.label.padding[0] + this.label.padding[2] ;
                    break;
                case Direction.left:
                case Direction.right:
                    totalProtrusion += this.label.width + this.label.padding[3] + this.label.padding[1];
                    break;
            }
        }
        
        this.totalProtrusion = totalProtrusion;
    }
}