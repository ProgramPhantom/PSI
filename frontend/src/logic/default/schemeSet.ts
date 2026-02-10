import { SchemeSet } from "../default";
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


export const DEFAULT_SCHEME_SET: SchemeSet = {
	"internal": {
		"diagram": {
			"default": DEFAULT_DIAGRAM
		},
		"sequence": {
			"default": DEFAULT_SEQUENCE,
			
		},
		"channel": {
			"default": DEFAULT_CHANNEL
		},
		"line": {
			"default": DEFAULT_LINE
		},
		"text": {
			"default": DEFAULT_TEXT
		},

		"svgElements": {
			"180": DEFAULT_180S,
			"acquire": DEFAULT_ACQUIRE,
			"amp": DEFAULT_AMP,
			"chirphilo": DEFAULT_CHIRPHILO,
			"chirplohi": DEFAULT_CHIRPLOHI,
			"halfsine": DEFAULT_HALFSINE,
			"saltirehilo": DEFAULT_SALTIREHILO,
			"saltirelohi": DEFAULT_SALTIRELOHI,
			"tall-trapezium": DEFAULT_TALLTRAPEZIUM,
			"trapezium": DEFAULT_TRAPEZIUM
		},

		"rectElements": {
			"90-pulse": DEFAULT_90H,
			"180-pulse": DEFAULT_180H
		},
		"labelGroupElements": {},

		"subgrids": {
			"sub-sequence": DEFAULT_SUBSEQUENCE
		}
	}
}
