import { Button, Classes, Dialog, DialogBody, DialogFooter, Divider, FormGroup, Icon, InputGroup, Text } from '@blueprintjs/core';
import React from 'react';
import ENGINE from './vanilla/engine';
import { IUserSchemeData } from './vanilla/default';
import { myToaster } from './App';

interface AddSchemeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSchemeCreated: () => void;
}

const AddSchemeDialog: React.FC<AddSchemeDialogProps> = ({ isOpen, onClose, onSchemeCreated }) => {
    const [newSchemeName, setNewSchemeName] = React.useState('');
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [uploadedSchemeData, setUploadedSchemeData] = React.useState<IUserSchemeData | null>(null);
    const [svgUploads, setSvgUploads] = React.useState<Record<string, string>>({});

    const resetState = () => {
        setNewSchemeName('');
        setSelectedFile(null);
        setIsDragOver(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadedSchemeData(null);
        setSvgUploads({});
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileSelect = (file: File) => {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const schemeData = JSON.parse(e.target?.result as string) as IUserSchemeData;
                    setUploadedSchemeData(schemeData);
                    setSvgUploads({});
                } catch (error) {
                    console.error(error);
                    setUploadedSchemeData(null);
                    setSvgUploads({});
                    myToaster.show({ message: 'Invalid JSON file format. Please select a valid scheme file.', intent: 'danger' });
                }
            };
            reader.readAsText(file);
        } else {
            myToaster.show({ message: 'Please select a JSON file', intent: 'warning' });
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
        if (files.length > 0) handleFileSelect(files[0]);
    };
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) handleFileSelect(files[0]);
    };
    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadedSchemeData(null);
        setSvgUploads({});
    };

    const svgRefExistsInSchemeManager = (svgRef: string): boolean => {
        const svgString: string | undefined = (ENGINE as any).AllSvgStrings?.[svgRef];
        return svgString !== undefined;
    };
    const isSvgRefSatisfied = (svgRef: string): boolean => {
        if (svgRefExistsInSchemeManager(svgRef)) return true;
        if (uploadedSchemeData?.svgStrings && Object.prototype.hasOwnProperty.call(uploadedSchemeData.svgStrings, svgRef)) return true;
        if (Object.prototype.hasOwnProperty.call(svgUploads, svgRef)) return true;
        return false;
    };
    const requiredSvgRefs: string[] = React.useMemo(() => {
        if (!uploadedSchemeData?.svgElements) return [];
        const refs = new Set<string>();
        Object.values(uploadedSchemeData.svgElements).forEach((el: any) => {
            if (el?.svgDataRef) refs.add(el.svgDataRef);
        });
        return Array.from(refs);
    }, [uploadedSchemeData]);
    const allSvgsSatisfied: boolean = requiredSvgRefs.length === 0 || requiredSvgRefs.every((r) => isSvgRefSatisfied(r));

    const handleSubmit = () => {
        if (!newSchemeName.trim() || ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim())) return;
        if (selectedFile && uploadedSchemeData) {
            try {
                const mergedScheme: IUserSchemeData = {
                    ...uploadedSchemeData,
                    svgStrings: {
                        ...(uploadedSchemeData.svgStrings ?? {}),
                        ...svgUploads,
                    },
                };
                (ENGINE as any).addScheme(newSchemeName.trim(), mergedScheme);
                onSchemeCreated();
                handleClose();
                myToaster.show({ message: 'Scheme created successfully from JSON file', intent: 'success' });
            } catch (error) {
                console.error(error);
                myToaster.show({ message: 'Failed to create scheme from uploaded data.', intent: 'danger' });
            }
        } else if (!selectedFile) {
            (ENGINE as any).addBlankScheme(newSchemeName.trim());
            onSchemeCreated();
            handleClose();
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Create New Scheme" canOutsideClickClose={true} canEscapeKeyClose={true}>
            <div className={Classes.DIALOG_BODY}>
                <Text>Enter a name for the new scheme:</Text>
                <FormGroup
                    intent={!newSchemeName.trim() || ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ? 'danger' : 'primary'}
                    helperText={!newSchemeName.trim() ? 'Cannot be empty' : (ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ? 'Cannot have duplicate names' : undefined)}
                >
                    <InputGroup
                        intent={!newSchemeName.trim() || ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ? 'danger' : 'primary'}
                        value={newSchemeName}
                        onChange={(e) => setNewSchemeName(e.target.value)}
                        placeholder="Scheme name"
                        style={{ marginTop: '8px' }}
                    />
                </FormGroup>

                <Divider style={{ margin: '16px 0' }} />

                <Text style={{ marginBottom: '12px' }}>Optionally upload a JSON file to populate the scheme:</Text>

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
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {selectedFile ? (
                        <div style={{ width: '100%' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#e1f5fe',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #b3e5fc',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon icon="document" size={16} style={{ marginRight: '8px' }} />
                                    <span style={{ fontWeight: '500' }}>{selectedFile.name}</span>
                                </div>
                                <Button icon="cross" onClick={removeFile} style={{ marginLeft: '8px' }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Icon icon="upload" size={48} style={{ marginBottom: '16px', color: '#5c7080' }} />
                            <p style={{ marginBottom: '16px', color: '#5c7080' }}>Drag and drop a JSON scheme file here, or</p>
                            <Button icon="folder-open" intent="primary" onClick={() => fileInputRef.current?.click()}>
                                Choose File
                            </Button>
                            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileInputChange} style={{ display: 'none' }} />
                        </>
                    )}
                </div>

                {uploadedSchemeData?.svgElements && (
                    <div style={{ marginTop: '16px' }}>
                        <Text style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>SVG requirements</Text>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Object.entries(uploadedSchemeData.svgElements).map(([name, el]) => {
                                const svgDataRef = (el as any).svgDataRef as string | undefined;
                                const satisfied = svgDataRef ? isSvgRefSatisfied((el as any).svgDataRef) : true;
                                return (
                                    <div
                                        key={name}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e1e8ed', borderRadius: 6, padding: '8px 10px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Text style={{ fontWeight: 600 }}>{name}</Text>
                                            {svgDataRef && <Text style={{ color: '#5c7080' }}>svgDataRef: {svgDataRef}</Text>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {satisfied ? (
                                                <Icon icon="tick-circle" intent="success" title="Found" />
                                            ) : (
                                                <>
                                                    <input
                                                        id={`upload-${name}`}
                                                        type="file"
                                                        accept=".svg"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file || !svgDataRef) return;
                                                            const r = new FileReader();
                                                            r.onload = (ev) => {
                                                                const str = ev.target?.result as string;
                                                                setSvgUploads((prev) => ({ ...prev, [svgDataRef]: str }));
                                                            };
                                                            r.readAsText(file);
                                                            e.currentTarget.value = '';
                                                        }}
                                                    />
                                                    <Button
                                                        icon="upload"
                                                        onClick={() => {
                                                            const input = document.getElementById(`upload-${name}`) as HTMLInputElement | null;
                                                            input?.click();
                                                        }}
                                                    >
                                                        Upload SVG
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {!allSvgsSatisfied && (
                            <Text style={{ color: '#a82a2a', marginTop: 8 }}>Please upload missing SVG files before creating the scheme.</Text>
                        )}
                    </div>
                )}
            </div>

            <DialogFooter
                actions={
                    <>
                        <Button text="Cancel" onClick={handleClose} variant="minimal" />
                        <Button
                            text="Create"
                            intent="primary"
                            onClick={handleSubmit}
                            disabled={
                                !newSchemeName.trim() ||
                                ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ||
                                (!!uploadedSchemeData?.svgElements && !allSvgsSatisfied)
                            }
                        />
                    </>
                }
            />
        </Dialog>
    );
};

export default AddSchemeDialog;


