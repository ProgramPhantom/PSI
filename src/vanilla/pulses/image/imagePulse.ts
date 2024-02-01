import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Orientation, orientationEval, temporalInterface, temporalStyle} from "../../temporal";
import * as defaultPulse from "../../default/imagePulse.json"


export interface imagePulseInterface extends temporalInterface {
    path: string,
    style: imagePulseStyle,
}

export interface imagePulseStyle extends temporalStyle {
 
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
        }
    }

    public static anyArgConstruct(elementType: typeof ImagePulse, args: any): ImagePulse {
        // This seems wrong
        var defaultStyleWithArgs: imagePulseStyle = elementType.defaults.style;
        if (args.style !== undefined) {
            defaultStyleWithArgs = {
                width: args.style.width ?? elementType.defaults.style.width,
                height: args.style.height ?? elementType.defaults.style.height,
            }
        }
        
        var defaultWithArgs: imagePulseInterface = {
            padding: args.padding ?? elementType.defaults.padding,
            orientation: orientationEval[args.orientation] ?? elementType.defaults.orientation,
            path: args.path ?? elementType.defaults.path,
            style: defaultStyleWithArgs
        }

        

        var el = new elementType(defaultWithArgs.path,
                                 defaultWithArgs.orientation,
                                 0,
                                 defaultWithArgs.padding,
                                 defaultWithArgs.style)

        return el;
    }

    path: string;

    constructor(path: string,
                orientation: Orientation, 
                timestamp: number, 
                padding: number[], 
                style: imagePulseStyle,
                offset: number[]=[0, 0]) {

        super(timestamp, orientation, 
              padding, 
              style, 
              offset);

        this.style = style;
        this.path = path;
        
    }


    draw(surface: Svg) {
        var image = surface.image(this.path);

    }
}