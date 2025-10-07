import {
  ControlGroup,
  FormGroup,
  HTMLSelect,
  InputGroup,
  NumericInput,
  Section,
  Slider
} from "@blueprintjs/core";
import React from "react";
import {Controller, FieldErrors, useFormContext} from "react-hook-form";
import {getByPath} from "../../logic/util";
import {IVisual} from "../../logic/visual";
import {FormRequirements} from "./FormDiagramInterface";

interface IVisualFormProps extends FormRequirements {
  widthDisplay?: boolean;
  heightDisplay?: boolean;
}

const VisualForm: React.FC<IVisualFormProps> = (props) => {
  var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
  const formControls = useFormContext();

  var errors: Partial<FieldErrors<IVisual>> | undefined = getByPath(
    formControls.formState.errors,
    props.prefix
  );
  var rawVals = formControls.getValues();
  var values: Partial<IVisual> = getByPath(formControls.getValues(), props.prefix);

  var widthActive = props.target
    ? props.target.sizeSource.x === "inherited"
      ? false
      : true
    : true;
  var heightActive = props.target
    ? props.target.sizeSource.y === "inherited"
      ? false
      : true
    : true;

  var vals = formControls.getValues();
  return (
    <ControlGroup vertical={true}>
      {/* Reference */}
      <FormGroup
        style={{userSelect: "none"}}
        fill={false}
        inline={true}
        label="Reference"
        labelFor="ref-input"
        intent={errors?.ref ? "danger" : "none"}
        helperText={errors?.ref?.message.toString()}>
        <Controller
          control={formControls.control}
          name={`${fullPrefix}ref`}
          render={({field}) => (
            <InputGroup
              id="ref-input"
              {...field}
              size="small"
              intent={errors?.ref ? "danger" : "none"}
            />
          )}
          rules={{
            required: "Reference is required", // message shown if empty
            validate: (value) => value.trim() !== "" || "Reference cannot be empty" // extra safeguard against only-spaces
          }}></Controller>
      </FormGroup>

      {/* Width and height */}
      {/* Content Width */}
      {vals.contentWidth !== undefined && props.widthDisplay ? (
        <>
          <FormGroup
            intent={errors?.contentWidth ? "danger" : "none"}
            helperText={errors?.contentWidth?.message.toString()}
            inline={true}
            label="Width"
            labelFor="width-input">
            <Controller
              control={formControls.control}
              name={`${fullPrefix}contentWidth`}
              render={({field}) => (
                <NumericInput
                  {...field}
                  id="width-input"
                  onValueChange={field.onChange}
                  min={1}
                  max={400}
                  size="small"
                  disabled={!widthActive}
                  title={!widthActive ? "Width inherited" : ""}
                  intent={errors?.contentWidth ? "danger" : "none"}
                  allowNumericCharactersOnly={true}></NumericInput>
              )}
              rules={{
                required: "Width is required",
                min: {value: 1, message: "Width must be at least 1"},
                max: {value: 400, message: "Width cannot exceed 400"}
              }}></Controller>
          </FormGroup>
        </>
      ) : (
        <></>
      )}

      {/* Content Height */}
      {vals.contentHeight !== undefined && props.heightDisplay ? (
        <>
          <FormGroup
            intent={errors?.contentHeight ? "danger" : "none"}
            helperText={errors?.contentHeight?.message.toString()}
            inline={true}
            label="Height"
            labelFor="height-input">
            <Controller
              control={formControls.control}
              name={`${fullPrefix}contentHeight`}
              render={({field}) => (
                <NumericInput
                  {...field}
                  id="height-input"
                  onValueChange={field.onChange}
                  min={1}
                  max={400}
                  size="small"
                  disabled={!widthActive}
                  title={!heightActive ? "Height inherited" : ""}
                  intent={errors?.contentHeight ? "danger" : "none"}
                  allowNumericCharactersOnly={true}></NumericInput>
              )}
              rules={{
                required: "Height is required",
                min: {value: 1, message: "Height must be at least 1"},
                max: {value: 400, message: "Height cannot exceed 400"}
              }}></Controller>
          </FormGroup>
        </>
      ) : (
        <></>
      )}

      {/* Config */}
      {vals.mountConfig !== undefined ? (
        <>
          <Section
            style={{borderRadius: 0}}
            collapseProps={{defaultIsOpen: false}}
            compact={true}
            title={"Config"}
            collapsible={true}>
            <ControlGroup vertical={true}>
              {/* Orientation */}
              <FormGroup
                style={{padding: "4px 8px"}}
                inline={true}
                label="Orientation"
                labelFor="text-input">
                <Controller
                  control={formControls.control}
                  name="mountConfig.orientation"
                  render={({field}) => (
                    <HTMLSelect {...field} iconName="caret-down">
                      <option value={"top"}>Top</option>
                      <option value={"both"}>Both</option>
                      <option value={"bottom"}>Bottom</option>
                    </HTMLSelect>
                  )}></Controller>
              </FormGroup>

              {/* Alignment */}
              <FormGroup
                style={{padding: "4px 8px"}}
                inline={true}
                label="Alignment"
                labelFor="text-input">
                <Controller
                  control={formControls.control}
                  name="mountConfig.alignment"
                  render={({field}) => (
                    <HTMLSelect {...field} iconName="caret-down">
                      <option value={"here"}>Left</option>
                      <option value={"centre"}>Centre</option>
                      <option value={"far"}>Right</option>
                      <option value={"stretch"}>Stretch</option>
                    </HTMLSelect>
                  )}></Controller>
              </FormGroup>

              {/* No Sections */}
              <FormGroup
                style={{padding: "4px 8px", margin: 0}}
                intent={errors?.mountConfig?.noSections ? "danger" : "none"}
                helperText={errors?.mountConfig?.noSections?.message}
                inline={true}
                label="No. Sections"
                labelFor="sections-input">
                <Controller
                  control={formControls.control}
                  name="mountConfig.noSections"
                  render={({field}) => (
                    <NumericInput
                      {...field}
                      id="sections-input"
                      onValueChange={field.onChange}
                      min={1}
                      max={5}
                      size="small"
                      intent={errors?.mountConfig?.noSections ? "danger" : "none"}
                      allowNumericCharactersOnly={true}></NumericInput>
                  )}
                  rules={{
                    required: "No. sections is required",
                    min: {
                      value: 1,
                      message: "No. Sections must be at least 1"
                    },
                    max: {value: 5, message: "No. Sections cannot exceed 5"}
                  }}></Controller>
              </FormGroup>
            </ControlGroup>
          </Section>
        </>
      ) : (
        <></>
      )}

      {/* Padding */}
      <Section
        style={{borderRadius: 0}}
        collapseProps={{defaultIsOpen: false}}
        compact={true}
        title={"Padding"}
        collapsible={true}>
        <ControlGroup vertical={true} style={{gap: 10}}>
          <FormGroup style={{padding: "4px 16px"}} label="Padding top" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="padding.0"
              render={({field}) => (
                <Slider {...field} min={0} max={30} labelStepSize={10}></Slider>
              )}></Controller>
          </FormGroup>

          <FormGroup style={{padding: "4px 16px"}} label="Padding right" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="padding.1"
              render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
              )}></Controller>
          </FormGroup>

          <FormGroup style={{padding: "4px 16px"}} label="Padding bottom" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="padding.2"
              render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
              )}></Controller>
          </FormGroup>

          <FormGroup
            style={{padding: "4px 16px", margin: 0}}
            label="Padding left"
            labelFor="slider3">
            <Controller
              control={formControls.control}
              name="padding.3"
              render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
              )}></Controller>
          </FormGroup>
        </ControlGroup>
      </Section>

      {/* Offset */}
      <Section
        style={{borderRadius: 0}}
        collapseProps={{defaultIsOpen: false}}
        compact={true}
        title={"Offset"}
        collapsible={true}>
        <ControlGroup vertical={true}>
          <FormGroup
            style={{padding: "4px 8px", margin: 0}}
            intent={errors?.offset?.[0] ? "danger" : "none"}
            helperText={errors?.offset?.[0]?.message}
            inline={true}
            label="Offset X"
            labelFor="offset0">
            <Controller
              control={formControls.control}
              name={`${fullPrefix}offset.0`}
              render={({field}) => (
                <NumericInput
                  {...field}
                  id="offset0"
                  onBlur={field.onChange}
                  onValueChange={field.onChange}
                  min={-2000}
                  max={2000}
                  size="small"
                  intent={errors?.offset?.[0] ? "danger" : "none"}
                  allowNumericCharactersOnly={true}></NumericInput>
              )}
              rules={{
                required: "Offset is required",
                min: {
                  value: -2000,
                  message: "Offset must be greater than -2000"
                },
                max: {value: 2000, message: "Offset cannot exceed 2000"}
              }}></Controller>
          </FormGroup>

          <FormGroup
            style={{padding: "4px 8px", margin: 0}}
            intent={errors?.offset?.[1] ? "danger" : "none"}
            helperText={errors?.offset?.[1]?.message}
            inline={true}
            label="Offset Y"
            labelFor="offset1">
            <Controller
              control={formControls.control}
              name={`${fullPrefix}offset.1`}
              render={({field}) => (
                <NumericInput
                  {...field}
                  id="offset1"
                  onBlur={field.onChange}
                  onValueChange={field.onChange}
                  min={-2000}
                  max={2000}
                  size="small"
                  intent={errors?.offset?.[1] ? "danger" : "none"}
                  allowNumericCharactersOnly={true}></NumericInput>
              )}
              rules={{
                required: "Offset is required",
                min: {
                  value: -2000,
                  message: "Offset must be greater than -2000"
                },
                max: {value: 2000, message: "Offset cannot exceed 2000"}
              }}></Controller>
          </FormGroup>
        </ControlGroup>
      </Section>
    </ControlGroup>
  );
};

export default VisualForm;
