import { v4 as uuidv4 } from "uuid";
import { DEFAULT_CHANNEL } from "./channel";
import { DEFAULT_LINE } from "./line";
import { DEFAULT_180H } from "./simplePulse/180pulse";
import { DEFAULT_90H } from "./simplePulse/90pulse";
import { DEFAULT_SUBSEQUENCE } from "./subsequence";
import { DEFAULT_180S } from "./svgPulse/180Soft";
import { DEFAULT_ACQUIRE } from "./svgPulse/acquire";
import { DEFAULT_AMP } from "./svgPulse/amp";
import { DEFAULT_CHIRPHILO } from "./svgPulse/chirphilo";
import { DEFAULT_CHIRPLOHI } from "./svgPulse/chirplohi";
import { DEFAULT_SHAPED_GRADIENT_1 } from "./svgPulse/shaped_gradient_1";
import { DEFAULT_SHAPED_GRADIENT_2 } from "./svgPulse/shaped_gradient_2";
import { DEFAULT_SALTIREHILO } from "./svgPulse/saltirehilo";
import { DEFAULT_SALTIRELOHI } from "./svgPulse/saltirelohi";
import { DEFAULT_TALLTRAPEZIUM } from "./svgPulse/talltrapezium";
import { DEFAULT_TRAPEZIUM } from "./svgPulse/trapezium";
import { DEFAULT_LATEX } from "./latex";
import { DEFAULT_TEXT } from "./text";
import { SchemeDict } from "../../types/schemes";
import { DEFAULT_SIMPLE_LABEL_GROUP } from "./simpleLabelGroup";
import { DEFAULT_LABEL } from "./label";
import { DEFAULT_GRADIENT } from "./simplePulse/gradient";
import { CW } from "./composite/CW";
import { DIPSI2 } from "./composite/DIPSI2";
import { MLEV } from "./composite/MLEV";
import { SPIN_LOCK } from "./composite/SPIN_LOCK";
import { WALTZ } from "./composite/WALTZ";

export const DEFAULT_SCHEME_SET: SchemeDict = {
	"internal": {
		location: "builtin",
		scheme: {
			metadata: {
				name: "internal",
				id: uuidv4(),
				format: "psi-scheme-format"
			},
			components: {
				"e9530b12-6b62-48e0-89de-60b61c7b87d8": DEFAULT_LATEX,
				"5c3d4a2d-2d4e-4f30-8a42-5f69c5e53e7f": DEFAULT_LABEL,
				"f1a91a92-6d27-46ef-bc96-107077a5ef01": DEFAULT_TEXT,
				"260710ef-5d40-4ada-bde2-044b17ab271a": DEFAULT_180S,
				"74d4af8c-e981-4f12-afa0-62a6ddff9d5b": DEFAULT_ACQUIRE,
				"0ac27981-b1e4-4d11-9b95-633ea14d24fe": DEFAULT_AMP,
				"f0f8adc5-5299-484a-9c67-a841c74f6aef": DEFAULT_CHIRPHILO,
				"7f139332-cf1a-44de-8688-598f6621f3e2": DEFAULT_CHIRPLOHI,
				"01c5ff6e-1a01-49ef-833f-c400f2534316": DEFAULT_SHAPED_GRADIENT_1,
				"01c5ff6e-1a01-49ef-833f-c400f2534317": DEFAULT_SHAPED_GRADIENT_2,
				"1dfe9586-611c-49c2-bc85-ab9a82619699": DEFAULT_SALTIREHILO,
				"2bceea9d-6761-4dc9-84d6-ce56b63427c4": DEFAULT_SALTIRELOHI,
				"71c7b9bf-92a0-460a-9574-56fe91e9fa3d": DEFAULT_TALLTRAPEZIUM,
				"5ccb5f37-7bd9-48e3-a076-a6a425131ad4": DEFAULT_TRAPEZIUM,
				"09584fb0-d0dc-482a-bf9d-609a204035a0": DEFAULT_90H,
				"73ea4ef5-bcca-47e0-bb4c-70488cf7b66e": DEFAULT_180H,

				"dcfed31a-e1bd-4012-8777-2cec4e6b7753": DIPSI2,
				"dcfed31a-e1bd-4012-8777-2cec4e6b7761": CW,
				"dcfed31a-e1bd-4012-8777-2cec4e6b7762": MLEV,
				"dcfed31a-e1bd-4012-8777-2cec4e6b7763": SPIN_LOCK,
				"dcfed31a-e1bd-4012-8777-2cec4e6b7764": WALTZ,
				"dcfed31a-e1bd-4012-8777-2cec4e6b7755": DEFAULT_GRADIENT
			}
		}
	}
}
