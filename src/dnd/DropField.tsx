import { useDragDropManager, useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties, useEffect, useState } from "react";
import SequenceHandler from "../vanilla/sequenceHandler";
import InsertArea, { AddSpec } from "./InsertArea";
import { Dimensions } from "../vanilla/spacial";
import { Visual } from "../vanilla/visual";
import Aligner from "../vanilla/aligner";
import { Orientation } from "../vanilla/mountable";
import Channel from "../vanilla/channel";
import { OccupancyStatus } from "../vanilla/sequence";
import ENGINE from "../vanilla/engine";

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
        var columns = sequence.pulseColumns.children;
        var channels = sequence.channels;
        var noColumns = columns.length;
        var noChannels = channels.length;
        var newSlither: AddSpec;

        // Allowed Slither indexes
        var slitherIndexes: boolean[] = Array<boolean>(noColumns).fill(true);
        for (var channelIndex=0; channelIndex<noChannels; channelIndex++) {
            var channel: Channel = channels[channelIndex];

            // Columns
            for (var columnIndex=0; columnIndex<noColumns+1; columnIndex++) {
                let preOccupancy: OccupancyStatus = sequence.elementMatrix[channelIndex][columnIndex-1];
                let hereOccupancy: OccupancyStatus= sequence.elementMatrix[channelIndex][columnIndex];

                if (!((preOccupancy === undefined) ||
                    (preOccupancy === "." && hereOccupancy !== ".") || 
                    (preOccupancy instanceof Visual &&
                     hereOccupancy instanceof Visual && preOccupancy !== hereOccupancy))) {
                    slitherIndexes[columnIndex] = false
                }
            }

        }

        columns.forEach((column, columnIndex) => {
            var heightTop;
            var heightBottom; 

            Object.entries(sequence.channelsDic).forEach(([name, channel], channelIndex) => { 
                let occupied: boolean = sequence.elementMatrix[channelIndex][columnIndex] === undefined ? false : true;

                if (slitherIndexes[columnIndex]) {
                    // Insert start
                    // Top slither
                    newSlither = {
                        area: {x: column.x - this.slitherWidth/2, 
                            y: channel.y, 
                            width: this.slitherWidth, 
                            height: channel.upperAligner.contentHeight! + channel.padding[0]},
                        index: columnIndex, orientation: Orientation.top, channelID: name, insert: true,
                    };
                    this.insertAreas.push(newSlither)

                    // bottom slither
                    newSlither = {
                        area: {x: column.x - this.slitherWidth/2, 
                            y: channel.lowerAligner.y, 
                            width: this.slitherWidth, 
                            height: channel.lowerAligner.contentHeight! + channel.padding[2]},
                        index: columnIndex, orientation: Orientation.bottom, channelID: name, insert: true
                    };
                    this.insertAreas.push(newSlither)
                }

                if (!occupied) {  // Top block
                    var columnWidth = column.contentWidth === undefined ? 0 : column.contentWidth;
                    var upperAlignerHeight = channel.upperAligner.contentHeight === undefined ? 0 : channel.upperAligner.contentHeight;
                    var lowerAlignerHeight = channel.lowerAligner.contentHeight === undefined ? 0 : channel.lowerAligner.contentHeight;

                    let newBlock: AddSpec = {
                        area: {x: column.x + this.slitherWidth / 2, 
                               y: channel.contentY, 
                               width: columnWidth - this.slitherWidth, 
                               height: upperAlignerHeight}, 
                        index: columnIndex, orientation: Orientation.top, channelID: name, insert: false}
                    this.insertAreas.push(newBlock);

                    // Bottom block
                    newBlock = {
                        area: {x: column.x + this.slitherWidth / 2, 
                               y: channel.lowerAligner.y, 
                               width: columnWidth - this.slitherWidth, 
                               height: lowerAlignerHeight}, 
                        index: columnIndex, orientation: Orientation.bottom, channelID: name, insert: false}
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
                    area: {x: column.getFar("x") ?? 0 - this.slitherWidth/2, 
                           y: channel.y, 
                           width: this.slitherWidth, 
                           height: upperAlignerHeight},
                    index: i+1, orientation: Orientation.top, channelID: name, insert: true,
                };
                this.insertAreas.push(newSlither)

                // bottom slither
                newSlither = {
                    area: {x: column.getFar("x") ?? 0 - this.slitherWidth/2, 
                           y: channel.lowerAligner.y, 
                           width: this.slitherWidth, 
                           height: lowerAlignerHeight + channel.padding[2]},
                    index: i+1, orientation: Orientation.bottom, channelID: name, insert: true
                };
                this.insertAreas.push(newSlither)
        })
    }

}



function DropField() {
    let areaGenerator: SequenceDropInterpreter = new SequenceDropInterpreter(ENGINE.handler);

    return (
    <div id="drop-field">
        {areaGenerator.insertAreas?.map((insertArea) => {
            return (                               // This fixes an enormous, impossible to fix problem
                <InsertArea areaSpec={insertArea} key={insertArea.channelID + insertArea.index + insertArea.insert + insertArea.orientation}></InsertArea>
            )
            })
        }
    </div>
    )
}

export default DropField