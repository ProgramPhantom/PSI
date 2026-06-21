import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import { isPulse } from "../../logic/spacial";
import LabelGroupDropField from "./LabelGroupDropField";

export default function LabelGroupDropFields() {
	// Subscribe to store updates to trigger re-renders when the generic state changes
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const pulses = Object.values(ENGINE.handler.allElements).filter(
		(el) => isPulse(el) && el.type !== "label-group" && el.type !== "simple-label-group"
	);

	return (
		<>
			{pulses.map((pulse) => (
				<LabelGroupDropField key={pulse.id} pulse={pulse} />
			))}
		</>
	);
}
