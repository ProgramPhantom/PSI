import { Card } from '@blueprintjs/core';
import React from 'react';
import { FormDiagramInterface } from './form/FormDiagramInterface';
import { AllComponentTypes } from './vanilla/diagramHandler';
import { Visual } from './vanilla/visual';


interface IFormProps {
    target?: Visual,
    changeTarget: (val: Visual | undefined) => void
}

const Form: React.FC<IFormProps> = (props) => {
    var targetType: AllComponentTypes = props.target ? (props.target.constructor as typeof Visual).ElementType : "channel"

    return (
        <>
        <Card style={{ padding: "4px 12px", height: "100%",  overflow: "hidden", display: "flex", flexDirection: 
            "column", borderLeft: "1px solid #c3c3c4"}}>
                <FormDiagramInterface target={props.target} changeTarget={props.changeTarget} targetType={targetType}/>
        </Card>
            
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form // ?
}

export default Form