import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import { isPulse } from "../../logic/spacial";
import LabelGroupDropField from "./LabelGroupDropField";

export default function LabelGroupDropFields() {
	// Subscribe to store updates to trigger re-renders when the generic state changes
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const targets = Object.values(ENGINE.handler.allElements).filter((el) => {
		if (el.type === "label-group" || el.type === "simple-label-group") {
			return true;
		}
		if (isPulse(el)) {
			const parent = el.parentId ? ENGINE.handler.identifyElement(el.parentId) : undefined;
			if (parent && (parent.type === "label-group" || parent.type === "simple-label-group")) {
				return false;
			}
			return true;
		}
		return false;
	});

	return (
		<>
			{targets.map((target) => (
				<LabelGroupDropField key={target.id} target={target} />
			))}
		</>
	);
}
