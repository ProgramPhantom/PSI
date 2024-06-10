import { useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties, useEffect, useState } from "react";
import SequenceHandler from "../vanilla/sequenceHandler";
import InsertArea, { AddSpec } from "./InsertArea";
import { Orientation } from "../vanilla/positional";

class SequenceDropInterpreter {
    public handler: SequenceHandler;
    public insertAreas: AddSpec[];
    private slitherWidth: number = 2;

    constructor (handler: SequenceHandler) {
        this.handler = handler;

        this.insertAreas = [];
        this.computeAreas();
    }

    computeAreas() {
        this.insertAreas = [];
        var sequence = this.handler.sequence;

        sequence.positionalColumns.forEach((column, i) => {
            var heightTop;
            var heightBottom;


            Object.entries(sequence.channelsDic).forEach(([name, channel]) => { 
                // Insert start

                // Top slither
                let newSlither: AddSpec = {
                    area: {x: column.x - this.slitherWidth/2, 
                           y: channel.y + (channel.annotationLayer ? channel.annotationLayer?.height : 0), 
                           width: this.slitherWidth, 
                           height: channel.maxTopProtrusion},
                    index: i, orientation: Orientation.top, channelName: name, insert: true,
                };
                this.insertAreas.push(newSlither)

                // bottom slither
                newSlither = {
                    area: {x: column.x - this.slitherWidth/2, 
                        y: channel.bar.y + channel.style.thickness + 1, 
                        width: this.slitherWidth, 
                        height: channel.maxBottomProtrusion + channel.padding[2] - 3},
                    index: i, orientation: Orientation.bottom, channelName: name, insert: true
                };
                this.insertAreas.push(newSlither)

                let occupied = channel.occupancy[i];
                if (!occupied) {  // Top block
                    let newBlock: AddSpec = {
                        area: {x: column.x + this.slitherWidth / 2, 
                               y: channel.y + (channel.annotationLayer ? channel.annotationLayer?.height : 0), 
                               width: column.width - this.slitherWidth, 
                               height: channel.maxTopProtrusion + channel.padding[0] - 1}, 
                        index: i, orientation: Orientation.top, channelName: name, insert: false}
                    this.insertAreas.push(newBlock);

                    // Bottom block
                    newBlock = {
                        area: {x: column.x + this.slitherWidth / 2, 
                               y: channel.bar.y + channel.style.thickness + 1, 
                               width: column.width - this.slitherWidth, 
                               height: channel.maxBottomProtrusion + channel.padding[2] - 3}, 
                        index: i, orientation: Orientation.bottom, channelName: name, insert: false}
                    this.insertAreas.push(newBlock);
                } 
            })

        })
    }
}

const style: CSSProperties = {
    height: '12rem',
    width: '12rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: 'normal',
    float: 'left',
    backgroundColor: "transparent"
  }

function DropField(props: {sequence: SequenceHandler}) {
    const [sequence] = useState<SequenceHandler>(props.sequence);

    let areaGenerator: SequenceDropInterpreter = new SequenceDropInterpreter(props.sequence);


    return (
    <div>
        {areaGenerator.insertAreas?.map((insertArea) => {
            return (
                <InsertArea areaSpec={insertArea}></InsertArea>
            )
        })
        }
    </div>
    )
}

export default DropField