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
import { allTemporal } from './vanilla/default/data';

import { Field, FormTemplateRenderProps, Schema, useFormApi } from '@data-driven-forms/react-form-renderer';
import SequenceHandler from './vanilla/sequenceHandler';
import { sectionSchema } from './vanilla/default/types/sectionSchema';
import { lineSchema } from './vanilla/default/types/lineSchema';
import LabelForm from './form/LabelForm';
import { Tab, Tabs, TabsExpander } from '@blueprintjs/core';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import ArrowForm from './form/ArrowForm';
import SimpleForm from './form/SimpleForm';

interface template {
    schema: Schema,
    formFields: any
}


function DynamicForm(props: {AddCommand: (line: string) => void, commandName: string, channelName: string,}) {

    var currSchema: Schema = {"fields": []};  // Make this into a dictionary please!!
    if (Object.keys(simplePulses).includes(props.commandName)) {
        currSchema = simplePulseSchema({...(simplePulses[props.commandName as keyof typeof simplePulses] as any)});
    } else if (Object.keys(svgPulses).includes(props.commandName)) {
        currSchema = svgPulseSchema({...(svgPulses[props.commandName as keyof typeof svgPulses] as any)});
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


    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm({
        defaultValues: {
            padding: [0, 1, 0, 1],
            offset: [0, 0],
        
            config: {
                orientation: "top",
                alignment: "centre",
                overridePad: false,
                inheritWidth: false,
                noSections: 1
            },
        
            style: {
                width: 7,
                height: 50,
                fill: "#000000",
                stroke: "black",
                strokeWidth: 0
            },
        
            labelOn: false,
            label: {
                text: "\\mathrm{90}",
                padding: [0, 0, 3, 0], 
                position: "top",
                style: {
                    size: 10,
                    colour: "black"
                }
            },
        
            arrowOn: false,
            arrow: {
                padding: [0, 0, 10, 0],
                position: "top",
                style: {
                    thickness: 2, 
                    headStyle: "default", 
                    stroke: "black"
                }
            }
        },
        mode: "onChange"
    });

    // const data = useWatch();

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


        /*
        toInclude.forEach((prop) => {
            var subProps = prop.split(".");
            var obj = {...f.values};
            while(subProps.length) { obj = obj[subProps.shift()!]; }  // Access argument from prop names
            command += prop + "=" + obj + ",";
        })*/

        
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
            <Tabs defaultSelectedTabId={"core"}>
                <Tab id="core" title="Core" panel={<SimpleForm control={control} change={changedForm}></SimpleForm>} />
                <Tab id="label" title="Label" panel={<LabelForm control={control} change={changedForm}></LabelForm>}/>
                <Tab id="arrow" title="Arrow" panel={<ArrowForm control={control} change={changedForm}></ArrowForm>} />

                <TabsExpander />
            </Tabs>

            <input type={"submit"}></input>
        </form>
        
        
        </>
    )
}

export default DynamicForm