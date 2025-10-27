import {Element, G, Rect, SVG} from "@svgdotjs/svg.js";
import logger, {Operations, Processes} from "./log";
import Point, {ID} from "./point";
import {CreateChild, FillObject, posPrecision, RecursivePartial} from "./util";
import {IDraw, IVisual, Visual, doesDraw} from "./visual";
import Spacial, {BinderGetFunction, BinderSetFunction, Dimension} from "./spacial";

export function HasComponents<T extends Record<string, Spacial | Spacial[]>>(
	obj: any
): obj is IHaveComponents<T> {
	return (obj as any).components !== undefined;
}

export interface IHaveComponents<C extends Record<string, Spacial | Spacial[]>> {
	components: C;
}

export interface ICollection extends IVisual {
	userChildren: IVisual[];
}

export default class Collection<T extends Visual = Visual> extends Visual implements IDraw {
	static defaults: {[name: string]: ICollection} = {
		default: {
			contentWidth: 0,
			contentHeight: 0,
			x: undefined,
			y: undefined,
			offset: [0, 0],
			padding: [0, 0, 0, 0],
			ref: "default-collection",
			userChildren: []
		}
	};
	get state(): ICollection {
		return {
			userChildren: this.userChildren.map((c) => c.state),
			...super.state
		};
	}

	_parentElement?: T;
	children: T[] = [];

	get userChildren(): T[] {
		var freeChildren: T[] = [];
		var arrayStructure: Point[][] = [];
		if (HasComponents(this)) {
			arrayStructure = Object.values(this.components).filter((s) => Array.isArray(s));
		}

		for (var child of this.children) {
			var adding: boolean = true;

			if (HasComponents(this)) {
				var structureObjIndex = Object.values(this.components).indexOf(child);
				if (structureObjIndex !== -1) {
					adding = false;
				} else {
					// search array structure
					for (var arrStruct of arrayStructure) {
						if (arrStruct.includes(child)) {
							adding = false;
						}
					}
				}
			}

			if (adding) {
				freeChildren.push(child);
			}
		}
		return freeChildren;
	}
	get componentChildren(): T[] {
		var allComponentChildren: T[] = [];
		if (HasComponents(this)) {
			for (var child of Object.values(this.components)) {
				if (Array.isArray(child)) {
					allComponentChildren.push(...(child as T[]));
				} else {
					allComponentChildren.push(child as T);
				}
			}
		}

		return allComponentChildren;
	}

	constructor(
		params: RecursivePartial<ICollection>,
		templateName: string = Collection.defaults["default"].ref
	) {
		var fullParams: ICollection = FillObject<ICollection>(
			params,
			Collection.defaults[templateName]
		);
		super(fullParams);

		fullParams.userChildren.forEach((c) => {
			if (c.type === undefined) {
				console.warn(`Cannot instantiate parameter child ${c.ref} as it has no type`);
				return;
			}
			if (!this.has(c.id)) {
				var child: T = CreateChild(c, c.type) as T;
				this.add(child);
			}
		});
	}

	draw(surface: Element) {
		if (this.svg) {
			this.svg.remove();
		}

		var group = new G().id(this.id).attr({title: this.ref});
		group.attr({
			transform: `translate(${this.offset[0]}, ${this.offset[1]})`
		});

		// Add component children to group
		this.componentChildren.forEach((c) => {
			if (doesDraw(c)) {
				c.draw(group);
			}
		});
		// group.move(this.x, this.y).size(this.width, this.height)
		this.svg = group;

		this.svg.attr({
			"data-position": this.positionMethod,
			"data-ownership": this.ownershipType
		});

		surface.add(this.svg);

		this.userChildren.forEach((uc) => {
			if (doesDraw(uc)) {
				uc.draw(surface);
			}
		});
	}

	public getHitbox(): Rect {
		var collectionHitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({"data-editor": "hitbox", key: this.ref});

		collectionHitbox.size(this.width, this.height);
		collectionHitbox.move(this.x, this.y);
		collectionHitbox.fill(`transparent`).opacity(0.3);

		return collectionHitbox;
	}

