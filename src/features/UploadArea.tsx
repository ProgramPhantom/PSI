import { Button, Icon } from '@blueprintjs/core'
import React from 'react'

export interface UploadAreaProps {
    selectedFile: File | null
    onFileSelected: (file: File) => void
    onRemoveFile: () => void
    accept: string
    promptText: string
    buttonText?: string
    setInputRef?: (el: HTMLInputElement | null) => void
    style?: React.CSSProperties
}

const UploadArea: React.FC<UploadAreaProps> = ({
    selectedFile,
    onFileSelected,
    onRemoveFile,
    accept,
    promptText,
    buttonText = 'Choose File',
    setInputRef,
    style,
}) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const localInputRef = React.useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            onFileSelected(files[0])
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            onFileSelected(files[0])
        }
    }

    return (
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
                ...(style ?? {}),
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
                        <Button icon="cross" minimal small onClick={onRemoveFile} style={{ marginLeft: '8px' }} />
                    </div>
                </div>
            ) : (
                <>
                    <Icon icon="upload" size={48} style={{ marginBottom: '16px', color: '#5c7080' }} />
                    <p style={{ marginBottom: '16px', color: '#5c7080' }}>{promptText}</p>
                    <Button icon="folder-open" intent="primary" onClick={() => localInputRef.current?.click()}>
                        {buttonText}
                    </Button>
                    <input
                        ref={(el) => {
                            localInputRef.current = el
                            if (setInputRef) setInputRef(el)
                        }}
                        type="file"
                        accept={accept}
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />
                </>
            )}
        </div>
    )
}

export default UploadArea


