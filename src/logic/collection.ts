import {Element, G, Rect, SVG} from "@svgdotjs/svg.js";
import logger, {Processes} from "./log";
import Point, {ID} from "./point";
import {CreateChild, FillObject, RecursivePartial} from "./util";
import {IDraw, IVisual, Visual, doesDraw} from "./visual";
import Spacial, { Size } from "./spacial";

export function HasComponents<T extends Record<string, Spacial | Spacial[]>>(
	obj: any
): obj is IHaveComponents<T> {
	return (obj as any).components !== undefined;
}

export interface IHaveComponents<C extends Record<string, Spacial | Spacial[]>> {
	components: C;
}

export interface ICollection extends IVisual {
	children: IVisual[];
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
			selfAlignment:  {x: "here", y: "here"},
			sizeMode: {x: "fixed", y: "fixed"},
			children: []
		}
	};
	get state(): ICollection {
		return {
			children: this.children.map((c) => c.state),
			...super.state
		};
	}

	children: T[] = [];

	constructor(
		params: RecursivePartial<ICollection>,
		templateName: string = Collection.defaults["default"].ref
	) {
		var fullParams: ICollection = FillObject<ICollection>(
			params,
			Collection.defaults[templateName]
		);
		super(fullParams);

		fullParams.children.forEach((c) => {
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

		this.svg = group;


		surface.add(this.svg);

		this.children.forEach((uc) => {
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

	add(child: T) {
		child.parentId = this.id;

		this.children.push(child);
	}

	erase(): void {
		this.children.forEach((c) => {
			if (doesDraw(c)) {
				c.erase();
			}
		});
	}

	remove(child: T) {
		var index: number | undefined = this.locateChild(child);

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


	computeSize(): Size {
		var size: Size = {width: 0, height: 0}

		var top = Infinity;
		var left = Infinity;
		var bottom = -Infinity;
		var right = -Infinity;

		this.children.forEach((c) => {
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

		return {width: this.width, height: this.height}
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

	private locateChild(target: T): number | undefined {
		var index: number | undefined;

		this.children.forEach((c, i) => {
			if (c.id === target.id) {
				index = i
			}
		})

		return index;
	}
}
