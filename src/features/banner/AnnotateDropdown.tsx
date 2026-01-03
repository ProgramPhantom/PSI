import {
	Button,
	ButtonGroup,
	Classes,
	ControlGroup,
	FormGroup,
	Menu,
	MenuItem,
	NumericInput,
	Popover,
	SegmentedControl
} from "@blueprintjs/core";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Tool } from "../../app/App";
import { defaultLine } from "../../logic/default/index";
import { ILineStyle } from "../../logic/line";
import { IDrawArrowConfig } from "../canvas/LineTool";

interface IAnnotateDropdownProps {
	selectedTool: Tool;
	setTool: (tool: Tool) => void;
}

export function AnnotateDropdown(props: IAnnotateDropdownProps) {
	const toolValue = useRef<IDrawArrowConfig>({
		lineStyle: defaultLine.lineStyle as ILineStyle,
		mode: "bind"
	});
	const { control, handleSubmit, reset, watch } = useForm<IDrawArrowConfig>({
		mode: "onChange",
		defaultValues: {
			lineStyle: defaultLine.lineStyle as ILineStyle,
			mode: "bind"
		}
	});

	const onSubmit = (data: IDrawArrowConfig) => {
		// TODO: i don't want the tool to be selected if nothing is changed.
		if (data != toolValue.current) {
			props.setTool({
				type: "arrow",
				config: data
			});
			toolValue.current = data;
		}
	};

	const selectTool = () => {
		if (props.selectedTool.type === "arrow") {
			props.setTool({ type: "select", config: {} });
		} else {
			props.setTool({ type: "arrow", config: toolValue.current });
		}
	};

	// Sync form values from selected tool when it changes
	useEffect(() => {
		if (props.selectedTool.type === "arrow") {
			const config = props.selectedTool.config;
			reset(config);
		}
	}, [props.selectedTool, reset]);

	return (
		<Popover
			hoverCloseDelay={100}
			hoverOpenDelay={500}
			lazy={false}
			renderTarget={({ isOpen, ...targetProps }) => (
				<Button active={false} disabled={true}
					{...targetProps}
					onClick={(e) => selectTool()}
					intent={props.selectedTool.type === "arrow" ? "primary" : "none"}
					size="small"
					variant={props.selectedTool.type === "arrow" ? "solid" : "minimal"}
					icon="arrow-top-right"
					text="Line Tool"
				/>
			)}
			interactionKind="hover"
			popoverClassName={Classes.POPOVER_CONTENT_SIZING}
			content={
				<form
					style={{ width: "300px" }}
					onBlur={handleSubmit(onSubmit)}
					onMouseLeave={handleSubmit(onSubmit)}>
					<ControlGroup fill={true} vertical={true}>
						<FormGroup label="Mode" inline={true}>
							<Controller
								name="mode"
								control={control}
								render={({ field }) => (
									<SegmentedControl
										size={"small"}
										{...field}
										options={[
											{
												label: "Bind",
												value: "bind"
											},
											{
												label: "Vertical",
												value: "vertical"
											}
										]}
										defaultValue="bind"
										onValueChange={(v) => field.onChange(v)}></SegmentedControl>
								)}></Controller>
						</FormGroup>

						<FormGroup label="Heads" inline={true}>
							<ButtonGroup>
								<Controller
									name="lineStyle.headStyle.0"
									control={control}
									render={({ field }) => (
										<Popover
											minimal={true}
											hoverOpenDelay={0}
											hoverCloseDelay={200}
											interactionKind="click"
											captureDismiss={true}
											position="bottom"
											content={
												<Menu {...field}>
													<MenuItem
														text="Default"
														onClick={() => field.onChange("default")}
													/>
													<MenuItem
														text="Thin"
														onClick={() => field.onChange("thin")}
													/>
													<MenuItem
														text="None"
														onClick={() => field.onChange("none")}
													/>
												</Menu>
											}>
											<Button
												text={`Start: ${field.value}`}
												endIcon="caret-down"
											/>
										</Popover>
									)}
								/>
								<Controller
									name="lineStyle.headStyle.1"
									control={control}
									render={({ field }) => (
										<Popover
											minimal={true}
											hoverOpenDelay={0}
											hoverCloseDelay={200}
											interactionKind="click"
											captureDismiss={true}
											position="bottom"
											content={
												<Menu {...field}>
													<MenuItem
														text="Default"
														onClick={() => field.onChange("default")}
													/>
													<MenuItem
														text="Thin"
														onClick={() => field.onChange("thin")}
													/>
													<MenuItem
														text="None"
														onClick={() => field.onChange("none")}
													/>
												</Menu>
											}>
											<Button
												text={`End: ${field.value}`}
												endIcon="caret-down"
											/>
										</Popover>
									)}
								/>
							</ButtonGroup>
						</FormGroup>

						<FormGroup label="Stroke" inline={true}>
							<Controller
								name="lineStyle.stroke"
								control={control}
								render={({ field }) => (
									<input
										{...field}
										type="color"
										style={{
											width: 36,
											height: 30,
											padding: 0,
											border: "none",
											background: "transparent"
										}}
										aria-label="Stroke color"
									/>
								)}
							/>
						</FormGroup>

						<FormGroup label="Dashing" fill={true} inline={true}>
							<div style={{ display: "flex", flexDirection: "row" }}>
								<Controller
									name="lineStyle.dashing.0"
									control={control}
									render={({ field }) => (
										<NumericInput
											{...field}
											min={0}
											placeholder="dash"
											buttonPosition="none"
											style={{ width: 70 }}
										/>
									)}
								/>
								<Controller
									name="lineStyle.dashing.1"
									control={control}
									render={({ field }) => (
										<NumericInput
											{...field}
											min={0}
											placeholder="gap"
											buttonPosition="none"
											style={{ width: 70 }}
											allowNumericCharactersOnly={true}
										/>
									)}
								/>
							</div>
						</FormGroup>

						<FormGroup label="Thickness" inline={true}>
							<Controller
								name="thickness"
								control={control}
								render={({ field }) => (
									<NumericInput
										value={field.value}
										onValueChange={
											(num /* number */, str /* string */) =>
												field.onChange(num) // send number to RHF
										}
										min={1}
										stepSize={1}
										buttonPosition="none"
										style={{ width: 80 }}
									/>
								)}
							/>
						</FormGroup>
					</ControlGroup>
				</form>
			}></Popover>
	);
}
