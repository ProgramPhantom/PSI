import { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import SequenceChannelPaddingEditor from "./SequenceChannelPaddingEditor";

interface SequencesChannelPaddingEditorProps {
	scale?: number;
}

export default function SequencesChannelPaddingEditor({ scale = 1 }: SequencesChannelPaddingEditorProps) {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	return (
		<>
			{ENGINE.handler.sequences.map((s) => (
				<SequenceChannelPaddingEditor sequence={s} key={s.id} scale={scale} />
			))}
		</>
	);
}
