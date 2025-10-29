import ChannelForm from "../../features/form/ChannelForm";
import { FormBundle } from "../../features/form/LabelGroupComboForm";
import defaultChannel from "../default/channel.json";
import { UserComponentType } from "../diagramHandler";
import Grid, { IGrid } from "../grid";
import { ID } from "../point";
import RectElement, { IRectElement, IRectStyle } from "../rectElement";
import Text, { IText } from "../text";
import { RecursivePartial, UpdateObj } from "../util";
import Visual, { IVisual  } from "../visual";


export interface IChannel extends IGrid {
	sequenceID?: ID;
	style: IChannelStyle;
	label: IText,
	bar: IRectElement,

	pulseElements: IVisual[]
}

export interface IChannelStyle {
	thickness: number;
	barStyle: IRectStyle;
}

export default class Channel extends Grid implements IChannel {
	static namedElements: {[name: string]: IChannel} = {
		default: <any>defaultChannel,
		"form-defaults": {
			padding: [0, 0, 0, 0],
			offset: [0, 0],
			ref: "my-channel",
			sequenceID: null,
			gridChildren: [],
			pulseElements: [],
			placementMode: {type: "managed"},

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
				placementMode: {type: "managed"},
				style: {
					fontSize: 50,
					colour: "black",
					display: "block",
					background: null
				}
			},

			bar: {		
				padding: [0, 4, 0, 4],
				offset: [0, 0],

				contentWidth: 7,
				contentHeight: 50,

				placementMode: {type: "grid", 
					gridConfig: {
						coords: {row: 1, col: 1},
						alignment: {x: "here", y: "here"},
						size: {noRows: 1, noCols: 1},
					}
				},

				style: {
					fill: "#000000",
					stroke: "black",
					strokeWidth: 0
				},

				ref: "bar"
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
			pulseElements: this.pulseElements.map((p) => p.state),
			...super.state
		};
	}

	get pulseElements(): Visual[] {
		return this.gridChildren.filter((v) => v.placementMode.type === "pulse")
	}

	style: IChannelStyle;
	sequenceID: ID;

	label: Text;
	bar: RectElement;

	constructor(pParams: RecursivePartial<IChannel>, templateName: string = "default") {
		var fullParams: IChannel = pParams
			? UpdateObj(Channel.namedElements[templateName], pParams)
			: Channel.namedElements[templateName];
		super(fullParams);

		this.sequenceID = fullParams.sequenceID;
		this.style = fullParams.style;

		this.label = new Text(fullParams.label);
		this.bar = new RectElement(fullParams.bar);

		this.initialiseChannel();
	}

	private initialiseChannel() {
		this.insertEmptyRow();
		this.insertEmptyRow();
		this.insertEmptyRow();

		this.insertEmptyColumn();
		this.insertEmptyColumn();

		this.add(this.label, 1, 0);
		this.add(this.bar, 1, 1);
	}


}
