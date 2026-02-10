import ENGINE from "../../logic/engine";
import SequencePulseDropField from "./SequencePulseDropField";

export default function SequencesPulseDropField() {
	return (
		<>
			{ENGINE.handler.sequences.map((s) => {
				return (
					<SequencePulseDropField sequence={s} key={s.id} />
				)
			})}
		</>
	)
}