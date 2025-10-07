import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  DialogFooter,
  FormGroup,
  HTMLSelect,
  InputGroup
} from "@blueprintjs/core";
import React, {useRef, useState} from "react";
import {Controller, useFormContext} from "react-hook-form";
import {myToaster} from "../../app/App";
import SchemeManager from "../../logic/default";
import ENGINE from "../../logic/engine";
import {ISVGElement} from "../../logic/svgElement";
import UploadArea from "../UploadArea";
import {FormRequirements} from "./FormDiagramInterface";
import VisualForm from "./VisualForm";

interface ISVGElementFormProps extends FormRequirements {}

const SVGElementForm: React.FC<ISVGElementFormProps> = (props) => {
  const formControls = useFormContext<ISVGElement>();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [svgReference, setSvgReference] = useState("");
  const [schemeName, setSchemeName] = useState<string>(SchemeManager.InternalSchemeName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
      setSelectedFile(file);
    } else {
      myToaster.show({
        message: "Please select an SVG file",
        intent: "warning"
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle upload
  const handleUploadSVG = () => {
    if (selectedFile && svgReference.trim()) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const svgString = e.target?.result as string;
          ENGINE.schemeManager.addSVGStrData(svgString, svgReference.trim());

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
      <FormGroup fill={false} inline={true} label="SVG" labelFor="text-input">
        <ControlGroup>
          <Controller
            control={formControls.control}
            name="svgDataRef"
            render={({field}) => (
              <HTMLSelect {...field} iconName="caret-down">
                {Object.keys(ENGINE.schemeManager.svgStrings).map((ref) => {
                  return (
                    <option key={ref} value={ref}>
                      {ref}
                    </option>
                  );
                })}
              </HTMLSelect>
            )}></Controller>
          <Button icon="plus" onClick={() => setIsUploadDialogOpen(true)} title="Add new SVG" />
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
        icon="upload">
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label="Reference Name"
            labelFor="reference-input"
            intent={svgReference.trim() === "" ? "danger" : "none"}
            helperText={svgReference.trim() === "" ? "Enter reference" : ""}>
            <InputGroup
              id="reference-input"
              value={svgReference}
              intent={svgReference.trim() === "" ? "danger" : "none"}
              onChange={(e) => setSvgReference(e.target.value)}
              placeholder="Enter reference name..."
            />
          </FormGroup>

          <FormGroup label="Add to scheme" labelFor="scheme-input">
            <HTMLSelect
              id="scheme-input"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}>
              {ENGINE.schemeManager.allSchemeNames.map((name) => {
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </HTMLSelect>
          </FormGroup>

          <UploadArea
            selectedFile={selectedFile}
            onFileSelected={handleFileSelect}
            onRemoveFile={removeFile}
            accept={".svg"}
            promptText={"Drag and drop an SVG file here, or"}
            buttonText={"Choose File"}
            setInputRef={(el) => {
              if (fileInputRef) (fileInputRef as any).current = el;
            }}
            style={{marginTop: "16px"}}
          />
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
};

export default SVGElementForm;
