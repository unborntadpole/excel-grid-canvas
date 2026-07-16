import { DataStore } from './datastore.js';
import { GridApplication } from './gridApplication.js';

declare global {
    interface Window {
        __gridAppInstance?: GridApplication;
        __datastore?: DataStore;
    }
}

if (window.__datastore) {
    //
} else {
    window.__datastore = new DataStore();
}

if (window.__gridAppInstance) {
    window.__gridAppInstance.destroy();
} else {
    window.__gridAppInstance = new GridApplication();
}
