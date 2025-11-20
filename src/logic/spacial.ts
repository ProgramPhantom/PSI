import { Rect, SVG } from "@svgdotjs/svg.js";
import Point, { ID, IPoint } from "./point";

console.log(`[ModuleLoad] Spacial`);

export interface Bounds {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export type Orientation = "top" | "bottom" | "both";

export interface Size {
	width: number;
	height: number;
}

export type PointBind = Record<Dimensions, IBindingPayload>;

export interface IMountConfig {
	index: number | null;
	channelID: ID | null;
	sequenceID: ID | null;

	orientation: Orientation;
	alignment: Record<Dimensions, SiteNames>;
	noSections: number;
}


export interface IGridChildConfig {
	coords?: {row: number, col: number}
	alignment?: Record<Dimensions, SiteNames>
	gridSize?: {noRows: number, noCols: number}
	contribution?: Record<Dimensions, boolean>
}

export type PlacementConfiguration = {type: "free"} | 
									 {type: "pulse"; config: IMountConfig} | 
									 {type: "binds"; bindings: undefined} | 
									 {type: "grid"; gridConfig: IGridChildConfig} |
									 {type: "managed"}

export type SizeConfiguration = {x: SizeMethod, y: SizeMethod}


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

	placementMode?: PlacementConfiguration
	sizeMode?: SizeConfiguration
}

export type UpdateNotification = (...args: any[]) => any;

export default class Spacial extends Point implements ISpacial, IHaveSize {
	get state(): ISpacial {
		return {
			contentWidth: this._contentWidth,
			contentHeight: this._contentHeight,
			placementMode: this.placementMode,
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

	public placementMode: PlacementConfiguration;
	public sizeMode: SizeConfiguration;

	bindings: IBinding[] = []; // Investigate (enforce is called from point before bindings=[] is initialised in spacial)
	bindingsToThis: IBinding[] = [];

	constructor(
		x?: number,
		y?: number,
		width?: number,
		height?: number,
		placementMode?: PlacementConfiguration,
		sizeMode?: SizeConfiguration,
		ref: string = "spacial",
		id: ID | undefined = undefined
	) {
		super(x, y, ref, id);

		this.placementMode = placementMode ?? {type: "free"}
		this.sizeMode = sizeMode ?? {x: "fixed", y: "fixed"}

		this.contentWidth = width ?? 0;
		this.contentHeight = height ?? 0;
	}

	public computeSize(): Size {
		// this.width = this.contentHeight;
		// this.height = this.contentHeight;

		return {width: this.width, height: this.height}
	}

	public computePositions(root: {x: number, y: number}) {
		this.x = root.x;
		this.y = root.y;

		return
	}

	public growElement(containerSize: Size) {


		if (this.sizeMode.x === "grow") {
			this.width = containerSize.width;
		}
		if (this.sizeMode.y === "grow") {
			this.height = containerSize.height;
		}
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
	}

	set contentSize(b: Size) {
		this._contentWidth = b.width;
		this._contentHeight = b.height;
	}
	get contentSize(): Size {
		return {width: this.contentWidth, height: this.contentWidth};
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

	get size(): Size {
		return {width: this.width, height: this.height}
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

				if (b.targetObject) {
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


			// Only go into the setter if it will change a value, massively reduces function calls.
			// Alternative was doing the check inside the setter which still works but requires a function call
			if (anchorBindCoord !== currentTargetPointPosition) {
				// Use the correct setter on the target with this value

				setter(dimension, anchorBindCoord!); // SETTER MAY NEED INTERNAL BINDING FLAG?
			}
		}
	}

	public immediateBind(		
		target: Spacial,
		dimension: Dimensions,
		anchorBindSide: keyof typeof this.AnchorFunctions,
		targetBindSide: keyof typeof this.AnchorFunctions,
		bindToContent: boolean = true) {
		
		var getter: BinderGetFunction =
			this.AnchorFunctions[anchorBindSide].get;
		var setter: BinderSetFunction =
			target.AnchorFunctions[targetBindSide].set;
		
		var anchorValue: number = getter(dimension, bindToContent);

		setter(dimension, anchorValue);
	}

	public internalImmediateBind(
		target: Spacial,
		dimension: Dimensions,
		alignment: keyof typeof this.AnchorFunctions,
		bindToContent: boolean = true) {
		
		var getter: BinderGetFunction;
		var setter: BinderSetFunction;

		switch (alignment) {
			case "here":
				getter = this.AnchorFunctions["here"].get;
				setter = target.AnchorFunctions["here"].set;
				break;
			case "centre":
				getter = this.AnchorFunctions["centre"].get;
				setter = target.AnchorFunctions["centre"].set;
				break;
			case "far":
				getter = this.AnchorFunctions["far"].get;
				setter = target.AnchorFunctions["far"].set;
				break;
		}

		var anchorValue: number = getter(dimension, bindToContent);

		setter(dimension, anchorValue);
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
						+ this.contentWidth / 2
					);
				}
				return this.x + this.width / 2;
			case "y":
				if (ofContent) {
					return (
						this.contentY
						+ this.contentHeight / 2
					);
				}
				return this.y + this.height / 2;
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
				this.x2 = v;
				break;
			case "y":
				this.y2 = v;
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
}
