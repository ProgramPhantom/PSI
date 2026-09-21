import {
	HTMLSelect,
	Icon,
	Popover,
	Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { DoubleField } from "../fields/DoubleField";
import { SimpleField } from "../fields/SimpleField";
import { CustomNumericInput } from "../fields/CustomNumericInput";
import fieldStyles from "../styles/FormFields.module.scss";

export const PulsePlacement: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const pulseLayoutConfig = useWatch({
		control,
		name: `${fullPrefix}pulseLayoutConfig`
	});

	return (
		<>
			{/* Read-only info row */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					minHeight: "22px",

				}}
			>
				<span
					style={{
						fontSize: "0.75em",
						fontWeight: 500,
						opacity: 0.75
					}}
				>
					Info
				</span>
				<Popover
					position="left"
					content={
						<div
							style={{
								padding: "8px 12px",
								display: "flex",
								flexDirection: "column",
								gap: "6px",
								fontSize: "0.78em",
								minWidth: "180px",
								maxWidth: "280px"
							}}
						>
							<div
								style={{
									fontWeight: 600,
									fontSize: "0.95em",
									borderBottom: "1px solid rgba(125, 140, 160, 0.2)",
									paddingBottom: "4px",
									marginBottom: "2px",
									opacity: 0.85
								}}
							>
								Pulse Layout Info
							</div>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									gap: "8px"
								}}
							>
								<span style={{ opacity: 0.65, fontWeight: 500 }}>Index</span>
								<span style={{ fontWeight: 600, fontFamily: "monospace" }}>
									{pulseLayoutConfig?.index ?? "-"}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "2px"
								}}
							>
								<span style={{ opacity: 0.65, fontWeight: 500 }}>Channel ID</span>
								<span
									style={{
										fontFamily: "monospace",
										fontSize: "0.88em",
										opacity: 0.85,
										wordBreak: "break-all",
										userSelect: "all"
									}}
								>
									{pulseLayoutConfig?.channelID ?? "-"}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "2px"
								}}
							>
								<span style={{ opacity: 0.65, fontWeight: 500 }}>Sequence ID</span>
								<span
									style={{
										fontFamily: "monospace",
										fontSize: "0.88em",
										opacity: 0.85,
										wordBreak: "break-all",
										userSelect: "all"
									}}
								>
									{pulseLayoutConfig?.sequenceID ?? "-"}
								</span>
							</div>
						</div>
					}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							cursor: "pointer",
							padding: "2px"
						}}
						title="View pulse layout info"
					>
						<Icon
							icon="info-sign"
							size={12}
							style={{ opacity: 0.65 }}
						/>
					</span>
				</Popover>
			</div>

			<SimpleField label="Orientation">
				<Controller
					control={control}
					name={`${fullPrefix}pulseLayoutConfig.orientation`}
					defaultValue="top"
					render={({ field }) => (
						<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
							<option value="both">Both</option>
						</HTMLSelect>
					)}
				/>
			</SimpleField>

			<DoubleField
				label="Align"
				leftLabel="X"
				leftField={
					<Controller
						control={control}
						name={`${fullPrefix}pulseLayoutConfig.alignment.x`}
						defaultValue="here"
						render={({ field }) => (
							<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
								<option value="here">Left</option>
								<option value="centre">Centre</option>
								<option value="far">Right</option>
							</HTMLSelect>
						)}
					/>
				}
				rightLabel="Y"
				rightField={
					<Controller
						control={control}
						name={`${fullPrefix}pulseLayoutConfig.alignment.y`}
						defaultValue="far"
						render={({ field }) => (
							<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
								<option value="here">Top</option>
								<option value="centre">Centre</option>
								<option value="far">Bottom</option>
							</HTMLSelect>
						)}
					/>
				}
			/>

			<SimpleField label="Num. Sections">
				<Controller
					control={control}
					name={`${fullPrefix}pulseLayoutConfig.noSections`}
					defaultValue={1}
					render={({ field }) => (
						<CustomNumericInput
							{...field}
							allowNegative={false}
							onValueChange={field.onChange}
							min={1}
							max={10}
							size="small"
							fill
						/>
					)}
				/>
			</SimpleField>

			<SimpleField inline label="Clip Channel Bar">
				<Controller
					control={control}
					name={`${fullPrefix}pulseLayoutConfig.clipBar`}
					render={({ field }) => (
						<Switch {...field} onChange={field.onChange} checked={field.value} className={fieldStyles.compactSwitch} />
					)}
				/>
			</SimpleField>
		</>
	);
};

export default PulsePlacement;
