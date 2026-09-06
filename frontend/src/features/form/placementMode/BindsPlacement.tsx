import {
	Card,
	Icon,
	Tag
} from "@blueprintjs/core";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import ENGINE from "../../../logic/engine";
import { IPlacementBindingRule } from "../../../logic/spacial";

const formatSite = (site: string, dimension?: string): string => {
	if (site === "start") return "Start";
	if (site === "end") return "End";
	if (site === "centre") return "Center";
	if (site === "here") return dimension === "y" ? "Top" : "Left";
	if (site === "far") return dimension === "y" ? "Bottom" : "Right";
	return site;
};

export const BindsPlacement: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const placementMode = useWatch({
		control,
		name: `${fullPrefix}placementMode`
	});

	const rules: IPlacementBindingRule[] = Array.isArray(placementMode?.config)
		? placementMode.config
		: [];

	return (
		<div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "0 2px"
				}}
			>
				<span
					style={{
						fontSize: "0.75em",
						fontWeight: 600,
						textTransform: "uppercase",
						letterSpacing: "0.5px",
						opacity: 0.6
					}}
				>
					Binding Rules ({rules.length})
				</span>
			</div>

			{rules.length === 0 ? (
				<Card
					style={{
						padding: "10px",
						fontSize: "0.8em",
						opacity: 0.6,
						textAlign: "center",
						fontStyle: "italic"
					}}
				>
					No active binding rules
				</Card>
			) : (
				rules.map((rule, idx) => {
					const anchorId = rule.targetId || rule.anchorId || "";
					const anchor = anchorId ? ENGINE.handler.identifyElement(anchorId) : undefined;
					const anchorName = anchor?.ref || anchor?.type || (anchorId ? `#${anchorId.slice(0, 8)}` : "Unknown");
					const anchorDesc = anchor ? `${anchor.ref} (${anchor.type})` : anchorId;
					const hasOffset = rule.offset !== undefined && rule.offset !== 0;

					return (
						<Card
							key={idx}
							style={{
								padding: "6px 8px",
								display: "flex",
								flexDirection: "column",
								gap: "4px"
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: "6px"
								}}
							>
								{/* Target endpoint / site & dimension */}
								<div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
									<Tag
										minimal
										intent="primary"
										style={{
											fontSize: "0.75em",
											fontWeight: 500,
											padding: "1px 5px",
											minHeight: "18px"
										}}
									>
										{formatSite(rule.targetSiteName, rule.dimension)}
									</Tag>
									<Tag
										minimal
										style={{
											fontSize: "0.75em",
											fontWeight: 600,
											padding: "1px 5px",
											minHeight: "18px"
										}}
									>
										{rule.dimension.toUpperCase()}
									</Tag>
								</div>

								<Icon icon="arrow-right" size={10} style={{ opacity: 0.4, flexShrink: 0 }} />

								{/* Anchor element and anchor site */}
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "4px",
										overflow: "hidden",
										justifyContent: "flex-end"
									}}
								>
									<Icon icon="link" size={10} style={{ opacity: 0.4, flexShrink: 0 }} />
									<span
										title={`Anchor: ${anchorDesc}\nID: ${anchorId}`}
										style={{
											fontSize: "0.8em",
											fontWeight: 500,
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											maxWidth: "110px"
										}}
									>
										{anchorName}
									</span>
									<Tag
										minimal
										round
										style={{
											fontSize: "0.7em",
											padding: "0 4px",
											minHeight: "16px",
											flexShrink: 0,
											opacity: 0.8
										}}
									>
										{formatSite(rule.anchorSiteName, rule.dimension)}
									</Tag>
								</div>
							</div>

							{hasOffset && (
								<div
									style={{
										fontSize: "0.72em",
										opacity: 0.55,
										textAlign: "right",
										fontFamily: "monospace"
									}}
								>
									Offset: {rule.offset! > 0 ? `+${rule.offset}` : rule.offset}px
								</div>
							)}
						</Card>
					);
				})
			)}
		</div>
	);
};

export default BindsPlacement;
