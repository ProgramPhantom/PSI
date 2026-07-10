export type ShapedPulseType = "Hard" | "Soft" | "Composite" | "Adiabatic";

export type PulseType =
	| { category: "PFG" }
	| { category: "shape"; type: ShapedPulseType };


export interface IPulseData {
	pulseType: PulseType;
	flipAngle?: string | number;
	phase?: string | number;
	amplitude?: number;
	duration?: number;
}