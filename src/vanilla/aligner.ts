import { Svg } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";
import { Alignment } from "./positional";
import Spacial, { Dimensions } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { Visual } from "./visual";
import { SVG } from "@svgdotjs/svg.js";

export interface IAligner extends ICollection {
    axis: Dimensions,
    bindMainAxis: boolean,
    alignment: Alignment,
    minCrossAxis?: number
}



// A collection where all elements are assumed to be in a stack arrangement (either verticall or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends Spacial = Spacial> extends Collection<T> {
    static defaults: {[name: string]: IAligner} = {
        "default": {
            axis: Dimensions.X,
            bindMainAxis: false,
            alignment: Alignment.here,
            minCrossAxis: 0,
            contentWidth: 0,
            contentHeight: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0]
        }
    }

    mainAxis: Dimensions;
    crossAxis: Dimensions;

    bindMainAxis: boolean;
    alignment: Alignment;
    minCrossAxis?: number;

    constructor(params: RecursivePartial<IAligner>, templateName: string="default", refName: string="collection") {
        var fullParams: IAligner = FillObject<IAligner>(params, Aligner.defaults[templateName]);
        super(fullParams, templateName, refName);
        
        this.mainAxis = fullParams.axis;
        this.crossAxis = this.mainAxis === Dimensions.X ? Dimensions.Y : Dimensions.X;

        this.bindMainAxis = fullParams.bindMainAxis;
        this.alignment = fullParams.alignment;
        this.minCrossAxis = fullParams.minCrossAxis;

        // This sets cross axis to minCrossAxis which is the expected value upon initialisation.  
        this.squeezeCrossAxis();

    }

    add(child: T, index?: number, alignItem: Alignment=Alignment.here) {
        // AlignItem takes precidence
        var alignChild: Alignment = alignItem !== Alignment.here ? alignItem : this.alignment;
        const INDEX = index !== undefined ? index : this.children.length;

        if (this.refName === "top aligner") {
            console.log(".")
        }

        // MAIN AXIS COMPUTE
        if (this.bindMainAxis) {
            var preChild: T | undefined = this.children[INDEX - 1];
            var postChild: T | undefined = this.children[INDEX];

            // child here bind
            if (preChild !== undefined) {  // Bind the before child to this child
                preChild.bind(child, this.mainAxis, "far", "here", undefined, `${preChild.refName} ${this.mainAxis}> ${child.refName}`, false);
                preChild.enforceBinding();

            } else { // this is the first element, bind to this
                this.clearBindings(this.mainAxis);

                this.bind(child, this.mainAxis, "here", "here", undefined, `${this.refName} ${this.mainAxis}> ${child.refName}`);
                this.enforceBinding();
            }

            // Child far bound
            if (postChild !== undefined) {
                child.bind(this.children[INDEX], this.mainAxis, "far", "here", undefined, `${this.refName} ${this.mainAxis}> ${child.refName}`, false);
                child.enforceBinding();
            }
        }
        this.children.splice(INDEX, 0, child);
        
        // Resize cross axis
        if (alignChild !== Alignment.none) {  // Optimisation AND is required
            var crossAxisSizeChild = child.getSizeByDimension(this.crossAxis);
            var crossAxisSize = this.getSizeByDimension(this.crossAxis);  

            if (crossAxisSizeChild > crossAxisSize) {
                this.setSizeByDimension(child.getSizeByDimension(this.crossAxis), this.crossAxis);
            } else {
                // If this addition is a modification of the positional with max crossAxis size, crossAxis size will need decreasing:
                // Aligner Special:
                // Size of cross axis should be max cross axis of all elements:
                this.squeezeCrossAxis();
            }
        }

        switch (alignChild) {
            case Alignment.none:
                break;
            case Alignment.here:
                this.bind(child, this.crossAxis, "here", "here", undefined, `${this.refName} ${this.crossAxis}> ${child.refName}`);
                break;
            case Alignment.centre:
                this.bind(child, this.crossAxis, "centre", "centre", undefined, `${this.refName} ${this.crossAxis}> ${child.refName}`);
                break;
            case Alignment.far:
                this.bind(child, this.crossAxis, "far", "far", undefined, `${this.refName} ${this.crossAxis}> ${child.refName}`);
                break;
        }
        this.enforceBinding();
        
        // Child will tell this to update size when it changes size or position
        child.subscribe(this.computeBoundry.bind(this));
        this.computeBoundry();
    }

    removeAt(index: number) {
        var target: T = this.children[index];


        if (this.bindMainAxis) {
            var preChild: T | undefined = this.children[index - 1];
            var postChild: T | undefined = this.children[index + 1];

            if (preChild !== undefined) {
                // Remove binding to target
                preChild.removeBind(target);

                if (postChild) {
                    preChild.bind(postChild, this.mainAxis, "far", "here", undefined, `${preChild.refName} ${this.mainAxis}> ${postChild.refName}`, false);
                }
            } else {
                // This element is bound to the inside of the aligner object
                // Remove this binding to target:
                this.removeBind(target);

                if (postChild) {  // Rebind next element to this
                    this.bind(postChild, this.mainAxis, "here", "here", undefined, `${this.refName} ${this.mainAxis}> ${postChild.refName}`);
                }
            }
        }

        this.squeezeCrossAxis();

        this.remove(target);
    }

    remove(child: T) {
        this.children.forEach((c, i) => {
            if (c === child) {
                this.children.splice(i, 1);

                if (c instanceof Visual) {
                    c.erase();
                }
                
                this.removeBind(child);
            }
        })

        this.squeezeCrossAxis();

        this.computeBoundry();
        this.enforceBinding();
    }

    squeezeCrossAxis(): void {
        var crossAxisSize = this.minCrossAxis !== undefined ? this.minCrossAxis : 0;

        // Non aligned elements would break the following code,
        // Currently, an element can only be non-aligned if the aligner is non-aligned.
        if (this.alignment === Alignment.none) {
            return 
        }


        this.children.forEach((c) => {
            var childCrossAxisSize = c.getSizeByDimension(this.crossAxis);
            if (childCrossAxisSize > crossAxisSize) {
                crossAxisSize = childCrossAxisSize
            }
        })

        this.setSizeByDimension(crossAxisSize, this.crossAxis)
    }

    computeBoundry(): void {

        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;

        if (this.refName == "sequence") {
            console.log()
        }

        this.children.forEach((c) => {
            if (c.definedVertically) {
                top = c.y < top ? c.y : top;
                bottom = c.getFar(Dimensions.Y) > bottom ? c.getFar(Dimensions.Y) : bottom;
            }
            
            if (c.definedHorizontally) {
                left = c.x < left ? c.x : left;
                right = c.getFar(Dimensions.X) > right ? c.getFar(Dimensions.X) : right;
            }
        })

        // Include current location in boundary.
        // This fixes a problem for the positional columns where the correct size of the boundary would be computed
        // as if the collection was positioned at the top left element, but would not actually be in the correct location.
        if (this.definedVertically && this.contentY < top) {
            top = this.contentY
        }
        if (this.definedHorizontally &&  this.contentX < left) {
            left = this.contentX;
        }



        var bounds = {top: top, right: right, bottom: bottom, left: left}
        var width = right - left;
        var height = bottom - top;
        
        // Inflate cross axis
        if (this.minCrossAxis !== undefined) {
            var currCrossAxis = this.crossAxis === Dimensions.X ? width : height;
            
            if (currCrossAxis < this.minCrossAxis) {
                if (this.crossAxis === Dimensions.X) {
                    width = this.minCrossAxis
                } else {
                    height = this.minCrossAxis
                }
            }
        }

        if (width !== -Infinity) {
            this.contentWidth = width;
        } else {
            this.contentWidth = 0;
        }
        if (height !== -Infinity) {
            this.contentHeight = height;
        } else {
            this.contentHeight = 0;
        }

        this.childBounds = {
            top: top,
            bottom: bottom,
            left: left,
            right: right
        }
    }
}