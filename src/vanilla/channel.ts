import * as defaultSeq from "./default/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import Pulse90 from "./pulses/simple/pulse90";
import Pulse180 from "./pulses/simple/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import ImagePulse from "./pulses/image/imagePulse";
import Label, { hasLabel, labelInterface } from "./label";
 

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




export default class Channel extends Drawable implements hasLabel {
    static defaults: channelInterface = {
        temporalElements: [],
    
        padding: defaultSeq.padding,
        style: {
            thickness: defaultSeq.thickness,
            fill: defaultSeq.fill,
            stroke: defaultSeq.stroke,
            strokeWidth: defaultSeq.strokeWidth
        }
    }

    width: number;
    height: number;  // Excludes padding

    style: channelStyle;
    pad: number[];
    label?: Label;

    maxTopProtrusion: number;
    maxBottomProtrusion: number;
    topBound: number;
    bottomBound: number;
    
    temporalElements: Temporal[];

    constructor(pad: number[]=Channel.defaults.padding, 
                style: channelStyle=Channel.defaults.style,
                temporalElements: Temporal[]=[...Channel.defaults.temporalElements],
                // ARRAYS USE REFERENCE!!!!! WAS UPDATING 
                offset: number[]=[0, 0],
                label?: Label) {
                
        super(0, 0, offset);

        this.style = style;

        this.pad = pad;

        this.maxTopProtrusion = 0;
        this.maxBottomProtrusion = style.thickness;
        this.topBound = 0;
        this.bottomBound = style.thickness;
        
        this.height = style.thickness;
        this.width = 0;

        this.temporalElements = temporalElements;
        this.label = label;
    }
    

    draw(surface: Svg, yCursor: number=0) {
        console.log("--- drawing channel ---");
        console.log(this.temporalElements);


        this.computeY(yCursor);

        var labelHOffset = this.drawLabel(surface);
        console.log(labelHOffset);
        this.computeX(labelHOffset[0]);
        

        this.positionElements();

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
        this.height = this.maxBottomProtrusion + 
                      this.maxTopProtrusion + this.style.thickness;
    }

    positionElements() : void {
        var currentX = this.x;

        this.temporalElements.forEach((element) => {
            element.positionVertically(this.y, this.style.thickness);

            currentX += element.padding[3]  // LEFT PAD

            element.x = currentX;
            currentX += element.width;

            currentX += element.padding[1]  // RIGHT PAD
        })

        this.width = currentX - this.x;
        
    }

    addSimplePulse(elementType: typeof SimplePulse, args: any) {
        var pulse = elementType.anyArgConstruct(elementType, args);
        this.temporalElements.push(pulse);
    }

    addImagePulse(elementType: typeof ImagePulse, args: any) {
        var pulse = elementType.anyArgConstruct(elementType, args);
        this.temporalElements.push(pulse);
        
        console.log(this.temporalElements);
    }

    // Draws the channel label
    // It is required that computeY has been ran for this to work
    drawLabel(surface: Svg) : number[] {
        if (this.temporalElements.length === 0) {
            return [0, 0];
        }

        if (this.label) {
            // Cannot get dimensions until drawn apparently so this draws, sets dim and removes
            this.label.computeDimensions(surface);
            console.log("height", this.height);
            var y = this.y + this.style.thickness/2 - this.label.height/2;
            var x = this.label.padding[3];

            console.log("x", x, "y", y);

            var hOffset: number = x + this.label.width + this.label.padding[1];

            this.label.position(x, y);
            this.label.draw(surface);
            

            return [hOffset, this.label.height];
        }

        return [0, 0];
    }

}
