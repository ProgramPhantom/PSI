import { arrowStyle } from "./arrow";
import { Visual, IVisual } from "./visual";
import Text, { Position, IText } from "./label";
import { labelable } from "./positional";
import { SVG, Element as SVGElement, Svg, Timeline } from '@svgdotjs/svg.js'
import Span from "./span";
import Bracket, { Direction, bracketType } from "./bracket";
import Section from "./section.old";
import Annotation from "./annotation";
import defaultAnnotationLayer from "./default/data/annotationLayer.json";
import { FillObject, RecursivePartial } from "./util";
import p from "@blueprintjs/icons/lib/esm/generated/16px/paths/blank";
import PaddedBox from "./paddedBox";

export interface bigISpan {
    padding: number[],
    label?: IText | null
}

export interface IAnnotationLayer extends IVisual {

}


export default class AnnotationLayer extends PaddedBox {
    static defaults: {[name: string]: IAnnotationLayer} = {"default": {...<any>defaultAnnotationLayer}}

    labels: {[index: number]: Span[]} = [];
    sections: Section[] = [];

    indexWidths: number[];
    indexX: number[] = [];

    constructor(params: RecursivePartial<IAnnotationLayer>, templateName: string="default") {
        var fullParams: IAnnotationLayer = FillObject(params, AnnotationLayer.defaults[templateName]);
        super();

        this.indexWidths = [];
    }

    resolveDimensions(): {width: number, height: number} {
        var height = 0;
        var width = 0;

        this.sections.forEach((s) => {
            if (!s.hasDimensions) {
                s.resolveDimensions();
            } 
            height += s.contentHeight;

            width = Math.max(width, s.contentWidth); // TODO: This isn't how it works mate.
        })

        return {width: width, height: height}
    }

    draw(surface: Svg, indexWidths: number[]=[], startX: number=0, startY: number=0) {

        this.indexWidths = indexWidths;
        this.x = startX;
        this.y = startY + this.padding[0];
        

        this.indexX.push(this.x);
        this.indexWidths.forEach((w, i) => {
            this.indexX.push(w + this.indexX[i]);
        })

        var maxYLong = this.drawLongs(surface, this.y);
        var maxYLabel = this.positionLabels(surface, maxYLong);

        var maxY = maxYLabel > maxYLong ? maxYLabel : maxYLong;

        var height = maxY - this.y;
        
        var width = this.indexX[this.indexX.length-1] - this.indexX[0];

        this.contentDim = {width: width, height: height};
    }

    positionLabels(surface: Svg, startY: number): number {
        var ys = new Array<number>(this.indexX.length);
        ys.fill(startY);
        

        // Draw labels
        for (const [key, value] of Object.entries(this.labels)) {
            var index = parseInt(key);  // really?...

            value.forEach((l) => {
                var yCurs = ys[index];

                var x;
                var timeWidth;


                if (index < this.indexWidths.length) {
                    x = this.indexX[index];
                    timeWidth = this.indexWidths[parseInt(key)];
                } else {
                    x = 0;
                    timeWidth = 0;
                }

                l.x = x + timeWidth/2 - l.contentWidth/2;
                l.y = ys[index];
             
                ys[index] += l.contentHeight;

                
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

        var ys = new Array<number>(this.indexX.length-1);
        ys.fill(startY);
        

        // Draw Longs
        for (const section of this.sections) {
            var timespanRange: [number, number] = section.indexRange;

            var x1 = this.indexX[timespanRange[0]];
            var x2 = this.indexX[timespanRange[1]+1]  // To the other side of last

            // Find y
            var longHeight = Math.abs(section.protrusion);

            var relaventYs = [...ys].splice(timespanRange[0], timespanRange[1] - timespanRange[0])  
            // Array of y levels over where this section is going
            var thisStartY = Math.max(...relaventYs);
            
            var y = thisStartY;
            
            section.set(x1, y, x2, y);
            section.draw(surface);

            for (var i = timespanRange[0]; i < timespanRange[1]+1; i++) {  // Apply height
                ys[i] += section.totalProtrusion;
            }
        }

        
        var longHeight = Math.max(...ys);  // Overall height of sections

        if (longHeight !== Infinity) {
            return longHeight;
        } else {
            return 0;
        }
    }

    annotateLabel(label: Span) {
        var newLabel = label;
        
        if (this.labels[label.index[0]] === undefined) {
            this.labels[label.index[0]] = [newLabel];
        } else {
            this.labels[label.index[0]].push(newLabel);
        }
        
    }

    annotateLong(section: Section) {
        this.sections.push(section)
    }

}