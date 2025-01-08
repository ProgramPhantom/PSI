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
    alignment: Alignment
}



// A collection where all elements are assumed to be in a stack arrangement (either verticall or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends Spacial = Spacial> extends Collection<T> {
    static defaults: {[name: string]: IAligner} = {
        "default": {
            axis: Dimensions.X,
            bindMainAxis: false,
            alignment: Alignment.here,
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

    constructor(params: RecursivePartial<IAligner>, templateName: string="default", refName: string="collection") {
        var fullParams: IAligner = FillObject<IAligner>(params, Aligner.defaults[templateName]);
        super(fullParams, templateName, refName);
        
        this.mainAxis = fullParams.axis;
        this.crossAxis = this.mainAxis === Dimensions.X ? Dimensions.Y : Dimensions.X;

        this.bindMainAxis = fullParams.bindMainAxis;
        this.alignment = fullParams.alignment;
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
        
        // cross AXIS
        if (alignChild !== Alignment.none) {  // Optimisation AND is required
            var crossAxisSizeChild = child.getSizeByDimension(this.crossAxis);
            var crossAxisSize = this.getSizeByDimension(this.crossAxis);  

            if (crossAxisSizeChild > crossAxisSize) {
                this.setSizeByDimension(child.getSizeByDimension(this.crossAxis), this.crossAxis);
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
                    preChild.bind(postChild, this.mainAxis, "far", "here", undefined, false);
                }
            } else {
                // This element is bound to the inside of the aligner object
                // Remove this binding to target:
                this.removeBind(target);

                if (postChild) {  // Rebind next element to this
                    this.bind(postChild, this.mainAxis, "here", "here", undefined, true);
                }
            }
        }

        this.children.splice(index, 1);

        this.computeBoundry();
        this.enforceBinding();
    }
}