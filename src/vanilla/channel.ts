import * as defaultChannel from "./default/data/channel.json"
import { Element, IElement } from "./element";
import { Number, SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Positional, { Alignment, Orientation, labelable } from "./positional";
import SimplePulse, { ISimplePulse } from "./pulses/simple/simplePulse";
import SVGPulse from "./pulses/image/svgPulse";
import Label, { ILabel, Position } from "./label";
import Span from "./span";
import Abstract from "./abstract";
import AnnotationLayer from "./annotationLayer";
import Bracket, { IBracket } from "./bracket";
import Section from "./section";
import Annotation from "./annotation";
import { PartialConstruct, UpdateObj } from "./util";
import PaddedBox from "./paddedBox";
 
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


export interface IChannel extends IElement {
    positionalElements: Positional[],
    identifier: string;

    style: channelStyle;

    labelOn: boolean;
    label: ILabel;
    
    annotationStyle: channelAnnotation,
}


export interface channelStyle {
    thickness: number,
    fill: string,
    stroke?: string | null,  
    strokeWidth?: number | null
}

export interface channelAnnotation {
    padding: [number, number, number, number]
}


export default class Channel extends PaddedBox implements labelable {
    static defaults: {[name: string]: IChannel} = {"blankH1": <any>defaultChannel}

    style: channelStyle;

    identifier: string;

    maxTopProtrusion: number;
    maxBottomProtrusion: number;

    barWidth: number;  // Actually the width left to right
    barX: number;
    barY: number;
    
    positionalElements: Positional[];
    annotationLayer?: AnnotationLayer;

    sectionWidths: number[] = [];  // List of widths of each section along the sequence
    occupancy: boolean[] = [];  // 
    sectionXs: number[] = [];  // X coords of the leftmost of each section (including end) taken from sequence
    elementCursor: number = -1;

    labelOn: boolean;
    label?: Label;
    position: Position=Position.left;

    constructor(params: Partial<IChannel>, templateName: string="blankH1") {
        var fullParams: IChannel = params ? UpdateObj(Channel.defaults[templateName], params) : Channel.defaults[templateName];
        super(fullParams.offset, fullParams.padding);
        
        this.barX = fullParams.padding[3];
        this.barY = 0;

        this.style = fullParams.style;
        this.padding = fullParams.padding;

        this.identifier = fullParams.identifier;

        this.maxTopProtrusion = 0;  // Move this to element
        this.maxBottomProtrusion = this.style.thickness;

        this.barWidth = 0;

        this.positionalElements = [...fullParams.positionalElements];  // please please PLEASE do this (list is ref type)
        
        this.labelOn = fullParams.labelOn;
        if (fullParams.label) {
            this.label = new Label(fullParams.label);
            this.barX = this.padding[3] + this.label!.width;
        }
    }

    resolveDimensions(): void {
        this.computeVerticalBounds;

    }

    // Computes maxTopProtrusion, maxBottomProtrusion, height
    computeVerticalBounds() {
        var topProtrusion: number[] = [0];
        var bottomProtrusion: number[] = [0];

        this.positionalElements.forEach((element) => {
            var protrusion = element.verticalProtrusion(this.style.thickness);
            topProtrusion.push(protrusion[0]);
            bottomProtrusion.push(protrusion[1]);
        })

        this.maxTopProtrusion = Math.max(...topProtrusion);
        this.maxBottomProtrusion = Math.max(...bottomProtrusion);


        var height = this.maxBottomProtrusion + 
                      this.maxTopProtrusion + this.style.thickness;
        

        this.contentDim = {height: height}
    }

    draw(surface: Svg, initialX: number, indexWidths: number[]=[], yCursor: number=0,) {
        this.y = yCursor + this.padding[0];
        this.barX = initialX;
        this.occupancy = new Array<boolean>(indexWidths.length).fill(false);  // Initialise occupancy

        // Compute x values of start of each timespan
        this.sectionXs.push(this.barX);
        indexWidths.forEach((w, i) => {
            this.sectionXs.push(w + this.sectionXs[i]);
        })
        
        // Add annotation
        var annotationHeight = 0;
        if (this.annotationLayer) {
            this.annotationLayer.draw(surface, indexWidths, this.barX, this.y);
            yCursor += this.annotationLayer.height;
            annotationHeight = this.annotationLayer.height;
        }

        this.computeBarY(yCursor);
        
        this.posDrawDecoration(surface);
        
        
        this.contentDim = {width: this.sectionXs[this.sectionXs.length-1],
                    height: this.contentHeight + annotationHeight}
        

        // CURRENTLY IGNORING VERTICAL LABEL IMPACT

        this.positionElements(indexWidths);

        this.positionalElements.forEach(element => {
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


    // Position positional elements on the bar
    positionElements(indexWidths: number[]) {
        // Current alignment style: centre
        this.positionalElements.forEach((positionalEl) => {
            var tempX = 0;
            var sectionWidth: number = 0;

            // Vertical Positioning
            positionalEl.positionVertically(this.barY, this.style.thickness);

            if (positionalEl.index.length > 1) {  // Multi index element eg [1, 4]
                tempX = this.sectionXs[positionalEl.index[0]] // Set x as start section

                for (var i = positionalEl.index[0]; i <= positionalEl.index[1]; i++) {
                    sectionWidth += indexWidths[i];  // Compute width of entire element slot
                    this.occupancy[i] = true;
                }
            } else {
                tempX = this.sectionXs[positionalEl.index[0]]  // Simply set x and 
                sectionWidth = indexWidths[positionalEl.index[0]] // Width as the x section and section width
                this.occupancy[positionalEl.index[0]] = true;
            }
            
            if (positionalEl.config.inheritWidth) {  // Transform
                positionalEl.contentDim = {width: sectionWidth, height: positionalEl.contentHeight};
            }

            switch (positionalEl.config.alignment) {
                case Alignment.Centre:
                    positionalEl.centreXPos(tempX + sectionWidth/2);
                    break;
                case Alignment.Left:
                    if (positionalEl.config.overridePad) {
                        positionalEl.x = tempX;
                    } else {
                        positionalEl.x = tempX + positionalEl.padding[3];
                    }
                    break;
                case Alignment.Right:
                    
                    if (positionalEl.config.overridePad) {
                        positionalEl.x = tempX + sectionWidth - positionalEl.contentWidth;
                    } else {
                        positionalEl.x = tempX + sectionWidth - positionalEl.contentWidth - positionalEl.padding[1];
                    }

                    break;
                default: 
                    // Centre
                    positionalEl.centreXPos(tempX + sectionWidth/2);
                    break;

            }
        })

        
        this.barWidth = this.sectionXs[this.sectionXs.length-1] - this.barX;
    }

    addPositional(obj: Positional, index?: number): number[] {
        this.elementCursor += 1;  // Keep this here.
        var position: number = index ? index : this.elementCursor;

        obj.barThickness = this.style.thickness;

        if (!obj.index) {
            obj.index = position;

            this.elementCursor += obj.config.noSections;
        }

        var sections = new Array<number>(obj.config.noSections);
        sections.fill(obj.width / obj.config.noSections);

        this.positionalElements.push(obj);
        this.sectionWidths.push(...sections);

        this.computeVerticalBounds();
        return this.sectionWidths;
    }

    addAnnotationLabel(lab: Span) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.defaults["blankH1"].annotationStyle.padding)
        }
        var index;
        
        if (lab.index !== undefined) {
            index = lab.index;
        } else {
            index = this.elementCursor;
        }

        if (index == -1) {
            return;
        }

        this.annotationLayer.annotateLabel(lab);
    }

    addSection(section: Section) {
        if (!this.annotationLayer) {
            this.annotationLayer = new AnnotationLayer(Channel.defaults["blankH1"].annotationStyle.padding);
        }

        var indexStart: number;
        var indexEnd: number;
        
        if (section.indexRange === undefined) {
            indexStart = 0;
            indexEnd = 1;
        } else {
            indexStart = section.indexRange[0];
            indexEnd = section.indexRange[1];
        }


        var range: [number, number] = section.indexRange ? section.indexRange : [indexStart, indexEnd];

        if (range[0] < 0) {range[0] = 0;}
        if (range[1] > this.sectionWidths.length+1) {range[1] = this.sectionWidths.length+1}
        if (range[0] > range[1]) {range = [0, 1]}


        section.indexRange = range;
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
        if (this.positionalElements.length === 0) {
            return [0, 0];
        }*/

        if (this.label) {

            var y = this.barY + this.style.thickness/2 - this.label.contentHeight/2;
            var x = this.label.padding[3];

            var hOffset: number = x + this.label.contentWidth + this.label.padding[1];

            this.label.move(x, y);
            this.label.draw(surface);
            
            return [hOffset, this.label.contentHeight];
        }

        return [0, 0];
    }

}
