// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import {
    Email,
    GetAttachmentUrlArgs,
    OpenDirResponse,
} from './types/email.types';

contextBridge.exposeInMainWorld('electronAPI', {
    openDir: async (): Promise<OpenDirResponse | undefined> => {
        return ipcRenderer.invoke('dialog:openDir');
    },
    getAttachmentUrl: async (
        args: GetAttachmentUrlArgs,
    ): Promise<string | undefined> => {
        return ipcRenderer.invoke('getAttachmentUrl', args);
    },
    onEmailLoaded: (callback: (email: Email) => void) => {
        ipcRenderer.on('email:loaded', (_event, email) => {
            callback(email);
        });
    },
});
