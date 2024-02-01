import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'


export default class Label extends Drawable {
    text: string;

    constructor(x: number, y: number, text: string) {
        super(x, y);

        this.text = text;
    }

    draw() {
        throw new Error("not implemented");
    }
}