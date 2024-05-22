import { Svg } from "@svgdotjs/svg.js";
import Positional, { Alignment, Orientation, positionalConfig } from "./positional";


export default class Spacer extends Positional {
    static DefaultSpacerConfig: positionalConfig = {
        index: 1,

        orientation: Orientation.top,
        alignment: Alignment.Centre,
        overridePad: false,
        inheritWidth: false,
        noSections: 1,
    }

    constructor(index: number, orientation: Orientation) {
        super({config: {...Spacer.DefaultSpacerConfig, index: index, orientation: orientation, inheritWidth: true}})
    }

    resolveDimensions(): void {
        
    }

    draw(surface: Svg) {

    }
}