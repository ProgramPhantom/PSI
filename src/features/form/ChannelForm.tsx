import {
  ControlGroup,
  Divider,
  FormGroup,
  InputGroup,
  NumericInput,
  Section,
  Slider
} from "@blueprintjs/core";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import {IChannel} from "../../logic/hasComponents/channel";

interface ChanelFormProps {
  onSubmit: (data: IChannel) => void;
}

const ChannelForm: React.FC = () => {
  const formControls = useFormContext<IChannel>();

  return (
    <>
      <ControlGroup vertical={true}>
        {/* Text */}
        <FormGroup
          fill={false}
          inline={true}
          label="Label"
          helperText="LaTeX"
          labelFor="text-input">
          <Controller
            control={formControls.control}
            name={"label.text"}
            render={({field}) => (
              <InputGroup {...field} id="text" placeholder="_1\textrm{H}" size="small" />
            )}></Controller>
        </FormGroup>

        {/* Padding */}
        <Section
          style={{borderRadius: 0}}
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Padding"}
          collapsible={true}>
          <ControlGroup vertical={true} style={{gap: 10}}>
            <FormGroup
              style={{padding: "4px 16px"}}
              fill={false}
              label="Padding top"
              labelFor="text-input">
              <Controller
                control={formControls.control}
                name="padding.0"
                render={({field}) => (
                  <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
                )}></Controller>
            </FormGroup>

            <FormGroup
              style={{padding: "4px 16px"}}
              fill={false}
              label="Padding right"
              labelFor="text-input">
              <Controller
                control={formControls.control}
                name="padding.1"
                render={({field}) => (
                  <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
                )}></Controller>
            </FormGroup>

            <FormGroup
              style={{padding: "4px 16px"}}
              fill={false}
              label="Padding bottom"
              labelFor="text-input">
              <Controller
                control={formControls.control}
                name="padding.2"
                render={({field}) => (
                  <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
                )}></Controller>
            </FormGroup>

            <FormGroup
              style={{padding: "4px 16px", margin: 0}}
              fill={false}
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
              fill={false}
              inline={true}
              label="Offset X"
              labelFor="text-input">
              <Controller
                control={formControls.control}
                name="offset.0"
                render={({field}) => (
                  <NumericInput
                    {...field}
                    min={-50}
                    max={50}
                    onValueChange={field.onChange}
                    size="small"></NumericInput>
                )}></Controller>
            </FormGroup>

            <FormGroup
              style={{padding: "4px 8px", margin: 0}}
              fill={false}
              inline={true}
              label="Offset Y"
              labelFor="text-input">
              <Controller
                control={formControls.control}
                name="offset.1"
                render={({field}) => (
                  <NumericInput
                    {...field}
                    min={-50}
                    max={50}
                    onValueChange={field.onChange}
                    size="small"></NumericInput>
                )}></Controller>
            </FormGroup>
          </ControlGroup>
        </Section>

        {/* Label stuff */}
        <Section
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Style"}
          collapsible={true}>
          <FormGroup label="Thickness" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="style.thickness"
              render={({field}) => (
                <NumericInput
                  {...field}
                  onValueChange={field.onChange}
                  min={1}
                  small={true}
                  fill={true}></NumericInput>
              )}></Controller>
          </FormGroup>

          <Divider></Divider>

          <FormGroup inline={true} label="Fill" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="style.barStyle.fill"
              render={({field}) => <input type={"color"} {...field}></input>}></Controller>
          </FormGroup>

          <FormGroup inline={true} label="Stroke" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="style.barStyle.stroke"
              render={({field}) => <input type={"color"} {...field}></input>}></Controller>
          </FormGroup>

          <FormGroup inline={true} label="Stroke Width" labelFor="text-input">
            <Controller
              control={formControls.control}
              name="style.barStyle.strokeWidth"
              render={({field}) => (
                <NumericInput
                  {...field}
                  onValueChange={field.onChange}
                  min={1}
                  small={true}></NumericInput>
              )}></Controller>
          </FormGroup>
        </Section>
      </ControlGroup>
    </>
  );
};

export default ChannelForm;
