import { Button, ButtonGroup } from "@blueprintjs/core";
import React from "react";
import ENGINE from "../../logic/engine";
import Channel from "../../logic/hasComponents/channel";
import styles from "./styles/toolbars.module.scss";

interface ChannelReorderButtonsProps {
	channel: Channel;
}

export const ChannelReorderButtons: React.FC<ChannelReorderButtonsProps> = React.memo(({ channel }) => {
	const handleMoveUp = (e: React.MouseEvent) => {
		e.stopPropagation();
		ENGINE.handler.reorderChannel(channel.id, "up");
	};

	const handleMoveDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		ENGINE.handler.reorderChannel(channel.id, "down");
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onMouseUp={(e) => e.stopPropagation()}
			onMouseDown={(e) => e.stopPropagation()}
			className={`${styles["frosted-toolbar"]} ${styles.vertical}`}
			style={{ padding: "3px", gap: "2px" }}
		>
			<ButtonGroup vertical>
				<Button
					icon="chevron-up"
					variant="minimal"
					size="small"
					style={{ width: "10px", height: "18px", minWidth: "18px", minHeight: "18px", padding: 0 }}
					title="Move channel up"
					onClick={handleMoveUp}
				/>
				<Button
					icon="chevron-down"
					variant="minimal"
					size="small"
					style={{ width: "10px", height: "18px", minWidth: "18px", minHeight: "18px", padding: 0 }}
					title="Move channel down"
					onClick={handleMoveDown}
				/>
			</ButtonGroup>
		</div>
	);
});
