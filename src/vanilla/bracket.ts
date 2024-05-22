import { Svg, SVG } from "@svgdotjs/svg.js";
import { BindSide, Dimension, Element, IElement } from "./element";
import { labelable } from "./positional";
import * as defaultBracket from "./default/data/bracket.json"
import Label, { ILabel, Position } from "./label";
import { PartialConstruct, UpdateObj } from "./util";
import LineLike, { ILineLike } from "./lineLike";


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

export interface IBracket extends ILineLike {
    protrusion: number,
    direction: Direction,
    style: bracketStyle,
    labelOn: boolean,
    label: ILabel,
}

export interface bracketStyle {
    strokeWidth: number,
    bracketType: bracketType,
    expression: number,
    stroke: string,
}


export default class Bracket extends LineLike implements labelable {
    static defaults: {[key: string]: IBracket} = {"horizontal": {...<any>defaultBracket}}

    style: bracketStyle;

    protrusion: number;  // Caused by label
    bracketProtrusion: number; // Protrusion of bracket
    totalProtrusion: number;

    direction: Direction = Direction.down;  // "mouth" of bracket is facing down

    labelOn: boolean;
    label?: Label;

    constructor(params: Partial<IBracket>, templateName: string="horizontal") {
        var fullParams: IBracket = params ? UpdateObj(Bracket.defaults[templateName], params) : Bracket.defaults[templateName];
        super(fullParams)

        this.style = fullParams.style;
        this.adjustment = fullParams.adjustment;

        this.direction = fullParams.direction;
        
        this.bracketProtrusion = Math.abs(fullParams.protrusion);
        this.totalProtrusion = 0;
        
        switch (this.direction) {
            case Direction.down:
            case Direction.right:
                this.protrusion = -fullParams.protrusion;
                break;
            case Direction.left:
            case Direction.up:
                this.protrusion = fullParams.protrusion;
                break;
        }

        this.labelOn = fullParams.labelOn;
        if (params.labelOn) {
            this.label = PartialConstruct(Label, params.label, Label.defaults["label"]);
        }
        
        this.computeTotalProtrusion();
    }

