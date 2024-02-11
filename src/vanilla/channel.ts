import * as defaultChan from "./default/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { LabelPosition, Orientation, labelable } from "./temporal";
import Pulse90 from "./pulses/simple/pulse90";
import Pulse180 from "./pulses/simple/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import ImagePulse from "./pulses/image/imagePulse";
import Label, { labelInterface } from "./label";
import Span from "./span";
 

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
    topBound: number;
    bottomBound: number;
    
    temporalElements: Temporal[];
    hSections: number[] = [];

    label?: Label;
    labelPosition: LabelPosition=LabelPosition.Left;

    constructor(pad: number[]=Channel.defaults.padding, 
                style: channelStyle=Channel.defaults.style,
                temporalElements: Temporal[]=[...Channel.defaults.temporalElements], // ARRAYS USE REFERENCE!!!!! WAS UPDATING 
                offset: number[]=[0, 0],
                label?: Label) {
                
        super(0, 0, offset);

        this.style = style;
        this.pad = pad;

        this.maxTopProtrusion = 0;  // Move this to element
        this.maxBottomProtrusion = style.thickness;
        this.topBound = 0;
        this.bottomBound = style.thickness;

        this.bounds = {width: 0, height: style.thickness};

        this.temporalElements = temporalElements;
        this.label = label;
    }
    

    draw(surface: Svg, timestampWidths: number[]=[], yCursor: number=0) {
        console.log("--- drawing channel ---");
        console.log(this.temporalElements);


        this.computeY(yCursor);

        var labelHOffset = this.drawLabel(surface);
        console.log(labelHOffset);
        this.computeX(labelHOffset[0]);
        

        this.positionElements(timestampWidths);

        this.temporalElements.forEach(element => {
            element.draw(surface);
        });
        this.drawRect(surface);
    }

    computeY(yCursor: number=0) {
        this.computeVerticalBounds();

        this.topBound = yCursor;
        
        var rectPosY = yCursor + this.pad[0] + this.maxTopProtrusion;
        this.y = rectPosY;

        this.bottomBound = this.y + this.style.thickness + 
                           this.maxBottomProtrusion + 
                           this.pad[2];
    }

    computeX(labelOffsetX: number=0) {
        this.x = this.pad[3] + labelOffsetX;
    }

    drawRect(surface: Svg) {
        // Draws bar
        surface.rect(this.width, this.style.thickness)
        .attr(this.style).move(this.x, this.y);
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
        var xCurs = this.x;

        // Current alignment style: centre

        for (var i = 0; i < this.temporalElements.length; i++) {
            var temporalEl = this.temporalElements[i];
            console.log(temporalEl.bounds);

            temporalEl.positionVertically(this.y, this.style.thickness);

            if (i < timestampWidths.length) {  // Should always fire with current config
                
                var sectionWidth = timestampWidths[i];

                xCurs += sectionWidth / 2;
                temporalEl.centreXPos(xCurs)
                xCurs += sectionWidth / 2;
            } else {
                xCurs += temporalEl.padding[3]  // LEFT PAD

                console.log("putting at ", xCurs)
                temporalEl.x = xCurs;
                xCurs += temporalEl.width;  // WIDTH
    
                xCurs += temporalEl.padding[1]  // RIGHT PAD
            }
        }

        var width = xCurs - this.x;
        this.bounds = {width: width, height: this.height}

    }

    addSimplePulse(elementType: typeof SimplePulse, args: any): number[] {
        var pulse = elementType.anyArgConstruct(elementType, args);
        this.temporalElements.push(pulse);

        this.hSections.push(pulse.actualWidth);
        
        return this.hSections;
    }

    addImagePulse(elementType: typeof ImagePulse, args: any) {
        var pulse = elementType.anyArgConstruct(elementType, args);
        this.temporalElements.push(pulse);
        
        console.log(this.temporalElements);
    }

    addSpan(elementType: typeof Span, args: any, width: number=0, ): number[] {

        if (width !== 0) {  // If width provided by hSections
            var span = elementType.anyArgConstruct(elementType, {...args, width})
        } else {
            var span = elementType.anyArgConstruct(elementType, args)
        }
        
        this.temporalElements.push(span);

        this.hSections.push(span.actualWidth);
        
        return this.hSections;
    }


    // Draws the channel label
    // It is required that computeY has been ran for this to work
    drawLabel(surface: Svg) : number[] {
        if (this.temporalElements.length === 0) {
            return [0, 0];
        }

        if (this.label) {

            var y = this.y + this.style.thickness/2 - this.label.height/2;
            var x = this.label.padding[3];


            var hOffset: number = x + this.label.width + this.label.padding[1];

            this.label.position(x, y);
            this.label.draw(surface);
            
            return [hOffset, this.label.height];
        }

        return [0, 0];
    }

}
