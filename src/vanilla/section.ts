
import { labelable } from "./positional";
import defaultSection from "./default/data/section.json"
import Label, { ILabel, Position } from "./label";
import { FillObject, RecursivePartial, UpdateObj } from "./util";
import Bracket, { IBracket } from "./bracket";


export interface ISection extends IBracket {
    indexRange: [number, number],
}

export default class Section extends Bracket implements labelable {
    static defaults: {[key: string]: ISection} = {"section": {...<ISection>defaultSection}}

    indexRange: [number, number];

    constructor(params: RecursivePartial<ISection>, templateName: string="section") {
        var fullParams: ISection = FillObject(params, Section.defaults[templateName]);
        super(fullParams)
            
        this.indexRange = fullParams.indexRange;
    }
}