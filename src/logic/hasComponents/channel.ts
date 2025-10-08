import ChannelForm from "../../features/form/ChannelForm";
import {FormBundle} from "../../features/form/LabelGroupComboForm";
import Aligner from "../aligner";
import Collection, {ICollection, IHaveComponents} from "../collection";
import defaultChannel from "../default/channel.json";
import {UserComponentType} from "../diagramHandler";
import {IMountConfig} from "../mountable";
import {ID} from "../point";
import RectElement, {IRectStyle} from "../rectElement";
import {OccupancyStatus} from "./sequence";
import Spacial from "../spacial";
import Text, {IText} from "../text";
import {MarkAsComponent, RecursivePartial, UpdateObj} from "../util";
import {IVisual, Visual} from "../visual";

export type ChannelNamedStructure =
	| "top aligner"
	| "bottom aligner"
	| "bar"
	| "label"
	| "mounted-elements";

export interface IChannelComponents extends Record<string, Spacial | Spacial[]> {
	bar: RectElement;
	label: Text;
	mountedElements: Visual[];

	topAligner: Aligner<Visual>;
	bottomAligner: Aligner<Visual>;
}

export interface IChannel extends ICollection {
	sequenceID?: ID;

	style: IChannelStyle;
	mountedElements: IVisual[];
	label: IText;
}

export interface IChannelStyle {
	thickness: number;
	barStyle: IRectStyle;
}

export default class Channel extends Collection implements IHaveComponents<IChannelComponents> {
	static namedElements: {[name: string]: IChannel} = {
		default: <any>defaultChannel,
		"form-defaults": {
			padding: [0, 0, 0, 0],
			offset: [0, 0],
			ref: "my-channel",
			sequenceID: null,
			userChildren: [],
			mountedElements: [],

			style: {
				thickness: 3,
				barStyle: {
					fill: "#000000",
					stroke: null,
					strokeWidth: null
				}
			},

			label: {
				offset: [0, 0],
				padding: [0, 0, 0, 0],
				ref: "channel-symbol",
				text: "^{1}\\mathrm{H}",
				style: {
					fontSize: 50,
					colour: "black",
					display: "block",
					background: null
				}
			}
		}
	};
	static ElementType: UserComponentType = "channel";
	static formData: FormBundle = {
		form: ChannelForm,
		defaults: Channel.namedElements["form-defaults"],
		allowLabels: false
	};

	get state(): IChannel {
		return {
			sequenceID: this.sequenceID,
			style: this.style,
			label: this.components.label.state,
			mountedElements: this.components.mountedElements.map((m) => m.state),
			...super.state
		};
	}

	components: IChannelComponents;
	style: IChannelStyle;

	// A collection of columns to align this channel's positionals to
	private _mountColumns?: Aligner<Aligner<Visual>>;
	public get mountColumns(): Aligner<Aligner<Visual>> {
		if (this._mountColumns !== undefined) {
			return this._mountColumns;
		}
		throw new Error(`Positional Columns have not been set for channel: ${this.id}`);
	}
	public set mountColumns(value: Aligner<Aligner<Visual>>) {
		this._mountColumns = value;
		// this._mountColumns.bindSize(this.bar, "x");

		this._mountColumns.bind(this.components.bar, "x", "far", "far");
		this.components.bar.contentWidth = this._mountColumns.width;
		// This means when adding a new channel the bar is already as long as image
	}

	private _mountOccupancy?: OccupancyStatus[];
	public get mountOccupancy(): OccupancyStatus[] {
		if (this._mountOccupancy === undefined) {
			throw Error("Positional occupancy not set");
		}
		return this._mountOccupancy;
	}
	public set mountOccupancy(val: OccupancyStatus[]) {
		this._mountOccupancy = val;
	}

	sequenceID: ID;

