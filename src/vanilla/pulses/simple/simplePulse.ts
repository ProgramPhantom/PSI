import Temporal, {Orientation, orientationEval, temporalInterface, temporalStyle} from "../../temporal";
import * as defaultPulse from "../../default/180pulse.json"
import * as SVG from '@svgdotjs/svg.js'
import SVGPulse from "../image/svgPulse";



export interface simplePulseInterface extends temporalInterface {
    style: simplePulseStyle
}
export interface simplePulseStyle extends temporalStyle {
    // Sent to .attr
    fill: string,
    stroke?: string | null,  // Optional
    strokeWidth?: number | null
}



export default class SimplePulse extends Temporal {
    // Default is currently 180 Pulse
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill,
            stroke: defaultPulse.stroke,
            strokeWidth: defaultPulse.strokeWidth
        }
    }
    


    // A pulse that is an svg rect
    style: simplePulseStyle;
    
    public static anyArgConstruct(elementType: typeof SimplePulse, args: any): SimplePulse {
        console.log("ARGS --------------");
        console.log(args);
        // const options = opts ? { ...DEFAULT_OPTIONS, ...opts } : DEFAULT_OPTIONS;
        
        var defaultStyleWithArgs: simplePulseStyle = elementType.defaults.style;
        if (args.style !== undefined) {
            defaultStyleWithArgs = {
                width: args.style.width ?? elementType.defaults.style.width,
                height: args.style.height ?? elementType.defaults.style.height,
                fill: args.style.fill ?? elementType.defaults.style.fill,
                stroke: args.style.stroke ?? elementType.defaults.style.stroke,
                strokeWidth: args.style.strokeWidth ?? elementType.defaults.style.strokeWidth,
            }
        }
        
        var defaultWithArgs: simplePulseInterface = {
            padding: args.padding ?? elementType.defaults.padding,
            orientation: orientationEval[args.orientation] ?? elementType.defaults.orientation,
            style: defaultStyleWithArgs
        }

        var el = new elementType(defaultWithArgs.orientation,
                                 0,
                                 defaultWithArgs.padding,
                                 defaultWithArgs.style)

        return el;
    }

    constructor(orientation: Orientation, 
                timestamp: number, 
                padding: number[], 
                style: simplePulseStyle,
                offset: number[]=[0, 0]) {

        super(timestamp, orientation, 
              padding, 
              style, 
              offset);

        this.style = style;
    }


    draw(surface: SVG.Svg) {
        surface.rect(this.width, this.height)
        .attr(this.style)
        .move(this.x, this.y)
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth});

    }

    verticalProtrusion(channelThickness: number) : number[] {
        switch (this.orientation) {
            case Orientation.Top:
                var actualHeight = this.height;
                if (this.style.strokeWidth) {
                    actualHeight -= this.style.strokeWidth!/2;
                }
                
                return [actualHeight, 0];

            case Orientation.Bottom:
                var actualHeight = this.height;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                return [0, actualHeight];

            case Orientation.Both: // LOOK AT THIS
                var actualHeight = this.height/2 - channelThickness/2;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                return [actualHeight, actualHeight];
        }
    }

    positionVertically(y: number, channelThickness: number): number[] {
        var protrusion = this.verticalProtrusion(channelThickness);

        switch (this.orientation) {
            case Orientation.Top:
                this.y = y - this.height;


                if (this.style.strokeWidth) {
                    this.y += this.style.strokeWidth!/2;
                }
                break;

            case Orientation.Bottom:
                this.y = y + channelThickness;

                if (this.style.strokeWidth) {
                    this.y = this.y - this.style.strokeWidth!/2;
                }
                break;

            case Orientation.Both:
                this.y = y + channelThickness/2 - this.height/2

                if (this.style.strokeWidth) {
                    this.y = this.y;
                }
                break;
        }
    
        return protrusion;
    }
}

