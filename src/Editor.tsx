import React, { ChangeEvent } from 'react'

type InputEvent = ChangeEvent<HTMLTextAreaElement>;

interface EditorProps {
    Parse(text: string): void,
}

const Editor: React.FC<EditorProps> = ({Parse}: EditorProps) => {
    return (
        <textarea rows={10} cols={100} color='grey' 
                  onChange={(e: InputEvent) => Parse(e.target.value)}></textarea >
    )
}

export default Editor