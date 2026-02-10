import * as Acquire from "./acquire";
import * as HalfSine from "./halfsine";
import * as AmpSeries from "./amp";
import * as P180 from "./180";
import * as Trapezium from "./trapezium";
import * as TallTrapezium from "./talltrapezium";

import * as SaltireHiLo from "./saltirehilo";
import * as SaltireLoHi from "./saltirelohi";

import * as ChirpHiLo from "./chirphilo";
import * as ChirpLoHi from "./chirplohi";

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
