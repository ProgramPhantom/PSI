import {Element} from "@svgdotjs/svg.js";
import {FormBundle} from "../../features/form/LabelGroupComboForm";
import VisualForm from "../../features/form/VisualForm";
import Collection, {ICollection, IHaveComponents} from "../collection";
import DiagramHandler, {UserComponentType} from "../diagramHandler";
import Label, {ILabel} from "./label";
import RectElement, {IRectElement} from "../rectElement";
import SVGElement, {ISVGElement} from "../svgElement";
import {Position} from "../text";
import {CreateChild, FillObject, MarkAsComponent, RecursivePartial} from "../util";
import {IVisual, Visual} from "../visual";
import Spacial from "../spacial";

interface ILabelGroupComponents<T extends Visual = Visual>
  extends Record<string, Spacial | Spacial[]> {
  labels: Label[];
  coreChild: T;
}

export interface ILabelGroup extends ICollection {
  labels: ILabel[];
  coreChild: IVisual;
  coreChildType: UserComponentType;
}

export default class LabelGroup<T extends Visual = Visual>
  extends Collection
  implements IHaveComponents<ILabelGroupComponents<T>>
{
  static namedElements: {[name: string]: ILabelGroup} = {
    default: {
      contentWidth: 0,
      contentHeight: 0,
      x: undefined,
      y: undefined,
      offset: [0, 0],
      padding: [0, 0, 0, 0],

      labels: [],
      ref: "default-labellable",
      coreChild: SVGElement.namedElements["180"],
      coreChildType: "svg",
      userChildren: []
    }
  };
  static ElementType: UserComponentType = "label-group";
  static formData: FormBundle<ILabelGroup> = {
    form: VisualForm,
    defaults: LabelGroup.namedElements["form-defaults"],
    allowLabels: true
  };
  // Todo: fix this
  get state(): ILabelGroup {
    return {
      labels: this.components.labels.map((l) => {
        return l.state;
      }),
      coreChild: this.components.coreChild.state,
      coreChildType: this.coreChildType,
      ...super.state,
      contentWidth: this.components.coreChild.contentWidth,
      contentHeight: this.components.coreChild.contentHeight
    };
  }

  components: ILabelGroupComponents<T>;

  coreChildType: UserComponentType;

  public labelPositionDict(): {[k: string]: Label} {
    return Object.fromEntries(
      this.components.labels.map((item) => [item.labelConfig.labelPosition, item])
    );
  }

  constructor(
    params: RecursivePartial<ILabelGroup>,
    coreChild?: T,
    templateName: string = "default"
  ) {
    var fullParams: ILabelGroup = FillObject<ILabelGroup>(
      params,
      LabelGroup.namedElements[templateName]
    );
    super(fullParams, templateName);

    this.coreChildType = fullParams.coreChildType;

    if (coreChild !== undefined) {
      var coreChild: T = coreChild;
    } else {
      var coreChild: T = CreateChild(fullParams.coreChild, fullParams.coreChildType) as T;
    }

    this._contentHeight = coreChild.contentHeight!;
    this._contentWidth = coreChild.contentWidth!;

    this.mountConfig = fullParams.mountConfig;
    // parent.mountConfig = undefined;

    // this.ref = "labelled-" + coreChild.ref;
    this.ref = coreChild.ref;

    this.add(coreChild, undefined, true);

    this.components = {
      coreChild: coreChild,
      labels: []
    };

    var labels: Label[] = [];
    fullParams.labels?.forEach((label) => {
      var newLabel = new Label(label);
      labels.push(newLabel);
      this.bindLabel(newLabel);
    });

    this.components = {
      coreChild: coreChild,
      labels: labels
    };
    MarkAsComponent(this.components);
  }

  draw(surface: Element) {
    super.draw(surface);
  }

  bindLabel(label: Label) {
    if (this.labelPositionDict[label.labelConfig.labelPosition] !== undefined) {
      throw new Error("Cannot add a label to the same position twice");
    }

    switch (label.labelConfig.labelPosition) {
      case "top":
        // X
        label.sizeSource.x = "inherited";
        this.components.coreChild.bind(label, "x", "here", "here");
        this.components.coreChild.bind(label, "x", "far", "far");

        this.clearBindsTo(this.components.coreChild, "x");
        this.bind(this.components.coreChild, "x", "centre", "centre");

        // Y
        this.clearBindsTo(this.components.coreChild, "y");
        this.bind(label, "y", "here", "here", undefined, undefined, true);
        label.bind(this.components.coreChild, "y", "far", "here", undefined, undefined, false);

        this.add(label);
        this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
        break;
      case "right":
        // Y
        label.sizeSource.y = "inherited";
        this.components.coreChild.bind(label, "y", "here", "here", undefined);
        this.components.coreChild.bind(label, "y", "far", "far");

        // X
        this.components.coreChild.bind(label, "x", "far", "here", undefined, undefined, false);

        this.add(label);
        this._contentWidth = this._contentWidth! + label.width; // OPTIMISATION
        break;
      case "bottom":
        // Y
        this.components.coreChild.bind(label, "y", "far", "here");

        // X
        label.sizeSource.x = "inherited";
        this.components.coreChild.bind(label, "x", "here", "here");
        this.components.coreChild.bind(label, "x", "far", "far");

        this.clearBindsTo(this.components.coreChild, "x");
        this.bind(this.components.coreChild, "x", "centre", "centre");

        this.add(label);
        this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
        break;
      case "left":
        // Y
        label.sizeSource.y = "inherited";
        this.components.coreChild.bind(label, "y", "here", "here");
        this.components.coreChild.bind(label, "y", "far", "far");

        // X
        this.clearBindsTo(this.components.coreChild, "x");
        this.bind(label, "x", "here", "here");
        label.bind(this.components.coreChild, "x", "far", "here", undefined, undefined, false);

        this.add(label);
        this._contentWidth = this._contentWidth! + label.width; // OPTIMISATION
        break;
      case "centre":
        throw new Error("Not implemented");
        break;
      default:
        throw new Error(`Unknown label bind location ${label.labelConfig.labelPosition}`);
    }
  }

  getTotalLabelHeight(): number {
    var totalHeight: number = 0;
    this.components.labels.forEach((l) => {
      if (l.labelConfig.labelPosition === "top" || l.labelConfig.labelPosition === "bottom") {
        totalHeight += l.height;
      }
    });
    return totalHeight;
  }

  getTotalLabelWidth(): number {
    var totalWidth: number = 0;
    this.components.labels.forEach((l) => {
      if (l.labelConfig.labelPosition === "left" || l.labelConfig.labelPosition === "right") {
        totalWidth += l.width;
      }
    });
    return totalWidth;
  }

  // Override setters for content width and height to change parent element
  override get contentWidth(): number | undefined {
    return this._contentWidth;
  }
  override set contentWidth(v: number | undefined) {
    if (v === undefined) {
      this._contentWidth === undefined;
      this._parentElement?.contentWidth === undefined;
      return;
    }

    if (v !== this._contentWidth) {
      this._contentWidth = v;

      if (this.sizeSource.x === "inherited") {
        this.components.coreChild.contentWidth = v - this.getTotalLabelWidth();
      }

      this.enforceBinding();
      this.notifyChange();
    }
  }

  override get contentHeight(): number | undefined {
    return this._contentHeight;
  }
  override set contentHeight(v: number | undefined) {
    if (v === undefined) {
      this._contentHeight === undefined;
      this._parentElement?.contentHeight === undefined;
      return;
    }

    if (v !== this.contentHeight) {
      this._contentHeight = v;

      if (this.sizeSource.y === "inherited") {
        this.components.coreChild.contentHeight = v - this.getTotalLabelHeight();
      }

      this.enforceBinding();
      this.notifyChange();
    }
  }
}
