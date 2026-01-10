import { ControlGroup, FormGroup, InputGroup, Section, Slider } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { MathJax } from "better-react-mathjax";

interface ITextFormProps extends FormRequirements { }

function TextForm(props: ITextFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

	const formControls = useFormContext();

	return (
		<>
			<div style={{ width: "100%" }}>
				<ControlGroup vertical={true}>
					{/* Text */}
					<FormGroup
						style={{ padding: "8px 0px" }}
						fill={false}
						inline={false}
						label="Text (LaTeX)"
						labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}text`}
							render={({ field }) => (
								<div style={{ display: "flex", flexDirection: "row" }}>
									<InputGroup
										{...field}
										id="text"
										placeholder="_1\textrm{H}"
										size="small"
									/>
									<div style={{ marginLeft: "16px", display: "flex", alignItems: "center" }}>
										<MathJax>{`\\(${field.value || ""}\\)`}</MathJax>
									</div>
								</div>
							)}></Controller>
					</FormGroup>

					{/* Visual form */}
					<VisualForm
						widthDisplay={false}
						heightDisplay={false}
						prefix={props.prefix}></VisualForm>

					{/* Style */}
					<Section
						collapseProps={{ defaultIsOpen: false }}
						compact={true}
						title={"Style"}
						collapsible={true}>
						<FormGroup
							style={{ padding: "4px 8px", margin: 0 }}
							inline={true}
							label="Font Size"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.fontSize`}
								render={({ field }) => (
									<Slider {...field} max={60} min={0} labelStepSize={10}></Slider>
								)}></Controller>
						</FormGroup>

						<FormGroup
							style={{ padding: "4px 8px", margin: 0 }}
							inline={true}
							label="Colour"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.colour`}
								render={({ field }) => (
									<input type={"color"} {...field}></input>
								)}></Controller>
						</FormGroup>

						<FormGroup
							style={{ padding: "4px 8px", margin: 0 }}
							inline={true}
							label="Background"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.background`}
								render={({ field: { onChange, onBlur, value, ref } }) => (
									<input type={"color"}></input>
								)}></Controller>
						</FormGroup>
					</Section>
				</ControlGroup>
			</div>
		</>
	);
}

export default TextForm;
