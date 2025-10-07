import Collection, {ICollection} from "./collection";
import logger, {Processes} from "./log";
import {Alignment} from "./mountable";
import Spacial, {Dimensions} from "./spacial";
import {FillObject, RecursivePartial} from "./util";
import {Visual} from "./visual";

export interface IAligner extends ICollection {
	axis: Dimensions;
	bindMainAxis: boolean;
	alignment: Alignment;
	minCrossAxis?: number;
}

// A collection where all elements are assumed to be in a stack arrangement (either vertically or horizontally)
// Useful for getting the max width/height of multiple elements
export default class Aligner<T extends Visual = Visual> extends Collection<T> {
	static defaults: {[name: string]: IAligner} = {
		default: {
			axis: "x",
			bindMainAxis: false,
			alignment: "here",
			minCrossAxis: 0,
			contentWidth: 0,
			contentHeight: 0,
			x: undefined,
			y: undefined,
			offset: [0, 0],
			padding: [0, 0, 0, 0],
			ref: "default-aligner",
			userChildren: []
		}
	};

	mainAxis: Dimensions;
	crossAxis: Dimensions;

	bindMainAxis: boolean;
	alignment: Alignment;
	minCrossAxis?: number;

	constructor(params: RecursivePartial<IAligner>, templateName: string = "default") {
		var fullParams: IAligner = FillObject<IAligner>(params, Aligner.defaults[templateName]);
		super(fullParams, templateName);

		this.mainAxis = fullParams.axis;
		this.crossAxis = this.mainAxis === "x" ? "y" : "x";

		this.bindMainAxis = fullParams.bindMainAxis;
		this.alignment = fullParams.alignment;
		this.minCrossAxis = fullParams.minCrossAxis;

		// This sets cross axis to minCrossAxis which is the expected value upon initialisation.
		this.squeezeCrossAxis();
	}

	add(
		child: T,
		index?: number,
		bindHere: boolean = false,
		setParentId: boolean = true,
		alignItem: Alignment = "none"
	) {
		if (setParentId) {
			child.parentId = this.id;
		}
		// AlignItem takes precedence
		var alignChild: Alignment = alignItem !== "none" ? alignItem : this.alignment;
		const INDEX = index !== undefined ? index : this.children.length;

		// MAIN AXIS COMPUTE
		if (this.bindMainAxis) {
			var leftChild: T | undefined = this.children[INDEX - 1];
			var rightChild: T | undefined = this.children[INDEX];

			// child here bind
			if (leftChild !== undefined) {
				// Bind the before child to this child
				if (rightChild !== undefined) {
					// Release bind to post child if necessary
					leftChild.clearBindsTo(rightChild);
				}

				leftChild.bind(child, this.mainAxis, "far", "here", undefined, undefined, false);
				leftChild.enforceBinding(); // Needed for some reason
			} else {
				// this is the first element, bind to this
				if (rightChild !== undefined) {
					this.clearBindsTo(rightChild, "x");
				}

				this.bind(child, this.mainAxis, "here", "here", undefined);
				this.enforceBinding();
			}

			// Child far bound
			if (rightChild !== undefined) {
				child.bind(
					this.children[INDEX],
					this.mainAxis,
					"far",
					"here",
					undefined,
					undefined,
					false
				);
				child.enforceBinding();
			}
		}
		this.children.splice(INDEX, 0, child);

		// Cross axis
		switch (alignChild) {
			case "none":
				break;
			case "here":
				this.bind(child, this.crossAxis, "here", "here", undefined);
				break;
			case "centre":
				this.bind(child, this.crossAxis, "centre", "centre", undefined);
				break;
			case "far":
				this.bind(child, this.crossAxis, "far", "far", undefined);
				break;
			case "stretch":
				// child.sizeSource[this.crossAxis] = "inherited";
				this.bind(child, this.crossAxis, "here", "here", undefined);
				this.bind(child, this.crossAxis, "far", "far", undefined);
				break;
			default:
				throw new Error(`Unknown element alignment '${alignChild}'`);
		}

		// Resize cross axis
		//if (alignChild !== Alignment.none) {  // Optimisation AND is required
		//    var crossAxisSizeChild = child.getSizeByDimension(this.crossAxis);
		//    var crossAxisSize = this.getSizeByDimension(this.crossAxis);
		//
		//    if (crossAxisSizeChild > crossAxisSize) {
		//        this.setSizeByDimension(child.getSizeByDimension(this.crossAxis), this.crossAxis);
		//    } else {
		//        // If this addition is a modification of the positional with max crossAxis size, crossAxis size will need decreasing:
		//        // Aligner Special:
		//        // Size of cross axis should be max cross axis of all elements:
		//
		//    }
		//}
		//this.squeezeCrossAxis();

		this.enforceBinding();

		// Child will tell this to update size when it changes size or position
		child.subscribe(this.computeBoundary.bind(this));
		this.computeBoundary();
	}

