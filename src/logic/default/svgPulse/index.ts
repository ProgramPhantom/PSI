import * as Acquire from "./acquire.json";
import * as HalfSine from "./halfsine.json";
import * as AmpSeries from "./amp.json";
import * as P180 from "./180.json";
import * as Trapezium from "./trapezium.json";
import * as TallTrapezium from "./talltrapezium.json";

import * as SaltireHiLo from "./saltirehilo.json";
import * as SaltireLoHi from "./saltirelohi.json";

import * as ChirpHiLo from "./chirphilo.json";
import * as ChirpLoHi from "./chirplohi.json";

export const svgPulses = {
	acquire: Acquire,
	halfsine: HalfSine,
	amp: AmpSeries,
	"180": P180,
	trap: Trapezium,
	talltrap: TallTrapezium,

	saltirehilo: SaltireHiLo,
	saltirelohi: SaltireLoHi,

	chirphilo: ChirpHiLo,
	chirplohi: ChirpLoHi
};
