import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { HotkeysProvider } from '@blueprintjs/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <DndProvider backend={HTML5Backend} debugMode={true}>
        <HotkeysProvider>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </HotkeysProvider>
    </DndProvider>
)