	removeAt(index: number, quantity: number = 1): number {
		var targets: (T | undefined)[] = this.children.slice(index, index + quantity);

		if (targets.some((t) => (t = undefined))) {
			throw new Error(`No child element exists at index ${index}`);
		}

		var numRemoved: number = 0;
		targets.forEach((target) => {
			if (target !== undefined) {
				this.remove(target);
				numRemoved += 1;
			}
		});
		return numRemoved;
	}

	remove(target: T): boolean {
		var index: number | -1 = this.children.indexOf(target);

		if (index === -1) {
			throw new Error(`Failed to remove child ${target.ref} from aligner ${this.ref}`);
			return false;
		}

		// Update bindingsT
		if (this.bindMainAxis) {
			var preChild: T | undefined = this.children[index - 1];
			var postChild: T | undefined = this.children[index + 1];

			if (preChild !== undefined) {
				// Remove binding to target
				preChild.clearBindsTo(target);

				if (postChild) {
					preChild.bind(
						postChild,
						this.mainAxis,
						"far",
						"here",
						undefined,
						undefined,
						false
					);
				}
				preChild.enforceBinding();
			} else {
				// This element is bound to the inside of the aligner object
				// Remove this binding to target:
				this.clearBindsTo(target);

				if (postChild) {
					// Rebind next element to this
					this.bind(postChild, this.mainAxis, "here", "here");
				}
			}
		}

		// Remove child and clear visual
		this.children.forEach((c, i) => {
			if (c === target) {
				this.children.splice(i, 1);

				if (c instanceof Visual) {
					c.erase();
				}

				this.clearBindsTo(target);
			}
		});

		this.computeBoundary();
		this.enforceBinding();

		this.squeezeCrossAxis();
		return true;
	}

	squeezeCrossAxis(): void {
		var crossAxisSize = this.minCrossAxis !== undefined ? this.minCrossAxis : 0;

		// Non aligned elements would break the following code,
		// Currently, an element can only be non-aligned if the aligner is non-aligned.
		if (this.alignment === "none") {
			return;
		}

		this.children.forEach((c) => {
			var childCrossAxisSize = c.getSizeByDimension(this.crossAxis);
			if (childCrossAxisSize > crossAxisSize) {
				crossAxisSize = childCrossAxisSize;
			}
		});

		this.setSizeByDimension(crossAxisSize, this.crossAxis);
	}

	computeBoundary(): void {
		logger.processStart(Processes.COMPUTE_BOUNDARY, ``, this);

		var displacedElements = this.children.filter((f) => f.displaced === true);
		if (displacedElements.length > 0) {
			logger.performance(
				`ABORT COMPUTE BOUNDRY ${this.ref} as ${displacedElements} have not been positioned`
			);
			return;
		}

		var top = Infinity;
		var left = Infinity;
		var bottom = -Infinity;
		var right = -Infinity;

		if (this.ref == "sequence") {
		}

		this.children.forEach((c) => {
			if (c.definedVertically && c.sizeSource.y === "given") {
				top = c.y < top ? c.y : top;

				var far = c.getFar("y");
				bottom = far === undefined ? -Infinity : far > bottom ? far : bottom;
			}

			if (c.definedHorizontally && c.sizeSource.x === "given") {
				left = c.x < left ? c.x : left;

				var farX = c.getFar("x");
				right = farX === undefined ? -Infinity : farX > right ? farX : right;
			}
		});

		// Include current location in boundary.
		// This fixes a problem for the positional columns where the correct size of the boundary would be computed
		// as if the collection was positioned at the top left element, but would not actually be in the correct location.
		// if (this.definedVertically && this.contentY < top) {
		//     top = this.contentY
		// }
		// if (this.definedHorizontally &&  this.contentX < left) {
		//     left = this.contentX;
		// }

		var bounds = {top: top, right: right, bottom: bottom, left: left};
		var width = right - left;
		var height = bottom - top;

		// Inflate cross axis
		if (this.minCrossAxis !== undefined) {
			var currCrossAxis = this.crossAxis === "x" ? width : height;

			if (currCrossAxis < this.minCrossAxis) {
				if (this.crossAxis === "x") {
					width = this.minCrossAxis;
				} else {
					height = this.minCrossAxis;
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
		logger.processEnd(
			Processes.COMPUTE_BOUNDARY,
			`Left: ${left}, Right: ${right}, Top: ${top}, Bottom: ${bottom}`,
			this
		);
	}
}
