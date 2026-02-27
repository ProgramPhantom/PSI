import { SchemeDict } from "../../redux/schemesSlice";
import { ISequence } from "../hasComponents/sequence";
import { DEFAULT_CHANNEL } from "./channel";
import { DEFAULT_DIAGRAM } from "./defaultDiagram";
import { DEFAULT_LINE } from "./line";
import { DEFAULT_SEQUENCE } from "./sequence";
import { DEFAULT_180H } from "./simplePulse/180pulse";
import { DEFAULT_90H } from "./simplePulse/90pulse";
import { DEFAULT_SUBSEQUENCE } from "./subsequence";
import { DEFAULT_180S } from "./svgPulse/180";
import { DEFAULT_ACQUIRE } from "./svgPulse/acquire";
import { DEFAULT_AMP } from "./svgPulse/amp";
import { DEFAULT_CHIRPHILO } from "./svgPulse/chirphilo";
import { DEFAULT_CHIRPLOHI } from "./svgPulse/chirplohi";
import { DEFAULT_HALFSINE } from "./svgPulse/halfsine";
import { DEFAULT_SALTIREHILO } from "./svgPulse/saltirehilo";
import { DEFAULT_SALTIRELOHI } from "./svgPulse/saltirelohi";
import { DEFAULT_TALLTRAPEZIUM } from "./svgPulse/talltrapezium";
import { DEFAULT_TRAPEZIUM } from "./svgPulse/trapezium";
import { DEFAULT_TEXT } from "./text";


export const DEFAULT_SCHEME_SET: SchemeDict = {
	"internal": {
		metadata: {
			name: "internal"
		},
		components: {
			"6032ad89-7b6f-4f61-8406-4aea64f59339": DEFAULT_CHANNEL,
			"e645a7ef-69d4-415a-93fc-b9ff5b726388": DEFAULT_LINE,
			"e9530b12-6b62-48e0-89de-60b61c7b87d8": DEFAULT_TEXT,
			"260710ef-5d40-4ada-bde2-044b17ab271a": DEFAULT_180S,
			"74d4af8c-e981-4f12-afa0-62a6ddff9d5b": DEFAULT_ACQUIRE,
			"0ac27981-b1e4-4d11-9b95-633ea14d24fe": DEFAULT_AMP,
			"f0f8adc5-5299-484a-9c67-a841c74f6aef": DEFAULT_CHIRPHILO,
			"7f139332-cf1a-44de-8688-598f6621f3e2": DEFAULT_CHIRPLOHI,
			"01c5ff6e-1a01-49ef-833f-c400f2534316": DEFAULT_HALFSINE,
			"1dfe9586-611c-49c2-bc85-ab9a82619699": DEFAULT_SALTIREHILO,
			"2bceea9d-6761-4dc9-84d6-ce56b63427c4": DEFAULT_SALTIRELOHI,
			"71c7b9bf-92a0-460a-9574-56fe91e9fa3d": DEFAULT_TALLTRAPEZIUM,
			"5ccb5f37-7bd9-48e3-a076-a6a425131ad4": DEFAULT_TRAPEZIUM,
			"09584fb0-d0dc-482a-bf9d-609a204035a0": DEFAULT_90H,
			"73ea4ef5-bcca-47e0-bb4c-70488cf7b66e": DEFAULT_180H,
			"dcfed31a-e1bd-4012-8777-2cec4e6b7759": DEFAULT_SUBSEQUENCE,
		}
	}
}
