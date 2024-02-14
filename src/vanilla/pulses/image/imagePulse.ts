import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Alignment, Orientation, temporalInterface, temporalConfig} from "../../temporal";
import * as defaultPulse from "../../default/data/imagePulse.json"
import Label, {LabelPosition, labelInterface } from "../../label";
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
    static defaults: imagePulseInterface = {...<any>defaultPulse}

    public static anyArgConstruct(elementType: typeof ImagePulse, args: any): ImagePulse {
        const options = args ? UpdateObj(elementType.defaults, args) : elementType.defaults;

        var el = new elementType(options.timestamp,
                                 options.path,
                                 options.config,
                                 options.padding,
                                 options.style,
                                 options.label)

        return el;
    }

    style: imagePulseStyle;
    path: string;

    constructor(timestamp: number, 
                path: string,
                config: temporalConfig, 
                padding: number[], 
                style: imagePulseStyle,
                label?: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              config, 
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