import * as defaultChannel from "./default/data/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Alignment, Orientation, labelable } from "./temporal";
import Pulse90 from "./default/classes/pulse90";
import Pulse180 from "./default/classes/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import ImagePulse from "./pulses/image/imagePulse";
import Label, { labelInterface, LabelPosition } from "./label";
import Span from "./span";
import Abstraction from "./abstraction";
import AnnotationLayer from "./annotationLayer";
import Bracket from "./bracket";
 

export interface channelInterface {
    temporalElements: Temporal[],
    padding: number[],
    style: channelStyle,
    annotationStyle: channelAnnotation,
    label?: labelInterface
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
    static defaults: channelInterface = {...<any>defaultChannel}

    style: channelStyle;
    pad: number[];

    maxTopProtrusion: number;
    maxBottomProtrusion: number;

    barWidth: number;
    barX: number;
    barY: number;
    
    temporalElements: Temporal[];
    annotationLayer?: AnnotationLayer;

    hSections: number[] = [];
    timespanX: number[] = [];
    elementCursor: number = -1;

    label?: Label;
    labelPosition: LabelPosition=LabelPosition.left;

    constructor(pad: number[]=Channel.defaults.padding, 
                style: channelStyle=Channel.defaults.style,
                temporalElements: Temporal[]=[...Channel.defaults.temporalElements], // ARRAYS USE REFERENCE!!!!! WAS UPDATING 
                offset: number[]=[0, 0],
                label?: Label) {
                
        super(0, 0, offset);
        this.barX = 0;
        this.barY = 0;

        this.style = style;
        this.pad = pad;

        this.maxTopProtrusion = 0;  // Move this to element
        this.maxBottomProtrusion = style.thickness;

        this.bounds = {width: 0, height: style.thickness};
        this.barWidth = 0;

        this.temporalElements = temporalElements;
        this.label = label;
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
            console.log(this.annotationLayer.actualHeight)
        }

        this.computeBarY(yCursor);
        
        

        this.drawLabel(surface);

        
        console.log("TIMESPAN X ", this.timespanX)
        
        this.bounds = {width: this.width + labelOffsetX + this.pad[1] + this.pad[3], 
            height: this.height + this.pad[0] + this.pad[2] + annotationHeight}
        

        // CURRENTLY IGNORING VERTICAL LABEL IMPACT

        
        this.positionElements(timestampWidths);

        this.temporalElements.forEach(element => {
            element.draw(surface);
        });
        this.drawRect(surface);

        
    }

    computeBarY(yCursor: number=0) {
        this.computeVerticalBounds();

        var rectPosY = yCursor + this.pad[0] + this.maxTopProtrusion;
        
        this.barY = rectPosY;
    }

    computeBarX(labelOffsetX: number=0) {
        this.barX = this.pad[3] + labelOffsetX;
    }

    drawRect(surface: Svg) {
        // Draws bar
        surface.rect(this.barWidth, this.style.thickness)
        .attr(this.style).move(this.barX, this.barY);

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
                console.log("Inheriting width of ", timespanWidth)
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

        console.log("BAR X ", this.barX)
        this.barWidth = this.timespanX[this.timespanX.length-1] - this.barX;
        console.log(this.timespanX[this.timespanX.length-1]);
        console.log("BAR WIDTH: ", this.barWidth);
        this.bounds = {width: this.width + this.barWidth, height: this.height}
    }

    addSimplePulse(elementType: typeof SimplePulse, args: any): number[] {
        this.elementCursor += 1;

        var pulse = elementType.anyArgConstruct(elementType, {...args, timestamp: this.elementCursor});
        this.temporalElements.push(pulse);


        this.hSections.push(pulse.actualWidth);
        return this.hSections;
    }

    addImagePulse(elementType: typeof ImagePulse, args: any): number[] {
        this.elementCursor += 1;

        var pulse = elementType.anyArgConstruct(elementType, {...args, timestamp: this.elementCursor});
        this.temporalElements.push(pulse);
        
        this.hSections.push(pulse.actualWidth);
        return this.hSections;
    }

    addSpan(elementType: typeof Span, args: any): number[] {
        this.elementCursor += 1;

        var span = elementType.anyArgConstruct(elementType, {...args, timestamp: this.elementCursor})

        this.temporalElements.push(span);
        this.hSections.push(span.actualWidth);
        
        return this.hSections;
    }

    addAnnotationLabel(args: any) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.defaults.annotationStyle.padding)
        }
        var timestamp;
        console.log(args.timestamp);

        if (args.timestamp !== undefined) {
            timestamp = args.timestamp;
        } else {
            timestamp = this.elementCursor;
        }
        console.log("TIME STAMP IS", timestamp)

        if (timestamp == -1) {
            return;
        }

        var newLabel = Label.anyArgConstruct(args);
        this.annotationLayer.annotateLabel(newLabel, timestamp);
    }

    addAnnotationLong(args: any) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.defaults.annotationStyle.padding)
        }

        var timestampStart;
        var timestampEnd;

        
        timestampStart = args.timestampStart ? args.timestampStart : undefined;
        timestampEnd = args.timestampStart ? args.timestampStart : undefined;
        
        if (timestampStart == -1 || timestampEnd == -1) {
            // throw
            timestampStart = 0;
            timestampEnd = 1;
        }
        if (timestampStart === timestampEnd) {
            timestampStart = 0;
            timestampEnd = 1;
            // return; // Throw
        }

        var range = args.range ? args.range : [timestampStart ? timestampStart : 0, timestampEnd ? timestampEnd : 1];

        var long = Bracket.anyArgConstruct(args);

        this.annotationLayer.annotateLong(long, range[0], range[1]);
    }

    addAbstraction(elementType: typeof Abstraction, args: any) {
        this.elementCursor += 1;

        var abs = elementType.anyArgConstruct(elementType, {...args, timestamp: this.elementCursor})

        this.temporalElements.push(abs);
        
        this.hSections.push(abs.actualWidth);

        return this.hSections;
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

            this.label.position(x, y);
            this.label.draw(surface);
            
            return [hOffset, this.label.height];
        }

        return [0, 0];
    }


}
