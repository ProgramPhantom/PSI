import React from 'react'
import { Button, Icon, Text } from '@blueprintjs/core'
import ENGINE from './vanilla/engine'
import { ISVGElement } from './vanilla/svgElement'

export interface SVGUploadListProps {
    elements: Array<{ name: string; element: ISVGElement }>
    uploads: Record<string, string>
    setUploads: React.Dispatch<React.SetStateAction<Record<string, string>>>
    extraSvgStrings?: Record<string, string>
    title?: string
}

const SVGUploadList: React.FC<SVGUploadListProps> = ({ elements, uploads, setUploads, extraSvgStrings, title }) => {
    const svgRefExistsInSchemeManager = (svgRef: string): boolean => {
        const svgString: string | undefined = (ENGINE as any).AllSvgStrings?.[svgRef]
        return svgString !== undefined
    }

    const isSvgRefSatisfied = (svgRef: string): boolean => {
        if (svgRefExistsInSchemeManager(svgRef)) return true
        if (extraSvgStrings && Object.prototype.hasOwnProperty.call(extraSvgStrings, svgRef)) return true
        if (Object.prototype.hasOwnProperty.call(uploads, svgRef)) return true
        return false
    }

    // unique by svgDataRef, but display all entries (per instructions list all uploaded svgs)
    const rows = elements.map(({ name, element }) => {
        const svgDataRef = element.svgDataRef
        const satisfied = svgDataRef ? isSvgRefSatisfied(svgDataRef) : true
        return { name, svgDataRef, satisfied }
    })

    return (
        <div style={{ marginTop: '16px' }}>
            {title && (
                <Text style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>{title}</Text>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rows.map(({ name, svgDataRef, satisfied }) => (
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
                                            const file = e.target.files?.[0]
                                            if (!file || !svgDataRef) return
                                            const r = new FileReader()
                                            r.onload = (ev) => {
                                                const str = ev.target?.result as string
                                                setUploads((prev) => ({ ...prev, [svgDataRef]: str }))
                                            }
                                            r.readAsText(file)
                                            e.currentTarget.value = ''
                                        }}
                                    />
                                    <Button
                                        icon="upload"
                                        onClick={() => {
                                            const input = document.getElementById(`upload-${name}`) as HTMLInputElement | null
                                            input?.click()
                                        }}
                                    >
                                        Upload SVG
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SVGUploadList


