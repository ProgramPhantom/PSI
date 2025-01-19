import { useDragDropManager, useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties, useEffect, useState } from "react";
import SequenceHandler from "../vanilla/sequenceHandler";
import InsertArea, { AddSpec } from "./InsertArea";
import { Orientation } from "../vanilla/positional";
import { Dimensions } from "../vanilla/spacial";
import { Visual } from "../vanilla/visual";
import Aligner from "../vanilla/aligner";


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
        var columns = sequence.positionalColumns.children;
        var newSlither: AddSpec;

        columns.forEach((column, columnIndex) => {
            var heightTop;
            var heightBottom; 

            Object.entries(sequence.channelsDic).forEach(([name, channel], channelIndex) => { 
                // Insert start
                // Top slither
                newSlither = {
                    area: {x: column.x - this.slitherWidth/2, 
                           y: channel.y, 
                           width: this.slitherWidth, 
                           height: channel.upperAligner.contentHeight! + channel.padding[0]},
                    index: columnIndex, orientation: Orientation.top, channelName: name, insert: true,
                };
                this.insertAreas.push(newSlither)

                // bottom slither
                newSlither = {
                    area: {x: column.x - this.slitherWidth/2, 
                        y: channel.lowerAligner.y, 
                        width: this.slitherWidth, 
                        height: channel.lowerAligner.contentHeight! + channel.padding[2]},
                    index: columnIndex, orientation: Orientation.bottom, channelName: name, insert: true
                };
                this.insertAreas.push(newSlither)

                let occupied: boolean = sequence.elementMatrix[channelIndex][columnIndex] === undefined ? false : true;
                if (!occupied) {  // Top block
                    var columnWidth = column.contentWidth === undefined ? 0 : column.contentWidth;
                    var upperAlignerHeight = channel.upperAligner.contentHeight === undefined ? 0 : channel.upperAligner.contentHeight;
                    var lowerAlignerHeight = channel.lowerAligner.contentHeight === undefined ? 0 : channel.lowerAligner.contentHeight;

                    let newBlock: AddSpec = {
                        area: {x: column.x + this.slitherWidth / 2, 
                               y: channel.contentY, 
                               width: columnWidth - this.slitherWidth, 
                               height: upperAlignerHeight}, 
                        index: columnIndex, orientation: Orientation.top, channelName: name, insert: false}
                    this.insertAreas.push(newBlock);

                    // Bottom block
                    newBlock = {
                        area: {x: column.x + this.slitherWidth / 2, 
                               y: channel.lowerAligner.y, 
                               width: columnWidth - this.slitherWidth, 
                               height: lowerAlignerHeight}, 
                        index: columnIndex, orientation: Orientation.bottom, channelName: name, insert: false}
                    this.insertAreas.push(newBlock);
                } 
            })
        })

        // END SLITHERS
        var column: Aligner<Visual> = columns[columns.length - 1];
        var i = columns.length - 1;
        if (column === undefined) {  // no positional columns yet
            column = sequence.labelColumn;
        }
        // insert end slithers:
        Object.entries(sequence.channelsDic).forEach(([name, channel]) => {
                // insert end slithers
                var upperAlignerHeight = channel.upperAligner.contentHeight === undefined ? 0 : channel.upperAligner.contentHeight;
                var lowerAlignerHeight = channel.lowerAligner.contentHeight === undefined ? 0 : channel.lowerAligner.contentHeight;

                // Top slither
                newSlither = {
                    area: {x: column.getFar(Dimensions.X) - this.slitherWidth/2, 
                           y: channel.y, 
                           width: this.slitherWidth, 
                           height: upperAlignerHeight},
                    index: i+1, orientation: Orientation.top, channelName: name, insert: true,
                };
                this.insertAreas.push(newSlither)

                // bottom slither
                newSlither = {
                    area: {x: column.getFar(Dimensions.X) - this.slitherWidth/2, 
                           y: channel.lowerAligner.y, 
                           width: this.slitherWidth, 
                           height: lowerAlignerHeight + channel.padding[2]},
                    index: i+1, orientation: Orientation.bottom, channelName: name, insert: true
                };
                this.insertAreas.push(newSlither)
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
    const dragDropManager = useDragDropManager();

    let areaGenerator: SequenceDropInterpreter = new SequenceDropInterpreter(props.sequence);
    const registry = dragDropManager.getRegistry();
    
    
    


    return (
    <div>
        {areaGenerator.insertAreas?.map((insertArea) => {
            return (                               // This fixes an enormous, impossible to fix problem
                <InsertArea areaSpec={insertArea} key={insertArea.channelName + insertArea.index + insertArea.insert + insertArea.orientation}></InsertArea>
            )
            })
        }
    </div>
    )
}

export default DropField