import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/text';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip, Dialog, DialogFooter, Classes, Icon } from "@blueprintjs/core";
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';
import DiagramHandler from '../vanilla/diagramHandler';
import SVGElement, { ISVGElement } from '../vanilla/svgElement';
import { svgPulses } from '../vanilla/default/data/svgPulse';
import { dataTypes } from '@data-driven-forms/react-form-renderer';
import { ClassProperties, UpdateObj } from '../vanilla/util';
import Channel from '../vanilla/channel';
import { Visual } from '../vanilla/visual';
import Labellable from '../vanilla/labellable';
import VisualForm from './VisualForm';
import { FormRequirements } from './FormHolder';
import ENGINE from '../vanilla/engine';
import { myToaster } from '../App';
import SchemeManager from '../vanilla/default';

interface ISVGElementFormProps extends FormRequirements {

}


const SVGElementForm: React.FC<ISVGElementFormProps> = (props) => {
    const formControls = useFormContext<ISVGElement>();
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [svgReference, setSvgReference] = useState("");
    const [schemeName, setSchemeName] = useState(SchemeManager.DefaultSchemeName)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (file.type === "image/svg+xml" || file.name.endsWith('.svg')) {
            setSelectedFile(file);
        } else {
            myToaster.show({
                message: "Please select an SVG file",
                intent: "warning"
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadSVG = () => {
        if (selectedFile && svgReference.trim()) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const svgString = e.target?.result as string;
                    ENGINE.schemeManager.addSVGStrData(svgString, svgReference.trim(), schemeName);
                    
                    myToaster.show({
                        message: "SVG uploaded successfully",
                        intent: "success"
                    });
                    
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                    setSvgReference("");
                } catch (error) {
                    console.error(error);
                    myToaster.show({
                        message: "Error uploading SVG file",
                        intent: "danger"
                    });
                }
            };
            reader.readAsText(selectedFile);
        } else {
            myToaster.show({
                message: "Please select an SVG file and provide a reference name",
                intent: "warning"
            });
        }
    };

    return (
    <>
        {/* SVG Specific fields */}
        <FormGroup
            fill={false}
            inline={true}
            label="SVG"
            labelFor="text-input">
            <ControlGroup>
                <Controller defaultValue='180' control={formControls.control} name="svgDataRef" render={({field}) => (
                    <HTMLSelect {...field} iconName='caret-down'>
                        {Object.keys(ENGINE.AllSvgStrings).map((ref) => {
                            return <option key={ref} value={ref}>{ref}</option>
                        })}
                    </HTMLSelect>
                )} 
                >
                </Controller>
                <Button 
                    icon="plus" 
                    onClick={() => setIsUploadDialogOpen(true)}
                    title="Add new SVG"
                />
            </ControlGroup>
        </FormGroup>
        
        <VisualForm target={props.target} heightDisplay={true} widthDisplay={true}></VisualForm>

        {/* Upload SVG Dialog */}
        <Dialog
            isOpen={isUploadDialogOpen}
            onClose={() => {
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
                setSvgReference("");
            }}
            title="Upload SVG File"
            icon="upload"
        >
            <div className={Classes.DIALOG_BODY}>
                <FormGroup
                    label="Reference Name"
                    labelFor="reference-input"
                >
                    <InputGroup
                        id="reference-input"
                        value={svgReference}
                        onChange={(e) => setSvgReference(e.target.value)}
                        placeholder="Enter reference name..."
                    />
                </FormGroup>

                <FormGroup
                    label="Add to scheme"
                    labelFor="scheme-input"
                >
                    <HTMLSelect
                        id="scheme-input"
                        value={svgReference}
                        onChange={(e) => setSchemeName(e.target.value)}>
                            {ENGINE.schemeManager.schemeNames.map((name) => {
                                return <option key={name} value={name}>{name}</option>
                            })}
                        </HTMLSelect>
                </FormGroup>
                
                <div
                    style={{
                        border: `2px dashed ${isDragOver ? '#137cbd' : '#c1c1c1'}`,
                        borderRadius: '8px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '16px'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {selectedFile ? (
                        <div style={{ width: '100%' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                backgroundColor: '#e1f5fe',
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #b3e5fc'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon icon="document" size={16} style={{ marginRight: '8px' }} />
                                    <span style={{ fontWeight: '500' }}>{selectedFile.name}</span>
                                </div>
                                <Button
                                    icon="cross"
                                    minimal
                                    small
                                    onClick={removeFile}
                                    style={{ marginLeft: '8px' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Icon icon="upload" size={48} style={{ marginBottom: '16px', color: '#5c7080' }} />
                            <p style={{ marginBottom: '16px', color: '#5c7080' }}>
                                Drag and drop an SVG file here, or
                            </p>
                            <Button
                                icon="folder-open"
                                intent="primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose File
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".svg"
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                        </>
                    )}
                </div>
            </div>
            
            <DialogFooter
                actions={
                    <>
                        <Button 
                            text="Cancel" 
                            onClick={() => {
                                setIsUploadDialogOpen(false);
                                setSelectedFile(null);
                                setSvgReference("");
                            }} 
                        />
                        <Button 
                            text="Upload" 
                            intent="primary" 
                            onClick={handleUploadSVG}
                            disabled={!selectedFile || !svgReference.trim()}
                        />
                    </>
                }
            />
        </Dialog>
    </>
    );
}

    
export default SVGElementForm