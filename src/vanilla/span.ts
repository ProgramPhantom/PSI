import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowStyle, headStyleEval } from "./arrow";
import { LabelPosition, labelInterface } from "./label";
import Temporal, { Alignment, Orientation, labelable, temporalInterface, temporalConfig } from "./temporal";
import * as defaultSpan from "./default/span.json"
import { UpdateObj } from "./util";


interface spanInterface extends temporalInterface {
    
    width: number,
    style: arrowStyle
}   

export default class Span extends Temporal implements labelable {
    static defaults: spanInterface = {
        config: {
            orientation: Orientation[defaultSpan.config.orientation as keyof typeof Orientation],
            alginment: Alignment[defaultSpan.config.alignment as keyof typeof Alignment],
            overridePad: defaultSpan.config.overridePad,
            inheritWidth: defaultSpan.config.inheritWidth,
        },

        padding: defaultSpan.padding,
        style: {
            thickness: defaultSpan.style.thickness,
            headStyle: headStyleEval[defaultSpan.style.headStyle],
            stroke: defaultSpan.style.stroke
        },
        label: {
            text: defaultSpan.label.text,
            padding: defaultSpan.label.padding,
            labelPosition: LabelPosition[defaultSpan.label.labelPosition as keyof typeof LabelPosition],
            style: {
                size: defaultSpan.label.style.size,
                colour: defaultSpan.label.style.colour
            }
        },
        width: defaultSpan.width
    }

    public static anyArgConstruct(elementType: typeof Span, args: any): Span {

        const spanOptions = args ? UpdateObj(Span.defaults, args) : elementType.defaults;

        var el = new elementType(spanOptions.timestamp,
                                 spanOptions.config,
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
                config: temporalConfig=Span.defaults.config, 
                padding: number[]=Span.defaults.padding, 
                style: arrowStyle=Span.defaults.style, 
                width: number=Span.defaults.width,
                offset: number[]=[0,0],
                label?: labelInterface, ) {
            
        super(timestamp, config, padding, offset, label,)

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