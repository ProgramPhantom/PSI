import { Rect, SVG } from "@svgdotjs/svg.js";
import Point, { ID, IPoint } from "./point";


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

export interface IPulseConfig {
	index?: number;
	channelID?: ID;
	sequenceID?: ID;

	orientation: Orientation;
	alignment: Record<Dimensions, SiteNames>;
	noSections: number;
	clipBar?: boolean;
}
export const isPulse = (element: ISpacial): element is ISpacial & { pulseData: IPulseConfig } => {
	return element.pulseData !== undefined
}

export interface IGridConfig {
	coords?: { row: number, col: number }
	alignment?: Record<Dimensions, SiteNames>
	gridSize?: { noRows: number, noCols: number }
	contribution?: Record<Dimensions, boolean>,
	ownedGhosts?: { row: number, col: number }[]
}

export interface IAlignerConfig {
	index?: number,
	alignment?: SiteNames,
	contribution?: { mainAxis: boolean, crossAxis: boolean }
}

export type PlacementConfiguration = { type: "free" } |
{ type: "binds"; bindings: undefined } |
{ type: "grid"; config: IGridConfig } |
{ type: "aligner", config: IAlignerConfig }



export type PlacementControl = "auto" | "user";

export type ContainerSizeMethod = "fit" | "grow"
export type SizeMethod = "fixed" | ContainerSizeMethod
export type SizeConfiguration = Record<Dimensions, SizeMethod>


export type SiteNames = "here" | "centre" | "far";

export type BinderSetFunction = (dimension: Dimensions, v: number) => void;
export type BinderGetFunction = (dimension: Dimensions, onContent?: boolean) => number;

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
	placementControl?: PlacementControl
	sizeMode?: SizeConfiguration
	pulseData?: IPulseConfig
}

export type UpdateNotification = (...args: any[]) => any;

export default class Spacial extends Point implements ISpacial, IHaveSize {
	static CreateUnion(...rects: Spacial[]): Spacial {
		var size: Size = { width: 0, height: 0 }
		var top = Infinity;
		var left = Infinity;
		var bottom = -Infinity;
		var right = -Infinity;

		rects.forEach((r) => {
			top = r.y < top ? r.y : top;
			var far = r.getFar("y");
			bottom = far > bottom ? far : bottom;


			left = r.x < left ? r.x : left;
			var farX = r.getFar("x");
			right = farX > right ? farX : right;
		});

		size.width = right - left;
		size.height = bottom - top;

		let result: Spacial = new Spacial(
			{
				x: left, y: top, contentWidth: size.width, contentHeight: size.height, placementMode: { type: "free" }, ref: "union",
				type: "lower-abstract"
			})

		return result
	}

