import * as defaultChannel from "./default/data/channel.json"
import { Element } from "./drawable";
import { Number, SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Alignment, Orientation, labelable } from "./temporal";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import Label, { labelInterface, Position } from "./label";
import Span from "./span";
import Abstract from "./abstract";
import AnnotationLayer from "./annotationLayer";
import Bracket, { bracketInterface } from "./bracket";
import Section from "./section";
import SpanningLabel from "./spanningLabel";
import { PartialConstruct } from "./util";
 
interface Dim {
    width: number,
    height: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number

    width: number,
    height: number,
}


export interface channelInterface {
    temporalElements: Temporal[],
    padding: number[],
    identifier: string,

    style: channelStyle,

    labelOn: boolean
    label: labelInterface
    
    annotationStyle: channelAnnotation,
}


export interface channelStyle {
    thickness: number,
    fill: string,
    stroke?: string | null,  
    strokeWidth?: number | null
}

export interface channelAnnotation {
    padding: number[]
}


export default class Channel extends Element implements labelable {
    static default: channelInterface = {...<any>defaultChannel}

    style: channelStyle;

    identifier: string;

    maxTopProtrusion: number;
    maxBottomProtrusion: number;

    barWidth: number;  // Actually the width left to right
    barX: number;
    barY: number;
    
    temporalElements: Temporal[];
    annotationLayer?: AnnotationLayer;

    sectionWidths: number[] = [];  // List of widths of each section along the sequence
    occupancy: boolean[] = []
    sectionXs: number[] = [];  // X coords of the leftmost of each section (including end) taken from sequence
    elementCursor: number = -1;

    labelOn: boolean;
    label?: Label;
    position: Position=Position.left;

    constructor(params: channelInterface,
                offset: number[]=[0, 0]) {
                
        super(params.padding[3], 0, offset);
        this.barX = params.padding[3];
        this.barY = 0;

        this.style = params.style;
        this.padding = params.padding;

        this.identifier = params.identifier;

        this.maxTopProtrusion = 0;  // Move this to element
        this.maxBottomProtrusion = this.style.thickness;

        this.dim = {width: 0, height: this.style.thickness};
        this.barWidth = 0;

        this.temporalElements = [...params.temporalElements];  // please please PLEASE do this (list is ref type)
        
        this.labelOn = params.labelOn;
        if (params.label) {
            this.label = PartialConstruct(Label, params.label, Channel.default.label!);
            this.barX = this.padding[3] + this.label!.pwidth;
        }

    }

    draw(surface: Svg, initialX: number, timestampWidths: number[]=[], yCursor: number=0,) {
        this.y = yCursor + this.padding[0];
        this.barX = initialX;
        this.occupancy = new Array<boolean>(timestampWidths.length).fill(false);  // Initialise occupancy

        // Compute x values of start of each timespan
        this.sectionXs.push(this.barX);
        timestampWidths.forEach((w, i) => {
            this.sectionXs.push(w + this.sectionXs[i]);
        })
        
        // Add annotation
        var annotationHeight  = 0;
        if (this.annotationLayer) {
            this.annotationLayer.draw(surface, timestampWidths, this.barX, this.y);
            yCursor += this.annotationLayer.pheight;
            annotationHeight = this.annotationLayer.pheight;
        }

        this.computeBarY(yCursor);
        
        this.posDrawDecoration(surface);
        
        
        this.dim = {width: this.sectionXs[this.sectionXs.length-1],
                    height: this.height + annotationHeight}
        

        // CURRENTLY IGNORING VERTICAL LABEL IMPACT

        this.positionElements(timestampWidths);
        console.log("bar y", this.barY)
        this.temporalElements.forEach(element => {
            element.draw(surface);
        });
        this.drawRect(surface);

        
    }

    computeBarY(yCursor: number=0) {
        this.computeVerticalBounds();

        var rectPosY = yCursor + this.padding[0] + this.maxTopProtrusion;
        
        this.barY = rectPosY;
    }

    drawRect(surface: Svg) {
        // Draws bar
        surface.rect(this.barWidth, this.style.thickness)
        .attr(this.style).move(this.barX, this.barY).attr({
            "shape-rendering": "crispEdges"
        });

    }

    computeVerticalBounds() {
        var topProtrusion: number[] = [0];
        var bottomProtrusion: number[] = [0];

        this.temporalElements.forEach((element) => {
            var protrusion = element.verticalProtrusion(this.style.thickness);
            topProtrusion.push(protrusion[0]);
            bottomProtrusion.push(protrusion[1]);
        })

        this.maxTopProtrusion = Math.max(...topProtrusion);
        this.maxBottomProtrusion = Math.max(...bottomProtrusion);


        var height = this.maxBottomProtrusion + 
                      this.maxTopProtrusion + this.style.thickness;
        

        this.dim = {width: this.width, height: height}
    }

