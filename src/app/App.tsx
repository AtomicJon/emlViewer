import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import Button from '../components/Button';
import EmailList from '../components/EmailList';
import { Email } from '../types/email.types';

const EmailClient = styled.div`
    display: flex;
    height: 100vh;
    font-family: Arial, sans-serif;
    color: #333;
    background-color: #f5f5f5;
`;

const EmailDetails = styled.div`
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #fff;
`;

const EmailDetailsHeader = styled.h2`
    margin-top: 0;
    color: #1a73e8;
`;

const EmailInfo = styled.div`
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;

    p {
        margin: 5px 0;
    }
`;

const EmailContent = styled.div`
    background-color: #fff;
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #e0e0e0;
`;

const EmailAttachments = styled.div`
    margin-top: 20px;

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin-bottom: 5px;
    }
`;

const AttachmentButton = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    color: #1a73e8;
    background-color: transparent;
    border: none;
    cursor: pointer;
`;

const AttachmentIcon = styled.span`
    margin-right: 5px;
`;

const NoEmailSelected = styled.p`
    color: #666;
    font-style: italic;
`;

const PreFormattedText = styled.pre`
    white-space: pre-wrap;
    word-wrap: break-word;
`;

const AttachmentViewer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 800px;
`;

const AttachmentViewerControls = styled.div`
    display: flex;
`;

const AttachmentViewerContent = styled.iframe`
    border: none;
    flex: 1;
`;

const JsonViewToggle = styled.div`
    margin-top: 20px;
    border-top: 1px solid #e0e0e0;
    padding-top: 20px;
`;

const JsonViewContent = styled.pre`
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 12px;
`;

const ChevronDown = () => <span>&#9660;</span>;
const ChevronUp = () => <span>&#9650;</span>;

const App = () => {
    const [selectedDir, setSelectedDir] = useState<string | undefined>();
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | undefined>();
    const [isJsonViewShown, setIsJsonViewShown] = useState(false);
    const [selectedAttachmentName, setSelectedAttachmentName] = useState<
        string | undefined
    >();
    const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();

    useEffect(() => {
        // When the selected email changes, reset the attachment state
        setAttachmentUrl(undefined);
        setSelectedAttachmentName(undefined);
    }, [selectedEmail]);

    // Listen for email messages from the main process
    useEffect(() => {
        const onEmailLoaded = (email: Email) => {
            setEmails((currentEmails) => [...currentEmails, email]);
        };

        window.electronAPI.onEmailLoaded(onEmailLoaded);
        // TODO: Add listener cleanup
    }, []);

    const _onOpen = useCallback(async () => {
        setEmails([]);
        const { dir } = (await window.electronAPI.openDir()) ?? {};
        setSelectedDir(dir);
        console.log('Dir opened', dir);
    }, []);

    const _onOpenAttachment = useCallback(
        async (filename: string, cid: string) => {
            if (!selectedDir) {
                console.error('No directory selected');
                return;
            }
            const url = await window.electronAPI.getAttachmentUrl({
                dir: selectedDir,
                filename,
                cid,
            });
            setAttachmentUrl(url);
        },
        [selectedDir],
    );

    const _onEmailSelected = useCallback((email: Email) => {
        setSelectedEmail(email);
    }, []);

    const _onToggleJsonView = useCallback(() => {
        setIsJsonViewShown((currentIsJsonViewShown) => !currentIsJsonViewShown);
    }, []);

    return (
        <EmailClient>
            <EmailList
                emails={emails}
                selectedDir={selectedDir}
                selectedEmail={selectedEmail}
                onOpen={_onOpen}
                onEmailSelected={_onEmailSelected}
            />
            <EmailDetails>
                {selectedEmail ? (
                    <>
                        <EmailDetailsHeader>
                            {selectedEmail.subject || 'No Subject'}
                        </EmailDetailsHeader>
                        <EmailInfo>
                            <p title={selectedEmail.from}>
                                <strong>From:</strong> {selectedEmail.from}
                            </p>
                            <p title={selectedEmail.to}>
                                <strong>To:</strong> {selectedEmail.to}
                            </p>
                            {selectedEmail.cc && (
                                <p>
                                    <strong>CC:</strong> {selectedEmail.cc}
                                </p>
                            )}
                            <p>
                                <strong>Date:</strong>{' '}
                                {selectedEmail.date?.toLocaleString()}
                            </p>
                            <p>
                                <strong>Filename:</strong>{' '}
                                {selectedEmail.filename}
                            </p>
                        </EmailInfo>
                        <EmailContent>
                            {selectedEmail.html ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: selectedEmail.html as string,
                                    }}
                                />
                            ) : (
                                <PreFormattedText>
                                    {selectedEmail.text}
                                </PreFormattedText>
                            )}
                        </EmailContent>
                        {selectedEmail.attachments &&
                            selectedEmail.attachments.length > 0 && (
                                <EmailAttachments>
                                    <h3>Attachments</h3>
                                    <ul>
                                        {selectedEmail.attachments.map(
                                            (attachment, index) => (
                                                <li key={index}>
                                                    <AttachmentButton
                                                        onClick={() => {
                                                            _onOpenAttachment(
                                                                selectedEmail.filename,
                                                                attachment.cid,
                                                            );
                                                            setSelectedAttachmentName(
                                                                attachment.filename,
                                                            );
                                                        }}
                                                    >
                                                        <AttachmentIcon>
                                                            📎
                                                        </AttachmentIcon>
                                                        {attachment.filename} (
                                                        {Math.round(
                                                            attachment.size /
                                                                1024,
                                                        )}{' '}
                                                        KB)
                                                    </AttachmentButton>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </EmailAttachments>
                            )}
                        {attachmentUrl && (
                            <AttachmentViewer>
                                <AttachmentViewerControls>
                                    <Button
                                        onClick={() =>
                                            setAttachmentUrl(undefined)
                                        }
                                    >
                                        Close {selectedAttachmentName}
                                    </Button>
                                </AttachmentViewerControls>
                                <AttachmentViewerContent src={attachmentUrl} />
                            </AttachmentViewer>
                        )}
                        <JsonViewToggle>
                            <Button onClick={_onToggleJsonView}>
                                {isJsonViewShown ? (
                                    <>
                                        <ChevronUp />
                                        Hide JSON View
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown />
                                        Show JSON View
                                    </>
                                )}
                            </Button>
                            {isJsonViewShown && (
                                <JsonViewContent>
                                    {JSON.stringify(selectedEmail, null, 2)}
                                </JsonViewContent>
                            )}
                        </JsonViewToggle>
                    </>
                ) : (
                    <NoEmailSelected>
                        Select an email to view its contents
                    </NoEmailSelected>
                )}
            </EmailDetails>
        </EmailClient>
    );
};

export default App;