	add(child: T, index?: number, bindHere: boolean = false, setParentId: boolean = true) {
		if (setParentId) {
			child.parentId = this.id;
		}
		this.children.splice(index !== undefined ? index : this.children.length - 1, 0, child);

		child.subscribe(this.computeBoundary.bind(this));

		if (bindHere) {
			this.bind(child, "x", "here", "here", undefined);
			this.bind(child, "y", "here", "here", undefined);
		}

		if (this.isResolved) {
			this.enforceBinding(true);
		}

		
		// A final compute
	}

	erase(): void {
		this.children.forEach((c) => {
			if (doesDraw(c)) {
				c.erase();
			}
		});
	}

	remove(child: T) {
		this.children.forEach((c, i) => {
			if (c === child) {
				this.children.splice(i, 1);

				if (c instanceof Visual) {
					c.erase();
				}

				this.clearBindsTo(child);
			}
		});

		this.computeBoundary();
		this.enforceBinding();
	}

	removeAt(index: number) {
		this.children.splice(index, 1);

		this.computeBoundary();
		this.enforceBinding();
	}

	removeAll() {
		this.children.forEach((c) => {
			this.remove(c);
		});
	}

	setParent(element: T) {
		var found = false;
		this.children.forEach((c) => {
			if (c == element) {
				found = true;
			}
		});

		if (!found) {
			throw new Error("Error target parent not found in collection");
		}

		this._parentElement = element;
	}

