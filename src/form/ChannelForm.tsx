import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, Divider, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import LabelForm from './LabelForm';
import SequenceHandler from '../vanilla/sequenceHandler';
import { IChannel } from '../vanilla/channel';
import { defaultChannel } from '../vanilla/default/data';



function ChannelForm(props: {sequence: SequenceHandler, defaultVals: IChannel}) {  
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm({
        defaultValues: {...(props.defaultVals as any)},
        mode: "onChange"
    });
  
    function onSubmit(data: IChannel) {
        
        props.sequence.channel(data.identifier, data);

        props.sequence.draw();
    }

    return (
        <form onChange={() => {console.log("CHANGE")}} onSubmit={handleSubmit(onSubmit)}>
            <h3>New Channel</h3>

            <Tabs defaultSelectedTabId={"core"} animate={false} vertical={false}>
                <Tab id="core" title="Core" panel={
                    <ControlGroup vertical={true}>
                        { /* Identifier */}
                        <FormGroup
                        fill={false}
                        inline={true}
                        label="Identifier"
                        helperText="Name of channel"
                        labelFor="text-input">
                            <Controller control={control} name="identifier" render={({field}) => (
                                <InputGroup {...field} id="text" placeholder="h" small={true} />
                                )}>
                            </Controller>
                        </FormGroup>
                        
                        {/* Padding */}
                        <Section
                            collapseProps={{defaultIsOpen: false}}
                            compact={true}
                            title={"Padding"}
                            collapsible={true}>
                            <ControlGroup
                                vertical={true}>

                                <FormGroup
                                    fill={false}
                                    inline={true}
                                    label="Padding top"
                                    labelFor="text-input">
                                    <Controller control={control} name="padding.0" render={({field: { onChange, onBlur, value, name, ref },}) => (
                                        <Slider value={value} onChange={onChange} max={30} min={0} labelStepSize={10}></Slider>)}>
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
                
                        <Section 
                            collapseProps={{defaultIsOpen: false}}
                            compact={true}
                            title={"Style"}
                            collapsible={true}>
                            <FormGroup
                                label="Thickness"
                                labelFor="text-input">
                                <Controller control={control} name="style.thickness" render={({field}) => (
                                    <NumericInput {...field} onValueChange={field.onChange} min={1} small={true} fill={true}></NumericInput>)}>
                                </Controller>
                            </FormGroup>

                            <Divider></Divider>
            
                            <FormGroup
                                inline={true}
                                label="Fill"
                                labelFor="text-input">
            
                                <Controller control={control} name="style.barStyle.fill" render={({field}) => (
                                    <input type={"color"} {...field}></input>)}>
                                </Controller>
                            </FormGroup>
            
                            <FormGroup
                                inline={true}
                                label="Stroke"
                                labelFor="text-input">
            
                                <Controller control={control} name="style.barStyle.stroke" render={({field}) => (
                                    <input type={"color"} {...field}></input>)}>
                                </Controller>
                            </FormGroup>
            
                            <FormGroup
                                inline={true}
                                label="Stroke Width"
                                labelFor="text-input">
                                <Controller control={control} name="style.barStyle.strokeWidth" render={({field}) => (
                                    <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                                </Controller>
                            </FormGroup>
                        </Section>
            
                    </ControlGroup>
                }/>

                <Tab id="label" title="Label" panel={<LabelForm control={control} change={() => {}}></LabelForm>}/>

            </Tabs>

            <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
                    type={"submit"}>

            </input>
        </form>
    )
}

export default ChannelForm