import {Element, Rect, SVG} from "@svgdotjs/svg.js";
import {FormBundle} from "../features/form/LabelGroupComboForm";
import RectElementForm from "../features/form/RectForm";
import defaultBar from "./default/bar.json";
import {UserComponentType} from "./diagramHandler";
import {RecursivePartial, createWithTemplate} from "./util";
import {IDraw, IVisual, Visual} from "./visual";

export interface IRectStyle {
  fill: string;
  stroke: string | null;
  strokeWidth: number | null;
}

export interface IRectElement extends IVisual {
  style: IRectStyle;
}

export default class RectElement extends Visual implements IRectElement, IDraw {
  static namedElements: {[key: string]: IRectElement} = {
    bar: <any>defaultBar,
    "form-defaults": <any>defaultBar
  };
  get state(): IRectElement {
    return {
      style: this.style,
      ...super.state
    };
  }
  static ElementType: UserComponentType = "rect";
  static formData: FormBundle = {
    form: RectElementForm,
    defaults: RectElement.namedElements["form-defaults"],
    allowLabels: true
  };

  style: IRectStyle;

  constructor(params: IRectElement);
  constructor(params: RecursivePartial<IRectElement>, templateName: string);
  constructor(params: RecursivePartial<IRectElement> | IRectElement, templateName?: string) {
    const fullParams = createWithTemplate<IRectElement>(RectElement.namedElements)(
      params,
      templateName
    );
    super(fullParams);

    this.style = fullParams.style;

    this.svg = SVG()
      .rect(this.contentWidth, this.contentHeight)
      .attr({fill: this.style.fill, stroke: this.style.stroke})
      .attr({
        "stroke-width": this.style.strokeWidth,
        "shape-rendering": "crispEdges"
      });
  }

  draw(surface: Element) {
    if (this.dirty) {
      if (this.svg) {
        try {
          this.svg.remove();
        } catch {}
      }

      this.svg = new Rect()
        .size(this.contentWidth, this.contentHeight)
        .attr({fill: this.style.fill, stroke: this.style.stroke})
        .move(this.contentX + this.offset[0], this.contentY + this.offset[1])
        .attr({
          "stroke-width": this.style.strokeWidth,
          "shape-rendering": "crispEdges",
          "data-position": this.positionMethod,
          "data-ownership": this.ownershipType
        });
      surface.add(this.svg);

      this.id = this.svg.id();
    }
  }

  public static isRectElement(obj: any): obj is SVGElement {
    return (obj as RectElement).style.fill !== undefined;
  }
}
