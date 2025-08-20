import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {DndContext} from '@dnd-kit/core';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { HotkeysProvider } from '@blueprintjs/core';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <DndProvider backend={HTML5Backend} debugMode={true}>
        <HotkeysProvider>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </HotkeysProvider>
    </DndProvider>
)
