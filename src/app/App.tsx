import { useCallback, useEffect, useState } from 'react';
import { Email } from '../types/email.types';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

const EmailClient = styled.div`
    display: flex;
    height: 100vh;
    font-family: Arial, sans-serif;
    color: #333;
    background-color: #f5f5f5;
`;

const EmailList = styled.div`
    flex-shrink: 0;
    width: 350px;
    background-color: #fff;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
`;

const EmailListHeader = styled.div`
    padding: 20px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    overflow: hidden;
`;

const EmailListHeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const EmailListHeaderPath = styled.div`
    font-size: 0.9em;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const EmailListTitle = styled.h2`
    margin: 0;
`;

const EmailItem = styled.div<{ selected: boolean; hasTo?: boolean }>`
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    cursor: pointer;
    transition: background-color 0.3s ease;
    background-color: ${(props) =>
        props.selected ? '#e8f0fe' : 'transparent'};
    ${({ hasTo }) =>
        !hasTo &&
        css`
            opacity: 0.5;
        `}

    &:hover {
        background-color: #f9f9f9;
    }
`;

const EmailSubject = styled.div`
    font-weight: bold;
    margin-bottom: 5px;
`;

const EmailFrom = styled.div`
    font-size: 0.9em;
    color: #666;
`;

const EmailTo = styled.div`
    font-size: 0.9em;
    color: #666;
`;

const EmailDate = styled.div`
    font-size: 0.8em;
    color: #999;
    margin-top: 5px;
`;

const EmailFilename = styled.div`
    font-size: 0.8em;
    color: #999;
    font-style: italic;
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
const Folder = () => <span>📁</span>;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    background-color: #1a73e8;
    font-size: 1em;
`;

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

    const _onOpen = useCallback(async () => {
        const { dir, emails } = (await window.electronAPI.openDir()) ?? {};
        setSelectedDir(dir);
        setEmails(emails ?? []);
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

    const _onToggleJsonView = useCallback(() => {
        setIsJsonViewShown((currentIsJsonViewShown) => !currentIsJsonViewShown);
    }, []);

    return (
        <EmailClient>
            <EmailList>
                <EmailListHeader>
                    <EmailListHeaderSection>
                        <EmailListTitle>Emails</EmailListTitle>
                        <Button onClick={_onOpen}>
                            <Folder />
                            Open...
                        </Button>
                    </EmailListHeaderSection>
                    <EmailListHeaderPath title={selectedDir}>
                        {selectedDir || 'No directory selected'}
                    </EmailListHeaderPath>
                </EmailListHeader>
                {emails.map((email, index) => (
                    <EmailItem
                        key={index}
                        hasTo={!!email.to}
                        selected={selectedEmail === email}
                        onClick={() => setSelectedEmail(email)}
                    >
                        <EmailSubject>
                            {email.subject || 'No Subject'}
                        </EmailSubject>
                        <EmailFrom>
                            From: {email.from || 'Unknown Sender'}
                        </EmailFrom>
                        <EmailTo>To: {email.to || 'Unknown Recipient'}</EmailTo>
                        <EmailDate>
                            {email.date?.toLocaleDateString()}
                        </EmailDate>
                        <EmailFilename>{email.filename}</EmailFilename>
                    </EmailItem>
                ))}
            </EmailList>
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
