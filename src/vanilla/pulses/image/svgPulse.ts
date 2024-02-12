import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Orientation, orientationEval, temporalInterface,} from "../../temporal";
import ImagePulse, { imagePulseStyle } from "./imagePulse";
import * as defaultPulse from "../../default/svgPulse.json"
import * as defaultSVG from "../../svg/acquisition.svg"
import { positionEval, labelInterface } from "../../label";

import * as svgContent from "../../../assets/aquire.svg";

export interface svgPulseInterface extends temporalInterface {
    path: string,
    style: svgPulseStyle,
}

export interface svgPulseStyle extends imagePulseStyle {
 
}

export default class SVGPulse extends ImagePulse {
    // svg
    static defaults: svgPulseInterface = {
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



    svgContent: string;

    constructor(timestamp: number,
                path: string,
                orientation: Orientation, 
                padding: number[], 
                style: svgPulseStyle,
                label?: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp,  
              path, orientation,
              padding, 
              style,
              label,
              offset);

        this.style = style;

        this.path = path;

        console.log("LOADING SVG");

        this.svgContent = this.getSVG();


        console.log(this.svgContent);
    }
        
    getSVG(): string {
        // Not possible to read a file using javascript
        // OPEN FILE HERE
        const str = 
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><path fill="none" stroke="#000" class="dcg-svg-curve" paint-order="fill stroke markers" d="M0 200h0l5.273-58.643 3.711-37.272L12.11 76.24l2.735-21.217 2.539-16.781 2.148-11.85 1.953-8.82 1.758-6.307 1.563-4.29 1.367-2.73 1.172-1.581.976-.784.977-.301.781.103.781.407.977.932 1.172 1.727 1.367 2.84 1.563 4.3 1.757 6.13 1.953 8.333 2.149 10.887 2.539 14.971 2.93 19.736 3.515 26.487 4.688 38.562 12.89 107.793 3.711 27.018 3.125 20.122 2.735 15.285 2.539 12.042 2.148 8.464 1.953 6.262 1.758 4.442 1.563 2.985 1.367 1.865 1.172 1.044 1.172.534.976.06.781-.204.977-.564 1.172-1.125 1.367-1.918 1.563-2.969 1.757-4.292 1.953-5.893 2.149-7.755 2.539-10.728 2.93-14.213 3.515-19.16 4.492-26.813 14.063-85.573 3.71-19.34 3.126-14.291 2.734-10.763 2.344-7.805 2.148-5.933 1.954-4.341 1.757-3.03 1.563-1.99 1.367-1.195 1.367-.686 1.18-.187.969.125 1.172.482 1.367 1.014 1.562 1.739 1.563 2.338 1.758 3.319 1.953 4.495 2.343 6.435 2.54 8.127 3.125 11.419 3.71 15.164 5.079 22.56 10.742 48.164 4.101 16.328 3.32 11.674 2.93 8.912 2.54 6.548 2.343 5.002 2.149 3.667 1.953 2.55 1.757 1.648 1.563.948 1.367.433 1.172.078 1.172-.19 1.367-.553 1.563-1.062 1.757-1.727 1.954-2.55 2.148-3.532 2.344-4.654 2.734-6.378 3.125-8.36 3.711-11.093 5.274-17.141 10.351-33.914 4.102-11.97 3.32-8.573 2.93-6.557 2.539-4.827 2.343-3.698 2.149-2.72 1.953-1.9 1.953-1.349 1.758-.74 1.367-.265 1.367.002 1.368.267 1.562.622 1.758 1.094 1.953 1.685 2.148 2.397 2.344 3.217 2.735 4.47 3.125 5.927 3.71 7.943 4.883 11.453 12.5 29.77 3.906 8.108 3.32 6.05 2.93 4.574 2.735 3.552 2.539 2.637 2.344 1.843 2.148 1.182 1.953.648 1.563.229 1.562-.027 1.563-.28 1.758-.606 1.953-1.027 2.343-1.699 2.54-2.375 2.734-3.123 3.125-4.19 3.71-5.677 4.688-7.928L383.594 189l3.906-5.693 3.32-4.179 2.93-3.103 2.734-2.355 2.735-1.802 2.344-1.09 2.148-.625 1.953-.258 1.953.033 1.953.32 1.953.596 2.344 1.067 2.54 1.56 2.929 2.28 3.32 3.124 3.906 4.276 4.883 5.983 15.625 19.626 4.102 4.252 3.515 3.084 3.32 2.363 2.93 1.604 2.54 1.007 2.343.608 2.149.283 2.148.024 2.149-.229 2.343-.53 2.54-.888 2.734-1.295 3.32-2 3.906-2.857 4.688-3.978 7.031-6.58 8.594-7.941 4.883-3.96 4.101-2.813 3.711-2.054 3.125-1.327 2.93-.888 2.734-.511 2.54-.198 2.538.065 2.54.32 2.734.618 2.93.953 3.32 1.408 3.906 2.038 4.883 2.991 8.008 5.472 8.984 5.998 5.078 2.902 4.297 2.018 3.711 1.357 3.32.883 3.125.531 2.93.23 2.93-.025 3.125-.302 3.125-.568 3.515-.93 3.907-1.35 4.687-1.97 6.445-3.112 13.672-6.697 5.078-2.043 4.297-1.394 3.907-.953 3.71-.607 3.516-.296 3.516-.024 3.515.237 3.711.518 4.102.857 4.687 1.287 5.86 1.944 20.898 7.262 4.883 1.209 4.492.816 4.102.473 4.101.203 4.102-.064 4.297-.34 4.492-.624 5.078-.981 6.445-1.551 21.29-5.38 5.468-.949 4.883-.582 4.687-.3 4.688-.044 4.883.219 5.273.508 4.883.681" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="6"/></svg>`;

        return str
    }


    draw(surface: Svg) {
        
        var obj = SVG(this.svgContent);
        obj.move(this.x + this.offset[0], this.y + this.offset[1]);
        obj.size(this.width, this.height);
        obj.attr({"preserveAspectRatio": "none"})

        // var foreignObject = surface.foreignObject(200, 200);
        surface.add(obj);


        console.log("GRADIENT HEIGHT", this.height)
    }
}