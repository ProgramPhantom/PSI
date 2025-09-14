import ChannelForm from "../features/form/ChannelForm";
import { FormBundle } from "../features/form/LabelGroupComboForm";
import Aligner from "./aligner";
import Collection, { ICollection } from "./collection";
import defaultChannel from "./default/channel.json";
import { IHaveStructure, UserComponentType } from "./diagramHandler";
import { IMountConfig } from "./mountable";
import { ID } from "./point";
import RectElement, { IRectStyle } from "./rectElement";
import { OccupancyStatus } from "./sequence";
import Text, { IText } from "./text";
import { RecursivePartial, UpdateObj } from "./util";
import { IVisual, Visual } from "./visual";
 

export type ChannelNamedStructure = "top aligner" | "bottom aligner" | "bar" | "label"

export interface IChannel extends ICollection {
    sequenceID: ID,

    style: IChannelStyle;

    channelSymbol: IText;
}

export interface IChannelStyle {
    thickness: number,
    barStyle: IRectStyle
}


export default class Channel extends Collection implements IHaveStructure {
    static namedElements: {[name: string]: IChannel} = {"default": <any>defaultChannel, "form-defaults": {
        "padding": [0, 0, 0, 0], 
        "offset": [0, 0],
        "ref": "my-channel",
        "sequenceID": null,
        userChildren: [],

        "style": {
            "thickness": 3,
            "barStyle": {
                "fill": "#000000",
                "stroke": null,
                "strokeWidth": null
            }
        },

        "channelSymbol": {
            "offset": [0,0],
            "padding": [0, 0, 0, 0],
            "ref": "channel-symbol",
            "text": "^{1}\\mathrm{H}",
            "style": {
                "fontSize": 50,
                "colour": "black",
                "display": "block",
                "background": null
            }
        }
    }}
    static ElementType: UserComponentType = "channel";
    static formData: FormBundle = {form: ChannelForm, defaults: Channel.namedElements["form-defaults"], allowLabels: false};

    get state(): IChannel {
        return {
            sequenceID: this.sequenceID,
            style: this.style,
            channelSymbol: this.label.state,
            ...super.state
        }
    }
    
    structure: Record<ChannelNamedStructure, Visual>;

    style: IChannelStyle;

    // Upper and Lower aligners are responsible for binding the elements to the bar,
    // and carrying a height used to structure the channel.
    public topAligner: Aligner<Visual>;
    public bottomAligner: Aligner<Visual>;

    bar: RectElement;

    // A column for containing the channel label and binding the bar and positional columns
    private _labelColumn?: Aligner<Visual>;
    set labelColumn(v: Aligner<Visual>) {  // When the label column is set, apply binding to the label.
        this._labelColumn = v;

        this._labelColumn.bind(this.bar, "x", "far", "here");  // Bind X of bar

        this.labelColumn.bind(this.topAligner, "x", "here", "here", undefined);
        this.labelColumn.bind(this.bottomAligner, "x", "here", "here", undefined);

        if (this.label) {
            this._labelColumn.add(this.label, undefined, false, false)
        }
    }
    get labelColumn(): Aligner<Visual> {
        if (this._labelColumn !== undefined) {
            return this._labelColumn;
        }
        throw new Error(`Label column has not been set for channel ${this.id}`)
    }
    
    // A collection of columns to align this channel's positionals to
    private _mountColumns?: Aligner<Aligner<Visual>>;
    public get mountColumns(): Aligner<Aligner<Visual>> {
        if (this._mountColumns !== undefined) {
            return this._mountColumns;
        }
        throw new Error(`Positional Columns have not been set for channel: ${this.id}`)
    }
    public set mountColumns(value: Aligner<Aligner<Visual>>) {
        this._mountColumns = value;
        // this._mountColumns.bindSize(this.bar, "x");

        this._mountColumns.bind(this.bar, "x", "far", "far")
        this.bar.contentWidth = this._mountColumns.width; 
        // This means when adding a new channel the bar is already as long as image
    }

