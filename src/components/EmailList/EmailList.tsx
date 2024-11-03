import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Email } from '../../types/email.types';
import Button from '../Button';

const StyledEmailList = styled.div`
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
    gap: 16px;
    overflow: hidden;
`;

const Folder = () => <span>📁</span>;

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

export type EmailListProps = {
    className?: string;
    emails: Email[];
    selectedDir?: string;
    selectedEmail?: Email;
    onOpen: () => void;
    onEmailSelected: (email: Email) => void;
};

const EmailList = ({
    className,
    emails,
    selectedDir,
    selectedEmail,
    onEmailSelected,
    onOpen,
}: EmailListProps) => (
    <StyledEmailList className={className}>
        <EmailListHeader>
            <EmailListHeaderSection>
                <EmailListTitle>Emails</EmailListTitle>
                <Button onClick={onOpen}>
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
                onClick={() => onEmailSelected(email)}
            >
                <EmailSubject>{email.subject || 'No Subject'}</EmailSubject>
                <EmailFrom>From: {email.from || 'Unknown Sender'}</EmailFrom>
                <EmailTo>To: {email.to || 'Unknown Recipient'}</EmailTo>
                <EmailDate>{email.date?.toLocaleDateString()}</EmailDate>
                <EmailFilename>{email.filename}</EmailFilename>
            </EmailItem>
        ))}
    </StyledEmailList>
);

export default EmailList;
