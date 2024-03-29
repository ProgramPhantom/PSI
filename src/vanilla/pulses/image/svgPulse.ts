import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Alignment, Orientation, temporalInterface, temporalConfig, IDefaultConstruct} from "../../temporal";
import {Position, labelInterface } from "../../label";
import { PartialConstruct, UpdateObj } from "../../util";
import {svgPulses} from "../../default/data/svgPulse"
import { IDraw } from "../../drawable";

const svgContent: {[path: string]: string} = {}
const svgPaths = ["\\src\\assets\\aquire2.svg",
				  "\\src\\assets\\saltirelohi.svg",
				  "\\src\\assets\\saltirehilo.svg",
				  "\\src\\assets\\halfsine.svg",
				  "\\src\\assets\\chirplohi.svg",
				  "\\src\\assets\\chirphilo.svg",
				  "\\src\\assets\\ampseries.svg",
				  "\\src\\assets\\180.svg",
				  "\\src\\assets\\trapezium.svg",
				  "\\src\\assets\\talltrapezium.svg"]

for (const p of svgPaths) {
	var svg = await fetch(p).then(
		(response) => response.text()
	).then(
		(response) => {return response}
	)

	svgContent[p] = svg;
}

export interface svgPulseInterface extends temporalInterface {
	path: string,
	style: svgPulseStyle,
}

export interface svgPulseStyle {
	width: number,
	height: number
}

export default class SVGPulse extends Temporal implements IDraw, IDefaultConstruct<svgPulseInterface> {
	// svg
	static defaults: {[key: string]: svgPulseInterface} = {...<any>svgPulses};

	svgContent: string;
	style: svgPulseStyle;
	path: string;

	constructor(params: svgPulseInterface) {
		super(params);


		this.style = params.style;
		this.path = params.path;

		this.svgContent = this.getSVG();

		this.dim = {width: this.style.width, height: this.style.height};
	}
		
	getSVG(): string {
		return svgContent[this.path]
	}


	draw(surface: Svg) {
		
		var obj = SVG(this.svgContent);
		obj.move(0, 0);
		obj.attr({"preserveAspectRatio": "none"})
		// var foreignObject = surface.foreignObject(200, 200);
		
		obj.children().forEach((c) => {
			c.attr({"vector-effect": "non-scaling-stroke"})
		})

		
		if (this.config.orientation === Orientation.bottom) {
			this.offset[1] = - Math.abs(this.offset[1]);
			console.log("FLIPPED")
			
			obj.children().forEach((c) => {

				c.transform({flip: "y", origin: "bottom left"})
				c.translate(0, -<number>obj.height())
			})
		}

		console.log(this.offset[1])
		obj.move(this.x + this.offset[0], this.y + this.offset[1]);
		obj.size(this.width, this.height);
		surface.add(obj);

		if (this.decoration.arrow || this.decoration.label) {
			this.positionDecoration();
			this.decoration.draw(surface);
		}
	}

	positionVertically(y: number, channelThickness: number) : number[] {
		var protrusion = this.verticalProtrusion(channelThickness); 
		
		switch (this.config.orientation) {
			case Orientation.top:
				this.y = y - this.height;
				break;

			case Orientation.bottom:
				this.y = y + channelThickness;

				break;

			case Orientation.both:
				this.y = y + channelThickness/2 - this.height/2;
				
				break;
		}

	   return protrusion;
	}
}