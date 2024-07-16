// export {default as Pulse90} from "./90pulse.json";
// export {default as Pulse180} from "./180pulse.json";
// export {default as Abstract} from "./Abstract.json";
// export {default as Aquire} from "./Aquire.json";

import { svgPulses } from "./svgPulse"
import { simplePulses } from "./simplePulse"
import * as Abstract from "./abstract.json"
import * as Span from "./span.json"

import * as Channel from "./channel.json";

export const positionalElements: {[name: string]: any} = {
    ...svgPulses,
    ...simplePulses,
    "abstract": Abstract,
    "span": Span,
};

export const defaultChannel = Channel;