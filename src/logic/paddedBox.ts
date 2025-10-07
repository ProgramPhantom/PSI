import {ID} from "./point";
import Spacial, {ISpacial} from "./spacial";

type Padding = number | [number, number] | [number, number, number, number];
type Offset = [number, number];

interface Dim {
  width?: number;
  height?: number;
}

interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IPaddedBox extends ISpacial {
  padding: [number, number, number, number];
}

// After inheriting from this class, x and y are now located away from the actual content, defined by this.padding.
export default abstract class PaddedBox extends Spacial implements IPaddedBox {
  get state(): IPaddedBox {
    return {
      padding: this.padding,

      ...super.state
    };
  }

  padding: [number, number, number, number] = [0, 0, 0, 0];

  constructor(
    padding: Padding = 0,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    ref: string = PaddedBox.defaults["default"].ref,
    id: ID | undefined = undefined
  ) {
    super(x, y, width, height, ref, id);

    if (typeof padding === "number") {
      this.padding = [padding, padding, padding, padding];
    } else if (typeof this.padding === "object") {
      if (padding.length === 2) {
        this.padding = [padding[0], padding[1], padding[0], padding[1]];
      } else {
        this.padding = padding;
      }
    }
  }

  public get contentX(): number {
    return this.x + this.padding[3];
  }
  public set contentX(v: number) {
    this.x = v - this.padding[3];
    // this._contentX = v;
  }

  public get contentY(): number {
    return this.y + this.padding[0];
  }
  public set contentY(v: number) {
    this.y = v - this.padding[0];
    // this._contentY = v;
  }

  get dim(): Dim {
    return {width: this.width, height: this.height};
  }

  get bounds(): Bounds {
    if (this.hasPosition && this.hasDimensions) {
      var top = this.y;
      var left = this.x;

      var bottom = this.y + this.height;
      var right = this.x + this.width;

      return {top: top, right: right, bottom: bottom, left: left};
    }
    throw new Error("Dimensions are unset");
  }

  override get width(): number {
    if (this._contentWidth !== undefined) {
      return this.padding[3] + this._contentWidth + this.padding[1];
    }
    throw new Error("Width unset");
  }
  override set width(v: number | undefined) {
    if (v === undefined) {
      this.contentWidth = undefined;
    } else {
      var newContentWidth: number = v - this.padding[1] - this.padding[3];

      if (newContentWidth < 0) {
        // Don't allow content height to go below 0
        this.contentWidth = 0;
      } else {
        this.contentWidth = newContentWidth;
      }
    }
  }

  override get height(): number {
    if (this._contentHeight !== undefined) {
      return this.padding[0] + this._contentHeight + this.padding[2];
    }
    throw new Error("Dimensions undefined");
  }
  override set height(v: number | undefined) {
    if (v === undefined) {
      this.contentHeight = undefined;
    } else {
      var newContentHeight: number = v - this.padding[0] - this.padding[2];

      if (newContentHeight < 0) {
        // Don't allow content height to go below 0
        this.contentHeight = 0;
      } else {
        this.contentHeight = newContentHeight;
      }
    }
  }
}
