import { ILine, Line } from "./line";
import { Svg } from "@svgdotjs/svg.js";



export enum GridPositioning {start="start", centre="centre"}

export interface IGrid {
    gridOn: boolean,
    gridPositioning: GridPositioning,
    line: ILine,
}



export class Grid {
    gridOn: boolean;
    vLines: {[timestamp: number]: Line} = {};
    line: ILine;
    gridPositioning: GridPositioning;

    constructor(params: IGrid) {
        this.gridOn = params.gridOn;
        this.line = params.line;
        this.gridPositioning = params.gridPositioning;
    }

    addLine(line: Line, index: number) {
        this.vLines[index] = line;
    }

    draw(surface: Svg, timestampX: number[], height: number) {
        var attr: any;

        switch (this.gridPositioning) {
            case GridPositioning.start:
                var cursX = timestampX[0];
                
                for (const [timestamp, line] of Object.entries(this.vLines)) {
                    attr = {"stroke-width": line.style.thickness,
                            "stroke-dasharray": line.style.dashing,
                            "stroke": line.style.stroke}

                    cursX = timestampX[parseInt(timestamp)] ;
                        
                    surface.line(cursX, 0, cursX, height)
                    .attr(attr);
                }
                
                break;
            case GridPositioning.centre:
                var cursX = timestampX[0];

                for (const [timestamp, line] of Object.entries(this.vLines)) {
                    attr = {"stroke-width": line.style.thickness,
                            "stroke-dasharray": line.style.dashing,
                            "stroke": line.style.stroke}

                    cursX = timestampX[parseInt(timestamp)];
                    var width = timestampX[parseInt(timestamp)+1] - timestampX[parseInt(timestamp)];
                        
                    cursX += width/2;
                    surface.line(cursX, 0, cursX, height)
                    .attr({...line});
                   
                }

                break;
            default: 
                
                throw Error;
            }
    }
}