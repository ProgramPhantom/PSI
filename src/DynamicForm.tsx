import React, { ChangeEvent, ReactNode, useState } from 'react'
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import componentMapper from '@data-driven-forms/mui-component-mapper/component-mapper';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';

import {simplePulseSchema} from "./vanilla/default/types/simplePulseSchema";
import {svgPulseSchema} from "./vanilla/default/types/svgPulseSchema";
import {spanSchema} from "./vanilla/default/types/spanSchema";
import {abstractSchema} from "./vanilla/default/types/abstractSchema";
import { bracketSchema } from './vanilla/default/types/bracketSchema';
import { channelSchema } from './vanilla/default/types/channelSchema';

import { simplePulses } from './vanilla/default/data/simplePulse';
import { svgPulses } from './vanilla/default/data/svgPulse';

import { Field, FormTemplateRenderProps, Schema, useFormApi } from '@data-driven-forms/react-form-renderer';
import SequenceHandler from './vanilla/sequenceHandler';
import { sectionSchema } from './vanilla/default/types/sectionSchema';
import { lineSchema } from './vanilla/default/types/lineSchema';
import LabelForm from './form/LabelForm';
import { Tab, Tabs, TabsExpander } from '@blueprintjs/core';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import ArrowForm from './form/ArrowForm';
import SimpleForm from './form/SimpleForm';

import { allTemporal } from './vanilla/default/data';
import { simplePulseInterface } from './vanilla/pulses/simple/simplePulse';
import { svgPulseInterface } from './vanilla/pulses/image/svgPulse';
import { channelInterface } from './vanilla/channel';
import SVGForm from './form/SVGForm';


type ElementType = simplePulseInterface | svgPulseInterface | channelInterface;


function DynamicForm(props: {AddCommand: (line: string) => void, commandName: string, channelName: string,}) {

    var defaultValues = allTemporal[props.commandName as keyof typeof allTemporal];
    
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<ElementType>({
        defaultValues: {...(defaultValues as any)},
        mode: "onChange"
    });
    
    var currSchema;
    var relevantForm = <h1>BROKEN</h1>;
    if (Object.keys(simplePulses).includes(props.commandName)) {
        relevantForm = <SimpleForm control={control} change={changedForm}></SimpleForm>
    } else if (Object.keys(svgPulses).includes(props.commandName)) {
        relevantForm = <SVGForm control={control} change={changedForm}></SVGForm>
    } else if (props.commandName === "span") {
        currSchema = spanSchema({...(allTemporal[props.commandName as keyof typeof allTemporal] as any)});
    } else if (props.commandName === "abstract") {
         currSchema = abstractSchema({...(allTemporal[props.commandName as keyof typeof allTemporal] as any)});
    } else if (props.commandName === "[" || props.commandName === "]") {
        currSchema = bracketSchema({...(SequenceHandler.ChannelUtil[props.commandName] as any)})
    } else if (props.commandName === "section") {
        currSchema = sectionSchema({...(SequenceHandler.ContentCommands[props.commandName] as any)})
    } else if (props.commandName === "~") {
        currSchema = channelSchema({...(SequenceHandler.ChannelUtil[props.commandName] as any)})
    } else if (props.commandName === "|") {
        currSchema = lineSchema({...(SequenceHandler.ChannelUtil[props.commandName] as any)})
    }



    console.log(control._defaultValues)

    function changedForm() {
        console.log("changed");
    }
    
    const onSubmit = (data: FieldValues) => {
        
        CreateCommand(data)
    };

    
    function CreateCommand(values: any) {
        if (Object.keys(SequenceHandler.ChannelUtil).includes(props.commandName)) {
            // Special command!
            if (props.commandName === "~") {
                var command = props.commandName + dirty.values.identifier + "(";
                delete dirty.dirtyFields.identifier;
            } else {
                var command = props.commandName + props.channelName + "(";
            }
            
        } else {
            var command = props.channelName + "." + props.commandName + "(";
        }


        var toInclude: string[] = [];

       //for (const kv of Object.entries(dirty.dirtyFields)) {
       //    toInclude.push(kv[0]);
       //}  // Collect changed fields


        
        toInclude.forEach((prop) => {
            var subProps = prop.split(".");
            var obj = {...f.values};
            while(subProps.length) { obj = obj[subProps.shift()!]; }  // Access argument from prop names
            command += prop + "=" + obj + ",";
        })

        
        var prefix = "";
        var tempVal = {}
        function buildCommand(dirties: any, values: any, currPrefix: string) {
            Object.entries(dirties).forEach(([k, v]) => {
                
                console.log(values);
                console.log(dirties);

                ;
                if (typeof v === "object" && 
                    !Array.isArray(v) &&
                    v !== null) { // If object but not array
                    
                    buildCommand(v, values[k], currPrefix + k + ".");
                } else {
                    

                    
                    if (Array.isArray(values[k])) {
                        command += currPrefix + k + "=[" + values[k] as string + "],";
                    } else if (parseInt(values[k] as string)) {
                        command += currPrefix  + k + "=" + values[k] as string + ",";
                    } else {
                        command += currPrefix + k + '="' + values[k] as string + '",';
                    }
                    
                    
                }}
            )
        }
        buildCommand(dirtyFields, values, "")
        command += ")";
        

        props.AddCommand(command);
    }
    

    return (
        
        <>
        {/*
        <FormRenderer schema={currSchema}
                        componentMapper={componentMapper}
                        FormTemplate={FormTemplate}
                        onSubmit={(values, form) => CreateCommand(form.getState())}
                        
        ></FormRenderer>*/}
        <form onSubmit={control.handleSubmit(onSubmit)}>
            {relevantForm}

            <input type={"submit"}></input>
        </form>
        
        
        </>
    )
}

export default DynamicForm