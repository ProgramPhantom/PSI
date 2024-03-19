import React, { ChangeEvent, useState } from 'react'
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import componentMapper from '@data-driven-forms/mui-component-mapper/component-mapper';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';


//import * as schema from "./vanilla/default/types/testSchema.json"
import {simplePulseSchema} from "./vanilla/default/types/simplePulseSchema";
import {svgPulseSchema} from "./vanilla/default/types/svgPulseSchema";
import {spanSchema} from "./vanilla/default/types/spanSchema";
import {abstractSchema} from "./vanilla/default/types/abstractSchema";
import { bracketSchema } from './vanilla/default/types/bracketSchema';
import { channelSchema } from './vanilla/default/types/channelSchema';

import { simplePulses } from './vanilla/default/data/simplePulse';
import { svgPulses } from './vanilla/default/data/svgPulse';
import { allTemporal } from './vanilla/default/data';

import { Schema } from '@data-driven-forms/react-form-renderer';
import SequenceHandler from './vanilla/sequenceHandler';
import { sectionSchema } from './vanilla/default/types/sectionSchema';



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
    }
     


    function CreateCommand(f: any) {
        if (Object.keys(SequenceHandler.ChannelUtil).includes(props.commandName)) {
            // Special command!
            if (props.commandName === "~") {
                var command = props.commandName + f.values.identifier + "(";
                delete f.dirtyFields.identifier;
            } else {
                var command = props.commandName + props.channelName + "(";
            }
            
        } else {
            var command = props.channelName + "." + props.commandName + "(";
        }

        
        var toInclude: string[] = [];

        for (const kv of Object.entries(f.dirtyFields)) {
            toInclude.push(kv[0]);
        }  // Collect changed fields

        toInclude.forEach((prop) => {
            var subProps = prop.split(".");
            var obj = {...f.values};
            while(subProps.length) { obj = obj[subProps.shift()!]; }  // Access argument from prop names
            command += prop + "=" + obj + ",";
        })
        command += ")";

        props.AddCommand(command);
    }

    return (
        
            
        <FormRenderer schema={currSchema}
                        componentMapper={componentMapper}
                        FormTemplate={FormTemplate}
                        onSubmit={(values, form) => CreateCommand(form.getState())}
                        
                        ></FormRenderer>
            
        
    )
}

export default DynamicForm