	constructor(pParams: RecursivePartial<IChannel>, templateName: string = "default") {
		var fullParams: IChannel = pParams
			? UpdateObj(Channel.namedElements[templateName], pParams)
			: Channel.namedElements[templateName];
		super(fullParams, templateName);

		this.sequenceID = fullParams.sequenceID;
		this.style = fullParams.style;
		this.padding = [...fullParams.padding];
		// SIDE PADDING is not permitted for channels as it would break alignment

		// ----- Create structure -----
		// Top aligner
		var topAligner: Aligner<Visual> = new Aligner(
			{axis: "x", alignment: "far", minCrossAxis: 30, ref: `top aligner`},
			"default"
		);
		this.add(topAligner, undefined, true);

		// Bar
		var bar: RectElement = new RectElement(
			{
				contentHeight: this.style.thickness,
				style: this.style.barStyle,
				ref: "bar"
			},
			"bar"
		);
		topAligner.bind(bar, "y", "far", "here");
		bar.sizeSource.x = "inherited";
		this.add(bar);

		// Bottom aligner
		var bottomAligner: Aligner<Visual> = new Aligner(
			{axis: "x", alignment: "here", minCrossAxis: 20, ref: "bottom aligner"},
			"default"
		);
		bar.bind(bottomAligner, "y", "far", "here");
		this.add(bottomAligner);

		var label = new Text(fullParams.label);
		bar.bind(label, "y", "centre", "centre");
		this.add(label);

		this.components = {
			bar: bar,
			bottomAligner: bottomAligner,
			label: label,
			mountedElements: [],
			topAligner: topAligner
		};

		MarkAsComponent(this.components);
		// ----------------------------
	}

	// Position positional elements on the bar
	mountElement(element: Visual): void {
		if (element.mountConfig === undefined) {
			throw new Error("Cannot mount element with uninitialised mount config.");
		}
		element.mountConfig.channelID = this.id;

		var element: Visual = element;
		var config: IMountConfig = element.mountConfig!;

		// ---- Bind to the upper and lower aligners for Y ONLY
		switch (config.orientation) {
			case "top":
				this.components.topAligner.add(element, undefined, false, false);
				break;
			case "both":
				this.components.bar.bind(element, "y", "centre", "centre");
				this.add(element);
				this.components.bar.enforceBinding();
				break;
			case "bottom":
				this.components.bottomAligner.add(element, undefined, false, false);
				break;
		}

		this.markComponent(element);
		this.add(element);
		this.components.mountedElements.push(element);
	}

	removeMountable(element: Visual) {
		// Remove from children of this channel (positional elements should be property taking positionals from children)
		this.remove(element);
		this.components.mountedElements.splice(this.components.mountedElements.indexOf(element), 1);

		// Remove from the column (?)
		if (element.mountConfig!.index === undefined) {
			throw new Error(`Trying to remove positional with uninitialised index`);
		}

		// Remove from aligner (yes one of these is redundant)
		switch (element.mountConfig?.orientation) {
			case "top":
				this.components.topAligner.remove(element);
				break;
			case "bottom":
				this.components.bottomAligner.remove(element);
				break;
			case "both":
				this.components.bar.clearBindsTo(element);
				break;
			default:
				throw new Error(`Unknown element orientation '${element.mountConfig?.orientation}`);
		}

		element.erase();
	}

	setLabelColumn(v: Aligner<Visual>) {
		v.bind(this.components.bar, "x", "far", "here"); // Bind X of bar

		v.bind(this.components.topAligner, "x", "here", "here", undefined);
		v.bind(this.components.bottomAligner, "x", "here", "here", undefined);

		if (this.components.label) {
			v.add(this.components.label, undefined, false, false);
		}
	}

	//
	shiftIndices(from: number, n: number = 1): void {
		//var shifted: Visual[] = []
		this.mountOccupancy.forEach((pos, i) => {
			if (pos === ".") {
				return;
			}
			if (i >= from && pos !== undefined && pos.mountConfig!.index !== undefined) {
				//if (!shifted.includes(pos)) {
				pos.mountConfig!.index = pos.mountConfig!.index + n;
				//  shifted.push(pos)
				//}
			}
		});
	}
}
