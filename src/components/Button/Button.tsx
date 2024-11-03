import React from 'react';
import styled from '@emotion/styled';

const StyledButton = styled.button`
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

export type ButtonProps = React.ComponentProps<'button'>;

const Button = ({ children, ...rest }: ButtonProps) => (
    <StyledButton {...rest}>{children}</StyledButton>
);

export default Button;