	computeBoundary(): void {
		logger.processStart(Processes.COMPUTE_BOUNDARY, ``, this);

		// if (this.children.filter((f) => f.displaced === true).length > 0) {
		// 	logger.performance(`ABORT COMPUTE BOUNDARY[${typeof this}]: ${this.ref}`);
		// 	console.groupEnd();
		// 	return;
		// }

		if (this.ref === "sequence") {
			console.log();
		}

		var top = Infinity;
		var left = Infinity;
		var bottom = -Infinity;
		var right = -Infinity;

		this.children.forEach((c) => {
			if (c.definedVertically) {
				top = c.y < top ? c.y : top;

				var far = c.getFar("y");
				bottom = far === undefined ? -Infinity : far > bottom ? far : bottom;
			}

			if (c.definedHorizontally) {
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
		// Don't know why I had that. The dimensions of a collection ARE defined by the children.

		var width = right - left;
		var height = bottom - top;

		if (width !== -Infinity && this.sizeSource.x !== "inherited") {
			this.contentWidth = width;
		} else {
			// this.contentWidth = 0;
		}
		if (height !== -Infinity && this.sizeSource.y !== "inherited") {
			this.contentHeight = height;
		} else {
			// this.contentHeight = 0;
		}

		logger.processEnd(
			Processes.COMPUTE_BOUNDARY,
			`Left: ${left}, Right: ${right}, Top: ${top}, Bottom: ${bottom}`,
			this
		);
	}

	override transform({dx, dy}: {dx?: number, dy?: number}) {
		super.transform({dx, dy})
		
		this.children.forEach((c) => {
			c.transform({dx, dy})
		})
		
		this.notifyChange();
	}

	// Construct and SVG with children positioned relative to (0, 0)
	override getInternalRepresentation(): Element | undefined {
		try {
			var deltaX = -this.contentX;
			var deltaY = -this.contentY;
		} catch (err) {
			var deltaX = 0;
			var deltaY = 0;
		}

		//

		var internalSVG = this.svg?.clone(true, true);
		internalSVG
			?.attr({style: "display: block;"})
			.attr({transform: `translate(${deltaX}, ${deltaY})`});

		return internalSVG;
	}

	get contentWidth(): number | undefined {
		return this._contentWidth;
	}
	get contentHeight(): number | undefined {
		return this._contentHeight;
	}
	protected set contentWidth(v: number) {
		if (v !== this._contentWidth) {
			this._contentWidth = v;
			this.enforceBinding(true);
			this.notifyChange();
		}
	}
	protected set contentHeight(v: number) {
		if (v !== this._contentHeight) {
			this._contentHeight = v;
			this.enforceBinding(true);
			this.notifyChange();
		}
	}

	get x(): number {
		if (this._x !== undefined) {
			return this._x;
		}
		throw new Error("x unset");
	}
	get y(): number {
		if (this._y !== undefined) {
			return this._y;
		}
		throw new Error("y unset");
	}
	override set x(val: number | undefined) {
		if (val !== this._x) {
			var diff: number = val - this._x;
			if (!(Number.isNaN(diff) || diff === undefined)) {
				this.transform({dx: diff})
			}

			this._x = val !== undefined ? posPrecision(val) : undefined;
			this.enforceBinding();
			this.notifyChange();
		}
	}
	override set y(val: number | undefined) {
		if (val !== this._y) {
			var diff: number = val - this._y;
			if (!(Number.isNaN(diff) || diff === undefined)) {
				this.transform({dy: diff})
			}
			
			this._y = val !== undefined ? posPrecision(val) : undefined;
			this.enforceBinding();
			this.notifyChange();
		}
	}

	get dirty(): boolean {
		var isDirty = false;
		this.children.forEach((c) => {
			if (c instanceof Visual && (c as Visual).dirty) {
				isDirty = true;
			}
		});

		return isDirty;
	}
	set dirty(v: boolean) {
		this.children?.forEach((c) => {
			if (c instanceof Visual) {
				(c as Visual).dirty = v;
			}
		});
	}

	override get hasDimensions(): boolean {
		if (this._contentWidth !== undefined && this._contentHeight !== undefined) {
			return true;
		}
		return false;
	}

	override get allElements(): Record<ID, Visual> {
		var elements: Record<ID, Visual> = {[this.id]: this};

		this.children.forEach((c) => {
			if (c instanceof Visual) {
				elements = {...elements, ...c.allElements};
			}
		});
		return elements;
	}

	public has(id: ID): boolean {
		return this.children.filter((c) => c.id === id).length > 0;
	}

	public markComponent(child: T) {
		if (HasComponents(this)) {
			child.ownershipType = "component";
		} else {
			console.warn(
				`Trying to mark child ${child.ref} as component on non-component owning parent`
			);
		}
	}

	public override enforceBinding(configureChildren: boolean=false) {
		this.bindings
			.map((b) => b.targetObject)
			.forEach((e) => {
				e.displaced = true;
			});

		// Collections only need to enforce bindings on non-children
		// Children are moved relatively when a new position of a collection is set.
		

		for (const binding of this.bindings) {
			var resolution = binding.targetObject.isResolvedInDimension(binding.bindingRule.dimension) === true;
			var inclusion = this.has(binding.targetObject.id)
			if (inclusion && resolution && !configureChildren) {
				console.log(`Skipping element ${binding.targetObject.ref} because it is not resolved and it is a child`)
				continue
			}

			var targetElement: Spacial = binding.targetObject;
			var getter: BinderGetFunction =
				this.AnchorFunctions[
					binding.bindingRule.anchorSiteName as keyof typeof this.AnchorFunctions
				].get;
			var setter: BinderSetFunction =
				targetElement.AnchorFunctions[
					binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions
				].set;
			var targetPosChecker: BinderGetFunction =
				targetElement.AnchorFunctions[
					binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions
				].get;
			var dimension: Dimension = binding.bindingRule.dimension;

			// get the X coord of the location on the anchor
			var anchorBindCoord: number | undefined = getter(dimension, binding.bindToContent);

			if (anchorBindCoord === undefined) {
				continue;
			}

			// Apply offset:
			anchorBindCoord = anchorBindCoord + (binding.offset ?? 0);

			// Current position of target:
			var currentTargetPointPosition: number | undefined = targetPosChecker(
				dimension,
				binding.bindToContent
			);

			// This must happen BEFORE the element is positioned so the last element moved in the collection
			// triggers the compute boundary
			targetElement.displaced = false;

			// Only go into the setter if it will change a value, massively reduces function calls.
			// Alternative was doing the check inside the setter which still works but requires a function call
			if (anchorBindCoord !== currentTargetPointPosition) {
				// Use the correct setter on the target with this value
				logger.operation(
					Operations.BIND,
					`(${this.ref})[${anchorBindCoord}, ${binding.bindingRule.anchorSiteName}] ${dimension}> (${targetElement.ref})[${currentTargetPointPosition}, ${binding.bindingRule.targetSiteName}]`,
					this
				);

				setter(dimension, anchorBindCoord!); // SETTER MAY NEED INTERNAL BINDING FLAG?
			}
		}
	}
}
