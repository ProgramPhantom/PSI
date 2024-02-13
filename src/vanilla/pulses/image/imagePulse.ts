import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Orientation, orientationEval, temporalInterface} from "../../temporal";
import * as defaultPulse from "../../default/imagePulse.json"
import { positionEval, labelInterface } from "../../label";
import { UpdateObj } from "../../util";


export interface imagePulseInterface extends temporalInterface {
    path: string,
    style: imagePulseStyle,
}

export interface imagePulseStyle {
    width: number,
    height: number
}

export default class ImagePulse extends Temporal {
    // png or jpeg
    static defaults: imagePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        path: defaultPulse.path,
        style: {
            width: defaultPulse.style.width,
            height: defaultPulse.style.height,
        },
        label: {
            text: defaultPulse.label.text,
            padding: defaultPulse.label.padding,
            labelPosition: positionEval[defaultPulse.label.labelPosition],
            style: {
                size: defaultPulse.label.style.size,
                colour: defaultPulse.label.style.colour
            }
        }
    }

    public static anyArgConstruct(elementType: typeof ImagePulse, args: any): ImagePulse {
        const options = args ? UpdateObj(elementType.defaults, args) : elementType.defaults;

        var el = new elementType(options.timestamp,
                                 options.path,
                                 options.orientation,
                                 options.padding,
                                 options.style,
                                 options.label)

        return el;
    }

    style: imagePulseStyle;
    path: string;

    constructor(timestamp: number, 
                path: string,
                orientation: Orientation, 
                padding: number[], 
                style: imagePulseStyle,
                label?: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              orientation, 
              padding, 
              offset,
              label,
              {width: style.width, height: style.height});

        this.style = style;
        this.path = path;
    }


    draw(surface: Svg) {
        var image = surface.image(this.path);

    }
}