import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import LabelForm from './LabelForm';
import SequenceHandler from '../vanilla/sequenceHandler';
import { IChannel } from '../vanilla/channel';
import { defaultChannel } from '../vanilla/default/data';


function ChannelForm(props: {sequence: SequenceHandler}) {  
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<IChannel>({
        defaultValues: {...(defaultChannel as any)},
        mode: "onChange"
    });
  
    function onSubmit(data: IChannel) {
        alert(data);
        props.sequence.channel(data.identifier, data);
    }

    return (
        <form onChange={() => {console.log("CHANGE")}} onSubmit={handleSubmit(onSubmit)}>
            <h3>New Channel</h3>

            <Tabs defaultSelectedTabId={"core"} animate={false} vertical={false}>
                <Tab id={"core"} title="Core" panel={
                    <ControlGroup vertical={true}>
                        {/* Identifier */}
                        <FormGroup fill={false}
                            inline={true}
                            label="Text"
                            helperText="Channel identifier"
                            labelFor="text-input">
                            
                            <Controller control={control} name="identifier" render={({field}) => (
                                <InputGroup {...field} id="text" placeholder="h" small={true} />
                                )}>
                            </Controller>

                        </FormGroup>

                        {/* Padding */}
                        <Section style={{borderRadius: 0}}
                            collapseProps={{defaultIsOpen: false}}
                            compact={true}
                            title={"Padding"}
                            collapsible={true}
                            >
                            <ControlGroup
                                vertical={true}
                                style={{gap: 10}}
                                >
                                <FormGroup
                                fill={false}
                                inline={true}
                                label="Padding top"
                                labelFor="text-input">
                                <Controller control={control} name="padding.0" render={({field}) => (
                                    <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
                                </Controller>
                                </FormGroup>

                                <FormGroup
                                fill={false}
                                inline={true}
                                label="Padding right"
                                labelFor="text-input">
                                <Controller control={control} name="padding.1" render={({field}) => (
                                    <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
                                </Controller>
                                </FormGroup>

                                <FormGroup
                                fill={false}
                                inline={true}
                                label="Padding bottom"
                                labelFor="text-input">
                                <Controller control={control} name="padding.2" render={({field}) => (
                                    <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
                                </Controller>
                                </FormGroup>

                                <FormGroup
                                fill={false}
                                inline={true}
                                label="Padding left"
                                labelFor="text-input">
                                <Controller control={control} name="padding.3" render={({field}) => (
                                    <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
                                </Controller>
                                </FormGroup>
                            </ControlGroup>
                        </Section>

                        {/* Offset */}
                        <Section style={{borderRadius: 0}}
                            collapseProps={{defaultIsOpen: false}}
                            compact={true}
                            title={"Offset"}
                            collapsible={true}
                            >
                            <ControlGroup
                                vertical={true}
                                >
                                <FormGroup
                                fill={false}
                                inline={true}
                                label="Offset X"
                                labelFor="text-input">
                                <Controller control={control} name="offset.0" render={({field}) => (
                                    <NumericInput {...field} onValueChange={field.onChange} min={-50} max={50} small={true}></NumericInput>)}>
                                </Controller>
                                </FormGroup>

                                <FormGroup
                                fill={false}
                                inline={true}
                                label="Offset Y"
                                labelFor="text-input">
                                <Controller control={control} name="offset.1" render={({field}) => (
                                    <NumericInput {...field} onValueChange={field.onChange} min={-50} max={50} small={true}></NumericInput>)}>
                                </Controller>
                                </FormGroup>
                            </ControlGroup>
                        </Section>
                    </ControlGroup>
                    }>
                </Tab>

                <Tab id="label" title="Label" panel={<LabelForm control={control} change={props.change}></LabelForm>}/>

            </Tabs>

            <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
                    type={"submit"}>

            </input>
        </form>
    );
}

    
export default ChannelForm