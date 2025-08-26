import { defaultMountable } from "./default/data";
import PaddedBox, { IPaddedBox } from "./paddedBox";
import { ID } from "./point";
import Space from "./space";


export enum Orientation { top=<any>"top", bottom=<any>"bottom", both=<any>"both" }

export enum Alignment { here=<any>"here", centre=<any>"centre", far=<any>"far", none=<any>"none", stretch="stretch" }


export interface IMountConfig {
    index: number,
    channelID: ID,
    sequenceID: ID,

    orientation: Orientation,
    alignment: Alignment,
    noSections: number,
    mountOn: boolean
}

export interface IMountable extends IPaddedBox {
    mountConfig?: IMountConfig
}


class Mountable extends PaddedBox implements IMountable {
    static override defaults: {[name: string]: IMountable} = {"default": <any>defaultMountable}
    get state(): IMountable {
        return {
            mountConfig: this.mountConfig,
            ...super.state
        }
    }

    protected _mountConfig?: IMountConfig;
    public flipped: boolean = false;
    public dummies: Space[] = [];

    constructor(params: IMountable) {
        super(params.padding, params.x, params.y, params.contentWidth, params.contentHeight, params.ref, params.id)

        this.mountConfig = params.mountConfig;

        if (this.mountConfig?.alignment === Alignment.stretch) {
            this.sizeSource.x = "inherited"
        }

        if (this.mountConfig !== undefined && this.mountConfig.noSections > 1) {
            this.mountConfig.alignment = Alignment.stretch;
            this.sizeSource.x = "inherited";
        }
    }

    get isMountable(): boolean {
        if (this.mountConfig !== undefined) {
            if (this.mountConfig.mountOn === true) {
                return true
            }
            return false
        } else {
            return false;
        }
        
    }

    get hasMountConfig(): boolean {
        if (this.mountConfig === undefined) {
            return false
        }
        return true
    }

    get mountConfig(): IMountConfig | undefined {
        return this._mountConfig;
    }
    set mountConfig(val: IMountConfig | undefined) {
        this._mountConfig = val;
    }
}

export default Mountable