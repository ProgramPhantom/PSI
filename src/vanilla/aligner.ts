import Collection, { ICollection } from "./collection";
import Spacial, { Dimensions } from "./spacial";
import { FillObject, RecursivePartial } from "./util";

export interface IAligner extends ICollection {
    dimension: Dimensions,
    bindChildren: boolean,
}

// A collection where all elements are assumed to be in a stack arrangement (either verticall or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends Spacial = Spacial> extends Collection<T> {
    static defaults: {[name: string]: IAligner} = {
        "default": {
            dimension: Dimensions.X,
            bindChildren: false,
            width: 0,
            height: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0]
        }
    }

    dimension: Dimensions;
    bindChildren: boolean;

    constructor(params: RecursivePartial<IAligner>, templateName: string="default", refName: string="collection") {
        var fullParams: IAligner = FillObject<IAligner>(params, Aligner.defaults[templateName]);
        super(fullParams, templateName, refName);
        
        this.dimension = fullParams.dimension;
        this.bindChildren = fullParams.bindChildren;
    }

    add(child: T, index?: number) {
        if (index !== undefined) {
            // --- Binding ---
            if (this.bindChildren) {
                if (this.children[index] !== undefined) {  // Bind the after child
                    child.bind(this.children[index], this.dimension, "far", "here");
                }
    
                if (this.children[index - 1] !== undefined) {  // Bind the before child
                    this.children[index - 1].bind(child, this.dimension, "far", "here");
                }
            }
            // --------------

            this.children.splice(index !== undefined ? index : this.children.length, 0, child)
        } else {
            // Insert at end.
            if (this.children[this.children.length - 1] !== undefined) {  // Bind the before child
                this.children[this.children.length - 1].bind(child, this.dimension, "far", "here");
            }

            this.children.push(child);
        }
        
        // Child will tell this to update size when it changes size or position
        child.subscribe(this.computeSize.bind(this));
        this.computeSize();
    }

    computeSize(): void {
        var width = 0;
        var height = 0;

        this.children.forEach((c) => {
            if (c.height !== undefined) {
                if (this.bindChildren && this.dimension === Dimensions.Y) {
                    height += c.height;
                } else {
                    if (c.height > height) {
                        height = c.height;
                    }
                }
                
            }
            
            if (c.width !== undefined) {
                if (this.bindChildren && this.dimension === Dimensions.X) {
                    width += c.width;
                } else {
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