import * as defaultChan from "./default/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation, labelable } from "./temporal";
import Pulse90 from "./pulses/simple/pulse90";
import Pulse180 from "./pulses/simple/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import ImagePulse from "./pulses/image/imagePulse";
import Label, { labelInterface, LabelPosition } from "./label";
import Span from "./span";
import Abstraction from "./abstraction";
 

export interface channelInterface {
    temporalElements: Temporal[],
    padding: number[],
    style: channelStyle,
    label?: labelInterface
}


export interface channelStyle {
    thickness: number,
    fill: string,
    stroke?: string | null,  
    strokeWidth?: number | null
}




export default class Channel extends Drawable implements labelable {
    static defaults: channelInterface = {
        temporalElements: defaultChan.temporalElements,
    
        padding: defaultChan.padding,
        style: {
            thickness: defaultChan.thickness,
            fill: defaultChan.fill,
            stroke: defaultChan.stroke,
            strokeWidth: defaultChan.strokeWidth
        }
    }

    style: channelStyle;
    pad: number[];

    maxTopProtrusion: number;
    maxBottomProtrusion: number;

    barWidth: number;
    barX: number;
    barY: number;
    
    temporalElements: Temporal[];
    hSections: number[] = [];
    elementCursor: number = -1;

    label?: Label;
    labelPosition: LabelPosition=LabelPosition.Left;

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

        this.computeBarY(yCursor);

        var labelOffset = this.drawLabel(surface);
        this.bounds = {width: this.width + labelOffset[0] + this.pad[1] + this.pad[3], 
            height: this.height + this.pad[0] + this.pad[2]}
        // CURRENTLY IGNORING VERTICAL LABEL IMPACT

        this.computeBarX(labelOffset[0]);
        this.positionElements(timestampWidths);

        this.temporalElements.forEach(element => {
            element.draw(surface);
        });
        this.drawRect(surface);

        console.log("CHANNEL DIMENSIONS: ", this.width, this.height)
    }

    computeBarY(yCursor: number=0) {
        this.computeVerticalBounds();

        var rectPosY = yCursor + this.pad[0] + this.maxTopProtrusion;
        console.log("RECT POS", rectPosY)
        this.barY = rectPosY;
        
        console.log("CHANNEL HEIGHT: ", this.height)
        
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
        var xCurs = this.barX;
        var currTimestamp = -1;

        // Current alignment style: centre

        for (var i = 0; i < this.temporalElements.length; i++) {

            // For all temporal elements
            var temporalEl = this.temporalElements[i];
            
            temporalEl.positionVertically(this.barY, this.style.thickness);

            for (var space = currTimestamp+1; space < temporalEl.timestamp; space++) {  // Shift if gap in timestamps
                xCurs += timestampWidths[space];
            }

            var sectionWidth = timestampWidths[temporalEl.timestamp];

            xCurs += sectionWidth / 2;
            temporalEl.centreXPos(xCurs)
            xCurs += sectionWidth / 2;
            currTimestamp = temporalEl.timestamp;
        }

        this.barWidth = xCurs - this.barX;
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

    addSpan(elementType: typeof Span, args: any, width: number=0, ): number[] {
        this.elementCursor += 1;

        if (width !== 0) {  // If width provided by hSections
            var span = elementType.anyArgConstruct(elementType, {...args, width, timestamp: this.elementCursor})
        } else {
            var span = elementType.anyArgConstruct(elementType, {...args, timestamp: this.elementCursor})
        }
        
        this.temporalElements.push(span);
        this.hSections.push(span.actualWidth);
        
        return this.hSections;
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
        if (this.temporalElements.length === 0) {
            return [0, 0];
        }

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
