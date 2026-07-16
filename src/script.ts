import type { DataStore } from './datastore.js';
import { GridApplication } from './gridApplication.js';

declare global {
    interface Window {
        __gridAppInstance?: GridApplication;
        __datastore?: DataStore;
    }
}


function initializeGrid() {
    if (window.__gridAppInstance) {
        window.__gridAppInstance.destroy();
    } else {
        window.__gridAppInstance = new GridApplication();
    }
}

if (typeof document !== 'undefined' && document.getElementById('my-grid-canvas')) {
    initializeGrid();
}