import { createListenerMiddleware } from '@reduxjs/toolkit';
import localforage from 'localforage';
import { addRecentDiagram, removeRecentDiagram } from '../slices/diagramSlice';
import { recentDiagramsSelectors } from '../selectors/diagramSelectors';
import { RootState } from '../rootReducer';

export const diagramListenerMiddleware = createListenerMiddleware();

diagramListenerMiddleware.startListening({
    actionCreator: addRecentDiagram,
    effect: async (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const recentDiagrams = recentDiagramsSelectors.selectAll(state);
        
        // Define the maximum number of recent diagrams
        const RECENT_DIAGRAMS_LIMIT = 10;
        
        // If we exceed the limit, remove the oldest (which will be at the end since we unshift)
        if (recentDiagrams.length > RECENT_DIAGRAMS_LIMIT) {
            // Get all items beyond the limit (usually just 1, but this handles edge cases)
            const itemsToRemove = recentDiagrams.slice(RECENT_DIAGRAMS_LIMIT);
            
            for (const item of itemsToRemove) {
                // Dispatch action to remove it from the store
                listenerApi.dispatch(removeRecentDiagram(item.diagramUUID));
                
                // Delete from localforage
                try {
                    await localforage.removeItem(`diagram-${item.diagramUUID}`);
                    console.log(`Deleted recent diagram ${item.diagramUUID} from localforage due to limit`);
                } catch (error) {
                    console.error(`Failed to delete diagram ${item.diagramUUID} from localforage:`, error);
                }
            }
        }
    }
});
