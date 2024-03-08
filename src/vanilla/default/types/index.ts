import * as SimplePulseDefs from "./simplePulse.d.json";
import * as LabelDefs from "./label.d.json";
import * as TemporalDefs from "./temporal.d.json";

export const definitions = {
    ...SimplePulseDefs,
    ...LabelDefs,
    ...TemporalDefs
}