    public draw(surface: Svg): void {
        
        // Position the bracket and the label:
        this.adjust();
        switch (this.direction) {
            case Direction.down:
                var width = this.x2 - this.x;

                // Label on top
                if (this.label) {
                    // If centre:
                    this.bind(this.label, Dimension.X, BindSide.Centre, BindSide.Centre);
                    this.bind(this.label, Dimension.Y, BindSide.Near, BindSide.Far);

                    var pro = this.posDrawDecoration(surface);
                } else {
                    var pro = [0, 0];
                }

                // this.place()
                this.y = this.y + this.bracketProtrusion + pro[1];
                this.y2 = this.y + this.bracketProtrusion + pro[1];
                break;
            case Direction.up:
                var width = this.x2 - this.x;

                if (this.label) {
                    this.label.x = this.x + width/2 - this.label.contentWidth/2;
                    this.label.y = this.y + this.bracketProtrusion;
                    var pro = this.posDrawDecoration(surface);
                } else {
                    var pro = [0, 0];
                }

                this.y = this.y;
                this.y2 = this.y;
                break;
            case Direction.right:
                if (this.label) {
                    switch (this.label.position) {
                        case Position.top:
                            this.label.x = this.x + this.label.padding[3];
                            this.label.y = this.y + this.label.padding[0];
                            
                            break;
                        case Position.bottom:
                            this.label.x = this.x;
                            this.label.y = this.y2 - this.adjustment[1] + this.label.padding[0];
                            break;
                        default:
                            throw new Error("Can only use bottom or top for vertical bracket label");
                    }

                    this.posDrawDecoration(surface);
                }
                break;
            case Direction.left:
                if (this.label) {
                    switch (this.label.position) {
                        case Position.top:
                            this.label.x = this.x + this.label.padding[3] + this.bracketProtrusion;
                            this.label.y = this.y + this.label.padding[0];
                            
                            break;
                        case Position.bottom:
                            this.label.x = this.x + this.label.padding[3] + this.bracketProtrusion;
                            this.label.y = this.y2 - this.adjustment[1] + this.label.padding[0];
                            break;
                        default:
                            throw new Error("Can only use bottom or top for vertical bracket label");
                    }

                    this.posDrawDecoration(surface);
                }
                break;
        }
        
        
        switch (this.style.bracketType) {
            case bracketType.curly:
                var d = this.curlyPath(this.x, this.y, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${d}">`;
                break;
            case bracketType.square:
                var d = this.squarePath(this.x, this.y, this.x2, this.y2, this.protrusion);
                var svgString = `<path d="${d}">`; 
                
                break;
            default:
                var d = this.curlyPath(this.x, this.y, this.x2, this.y2, this.protrusion, this.style.expression);
                var svgString = `<path d="${d}">`; 
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

    // https://gist.github.com/alexhornbake/6005176
    //returns path string d for <path d="This string">
	//a curly brace between x,y and x2,y2, w pixels wide 
	//and q factor, .5 is normal, higher q = more expressive bracket 
    curlyPath(x: number, y: number, x2: number,y2: number, w: number, q: number) {
		//Calculate unit vector
			var dx = x-x2;
			var dy = y-y2;
			var len = Math.sqrt(dx*dx + dy*dy);
			dx = dx / len;
			dy = dy / len;

			//Calculate Control Points of path,
			var qx = x + q*w*dy;
			var qy = y - q*w*dx;
			var qx2 = (x - .25*len*dx) + (1-q)*w*dy;
			var qy2 = (y - .25*len*dy) - (1-q)*w*dx;
			var tx = (x -  .5*len*dx) + w*dy;
			var ty = (y -  .5*len*dy) - w*dx;
			var qx3 = x2 + q*w*dy;
			var qy3 = y2 - q*w*dx;
			var qx4 = (x - .75*len*dx) + (1-q)*w*dy;
			var qy4 = (y - .75*len*dy) - (1-q)*w*dx;

    	return ( "M " +  x + " " +  y +
         		" Q " + qx + " " + qy + " " + qx2 + " " + qy2 + 
          		" T " + tx + " " + ty +
          		" M " +  x2 + " " +  y2 +
          		" Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 + 
          		" T " + tx + " " + ty );
	}

    squarePath(x: number, y: number, x2: number,y2: number, w: number) {
        var grad = (y2 - y)/(x2-x);
        var theta = Math.atan(-1/grad);

        var deltaX = w * Math.cos(theta);
        var deltaY = w * Math.sin(theta);

        switch (this.direction) {
            case Direction.down:
            case Direction.left:
                var vertex = [x - deltaX, y - deltaY];
                var vertex2 = [x2 - deltaX, y2 - deltaY];
                break;
            case Direction.right:
            case Direction.up:
                var vertex = [x + deltaX, y + deltaY];
                var vertex2 = [x2 + deltaX, y2 + deltaY];
                break;
            default:
                throw new Error("unkown bracket direction!");
        }


        var d = `M ${x} ${y} L${vertex[0]} ${vertex[1]} L${vertex2[0]} ${vertex2[1]} L${x2} ${y2}`
        return d;
    }

    posDrawDecoration(surface: Svg): number[] {
        if (!this.label) {
            return [0, 0];
        }

        this.label?.draw(surface);
        return [this.label.width, this.label.height];
    }

    computeTotalProtrusion() {
        var totalProtrusion = this.bracketProtrusion;

        if (this.label) {
            switch(this.direction) {
                case Direction.down:
                case Direction.up:
                    totalProtrusion += this.label.contentHeight + this.label.padding[0] + this.label.padding[2] ;
                    break;
                case Direction.left:
                case Direction.right:
                    totalProtrusion += this.label.contentWidth + this.label.padding[3] + this.label.padding[1];
                    break;
            }
        }
        
        this.totalProtrusion = totalProtrusion;
    }

}