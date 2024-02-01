import * as defaultSeq from "./default/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import Pulse90 from "./pulses/simple/pulse90";
import Pulse180 from "./pulses/simple/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import ImagePulse from "./pulses/image/imagePulse";
 

export interface channelInterface {
    temporalElements: Temporal[],

    padding: number[],
    style: channelStyle
}


export interface channelStyle {
    thickness: number,
    fill: string,
    stroke?: string | null,  
    strokeWidth?: number | null
}




export default class Channel extends Drawable {
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

    maxTopProtrusion: number;
    maxBottomProtrusion: number;
    topBound: number;
    bottomBound: number;
    
    temporalElements: Temporal[];

    constructor(pad: number[]=Channel.defaults.padding, 
                style: channelStyle=Channel.defaults.style,
                temporalElements: Temporal[]=[...Channel.defaults.temporalElements],
                // ARRAYS USE REFERENCE!!!!! WAS UPDATING 
                offset: number[]=[0, 0]) {
                
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
    }
    

    draw(surface: Svg, yCursor: number=0) {
        console.log("--- drawing channel ---");
        console.log(this.temporalElements);

        this.positionRect(yCursor);
        this.positionElements();

        this.temporalElements.forEach(element => {
            element.draw(surface);
        });
        this.drawRect(surface);
    }

    positionRect(yCursor: number=0) {
        this.computeVerticalBounds();

        this.topBound = yCursor;
        
        var rectPos = this.pad[0] + yCursor + this.maxTopProtrusion;
        this.y = rectPos;

        this.bottomBound = this.y + this.style.thickness + 
                           this.maxBottomProtrusion + 
                           this.pad[2];

        this.x = this.pad[3];
    } 

    drawRect(surface: Svg) {
        //Draws bar
        console.log("Y Here: " + this.y);
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

    removePulse() {
    }

}
