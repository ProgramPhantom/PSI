import Aligner from "../aligner";
import Channel, {IChannel} from "./channel";
import Collection, {ICollection, IHaveComponents} from "../collection";
import defaultSequence from "../default/sequence.json";
import {AllComponentTypes} from "../diagramHandler";
import logger, {Operations, Processes} from "../log";
import {ID} from "../point";
import Space from "../space";
import Spacial from "../spacial";
import {FillObject, MarkAsComponent, RecursivePartial} from "../util";
import {Visual} from "../visual";
import Grid, { IGrid } from "../grid";


export interface ISequence extends IGrid {
	channels: IChannel[];
}

export type OccupancyStatus = Visual | "." | undefined;



export default class Sequence extends Grid {
	static defaults: {[key: string]: ISequence} = {
		default: {...(<any>defaultSequence)}
	};
	static ElementType: AllComponentTypes = "sequence";
	get state(): ISequence {
		return {
			channels: this.channels.map((c) => c.state),
			...super.state
		};
	}

	channels: Channel[];


	get channelsDict(): Record<ID, Channel> {
		return Object.fromEntries(this.channels.map((item) => [item.id, item]));
	}
	get channelIDs(): string[] {
		return this.channels.map((c) => c.id);
	}
	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.channels.forEach((c) => {
			elements.push(...c.components.mountedElements);
		});
		return elements;
	}

	constructor(pParams: RecursivePartial<ISequence>, templateName: string = "default") {
		var fullParams: ISequence = FillObject(pParams, Sequence.defaults[templateName]);
		super(fullParams, templateName);


		fullParams.channels.forEach((c) => {
			var newChan = new Channel(c);
			this.addChannel(newChan);
		});
	}

	// Content Commands
	addChannel(channel: Channel) {
		this.channels.push(channel);

	}

	deleteChannel(channel: Channel) {
		if (!this.channels.includes(channel)) {
			throw new Error(`Channel '${channel.ref}' does not belong to ${this.ref}`);
		}
		
		var index = this.channels.indexOf(channel);

		this.channels.splice(index, 1);
	}

}
