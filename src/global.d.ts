interface Window {
    electronAPI: {
        openDir: () => Promise<
            import('./types/email.types').OpenDirResponse | undefined
        >;
        getAttachmentUrl: (
            args: import('./types/email.types').GetAttachmentUrlArgs,
        ) => Promise<string | undefined>;
        onEmailLoaded: (
            callback: (email: import('./types/email.types').Email) => void,
        ) => void;
    };
}
