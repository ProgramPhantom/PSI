import type { ICollection } from "../collection";
import { DEFAULT_VISUAL } from "./visual";

export const DEFAULT_COLLECTION: ICollection = {
	...DEFAULT_VISUAL,
	ref: "collection",
	type: "collection",
	children: [],
	sizeMode: { x: "fit", y: "fit" }
};
