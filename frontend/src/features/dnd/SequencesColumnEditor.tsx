import { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import SequenceColumnEditor from "./SequenceColumnEditor";

export default function SequencesColumnEditor() {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	return (
		<>
			{ENGINE.handler.sequences.map((s) => (
				<SequenceColumnEditor sequence={s} key={s.id} />
			))}
		</>
	);
}
