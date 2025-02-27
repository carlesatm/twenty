import isPropValid from '@emotion/is-prop-valid';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Pill } from '@ui/components/Pill/Pill';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { useIsMobile } from '@ui/utilities';
import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '@ui/feedback';

export type ButtonSize = 'medium' | 'small';
export type ButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonAccent = 'default' | 'blue' | 'danger';

export type ButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  inverted?: boolean;
  size?: ButtonSize;
  position?: ButtonPosition;
  accent?: ButtonAccent;
  soon?: boolean;
  justify?: 'center' | 'flex-start' | 'flex-end';
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  target?: string;
  dataTestId?: string;
  hotkeys?: string[];
  ariaLabel?: string;
  loading?: boolean;
} & React.ComponentProps<'button'>;

const StyledButton = styled('button', {
  shouldForwardProp: (prop) =>
    !['fullWidth'].includes(prop) && isPropValid(prop),
})<
  Pick<
    ButtonProps,
    | 'fullWidth'
    | 'variant'
    | 'inverted'
    | 'size'
    | 'position'
    | 'accent'
    | 'focus'
    | 'justify'
    | 'to'
    | 'target'
    | 'loading'
  >
>`
  align-items: center;
  ${({ theme, variant, inverted, accent, disabled, focus }) => {
    switch (variant) {
      case 'primary':
        switch (accent) {
          case 'default':
            return css`
              background: ${!inverted
                ? theme.background.secondary
                : theme.background.primary};
              border-color: ${!inverted
                ? !disabled && focus
                  ? theme.color.blue
                  : theme.background.transparent.light
                : theme.background.transparent.light};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
                : theme.font.color.secondary};
              &:hover {
                background: ${!inverted
                  ? theme.background.tertiary
                  : theme.background.secondary};
              }
              &:active {
                background: ${!inverted
                  ? theme.background.quaternary
                  : theme.background.tertiary};
              }
            `;
          case 'blue':
            return css`
              background: ${!inverted
                ? theme.color.blue
                : theme.background.primary};
              border-color: ${!inverted
                ? focus
                  ? theme.color.blue
                  : theme.background.transparent.light
                : theme.background.transparent.light};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted ? theme.grayScale.gray0 : theme.color.blue};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? theme.color.blue50
                        : theme.background.secondary};
                    }
                    &:active {
                      background: ${!inverted
                        ? theme.color.blue60
                        : theme.background.tertiary};
                    }
                  `}
            `;
          case 'danger':
            return css`
              background: ${!inverted
                ? theme.color.red
                : theme.background.primary};
              border-color: ${!inverted
                ? focus
                  ? theme.color.red
                  : theme.background.transparent.light
                : theme.background.transparent.light};
              border-width: 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.color.red10
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted ? theme.background.primary : theme.color.red};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? theme.color.red40
                        : theme.background.secondary};
                    }
                    &:active {
                      background: ${!inverted
                        ? theme.color.red50
                        : theme.background.tertiary};
                    }
                  `}
            `;
        }
        break;
      case 'secondary':
      case 'tertiary':
        switch (accent) {
          case 'default':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? !disabled && focus
                    ? theme.color.blue
                    : theme.background.transparent.medium
                  : focus
                    ? theme.color.blue
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? theme.grayScale.gray0
                    : theme.background.transparent.primary
                  : focus
                    ? theme.grayScale.gray0
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
                : theme.font.color.inverted};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.transparent.light
                    : 'transparent'
                  : theme.background.transparent.light};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.transparent.light
                    : 'transparent'
                  : theme.background.transparent.medium};
              }
            `;
          case 'blue':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? focus
                    ? theme.color.blue
                    : theme.accent.primary
                  : focus
                    ? theme.color.blue
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? theme.grayScale.gray0
                    : theme.background.transparent.primary
                  : focus
                    ? theme.grayScale.gray0
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.color.blue
                  : theme.accent.accent4060
                : theme.font.color.inverted};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? theme.accent.tertiary
                    : 'transparent'
                  : theme.background.transparent.light};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? theme.accent.secondary
                    : 'transparent'
                  : theme.background.transparent.medium};
              }
            `;
          case 'danger':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? focus
                    ? theme.color.red
                    : theme.border.color.danger
                  : focus
                    ? theme.color.red
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? theme.grayScale.gray0
                    : theme.background.transparent.primary
                  : focus
                    ? theme.grayScale.gray0
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.color.red10
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? theme.font.color.danger
                : theme.font.color.inverted};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.danger
                    : 'transparent'
                  : theme.background.transparent.light};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.danger
                    : 'transparent'
                  : theme.background.transparent.medium};
              }
            `;
        }
    }
  }}

  text-decoration: none;
  border-radius: ${({ position, theme }) => {
    switch (position) {
      case 'left':
        return `${theme.border.radius.sm} 0px 0px ${theme.border.radius.sm}`;
      case 'right':
        return `0px ${theme.border.radius.sm} ${theme.border.radius.sm} 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return theme.border.radius.sm;
    }
  }};
  border-style: solid;
  border-width: ${({ variant, position }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return position === 'middle' ? '1px 0px' : '1px';
      case 'tertiary':
        return '0';
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify};
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)}`;
  }};

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  text-overflow: ellipsis;

  &:focus {
    outline: none;
  }
`;

const StyledButtonWrapper = styled.div<{ loading: boolean }>`
  max-width: ${({ loading, theme }) =>
    loading ? `calc(100% - ${theme.spacing(6)} - 10px)` : 'none'};

  position: relative;
`;

const StyledSoonPill = styled(Pill)`
  margin-left: auto;
`;

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ theme, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.border.color.blue;
      case 'danger':
        return theme.border.color.danger;
      default:
        return theme.font.color.light;
    }
  }};
  height: ${({ theme, buttonSize }) =>
    theme.spacing(buttonSize === 'small' ? 2 : 4)};
  margin: 0;
  width: 1px;
`;

const StyledLoader = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing(2)};
  top: 50%;
  transform: translateY(-50%);
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(3)};
`;

const StyledShortcutLabel = styled.div<{
  variant: ButtonVariant;
  accent: ButtonAccent;
}>`
  color: ${({ theme, variant, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.border.color.blue;
      case 'danger':
        return variant === 'primary'
          ? theme.border.color.danger
          : theme.color.red40;
      default:
        return theme.font.color.light;
    }
  }};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledIcon = styled.div<{
  loading: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ loading }) => (loading ? 0 : 1)};