    private _mountOccupancy?: OccupancyStatus[];
    public get mountOccupancy(): OccupancyStatus[] {
        if (this._mountOccupancy === undefined) {
            throw Error("Positional occupancy not set");
        }
        return this._mountOccupancy;
    }
    public set mountOccupancy(val: OccupancyStatus[]) {
        this._mountOccupancy = val;
    }

    label: Text;

    public get mountedElements(): Visual[]  { // All positional elements on this channel
        return this.mountOccupancy.filter(p => (p !== undefined) && (p !== ".")) as Visual[];
    };  

    sequenceID: ID;

    constructor(pParams: RecursivePartial<IChannel>, templateName: string="default") {
        var fullParams: IChannel = pParams ? UpdateObj(Channel.namedElements[templateName], pParams) : Channel.namedElements[templateName];
        super(fullParams, templateName);

        this.style = fullParams.style;
        this.padding = [...fullParams.padding];
        // SIDE PADDING is not permitted for channels as it would break alignment


        // ----- Create structure -----
        // Top aligner
        this.topAligner = new Aligner({axis: "x", alignment: "far", minCrossAxis: 30, ref: `top aligner`}, "default");
        this.add(this.topAligner, undefined, true)
        
        // Bar
        this.bar = new RectElement({contentHeight: this.style.thickness, style: this.style.barStyle, ref: "bar"}, "bar");
        this.topAligner.bind(this.bar, "y", "far", "here");
        this.bar.sizeSource.x = "inherited";
        this.add(this.bar);

        // Bottom aligner
        this.bottomAligner = new Aligner({axis: "x", alignment: "here", minCrossAxis: 20, ref: "bottom aligner"}, "default");
        this.bar.bind(this.bottomAligner, "y", "far", "here");
        this.add(this.bottomAligner);


        // ----------------------------

        
        this.sequenceID = fullParams.sequenceID;
        // this.positionalElements = [...fullParams.positionalElements];  // please please PLEASE do this (list is ref type)
        
        
        this.label = new Text(fullParams.channelSymbol);

        this.bar.bind(this.label, "y", "centre", "centre");

        this.add(this.label);

        this.structure = {
            "top aligner": this.topAligner,
            "bottom aligner": this.bottomAligner,
            "bar": this.bar,
            "label": this.label
        }
    }


    // Position positional elements on the bar
    mountElement(element: Visual): void {
        if (element.mountConfig === undefined) {
            throw new Error("Cannot mount element with uninitialised mount config.")
        } 
        element.mountConfig.channelID = this.id;

        var element: Visual = element;  
        var config: IMountConfig = element.mountConfig!;


        // ---- Bind to the upper and lower aligners for Y ONLY
        switch (config.orientation) {
            case "top":
                this.topAligner.add(element, undefined, false, false);
                break;
            case "both":
                this.bar.bind(element, "y", "centre", "centre")
                this.add(element);
                this.bar.enforceBinding()
                break;
            case "bottom":
                this.bottomAligner.add(element, undefined, false, false);
                break;
        }

        this.add(element)
    }

    removeMountable(element: Visual) {
        // Remove from children of this channel (positional elements should be property taking positionals from children)
        this.remove(element);

        // Remove from the column (?)
        if (element.mountConfig!.index === undefined) {
            throw new Error(`Trying to remove positional with uninitialised index`)
        }

        // Remove from aligner (yes one of these is redundant)
        switch (element.mountConfig?.orientation) {
            case "top":
                this.topAligner.remove(element);
                break;
            case "bottom":
                this.bottomAligner.remove(element);
                break;
            case "both":
                this.bar.clearBindsTo(element);
                break;
            default:
                throw new Error(`Unknown element orientation '${element.mountConfig?.orientation}`);
        }
        
        element.erase();
    }

    // 
    shiftIndices(from: number, n: number=1): void {
        //var shifted: Visual[] = []
        this.mountOccupancy.forEach((pos, i) => {
            if (pos === ".") {return}
            if (i >= from && pos !== undefined && pos.mountConfig!.index !== undefined) {
                //if (!shifted.includes(pos)) {
                    pos.mountConfig!.index = pos.mountConfig!.index + n;
                  //  shifted.push(pos)
                //} 
            }
        })
    }

}
