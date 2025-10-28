import { ISequence } from "../../typeCheckers/sequence-ti";
import defaultSequence from "../default/sequence.json";
import { AllComponentTypes } from "../diagramHandler";
import Grid, { IGrid } from "../grid";
import { ID } from "../point";
import { IMountConfig } from "../spacial";
import { FillObject, RecursivePartial } from "../util";
import { Visual } from "../visual";
import Channel, { IChannel } from "./channel";


export interface ISequence extends IGrid {
	channels: IChannel[];
}

export type OccupancyStatus = Visual | "." | undefined;



export default class Sequence extends Grid implements ISequence {
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
			elements.push(...c.gridChildren);
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


	public addPulse(pulse: Visual) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot mount pulse with no pulse type config`)
			return
		}

		var config: IMountConfig = pulse.placementMode.config;

		var channelId: ID = pulse.placementMode.config.channelID; 

		// We now need to convert the mount config in the pulse's placement
		// type into the exact coordinate in the grid to insert this element
		var channelIndex = this.locateChannelById(channelId);

		var row: number = 0;
		var column: number = 1;  // Starting at 1 as we know the label goes there

		// --------- Row -------------
		// Currently, channels ALWAYS have a height of 3 so that's how we find 
		// our row number.
		row = channelIndex * 3;
		if (config.orientation === "both") {
			row += 1
		} else if (config.orientation === "bottom") {
			row += 2
		}


		// ---------- Column ------------
		column += config.index;  // Shift along by index


		this.add(pulse, row, column);
	}

	// Content Commands
	public addChannel(channel: Channel) {
		this.channels.push(channel);
		
		// Add the three rows of this channel to the bottom of the 
		// grid matrix;

		// First we need to expand the matrix (as this channel we are)
		// adding  could be longer than the matrix:

		var channelLength = channel.noColumns;
		this.expandMatrix({row: 0, col: channelLength})  
		
		// Note we don't care about the row as we will just append the 
		// rows of the channel now, there's no need to expand it
		
		channel.getRows().forEach((row) => {
			this.gridMatrix.push(row);
		})
	
	}

	public deleteChannel(channel: Channel) {
		var channelIndex = this.locateChannel(channel);

		this.channels.splice(channelIndex, 1);
		
		var channelStartRow = channelIndex * 3;

		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);
		this.removeRow(channelStartRow);

		// Matrix now may be over-long if the longest channel has 
		// been deleted, hence we squeeze.
		this.squeezeMatrix();
	}

	protected locateChannel(channel: Channel) {
		return this.locateChannelById(channel.id);
	}

	protected locateChannelById(id: ID): number | undefined {
		var channelIndex: number | undefined = undefined;

		this.channels.forEach((child, index) => {
			if (id === child.id) {
				channelIndex = index;
			}
		});

		return channelIndex;
	}

}