	get state(): ISpacial {
		return {
			contentWidth: this._contentWidth,
			contentHeight: this._contentHeight,
			placementMode: this._placementMode,
			placementControl: this.placementControl,
			sizeMode: this.sizeMode,
			pulseData: this.pulseData,
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

	private _placementMode: PlacementConfiguration;
	public get placementMode() {
		return this._placementMode;
	}
	public set placementMode(value: PlacementConfiguration) {
		this._placementMode = value;
	}

	public placementControl: PlacementControl;
	public sizeMode: SizeConfiguration;

	private _pulseData?: IPulseConfig | undefined;
	public get pulseData(): IPulseConfig | undefined {
		if (this.placementMode?.type === "grid" && this._pulseData !== undefined) {
			this.updatePulseDataFromGridConfig();
		}
		return this._pulseData;
	}
	public set pulseData(value: IPulseConfig | undefined) {
		this._pulseData = value;
	}

	bindings: IBinding[] = []; // Investigate (enforce is called from point before bindings=[] is initialised in spacial)
	bindingsToThis: IBinding[] = [];

	constructor(
		params: ISpacial = {
			contentWidth: 0,
			contentHeight: 0,
			placementMode: { type: "free" },
			placementControl: "user",
			sizeMode: { x: "fixed", y: "fixed" },
			ref: "spacial",
			type: "lower-abstract",
		}
	) {
		super(params);

		this._placementMode = params.placementMode ?? { type: "free" }
		this.placementControl = params.placementControl ?? "user";
		this.sizeMode = params.sizeMode ?? { x: "fixed", y: "fixed" }
		
		if (params.pulseData !== undefined) {
			this._pulseData = params.pulseData;
			this.setGridConfigUsingPulseData(params.pulseData);
		}
		

		this._contentWidth = params.contentWidth ?? 0;
		this._contentHeight = params.contentHeight ?? 0;
	}

	public computeSize(): Size {
		// this.width = this.contentHeight;
		// this.height = this.contentHeight;

		return { width: this.width, height: this.height }
	}

	public computePositions(root: { x: number, y: number }) {
		this.x = root.x;
		this.y = root.y;

		return
	}

	public growElement(containerSize: Size): Record<Dimensions, number> {
		let dw: number = 0;
		let dh: number = 0;


		if (this.sizeMode.x === "grow") {
			dw = containerSize.width - this.width;
			this.width = containerSize.width;
		}
		if (this.sizeMode.y === "grow") {
			dh = containerSize.height - this.height;
			this.height = containerSize.height;
		}

		return { x: dw, y: dh }
	}

	public getHitbox(): Rect {
		var hitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({ "data-editor": "hitbox", key: this.ref });

		hitbox.size(this.width, this.height);
		hitbox.move(this.x, this.y);
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}

	public get cx(): number {
		return this.x;
	}
	public set cx(v: number) {
		throw new Error("not implemented");
	}

	public get cy(): number {
		return this.y;
	}
	public set cy(v: number) {
		throw new Error("not implemented");
	}

	set contentSize(b: Size) {
		this._contentWidth = b.width;
		this._contentHeight = b.height;
	}
	get contentSize(): Size {
		return { width: this.contentWidth, height: this.contentHeight };
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
		return { width: this.width, height: this.height }
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
					return this.cx;
				}
				return this._x;
			case "y":
				if (ofContent) {
					return this.cy;
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

	public getCentre(dimension: Dimensions, ofContent: boolean = false): number {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return (
						this.cx
						+ this.contentWidth / 2
					);
				}
				return this.x + this.width / 2;
			case "y":
				if (ofContent) {
					return (
						this.cy
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

	public getFar(dimension: Dimensions, ofContent: boolean = false): number {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return this.cx + this.contentWidth;
				}
				return this.x2;
			case "y":
				if (ofContent) {
					return this.cy + this.contentHeight
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

	private updatePulseDataFromGridConfig() {
		if (this.placementMode?.type === "grid") {

			let orientation: Orientation = "top";
			switch (this.placementMode.config.coords?.row) {
				case 0:
					orientation = "top";
					break;
				case 1:
					orientation = "both";
					break;
				case 2:
					orientation = "bottom";
					break;
			}


			this._pulseData = {
				channelID: this._pulseData?.channelID,
				sequenceID: this._pulseData?.sequenceID,
				clipBar: this._pulseData?.clipBar,

				noSections: this.placementMode.config.gridSize?.noCols ?? 1,
				index: this.placementMode.config.coords?.col ?? 0,
				orientation: orientation,
				alignment: {
					x: this.placementMode.config.alignment?.x ?? "centre",
					y: this.placementMode.config.alignment?.y ?? "far"
				}
			}
		}
	}

	public setGridConfigUsingPulseData(pulseData: IPulseConfig) {
		if (!isPulse(this) || this.placementMode.type !== "grid") {
			return
		}

		let row: 0 | 1 | 2 = 0
		switch (pulseData.orientation) {
			case "top":
				row = 0;
				break;
			case "both":
				row = 1;
				break;
			case "bottom":
				row = 2;
				break;
		}
	

		this.placementMode.config = {
			"alignment": pulseData?.alignment,
			"coords": {row: row, col: pulseData?.index ?? 0},
			"gridSize": {noRows: 1, noCols: pulseData?.noSections ?? 1},
			
			"ownedGhosts": this.placementMode.config.ownedGhosts,
			"contribution": this.placementMode.config.contribution,

		}
	}
}