`;

const StyledText = styled.div<{ loading: boolean }>`
  max-width: ${({ loading, theme }) =>
    loading ? `calc(100% - ${theme.spacing(3)} - 10px)` : '100%'};
  overflow: hidden;
  text-overflow: ellipsis;
  transform: ${({ theme, loading }) =>
    loading ? `translateX(${theme.spacing(3)})` : 'none'};
  transition: transform 0.3s;
  white-space: nowrap;
`;

export const Button = ({
  className,
  Icon,
  title,
  fullWidth = false,
  variant = 'primary',
  inverted = false,
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  soon = false,
  disabled = false,
  justify = 'flex-start',
  focus: propFocus = false,
  onClick,
  to,
  target,
  dataTestId,
  hotkeys,
  ariaLabel,
  type,
  loading = false,
}: ButtonProps) => {
  const theme = useTheme();

  const isMobile = useIsMobile();

  const [isFocused, setIsFocused] = useState(propFocus);

  return (
    <StyledButtonWrapper loading={loading}>
      {loading && (
        <StyledLoader>
          <Loader />
        </StyledLoader>
      )}
      <StyledButton
        fullWidth={fullWidth}
        variant={variant}
        inverted={inverted}
        position={position}
        disabled={soon || disabled}
        focus={isFocused}
        justify={justify}
        accent={accent}
        className={className}
        onClick={onClick}
        to={to}
        as={to ? Link : 'button'}
        target={target}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        type={type}
        loading={loading}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {Icon && (
          <StyledIcon loading={loading}>
            <Icon size={theme.icon.size.sm} />
          </StyledIcon>
        )}
        <StyledText loading={loading}>{title}</StyledText>
        {hotkeys && !isMobile && (
          <>
            <StyledSeparator buttonSize={size} accent={accent} />
            <StyledShortcutLabel variant={variant} accent={accent}>
              {hotkeys.join(getOsShortcutSeparator())}
            </StyledShortcutLabel>
          </>
        )}
        {soon && <StyledSoonPill label="Soon" />}
      </StyledButton>
    </StyledButtonWrapper>
  );
};
