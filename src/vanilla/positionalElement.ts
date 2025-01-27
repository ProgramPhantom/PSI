import { Svg } from "@svgdotjs/svg.js";
import { IVisual, Visual } from "./visual";
import { IConfig, IPositional, Orientation } from "./positional";
import Channel from "./channel";
import { FillObject, RecursivePartial } from "./util";
import { defaultPositional } from "./default/data";




export class PositionalElement<T extends Visual> extends Visual implements IPositional {
    static defaults: {[name: string]: IPositional} = {"default": <any>defaultPositional}

    get state(): (typeof this.element.state) & IPositional { return {
        ...this.element.state,
        config: this.config
    }}

    private _config: IConfig;

    channel: Channel;
    index: number | undefined;
    
    
    constructor(public element: T, channel: Channel, positional: RecursivePartial<IPositional>, templateName: string="default") {
        var fullParams: IPositional = FillObject(positional, PositionalElement.defaults[templateName]);
        super(element.state, element.refName);

        this._config = {...fullParams.config};

        this.channel = channel;

        if (this._config.orientation === Orientation.bottom) {
            this.element.verticalFlip();
        }
    }


    get config(): IConfig {
        return this._config;
    }
    set config(val: IConfig) {
        if (val.orientation !== this._config.orientation) {
            this.element.verticalFlip();
        }

        this._config = val;
    }
} 