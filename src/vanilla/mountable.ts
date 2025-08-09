import { defaultMountable } from "./default/data";
import PaddedBox, { IPaddedBox } from "./paddedBox";
import { ID } from "./point";
import { Visual } from "./visual";


export enum Orientation { top=<any>"top", bottom=<any>"bottom", both=<any>"both" }

export enum Alignment { here=<any>"here", centre=<any>"centre", far=<any>"far", none=<any>"none" }


export interface IMountConfig {
    index: number,
    channelID: ID,

    orientation: Orientation,
    alignment: Alignment,
    inheritWidth: boolean,
    noSections: number,
    mountOn: boolean
}

export interface IMountable extends IPaddedBox {
    mountConfig?: IMountConfig
}


export class Mountable extends PaddedBox implements IMountable {
    static override defaults: {[name: string]: IMountable} = {"default": <any>defaultMountable}

    protected _mountConfig?: IMountConfig;
    public flipped: boolean = false;

    constructor(params: IMountable) {
        super(params.padding, params.x, params.y, params.contentWidth, params.contentHeight, params.ref)

        this.mountConfig = params.mountConfig; 
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