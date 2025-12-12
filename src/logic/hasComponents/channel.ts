import Grid, { IGrid } from "../grid";
import { ID, UserComponentType } from "../point";
import RectElement, { IRectElement, IRectStyle } from "../rectElement";
import Spacial from "../spacial";
import Text, { IText } from "../text";
import Visual, { IVisual } from "../visual";

console.log("Load module Channel")

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
	static ElementType: UserComponentType = "channel";
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
		return this.children.filter((v) => v.placementMode.type === "pulse")
	}

	style: IChannelStyle;
	sequenceID: ID;

	label: Text;
	bar: RectElement;

	constructor(params: IChannel) {
		super(params);

		this.sequenceID = params.sequenceID;
		this.style = params.style;

		this.label = new Text(params.label);
		this.label.placementMode = {type: "grid", gridConfig: {alignment: {x: "centre", y: "centre"},
															   coords: {row: 1, col: 0},
															   contribution: {x: true, y: false}}}
											

		this.bar = new RectElement(params.bar);
		this.bar.placementMode = {type: "grid", gridConfig: {alignment: {x: "here", y: "centre"},
														     coords: {row: 1, col: 1}}}

		this.initialiseChannel();
	}

	private initialiseChannel() {
		this.insertEmptyRow();
		this.insertEmptyRow();
		this.insertEmptyRow();

		this.insertEmptyColumn();
		this.insertEmptyColumn();

		this.addChildAtCoord(this.label, 1, 0);
		this.addChildAtCoord(this.bar, 1, 1);

		this.setMatrixAtCoord({ghost: {width: 0, height: 20}}, {row: 0, column: 0})
		this.setMatrixAtCoord({ghost: {width: 0, height: 20}}, {row: 2, column: 0})
	}

	public growBar() {
		this.setChildSize(this.bar, {noRows: 1, noCols: this.noColumns-1})
	}
}
