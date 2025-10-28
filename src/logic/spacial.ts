import {SVG} from "@svgdotjs/svg.js";
import logger, {Operations} from "./log";
import Point, {ID, IPoint} from "./point";
import {posPrecision} from "./util";
import {Rect} from "@svgdotjs/svg.js";

export interface Bounds {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface Size {
	width: number;
	height: number;
}

export type PositionMethod = "controlled" | "free" | "partially-controlled";
export type SizeMethod = "fixed" | "fit" | "grow";

export type SiteNames = "here" | "centre" | "far";

export type BinderSetFunction = (dimension: Dimensions, v: number) => void;
export type BinderGetFunction = (dimension: Dimensions, onContent?: boolean) => number | undefined;

export interface IBindingRule {
	anchorSiteGetter?: BinderGetFunction;
	targetSiteSetter?: BinderSetFunction;

	anchorSiteName: SiteNames;
	targetSiteName: SiteNames;

	dimension: Dimensions;
}

export interface IBinding {
	bindingRule: IBindingRule;
	targetObject: Spacial;
	anchorObject: Spacial;
	offset?: number;
	bindToContent: boolean;
	hint?: string;
}

export interface IBindingPayload {
	anchorObject: Spacial;
	bindingRule: IBindingRule;
}

export type Dimensions = "x" | "y";

export interface IHaveSize {
	computeSize: () => Size
}

export interface ISpacial extends IPoint {
	contentWidth?: number;
	contentHeight?: number;

	selfAlignment: Record<Dimensions, SiteNames>;
	sizeMode: Record<Dimensions, SizeMethod>;
}

export type UpdateNotification = (...args: any[]) => any;

export default class Spacial extends Point implements ISpacial, IHaveSize {
	static override defaults: {[name: string]: ISpacial} = {
		default: {
			x: undefined,
			y: undefined,
			contentWidth: 0,
			contentHeight: 0,
			selfAlignment:  {x: "here", y: "here"},
			sizeMode: {x: "fixed", y: "fixed"},
			ref: "default-spacial"
		}
	};
	get state(): ISpacial {
		return {
			contentWidth: this._contentWidth,
			contentHeight: this._contentHeight,
			selfAlignment: this.selfAlignment,
			sizeMode: this.sizeMode,
			...super.state
		};
	}
	public AnchorFunctions = {
		here: {
			get: this.getNear.bind(this),
			set: this.setNear.bind(this)
		},
		centre: {
			get: this.getCentre.bind(this),
			set: this.setCentre.bind(this)
		},
		far: {
			get: this.getFar.bind(this),
			set: this.setFar.bind(this)
		}
	};

	protected _contentWidth: number;
	protected _contentHeight: number;

	public selfAlignment: Record<Dimensions, SiteNames>;
	public sizeMode: Record<Dimensions, SizeMethod>;

	override bindings: IBinding[] = [];
	override bindingsToThis: IBinding[] = [];

	constructor(
		x?: number,
		y?: number,
		width?: number,
		height?: number,
		ref: string = "spacial",
		id: ID | undefined = undefined
	) {
		super(x, y, ref, id);

		this.width = width ?? 0;
		this.height = height ?? 0;
	}

	public computeSize(): Size {
		return {width: this.width, height: this.height}
	}

	public getHitbox(): Rect {
		var hitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({"data-editor": "hitbox", key: this.ref});

		hitbox.size(this.width, this.height);
		hitbox.move(this.x, this.y);
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}

	public get contentX(): number {
		return this.x;
	}
	public set contentX(v: number) {
		throw new Error("not implemented");
	}

	public get contentY(): number {
		return this.y;
	}
	public set contentY(v: number) {
		throw new Error("not implemented");
		// this._contentY = v;
	}

	get contentBounds(): Bounds {
		var top = this.contentY;
		var left = this.contentX;

		var bottom = this.contentY + (this.contentHeight ? this.contentHeight : 0);
		var right = this.contentX + (this.contentWidth ? this.contentWidth : 0);

		return {top: top, right: right, bottom: bottom, left: left};
	}

	set contentDim(b: Size) {
		this._contentWidth = b.width;
		this._contentHeight = b.height;
	}
	get contentDim(): Size {
		return {width: this.contentWidth, height: this.contentWidth};

		throw new Error("dimensions unset");
	}

