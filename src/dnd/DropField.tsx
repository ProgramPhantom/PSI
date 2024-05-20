import { useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties, useEffect, useState } from "react";
import SequenceHandler from "../vanilla/sequenceHandler";
import InsertArea, { AddSpec } from "./InsertArea";
import { Orientation } from "../vanilla/positional";

class SequenceDropInterpreter {
    public handler: SequenceHandler;
    public insertAreas: AddSpec[] = [];
    private slitherWidth: number = 2;

    constructor (handler: SequenceHandler) {
        this.handler = handler;

        this.computeAreas();
    }

    computeAreas() {
         var sequence = this.handler.sequence;

        Object.entries(sequence.channelsDic).forEach(([name, channel]) => {


            channel.sectionXs.forEach((x, i) => {
                
                let correspondingWidth = sequence.maxSectionWidths[i];
                
                let occupied = channel.occupancy[i];

                // slither top
                let newSlither: AddSpec = {
                    area: {x: x - this.slitherWidth/2, 
                           y: channel.py + (channel.annotationLayer ? channel.annotationLayer?.pheight : 0), 
                           width: this.slitherWidth, 
                           height: channel.maxTopProtrusion + channel.padding[0] - 1},
                    index: i, orientation: Orientation.top, channelName: name
                };
                this.insertAreas.push(newSlither)

                // bottom slither
                newSlither = {
                    area: {x: x - this.slitherWidth/2, 
                        y: channel.barY + channel.style.thickness + 1, 
                        width: this.slitherWidth, 
                        height: channel.maxBottomProtrusion + channel.padding[2] - 3},
                    index: i, orientation: Orientation.bottom, channelName: name
                };
                this.insertAreas.push(newSlither)

                if (!occupied) {  // Top block
                    let newBlock: AddSpec = {
                        area: {x: x + this.slitherWidth / 2, 
                               y: channel.py + (channel.annotationLayer ? channel.annotationLayer?.pheight : 0), 
                               width: correspondingWidth - this.slitherWidth, 
                               height: channel.maxTopProtrusion + channel.padding[0] - 1}, 
                        index: i, orientation: Orientation.top, channelName: name}
                    this.insertAreas.push(newBlock);

                    // Bottom block
                    newBlock = {
                        area: {x: x + this.slitherWidth / 2, 
                               y: channel.barY + channel.style.thickness + 1, 
                               width: correspondingWidth - this.slitherWidth, 
                               height: channel.maxBottomProtrusion + channel.padding[2] - 3}, 
                        index: i, orientation: Orientation.bottom, channelName: name}
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