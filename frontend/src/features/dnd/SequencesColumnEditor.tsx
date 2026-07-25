import { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import SequenceColumnEditor from "./SequenceColumnEditor";

interface SequencesColumnEditorProps {
	scale?: number;
}

export default function SequencesColumnEditor({ scale = 1 }: SequencesColumnEditorProps) {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	return (
		<>
			{ENGINE.handler.sequences.map((s) => (
				<SequenceColumnEditor sequence={s} key={s.id} scale={scale} />
			))}
		</>
	);
}
