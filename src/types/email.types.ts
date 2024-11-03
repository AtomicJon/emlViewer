export type OpenDirResponse = {
    dir: string;
    emails: Email[];
};

export type GetAttachmentUrlArgs = {
    dir: string;
    filename: string;
    cid: string;
};

export type Email = {
    filename: string;
    from?: string;
    to?: string;
    cc?: string;
    subject?: string;
    date?: Date;
    text?: string;
    html?: string | boolean;
    textAsHtml?: string;
    attachments?: {
        cid: string;
        contentType: string;
        filename: string;
        size: number;
    }[];
};