    positionElements(timestampWidths: number[]) {
        // Current alignment style: centre
        this.temporalElements.forEach((temporalEl) => {
            var tempX = 0;
            var sectionWidth = 0;

            // Vertical Positioning
            temporalEl.positionVertically(this.barY, this.style.thickness);

            if (temporalEl.timestamp.length > 1) {  // Multi timestamp element eg [1, 4]
                tempX = this.sectionXs[temporalEl.timestamp[0]] // Set x as start section

                for (var i = temporalEl.timestamp[0]; i <= temporalEl.timestamp[1]; i++) {
                    sectionWidth += timestampWidths[i];  // Compute width of entire element slot
                    this.occupancy[i] = true;
                }
            } else {
                tempX = this.sectionXs[temporalEl.timestamp[0]]  // Simply set x and 
                sectionWidth = timestampWidths[temporalEl.timestamp[0]] // Width as the x section and section width
                this.occupancy[temporalEl.timestamp[0]] = true;
            }
            
            if (temporalEl.config.inheritWidth) {  // Transform
                temporalEl.dim = {width: sectionWidth, height: temporalEl.height};
            }

            switch (temporalEl.config.alignment) {
                case Alignment.Centre:
                    temporalEl.centreXPos(tempX + sectionWidth/2);
                    break;
                case Alignment.Left:
                    if (temporalEl.config.overridePad) {
                        temporalEl.x = tempX;
                    } else {
                        temporalEl.x = tempX + temporalEl.padding[3];
                    }
                    break;
                case Alignment.Right:
                    
                    if (temporalEl.config.overridePad) {
                        temporalEl.x = tempX + sectionWidth - temporalEl.width;
                    } else {
                        temporalEl.x = tempX + sectionWidth - temporalEl.width - temporalEl.padding[1];
                    }

                    break;
                default: 
                    // Centre
                    temporalEl.centreXPos(tempX + sectionWidth/2);
                    break;

            }
        })

        
        this.barWidth = this.sectionXs[this.sectionXs.length-1] - this.barX;
    }

    addTemporal(obj: Temporal): number[] {
        
        this.elementCursor += 1;
        obj.barThickness = this.style.thickness;

        if (obj.config.noSections > 1) {
            obj.timestamp = [this.elementCursor, this.elementCursor+obj.config.noSections-1];

            this.elementCursor += obj.config.noSections - 1;
        } else {
            if (obj.config.timestamp) {
                obj.timestamp = obj.config.timestamp;
            } else {
                obj.timestamp = [this.elementCursor];
            }
            
        }
        

        var sections = new Array<number>(obj.config.noSections);
        sections.fill(obj.pwidth / obj.config.noSections);

        this.temporalElements.push(obj);
        this.sectionWidths.push(...sections);

        this.computeVerticalBounds();
        return this.sectionWidths;
    }

    addAnnotationLabel(lab: Span) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.default.annotationStyle.padding)
        }
        var timestamp;
        
        if (lab.timestamp !== undefined) {
            timestamp = lab.timestamp;
        } else {
            timestamp = this.elementCursor;
        }

        if (timestamp == -1) {
            return;
        }

        this.annotationLayer.annotateLabel(lab);
    }

    addAnnotationLong(section: Section) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.default.annotationStyle.padding)
        }

        var timestampStart: number;
        var timestampEnd: number;
        
        if (section.timespan === undefined) {
            timestampStart = 0;
            timestampEnd = 1;
        } else if(section.timespan.length == 1) {
            timestampStart = section.timespan[0];
            timestampEnd = timestampStart + 1;
        } else if (section.timespan.length >= 2) {
            timestampStart = section.timespan[0];
            timestampEnd = section.timespan[1];
        } else {
            timestampStart = section.timespan[0];
            timestampEnd = section.timespan[1];
        }


        var range = section.timespan ? section.timespan : [timestampStart, timestampEnd];

        if (range[0] < 0) {range[0] = 0;}
        if (range[1] > this.sectionWidths.length+1) {range[1] = this.sectionWidths.length+1}
        if (range[0] > range[1]) {range = [0, 1]}


        section.timespan = range;
        this.annotationLayer.annotateLong(section);
    }

    jumpTimespan(newCurs: number) {
        for (var empty = this.elementCursor; empty < newCurs; empty++) {
            this.sectionWidths.push(0);
        }
        this.elementCursor = newCurs
    }

    // Draws the channel label
    // It is required that computeY has been ran for this to work
    posDrawDecoration(surface: Svg) : number[] {
        /*  Draw label with no temp elements?
        if (this.temporalElements.length === 0) {
            return [0, 0];
        }*/

        if (this.label) {

            var y = this.barY + this.style.thickness/2 - this.label.height/2;
            var x = this.label.padding[3];

            var hOffset: number = x + this.label.width + this.label.padding[1];

            this.label.move(x, y);
            this.label.draw(surface);
            
            return [hOffset, this.label.height];
        }

        return [0, 0];
    }

}
