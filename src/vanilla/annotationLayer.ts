import { arrowStyle } from "./arrow";
import { Drawable } from "./drawable";
import Label, { Position, labelInterface } from "./label";
import { labelable } from "./temporal";
import { SVG, Element as SVGElement, Svg, Timeline } from '@svgdotjs/svg.js'
import Span from "./span";
import Bracket, { Direction, bracketType } from "./bracket";
import Section from "./section";
import SpanningLabel from "./spanningLabel";

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
    labels: {[timestamp: number]: Span[]} = [];
    longs: Section[] = [];

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

        this.timestampWidths = timestampWidths;
        this.x = startX;
        this.y = startY + this.padding[0];
        

        this.timestampX.push(this.x);
        this.timestampWidths.forEach((w, i) => {
            this.timestampX.push(w + this.timestampX[i]);
        })

        var maxYLong = this.drawLongs(surface, this.y);
        var maxYLabel = this.positionLabels(surface, maxYLong);

        var maxY = maxYLabel > maxYLong ? maxYLabel : maxYLong;

        var height = maxY - this.y;
        
        var width = this.timestampX[this.timestampX.length-1] - this.timestampX[0];

        this.dim = {width: width, height: height};
    }

    positionLabels(surface: Svg, startY: number): number {
        var ys = new Array<number>(this.timestampX.length);
        ys.fill(startY);
        

        // Draw labels
        for (const [key, value] of Object.entries(this.labels)) {
            var timestamp = parseInt(key);  // really?...

            value.forEach((l) => {
                var yCurs = ys[timestamp];

                var x;
                var timeWidth;


                if (timestamp < this.timestampWidths.length) {
                    x = this.timestampX[timestamp];
                    timeWidth = this.timestampWidths[parseInt(key)];
                } else {
                    x = 0;
                    timeWidth = 0;
                }

                l.x = x + timeWidth/2 - l.width/2;
                l.y = ys[timestamp];
             
                ys[timestamp] += l.height;

                
                l.draw(surface);
            }) 
        }

        if (Object.values(ys).length != 0) {
            return Math.max(...Object.values(ys))
        } else {
            return 0;
        }
    }

    drawLongs(surface: Svg, startY: number): number {

        var ys = new Array<number>(this.timestampX.length-1);
        ys.fill(startY);
        

        // Draw Longs
        for (const timeLong of this.longs) {
            var timespanRange = timeLong.timespan;

            var x1 = this.timestampX[timespanRange[0]];
            var x2 = this.timestampX[timespanRange[1]+1]  // To the other side of last


            // Find y
            var longHeight = Math.abs(timeLong.protrusion);

            var relaventYs = [...ys].splice(timespanRange[0], timespanRange[1] - timespanRange[0])
            var thisStartY = Math.max(...relaventYs);
            
            var y = thisStartY;
            

            timeLong.x1 = x1;
            timeLong.x2 = x2;

            timeLong.y1 = y;
            timeLong.y2 = y;

            timeLong.y = y;
            timeLong.x = x1;

            timeLong.draw(surface);

            for (var i = timespanRange[0]; i < timespanRange[1]+1; i++) {  // Apply height
                ys[i] += timeLong.totalProtrusion;
            }
        }

        
        var longHeight = Math.max(...ys);

        if (longHeight !== Infinity) {
            return longHeight;
        } else {
            return 0;
        }
    }

    annotateLabel(label: Span) {
        var newLabel = label;
        
        if (this.labels[label.timestamp[0]] === undefined) {
            this.labels[label.timestamp[0]] = [newLabel];
        } else {
            this.labels[label.timestamp[0]].push(newLabel);
        }
        
    }

    annotateLong(section: Section) {
        this.longs.push(section)
    }

}