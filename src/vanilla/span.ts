import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowStyle, headStyleEval } from "./arrow";
import { labelInterface } from "./label";
import Temporal, { Orientation, labelable, orientationEval, temporalInterface } from "./temporal";
import { positionEval } from "./label";
import * as defaultSpan from "./default/span.json"
import { UpdateObj } from "./util";


interface spanInterface extends temporalInterface {
    width: number,
    style: arrowStyle
}   

export default class Span extends Temporal implements labelable {
    static defaults: spanInterface = {
        orientation: orientationEval[defaultSpan.orientation],
        padding: defaultSpan.padding,
        style: {
            thickness: defaultSpan.style.thickness,
            headStyle: headStyleEval[defaultSpan.style.headStyle],
            stroke: defaultSpan.style.stroke
        },
        label: {
            text: defaultSpan.label.text,
            padding: defaultSpan.label.padding,
            labelPosition: positionEval[defaultSpan.label.labelPosition],
            style: {
                size: defaultSpan.label.style.size,
                colour: defaultSpan.label.style.colour
            }
        },
        width: defaultSpan.width
    }

    public static anyArgConstruct(elementType: typeof Span, args: any): Span {

        const spanOptions = args ? UpdateObj(Span.defaults, args) : elementType.defaults;

        console.log("options: ", spanOptions)
        var el = new elementType(spanOptions.timestamp,
            spanOptions.orientation,
            spanOptions.padding,
            spanOptions.style,
            spanOptions.width,
            spanOptions.offset,
            spanOptions.label)

        return el;
    }

    arrow?: Arrow;
    arrowStyle: arrowStyle;

    constructor(timestamp: number=0,
                orientation: Orientation=Span.defaults.orientation, 
                padding: number[]=Span.defaults.padding, 
                style: arrowStyle=Span.defaults.style, 
                width: number=Span.defaults.width,
                offset: number[]=[0,0],
                label?: labelInterface, ) {
            
        super(timestamp, orientation, padding, offset, label,)
            
        this.bounds = {width: width, height: style.thickness + padding[2]}
        this.actualBounds = {width: padding[3] + width + padding[1], height: padding[0] + style.thickness + padding[2]}
                    
        this.arrowStyle = style;
    }

    public draw(surface: Svg): void {
        this.arrow = new Arrow(this.x, this.y, this.x + this.width, this.y, this.arrowStyle)
        
        this.arrow.draw(surface);

        if (this.label) {
            this.drawLabel(surface);
        }
    }

    
}