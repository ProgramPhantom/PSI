import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Orientation, orientationEval, temporalInterface} from "../../temporal";
import * as defaultPulse from "../../default/imagePulse.json"
import { positionEval } from "../../label";

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
            size: defaultPulse.label.size
        }
    }

    public static anyArgConstruct(elementType: typeof ImagePulse, args: any): ImagePulse {
        const styleOptions = args.style ? {...elementType.defaults.style, ...args.style} : elementType.defaults.style;
        const labelOptions = args.label ? {...elementType.defaults.label, ...args.label} : elementType.defaults.label;
        const options = args ? { ...elementType.defaults, ...args, style: styleOptions, label: labelOptions} : elementType.defaults;

        var el = new elementType(options.timestamp,
                                 options.path,
                                 options.orientation,
                                 options.padding,
                                 options.style)

        return el;
    }

    style: imagePulseStyle;
    path: string;

    constructor(timestamp: number, 
                path: string,
                orientation: Orientation, 
                padding: number[], 
                style: imagePulseStyle,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              orientation, 
              padding, 
              offset);

        this.style = style;
        this.path = path;
    }


    draw(surface: Svg) {
        var image = surface.image(this.path);

    }
}