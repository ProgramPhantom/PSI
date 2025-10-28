import ChannelForm from "../../features/form/ChannelForm";
import { FormBundle } from "../../features/form/LabelGroupComboForm";
import defaultChannel from "../default/channel.json";
import { UserComponentType } from "../diagramHandler";
import Grid, { IGrid } from "../grid";
import { ID } from "../point";
import RectElement, { IRectElement, IRectStyle } from "../rectElement";
import Text, { IText } from "../text";
import { RecursivePartial, UpdateObj } from "../util";


export interface IChannel extends IGrid {
	sequenceID?: ID;

	style: IChannelStyle;

	label: IText,
	bar: IRectElement,
}

export interface IChannelStyle {
	thickness: number;
	barStyle: IRectStyle;
}

export default class Channel extends Grid {
	static namedElements: {[name: string]: IChannel} = {
		default: <any>defaultChannel,
		"form-defaults": {
			padding: [0, 0, 0, 0],
			offset: [0, 0],
			ref: "my-channel",
			sequenceID: null,
			gridChildren: [],
			selfAlignment: {x: "centre", y: "centre"},
			sizeMode: {x: "fixed", y: "fixed"},

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
				placementMode: {type: "free", position: {x: 0, y: 0}},
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
			label: this.label,
			bar: this.bar,
			...super.state
		};
	}

	style: IChannelStyle;
	sequenceID: ID;

	label: Text;
	bar: RectElement;

	constructor(pParams: RecursivePartial<IChannel>, templateName: string = "default") {
		var fullParams: IChannel = pParams
			? UpdateObj(Channel.namedElements[templateName], pParams)
			: Channel.namedElements[templateName];
		super(fullParams, templateName);

		this.sequenceID = fullParams.sequenceID;
		this.style = fullParams.style;

		this.label = new Text(fullParams.label);
	}
}