	// ----------- Size --------------
	get contentWidth(): number {
		return this._contentWidth;
	}
	set contentWidth(v: number) {
		this._contentWidth = v;
	}

	get contentHeight(): number {
		return this._contentHeight;
	}
	set contentHeight(v: number) {
		this._contentHeight = v;
	}

	get width(): number {
		return this.contentWidth;
	}
	set width(v: number) {
		this.contentWidth = v;
	}
	get height(): number {
		return this.contentHeight;
	}
	set height(v: number) {
		this.contentHeight = v;
	}


	public clearBindings(dimension: Dimensions) {
		var toRemove: IBinding[] = [];
		for (var bind of this.bindings) {
			if (bind.bindingRule.dimension === dimension) {
				toRemove.push(bind);
				bind.targetObject.bindingsToThis = bind.targetObject.bindingsToThis.filter(
					(b) => b !== bind
				);
			}
		}

		this.bindings = this.bindings.filter((b) => !toRemove.includes(b));
	}

	public clearBindsTo(target: Spacial, dimension?: Dimensions) {
		var toRemove: IBinding[] = [];
		for (var bind of this.bindings) {
			if (
				bind.targetObject === target
				&& (bind.bindingRule.dimension === dimension || dimension === undefined)
			) {
				toRemove.push(bind);
				console.warn(`Removing binding ${bind.hint}`);
			}
		}

		this.bindings = this.bindings.filter((b) => !toRemove.includes(b));
		target.bindingsToThis = target.bindingsToThis.filter((b) => !toRemove.includes(b));
	}

	bind(
		target: Spacial,
		dimension: Dimensions,
		anchorBindSide: keyof typeof this.AnchorFunctions,
		targetBindSide: keyof typeof this.AnchorFunctions,
		offset?: number,
		hint?: string,
		bindToContent: boolean = true
	) {
		if (hint === undefined) {
			hint = `'${this.ref}' [${anchorBindSide}] ${dimension}> '${target.ref}' [${targetBindSide}]`;
		}

		var found = false;
		this.bindings.forEach((b) => {
			if (b.targetObject === target && b.bindingRule.dimension === dimension) {
				found = true;

				if (b.targetObject.sizeMode[dimension] === "fixed") {
					// Not stretchy so this gets overridden
					console.warn(
						`Warning: overriding binding on dimension ${b.bindingRule.dimension} for anchor ${this.ref} to target ${target.ref}`
					);

					b.bindingRule.anchorSiteName = anchorBindSide;
					b.bindingRule.targetSiteName = targetBindSide;
					b.bindingRule.dimension = dimension;
					b.bindToContent = bindToContent;
					b.offset = offset;
				} else {
					// Stretchy === true
					var newBindingRule: IBindingRule = {
						anchorSiteName: anchorBindSide,
						targetSiteName: targetBindSide,
						dimension: dimension
					};
					hint += " (stretch)";

					var newBinding: IBinding = {
						targetObject: target,
						anchorObject: this,
						bindingRule: newBindingRule,
						offset: offset,
						bindToContent: bindToContent,
						hint: hint
					};
					this.bindings.push(newBinding);
					target.bindingsToThis.push(newBinding);
				}
			}
		});

		if (!found) {
			var newBindingRule: IBindingRule = {
				anchorSiteName: anchorBindSide,
				targetSiteName: targetBindSide,
				dimension: dimension
			};

			var newBinding: IBinding = {
				targetObject: target,
				anchorObject: this,
				bindingRule: newBindingRule,
				offset: offset,
				bindToContent: bindToContent,
				hint: hint
			};

			this.bindings.push(newBinding);
			target.bindingsToThis.push(newBinding);
		}
	}

	getCoordinateFromBindRule(binding: IBindingRule): number {
		var getter: BinderGetFunction =
			this.AnchorFunctions[binding.anchorSiteName as keyof typeof this.AnchorFunctions].get;

		return getter(binding.dimension);
	}

