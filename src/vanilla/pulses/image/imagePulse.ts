import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Alignment, Orientation, temporalInterface, temporalPosition} from "../../temporal";
import * as defaultPulse from "../../default/imagePulse.json"
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
    static defaults: imagePulseInterface = {
        padding: defaultPulse.padding,

        positioning: {
            orientation: Orientation[defaultPulse.positioning.orientation  as keyof typeof Orientation],
            alginment: Alignment[defaultPulse.positioning.alignment as keyof typeof Alignment],
            overridePad: defaultPulse.positioning.overridePad,
        },

        path: defaultPulse.path,
        style: {
            width: defaultPulse.style.width,
            height: defaultPulse.style.height,
        },
        label: {
            text: defaultPulse.label.text,
            padding: defaultPulse.label.padding,
            labelPosition: LabelPosition[defaultPulse.label.labelPosition as keyof typeof LabelPosition],
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
                                 options.positioning,
                                 options.padding,
                                 options.style,
                                 options.label)

        return el;
    }

    style: imagePulseStyle;
    path: string;

    constructor(timestamp: number, 
                path: string,
                positioning: temporalPosition, 
                padding: number[], 
                style: imagePulseStyle,
                label?: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              positioning, 
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