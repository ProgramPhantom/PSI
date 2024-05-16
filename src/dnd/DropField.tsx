import { useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties, useEffect, useState } from "react";
import SequenceHandler from "../vanilla/sequenceHandler";
import InsertArea, { AddSpec } from "./InsertArea";
import { Orientation } from "../vanilla/temporal";

class SequenceDropInterpreter {
    public handler: SequenceHandler;
    public insertAreas: AddSpec[] = [];
    public slitherWidth: number = 2;

    constructor (handler: SequenceHandler) {
        this.handler = handler;

        this.computeAreas();
    }

    computeAreas() {
         var sequence = this.handler.sequence;

        Object.entries(sequence.channels).forEach(([name, channel]) => {
            var x = channel.barX;

            channel.sectionXs.forEach((x, i) => {
                
                // Left slither top
                let newSlither: AddSpec = {area: {x: x, y: channel.py, width: this.slitherWidth, 
                    height: channel.maxTopProtrusion + channel.padding[0]},
                    index: i, orientation: Orientation.top, channelName: name};

                this.insertAreas.push(newSlither)
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
    // const [insertAreas, setInsertAreas] = useState<AddSpec[]>()

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