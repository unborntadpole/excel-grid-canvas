import { GridApplication } from './gridApplication.js';

declare global {
    interface Window {
        __gridAppInstance?: GridApplication;
    }
}

if (window.__gridAppInstance) {
    window.__gridAppInstance.destroy();
} else {
    window.__gridAppInstance = new GridApplication();
}
