import { Element, G, Rect, SVG } from "@svgdotjs/svg.js";
import { ID } from "./point";
import { ContainerSizeMethod, Dimensions, Size } from "./spacial";
import Visual, { IDraw, IVisual, doesDraw } from "./visual";


export interface ICollection<C extends IVisual = IVisual> extends IVisual {
	children: C[];

	sizeMode?: Record<Dimensions, ContainerSizeMethod>
}

export type RolesDict = Record<string, { object: Visual | undefined, initialiser?: (object: Visual) => void }>;

export default class Collection<C extends Visual = Visual> extends Visual implements IDraw, ICollection<C> {
	static isCollection(v: IVisual): v is Collection {
		return (v as any).children !== undefined;
	}

	get state(): ICollection {
		return {
			children: this.children.map((c) => c.state),
			
			...super.state,
			sizeMode: this.sizeMode
		};
	}
	override get allElements(): Record<ID, Visual> {
		var elements: Record<ID, Visual> = { [this.id]: this };

		this.children.forEach((c) => {
			let childElements = c.allElements;
			elements = { ...elements, ...childElements };
		});
		return elements;
	}

	protected _children: C[] = [];
	get children(): C[] {
		return this._children;
	};

	public roles: RolesDict = {};

	declare public sizeMode: Record<Dimensions, ContainerSizeMethod>;

	constructor(
		params: ICollection,
	) {
		super(params);

		// params.children.forEach((c) => {
		// 	if (c.type === undefined) {
		// 		console.warn(`Cannot instantiate parameter child ${c.ref} as it has no type`);
		// 		return;
		// 	}
		// 	if (!this.has(c.id)) {
		// 		var child: T = Collection.CreateChild(c, c.type) as T;
		// 		this.add(child);
		// 	}
		// });
	}


	// ---------------- Compute -------------------------
	//#region 
	public computeSize(): Size {
		var size: Size = { width: 0, height: 0 }

		var top = Infinity;
		var left = Infinity;
		var bottom = -Infinity;
		var right = -Infinity;

		this.children.forEach((c) => {
			c.computeSize();

			top = c.y < top ? c.y : top;
			var far = c.getFar("y");
			bottom = far > bottom ? far : bottom;


			left = c.x < left ? c.x : left;
			var farX = c.getFar("x");
			right = farX > right ? farX : right;
		});

		size.width = right - left;
		size.height = bottom - top;

		this.contentWidth = size.width;
		this.contentHeight = size.height;

		return { width: this.width, height: this.height }
	}

	public computePositions(root: { x: number; y: number; }): void {
		this.x = root.x;
		this.y = root.y;

		this.children.forEach((c) => {
			c.computePositions({ x: this.cx, y: this.cy })
		})

		if (this.placementMode.type === "free") {
			let topLeft: { x: number, y: number } = this.getTopLeft();

			if (topLeft.x < this.x) {
				this.cx = topLeft.x;
			}

			if (topLeft.y < this.y) {
				this.cy = topLeft.y;
			}
		}
	}

	public override growElement(containerSize: Size): Record<Dimensions, number> {
		let sizeDiff = super.growElement(containerSize)

		// TODO:
		this.children.forEach((child) => {
			if (child.placementMode.type === "free") {
				child.growElement(this.size);
			}
		})

		return sizeDiff;
	}
	//#endregion
	// --------------------------------------------------


	// ----------------- Visual methods -----------------
	//#region 
	draw(surface: Element) {
		if (this.svg) {
			this.svg.remove();
		}

		var group = new G().id(this.id).attr({ title: this.ref });
		group.attr({
			transform: `translate(${this.offset[0]}, ${this.offset[1]})`
		});

		this.svg = group;

		surface.add(this.svg);

		this.children.forEach((uc) => {
			if (doesDraw(uc)) {
				uc.draw(this.svg!);
			}
		});

		super.draw(surface)
	}

	public getHitbox(): Rect {
		var collectionHitbox = new Rect()
			.id(this.id + "-hitbox")
			.attr({ "data-editor": "hitbox", key: this.ref });

		collectionHitbox.size(this.width, this.height);
		collectionHitbox.move(this.x, this.y);
		collectionHitbox.fill(`transparent`).opacity(0.3);

		return collectionHitbox;
	}

	// Construct and SVG with children positioned relative to (0, 0)
	override getInternalRepresentation(): Element | undefined {
		var deltaX = -this.cx;
		var deltaY = -this.cy;

		if (this.svg === undefined) {
			this.computeSelf();
			let temporaryCanvas: Element = SVG();
			this.draw(temporaryCanvas);
		}

		var internalSVG = this.svg?.clone(true, true);
		internalSVG
			?.attr({ style: "display: block;" })
			.attr({ transform: `translate(${deltaX}, ${deltaY})` });

		return internalSVG;
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
	//#endregion
	// --------------------------------------------------


	// ----------------- Collection methods -------------
	//#region 
	add(child: C, index?: number) {
		child.parentId = this.id;

		this.children.splice(index ?? this.numChildren, 0, child);

		if (child.role !== undefined && Object.keys(this.roles).includes(child.role ?? "") && this.roles[child.role].object === undefined) {
			this.roles[child.role].object = child;

			if (this.roles[child.role].initialiser !== undefined) {
				this.roles[child.role].initialiser!(child);
			}
		}
	}

	erase(): void {
		this.children.forEach((c) => {
			if (doesDraw(c)) {
				c.erase();
			}
		});
	}

	remove(child: C) {
		var index: number | undefined = this.childIndex(child);

		if (index === undefined) {
			console.warn(`Cannot find child to remove ${child.ref} in ${this.ref}`)
			return
		}

		this.removeAt(index);
	}

	removeAt(index: number) {
		this.children.splice(index, 1);
	}

	removeAll() {
		this.children.forEach((c) => {
			this.remove(c);
		});
	}
	//#endregion
	// --------------------------------------------------


	// ----------------- Collection helpers -------------
	//#region 
	public has(id: ID): boolean {
		return this.children.filter((c) => c.id === id).length > 0;
	}

	public childIndex(target: C): number | undefined {
		var index: number | undefined;

		this.children.forEach((c, i) => {
			if (c.id === target.id) {
				index = i
			}
		})

		return index;
	}

	public childIndexById(id: ID): number | undefined {
		return this.children.findIndex((c) => c.id === id);
	}

	public getChildById(id: ID): C | undefined {
		return this.children.find((c) => c.id === id);
	}

	public getTopLeft(): { x: number, y: number } {
		let top: number = Infinity
		let left: number = Infinity

		this.children.forEach((c) => {
			if (c.y < top) {
				top = c.y
			}
			if (c.x < left) {
				left = c.x
			}
		})

		return { x: left, y: top }
	}

	public get numChildren(): number {
		return this.children.length;
	}
	//#endregion
	// --------------------------------------------------
}