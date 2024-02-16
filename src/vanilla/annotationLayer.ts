import { arrowStyle } from "./arrow";
import { Drawable } from "./drawable";
import Label, { LabelPosition, labelInterface } from "./label";
import { labelable } from "./temporal";
import * as defaultBigSpan from "./default/data/bigspan.json";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Span from "./span";

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

export interface bigSpanInterface {

    padding: number[],
    label?: labelInterface | null
}

export default class AnnotationLayer extends Drawable {
    private _actualBounds?: Bounds;

    labels: {[timestamp: number]: Label[]} = [];
    spans: Span[] = [];

    padding: number[];

    timestampWidths: number[];
    timestampX: number[] = [];

    constructor(padding: number[], 
                offset: number[]=[0, 0]) {
        
        super(0, 0, offset);
        
        this.padding = padding;
        this.timestampWidths = [];
    }

    draw(surface: Svg, timestampWidths: number[]=[], startX: number=0, startY: number=0) {
        var heights: {[timestamp: number]: number} = [];

        this.timestampWidths = timestampWidths;
        this.x = startX;
        this.y = startY + this.padding[0];

        this.timestampX.push(this.x);
        this.timestampWidths.forEach((w, i) => {
            this.timestampX.push(w + this.timestampX[i]);
        })

        for (const [key, value] of Object.entries(this.labels)) {
            var timestamp = parseInt(key);  // really?...
            if (!Object.keys(heights).includes(key)) {
                heights[timestamp] = 0;
            }

            value.forEach((l) => {
                var yCurs = heights[timestamp];

                var x;
                var timeWidth;

                console.log(timestamp);
                console.log(this.timestampWidths)

                if (timestamp < this.timestampWidths.length) {
                    x = this.timestampX[timestamp];
                    timeWidth = this.timestampWidths[parseInt(key)];
                } else {
                    x = 0;
                    timeWidth = 0;
                }

                console.log("ANNOTATION X", parseInt(key));

                heights[timestamp] += l.height;

                switch (l.labelPosition) {
                    case LabelPosition.centre:
                        l.x = x + timeWidth/2 - l.width/2;
                        l.y = yCurs + this.y;
                        break;
                    default:
                        l.x = x;
                        l.y = yCurs + this.y;
                        break;
        
                }

                console.log("X FOR ANNO", x);
                l.draw(surface);
            }) 
        }

        var height = Math.max(...Object.values(heights));
        console.log("MAX HEIGHT: ", height);
        var width = this.timestampX[this.timestampX.length-1] - this.timestampX[0];

        this.bounds = {width: width, height: height};
        this.actualBounds = {
            width: width,
            height: this.padding[0] + height + this.padding[2]
        }
    }

    annotateLabel(label: Label, timestamp: number) {
        var newLabel = label;


        if (this.labels[timestamp] === undefined) {
            this.labels[timestamp] = [newLabel];
        } else {
            this.labels[timestamp].push(newLabel);
        }
        
    }

    annotateSpan(timespanStart: number, timespanEnd: number, label?: Label) {

    }

    get actualBounds(): Bounds {
        if (this._actualBounds) {
            return this._actualBounds;
        }
        throw new Error("Element has no dimensions");
    }
    set actualBounds(b: Dim)  {
        var top = this.y;
        var left = this.x;

        var bottom = this.y + b.height;
        var right = this.x + b.width;


        this._actualBounds = {top: top, right: right, bottom: bottom, left: left, width: b.width, height: b.height};
    }

    get actualWidth(): number {
        if (this._actualBounds) {
            return this._actualBounds.width;
        }
        throw new Error("Dimensions undefined")
    }
    get actualHeight(): number {
        if (this._actualBounds) {
            return this._actualBounds.height;
        }
        throw new Error("Dimensions undefined")
    }
}