import Collection, { ICollection } from "./collection";
import { Alignment } from "./positional";
import Spacial, { Dimensions } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { Visual } from "./visual";

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
            alignment: Alignment.none,
            width: 0,
            height: 0,
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

    add(child: T, index?: number, alignItem: Alignment=Alignment.none) {
        // AlignItem takes precidence
        var alignChild: Alignment = alignItem !== Alignment.none ? alignItem : this.alignment;
        const INDEX = index !== undefined ? index : this.children.length;

        if (this.refName === "pos col collection") {
            console.log(".")
        }

        if (this.bindMainAxis) {
            var preChild: T | undefined = this.children[INDEX - 1];
            var postChild: T | undefined = this.children[INDEX];

            // child here bind
            if (preChild !== undefined) {  // Bind the before child to this child
                preChild.bind(child, this.mainAxis, "far", "here");
                preChild.enforceBinding();

            } else { // this is the first element, bind to this
                this.clearBindings(this.mainAxis);

                this.bind(child, this.mainAxis, "here", "here", undefined, true);
                this.enforceBinding();
            }

            // Child far bound
            if (postChild !== undefined) {
                child.bind(this.children[INDEX], this.mainAxis, "far", "here");
                child.enforceBinding();
            }
        }
        this.children.splice(INDEX, 0, child);
        

        switch (alignChild) {
            case Alignment.none:
                break;
            case Alignment.here:
                this.bind(child, this.crossAxis, "here", "here", undefined, true);
                break;
            case Alignment.centre:
                this.bind(child, this.crossAxis, "centre", "centre");
                break;
            case Alignment.far:
                this.bind(child, this.crossAxis, "far", "far", undefined, true);
                break;
        }
        this.enforceBinding();
        
        // Child will tell this to update size when it changes size or position
        child.subscribe(this.computeSize.bind(this));
        this.computeSize();
        
        
    }

    computeSize(): void {
        var width = 0;
        var height = 0;


        this.children.forEach((c) => {
            if (c.height !== undefined) {
                if (this.bindMainAxis && this.mainAxis === Dimensions.Y) {
                    height += c.height;
                } else if ((this.alignment !== Alignment.none) && (this.crossAxis === Dimensions.Y)) {
                    if (c.height > height) {
                        height = c.height;
                    }
                }
            }
            
            if (c.width !== undefined) {
                if (this.bindMainAxis && (this.mainAxis === Dimensions.X)) {
                    width += c.width;
                } else if ((this.alignment !== Alignment.none) && (this.crossAxis === Dimensions.X)) {
                    if (c.width > width) {
                        width = c.width;
                    }
                }
            }
        })
        // Simply get max width and height


        if (width !== -Infinity) {
            this.contentWidth = width;
        }
        if (height !== -Infinity) {
            this.contentHeight = height;
        }
       
    }
}