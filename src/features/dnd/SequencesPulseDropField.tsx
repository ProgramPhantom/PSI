import ENGINE from "../../logic/engine";
import ChannelDropField from "./ChannelDropField";



export default function SequencesPulseDropField() {
	return (
		<>
			{ENGINE.handler.sequences.map((s) => {
				return (
					<div id={`$sequence-drop-field`}>
						{
							s.channels.map((c) => {
								return (
									<ChannelDropField target={c}></ChannelDropField>
								)
							})
						}
					</div>
				)
			})}
		</>
	)
}