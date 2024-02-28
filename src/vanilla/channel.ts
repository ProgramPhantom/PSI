import * as defaultChannel from "./default/data/channel.json"
import { Drawable } from "./drawable";
import { Number, SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Alignment, Orientation, labelable } from "./temporal";
import Pulse90 from "./default/classes/pulse90";
import Pulse180 from "./default/classes/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import ImagePulse from "./pulses/image/imagePulse";
import Label, { labelInterface, Position } from "./label";
import Span from "./span";
import Abstraction from "./abstraction";
import AnnotationLayer from "./annotationLayer";
import Bracket, { bracketInterface } from "./bracket";
 

export interface channelInterface {
    temporalElements: Temporal[],
    padding: number[],

    style: channelStyle,
    label?: labelInterface
    
    annotationStyle: channelAnnotation,
}


export interface channelStyle {
    thickness: number,
    fill: string,
    stroke?: string | null,  
    strokeWidth?: number | null
}

export interface channelAnnotation {
    padding: number[]
}


export default class Channel extends Drawable implements labelable {
    static default: channelInterface = {...<any>defaultChannel}

    style: channelStyle;
    padding: number[];

    maxTopProtrusion: number;
    maxBottomProtrusion: number;

    barWidth: number;
    barX: number;
    barY: number;
    
    private temporalElements: Temporal[];
    annotationLayer?: AnnotationLayer;

    hSections: number[] = [];
    timespanX: number[] = [];
    elementCursor: number = -1;

    label?: Label;
    position: Position=Position.left;

    constructor(params: channelInterface,
                offset: number[]=[0, 0]) {
                
        super(0, 0, offset);
        this.barX = 0;
        this.barY = 0;

        this.style = params.style;
        this.padding = params.padding;

        this.maxTopProtrusion = 0;  // Move this to element
        this.maxBottomProtrusion = this.style.thickness;

        this.bounds = {width: 0, height: this.style.thickness};
        this.barWidth = 0;

        this.temporalElements = [...params.temporalElements];  // please please PLEASE do this (list is ref type)
        this.label = this.label;
    }
    

    draw(surface: Svg, timestampWidths: number[]=[], yCursor: number=0) {
        this.y = yCursor;

        var labelOffsetX = this.label ? this.label.actualBounds.width : 0;
        this.computeBarX(this.label!.actualBounds.width);

        this.timespanX.push(this.barX);
        timestampWidths.forEach((w, i) => {
            this.timespanX.push(w + this.timespanX[i]);
        })
        
        // Add annotation
        var annotationHeight  = 0;
        if (this.annotationLayer) {
            this.annotationLayer.draw(surface, timestampWidths, this.barX, this.y);
            yCursor += this.annotationLayer.actualHeight;
            annotationHeight = this.annotationLayer.actualHeight;
            
        }

        this.computeBarY(yCursor);
        
        this.drawLabel(surface);
        
        this.bounds = {width: this.width + labelOffsetX + this.padding[1] + this.padding[3], 
            height: this.height + this.padding[0] + this.padding[2] + annotationHeight}
        

        // CURRENTLY IGNORING VERTICAL LABEL IMPACT

        
        this.positionElements(timestampWidths);

        this.temporalElements.forEach(element => {
            element.draw(surface);
        });
        this.drawRect(surface);

        
    }

    computeBarY(yCursor: number=0) {
        this.computeVerticalBounds();

        var rectPosY = yCursor + this.padding[0] + this.maxTopProtrusion;
        
        this.barY = rectPosY;
    }

    computeBarX(labelOffsetX: number=0) {
        this.barX = this.padding[3] + labelOffsetX;
    }

    drawRect(surface: Svg) {
        // Draws bar
        surface.rect(this.barWidth, this.style.thickness)
        .attr(this.style).move(this.barX, this.barY).attr({
            "shape-rendering": "crispEdges"
        });

    }

