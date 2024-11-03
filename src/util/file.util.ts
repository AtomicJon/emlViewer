import { app, dialog } from 'electron';
import { readdir, readFile, writeFile } from 'fs/promises';
import { AddressObject, simpleParser } from 'mailparser';
import path from 'path';
import { ATTCH_PROTOCOL } from '../const';
import {
    Email,
    GetAttachmentUrlArgs,
    OpenDirResponse,
} from '../types/email.types';

/**
 * Converts mailparser AddressObject(s) to a comma-separated string of email addresses.
 * @param address The mailparser AddressObject(s) to convert.
 * @returns A comma-separated string of email addresses.
 */
const emailAddressToString = (
    address: AddressObject | AddressObject[],
): string =>
    address === undefined
        ? undefined
        : Array.isArray(address)
          ? address.map(emailAddressToString).join(', ')
          : address.value.map((value) => value.address).join(', ');

/**
 * Opens a dialog to select a directory.
 * @returns The selected directory path, or undefined if the dialog was canceled.
 */
export const getDir = async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return !result.canceled && result.filePaths.length > 0
        ? result.filePaths[0]
        : undefined;
};

/**
 * Loads emails from a directory.
 * @param dir The directory to load emails from.
 * @returns A promise that resolves to an array of Email objects.
 */
export const loadEmails = async (dir: string) => {
    const files = await readdir(dir);
    const emails: Email[] = [];
    for (const filename of files) {
        const contents = await readFile(path.resolve(dir, filename), 'utf8');
        try {
            const parsed = await simpleParser(contents);
            emails.push({
                filename,
                from: emailAddressToString(parsed.from),
                to: emailAddressToString(parsed.to),
                cc: emailAddressToString(parsed.cc),
                subject: parsed.subject,
                date: parsed.date,
                text: parsed.text,
                html: parsed.html,
                textAsHtml: parsed.textAsHtml,
                attachments: parsed.attachments.map((attachment) => ({
                    cid: attachment.cid,
                    contentType: attachment.contentType,
                    filename: attachment.filename,
                    size: attachment.size,
                })),
            });
        } catch (error) {
            console.error(error);
        }
    }
    return emails;
};

/**
 * Gets the content of an attachment.
 * @param emailPath The path to the email file.
 * @param cid The CID of the attachment.
 * @returns A promise that resolves to the content of the attachment as a base64-encoded string.
 */
export const getAttachmentUrl = async ({
    dir,
    filename,
    cid,
}: GetAttachmentUrlArgs): Promise<string | undefined> => {
    const email = await simpleParser(
        await readFile(path.resolve(dir, filename), 'utf8'),
    );
    const attachment = email.attachments.find(
        ({ cid: attachmentCid }) => attachmentCid === cid,
    );
    const tmpPath = path.resolve(app.getPath('temp'), 'attachment');
    await writeFile(tmpPath, attachment.content);
    return `${ATTCH_PROTOCOL}://${tmpPath}`;
};

/**
 * Opens a directory and loads emails from it.
 * @returns A promise that resolves to an array of Email objects, or undefined if the dialog was canceled.
 */
export const openDir = async (): Promise<OpenDirResponse | undefined> => {
    const dir = await getDir();
    if (!dir) {
        return undefined;
    }

    const emails = await loadEmails(dir);
    return { dir, emails };
};