	public enforceBinding() {
		this.bindings
			.map((b) => b.targetObject)
			.forEach((e) => {
				e.displaced = true;
			});

		for (const binding of this.bindings) {
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
			var dimension: Dimensions = binding.bindingRule.dimension;

			if (binding.hint === "'acquire' [far] x> 'default-label' [far] (stretch)") {
				console.log();
			}

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

	subscribers: UpdateNotification[] = [];

	subscribe(toRun: UpdateNotification) {
		if (this.ref === "label") {
		}
		this.subscribers.push(toRun);
	}

	notifyChange() {
		this.subscribers?.forEach((s) => {
			logger.broadcast(this, s.name.split(" ")[1]);
			s();
		});
	}

	// Anchors:
	public getNear(dimension: Dimensions, ofContent: boolean = false): number {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return this.contentX;
				}
				return this._x;
			case "y":
				if (ofContent) {
					return this.contentY;
				}
				return this._y;
		}
	}
	public setNear(dimension: Dimensions, v: number) {
		switch (dimension) {
			case "x":
				this.x = v;
				break;
			case "y":
				this.y = v;
				break;
		}
	}

	public getCentre(dimension: Dimensions, ofContent: boolean = false): number | undefined {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return (
						this.contentX
						+ posPrecision(this.contentWidth / 2)
					);
				}
				return this.x + posPrecision(this.width / 2);
			case "y":
				if (ofContent) {
					return (
						this.contentY
						+ posPrecision(this.contentHeight / 2)
					);
				}
				return this.y + posPrecision(this.height / 2);
		}
	}
	public setCentre(dimension: Dimensions, v: number) {
		switch (dimension) {
			case "x":
				this.x = v - this.width / 2;
				break;
			case "y":
				this.y = v - this.height / 2;
				break;
		}
	}

	public getFar(dimension: Dimensions, ofContent: boolean = false): number | undefined {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return this.contentX + this.contentWidth;
				}
				return this.x2;
			case "y":
				if (ofContent) {
					return this.contentY + this.contentHeight
				}
				return this.y2;
		}
	}
	public setFar(dimension: Dimensions, v: number, stretch?: boolean) {
		switch (dimension) {
			case "x":
				if (this.sizeMode.x === "grow" || stretch) {
					var diff: number = v - this.x;
					
					if (diff < 0) {
						throw new Error(`Flipped element ${this.ref}`);
					}

					if (diff === 0) {
						return;
					}

					this.width = diff;
				} else {
					this.x2 = v;
				}
				break;
			case "y":
				if (this.sizeMode.y === "grow" || stretch) {
					var diff: number = v - this.y;
					if (diff < 0) {
						throw new Error(`Flipped element ${this.ref}`);
					}
					if (diff === 0) {
						return;
					}

					this.height = diff;
				} else {
					this.y2 = v;
				}
				break;
		}
	}

	// x2 y2
	public get x2(): number {
		return this.x + this.width;
	}
	public set x2(v: number) {
		this.x = v - this.width;
	}
	public get y2(): number {
		return this.y + this.height;
	}
	public set y2(v: number) {
		this.y = v - this.height;
	}

	// Helpers:
	get hasDimensions(): boolean {
		if (this.contentDim.height === undefined || !this.contentDim.height === undefined) {
			return false;
		} else {
			return true;
		}
	}

	get definedVertically(): boolean {
		if (this._y !== undefined && this.contentHeight !== undefined) {
			return true;
		}
		return false;
	}
	get definedHorizontally(): boolean {
		if (this._x !== undefined && this.contentWidth !== undefined) {
			return true;
		}
		return false;
	}

	get isResolved(): boolean {
		return this.definedHorizontally && this.definedVertically;
	}

	setSizeByDimension(v: number, dim: Dimensions) {
		switch (dim) {
			case "x":
				this.contentWidth = v;
				break;
			case "y":
				this.contentHeight = v;
				break;
		}
	}

	getSizeByDimension(dim: Dimensions): number {
		switch (dim) {
			case "x":
				return this.width;
			case "y":
				return this.height;
		}
	}

	get positionMethod(): PositionMethod {
		var method: PositionMethod = "free";
		if (this.bindingsToThis.length >= 2) {
			method = "controlled";
		} else if ((this.bindingsToThis.length = 1)) {
			method = "partially-controlled";
		}
		return method;
	}
}