    computeVerticalBounds() {
        var topProtrusion: number[] = [0];
        var bottomProtrusion: number[] = [0];

        this.temporalElements.forEach((element) => {
            var protrusion = element.verticalProtrusion(this.style.thickness);
            topProtrusion.push(protrusion[0]);
            bottomProtrusion.push(protrusion[1]);
        })

        this.maxTopProtrusion = Math.max(...topProtrusion);
        this.maxBottomProtrusion = Math.max(...bottomProtrusion);


        var height = this.maxBottomProtrusion + 
                      this.maxTopProtrusion + this.style.thickness;
        
        this.bounds = {width: this.width, height}
    }

    positionElements(timestampWidths: number[]) {
        // Current alignment style: centre

        this.temporalElements.forEach((temporalEl, i) => {
            var tempX = 0;
            var timespanWidth = 0;

            temporalEl.positionVertically(this.barY, this.style.thickness);

            tempX = this.timespanX[temporalEl.timestamp]
            timespanWidth = timestampWidths[temporalEl.timestamp]

            if (temporalEl.config.inheritWidth) {
                temporalEl.bounds = {width: timespanWidth, height: temporalEl.height};
                
            }

            switch (temporalEl.config.alignment) {
                case Alignment.Centre:
                    temporalEl.centreXPos(tempX + timespanWidth/2);
                    break;
                case Alignment.Left:
                    if (temporalEl.config.overridePad) {
                        temporalEl.x = tempX;
                    } else {
                        temporalEl.x = tempX + temporalEl.padding[3];
                    }
                    break;
                case Alignment.Right:
                    if (temporalEl.config.overridePad) {
                        temporalEl.x = tempX + timespanWidth - temporalEl.width;
                    } else {
                        temporalEl.x = tempX + timespanWidth - temporalEl.width - temporalEl.padding[1];
                    }
                    break;
                default: 
                    // Centre
                    temporalEl.centreXPos(tempX + timespanWidth/2);
                    break;

            }
        })

        
        this.barWidth = this.timespanX[this.timespanX.length-1] - this.barX;
        
        
        this.bounds = {width: this.width + this.barWidth, height: this.height}
    }

    addTemporal(obj: Temporal): number[] {
        this.elementCursor += 1;
        obj.timestamp = this.elementCursor;
        obj.barThickness = this.style.thickness;

        this.temporalElements.push(obj);
        this.hSections.push(obj.actualWidth);

        return this.hSections;
    }

    addAnnotationLabel(lab: Label) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.default.annotationStyle.padding)
        }
        var timestamp;
        
        if (lab.timestamp !== undefined) {
            timestamp = lab.timestamp;
        } else {
            timestamp = this.elementCursor;
        }

        if (timestamp == -1) {
            return;
        }

        this.annotationLayer.annotateLabel(lab, timestamp);
    }

    addAnnotationLong(brack: Bracket) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.default.annotationStyle.padding)
        }

        var timestampStart: number;
        var timestampEnd: number;
        
        if (brack.timespan === undefined) {
            timestampStart = 0;
            timestampEnd = 1;
        } else if(brack.timespan.length == 1) {
            timestampStart = brack.timespan[0];
            timestampEnd = timestampStart + 1;
        } else if (brack.timespan.length >= 2) {
            timestampStart = brack.timespan[0];
            timestampEnd = brack.timespan[1];
        } else {
            timestampStart = brack.timespan[0];
            timestampEnd = brack.timespan[1];
        }


        var range = brack.timespan ? brack.timespan : [timestampStart, timestampEnd];
        
        this.annotationLayer.annotateLong(brack, range[0], range[1]);
    }

    jumpTimespan(newCurs: number) {
        for (var empty = this.elementCursor; empty < newCurs; empty++) {
            this.hSections.push(0);
        }
        this.elementCursor = newCurs
    }

    // Draws the channel label
    // It is required that computeY has been ran for this to work
    drawLabel(surface: Svg) : number[] {
        /*  Draw label with no temp elements?
        if (this.temporalElements.length === 0) {
            return [0, 0];
        }*/

        if (this.label) {

            var y = this.barY + this.style.thickness/2 - this.label.height/2;
            var x = this.label.padding[3];

            var hOffset: number = x + this.label.width + this.label.padding[1];

            this.label.move(x, y);
            this.label.draw(surface);
            
            return [hOffset, this.label.height];
        }

        return [0, 0];
    }


}
