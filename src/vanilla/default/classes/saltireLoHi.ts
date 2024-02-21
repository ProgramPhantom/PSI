import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/svgPulse/saltirelohi.json"
import { Alignment, IDefaultConstruct, Orientation, temporalConfig } from "../../temporal.ts";
import SVGPulse from "../../pulses/image/svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "../../pulses/image/svgPulse.ts";
import Label, {labelInterface} from '../../label.ts';

const DEFAULTSVG = await fetch(defaultPulse.path).then(
    (response) => response.text()
).then(
    (response) => {return response}
)


export default class SaltireLoHi extends SVGPulse implements IDefaultConstruct {
    static defaults: svgPulseInterface = {...<any>defaultPulse}

    constructor(timestamp: number=0,
                params: svgPulseInterface=SaltireLoHi.defaults,
                offset: number[]=[0, 1]) {

        super(timestamp, params, offset);
    }

    getSVG(): string {
        return DEFAULTSVG;
    }

}