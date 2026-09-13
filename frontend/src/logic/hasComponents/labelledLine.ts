import Collection, { AddDispatchData, Components, ICollection, RemoveDispatchData } from "../collection";
import Line from "../line";
import { LaTeX } from "../latex";
import { UserComponentType } from "../point";
import Visual from "../visual";
import LineLike from "../lineLike";
import { Size } from "../spacial";

export type LineTextPosition = "start" | "centre" | "end";

export interface ILabelledLine extends ICollection {
	textPosition?: LineTextPosition;
}

export default class LabelledLine extends Collection implements ILabelledLine {
	static ElementType: UserComponentType = "labelled-line";

	public textPosition: LineTextPosition = "centre";

	get state(): ILabelledLine {
		return {
			...super.state,
			type: "labelled-line",
			textPosition: this.textPosition,
		};
	}

	get line(): Line | undefined {
		return this.roles["line"]?.object as Line | undefined;
	}

	get text(): LaTeX | undefined {
		return this.roles["text"]?.object as LaTeX | undefined;
	}

	roles: Components = {
		"line": {
			object: undefined,
			initialiser: this.initialiseLine.bind(this),

		},
		"text": {
			object: undefined,
			initialiser: this.initialiseText.bind(this),

		}
	};

	constructor(params: ILabelledLine) {
		super({
			...params,
			padding: params.padding ?? [0, 0, 0, 0],
			offset: params.offset ?? [0, 0],
			sizeMode: params.sizeMode ?? { x: "fit", y: "fit" },
			placementMode: params.placementMode ?? { type: "free" }
		});
		this.type = "labelled-line";
		this.textPosition = params.textPosition ?? "centre";
	}

	public override computePositions(root: { x: number; y: number }): void {
		const line = this.line;
		if (line) {
			this.cx = line.x;
			this.cy = line.y;
			return;
		}
		super.computePositions(root);
	}

	public override computeSize(): Size {
		const line = this.line;
		if (line) {
			const bbox = line.computeBoundingBox();
			this.contentWidth = bbox.width;
			this.contentHeight = bbox.height;
			return { width: bbox.width, height: bbox.height };
		}
		return super.computeSize();
	}

	private initialiseLine({ child }: AddDispatchData<Visual>) {
		child.placementMode = { type: "free" };
		if (this.text) {
			this.bindText();
		}
	}

	private initialiseText({ child }: AddDispatchData<Visual>) {
		this.bindText();
	}

	public bindText(): void {
		const text = this.text;
		const line = this.line;
		if (!text) return;
		if (!line) return;

		const targetId = line.id;

		text.placementMode = {
			type: "binds",
			config: [
				{
					targetId,
					dimension: "x",
					anchorSiteName: this.textPosition,
					targetSiteName: "centre",
					bindToContent: false
				},
				{
					targetId,
					dimension: "y",
					anchorSiteName: this.textPosition,
					targetSiteName: "centre",
					bindToContent: false
				}
			]
		};
		text.placementControl = "auto";
	}
}
