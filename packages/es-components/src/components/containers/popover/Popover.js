import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Icon from '../../base/icons/Icon';
import Button from '../../controls/buttons/Button';
import Popup from './Popup';

const Container = styled.div`
  display: inline-block;
`;

const PopoverContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  min-width: 270px;
`;

const PopoverHeader = styled.div`
  background-color: ${props =>
    props.hasTitle ? props.theme.colors.popoverHeader : 'none'};
  color: ${props => props.theme.colors.white};
  display: flex;
  justify-content: space-between;
  line-height: ${props => props.theme.sizes.baseLineHeight};
  outline: none;
`;

const TitleBar = styled.h3`
  font-size: 18px;
  margin: 0;
  padding: 8px 14px;
`;

const PopoverBody = styled.div`
  color: ${props => props.theme.colors.gray8};
  font-size: 18px;
  font-weight: normal;
  line-height: ${props => props.theme.sizes.baseLineHeight};
  padding: ${props =>
    props.hasAltCloseWithNoTitle ? '0 14px 8px' : '8px 14px'};
  text-align: right;
`;

const PopoverContent = styled.div`
  margin-bottom: ${props => (props.showCloseButton ? '8px' : '0')};
  text-align: left;
`;

const PopoverCloseButton = styled(Button)`
  display: inline-block;
  width: auto;
`;

const AlternateCloseButton = styled(PopoverCloseButton)`
  background: transparent;
  border: none;
  box-shadow: none;
  color: ${props =>
    props.hasTitle ? props.theme.colors.white : props.theme.colors.grayDark};
  margin: 0;
  margin-left: auto;
  padding: 0 8px;

  &:hover {
    background: transparent;
  }
`;

const CloseHelpText = styled.span`
  color: transparent;
  height: 1px;
  outline: 0;
  width: 1px;
`;

function Popover(props) {
  const {
    name,
    title,
    content,
    placement,
    arrowSize,
    renderTrigger,
    hasCloseButton,
    hasAltCloseButton,
    disableRootClose,
    disableFlipping
  } = props;

  const hasTitle = title !== undefined;
  const hasAltCloseWithNoTitle = !hasTitle && hasAltCloseButton;
  const showCloseButton = hasCloseButton && !hasAltCloseButton;

  const closeBtnRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const popperRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  function toggleShow(event) {
    event.preventDefault();
    event.stopPropagation();

    setTimeout(() => {
      if (contentRef.current) {
        const focusableContent = contentRef.current.querySelector('a, button');
        if (focusableContent) {
          focusableContent.focus();
        } else {
          headerRef.current.focus();
        }
      }
    }, 200);
    if (closeBtnRef.current) {
      triggerBtnRef.current.focus();
    }
    setIsOpen(!isOpen);
  }

  function hidePopover(event) {
    if (isOpen) {
      if (event.type !== 'click') {
        triggerBtnRef.current.focus();
      }
      setIsOpen(false);
    }
  }

  const closeButton = (
    <PopoverCloseButton onClick={toggleShow} ref={closeBtnRef}>
      Close
    </PopoverCloseButton>
  );

  const altCloseButton = (
    <AlternateCloseButton
      aria-label="Close"
      hasTitle={hasTitle}
      onClick={toggleShow}
      ref={closeBtnRef}
    >
      <Icon name="remove" />
    </AlternateCloseButton>
  );

  function hidePopOnScroll() {
    setInterval(() => {
      if (popperRef.current) {
        const bounds = popperRef.current.getBoundingClientRect();
        const inViewport =
          bounds.top >= 90 &&
          bounds.left >= 0 &&
          bounds.right <=
            (window.innerWidth || document.documentElement.clientWidth) &&
          bounds.bottom <=
            (window.innerHeight || document.documentElement.clientHeight);

        if (!inViewport && isOpen) {
          triggerBtnRef.current.focus();
          setIsOpen(false);
        }
      }
    }, 100);
  }

  useEffect(
    () => {
      if (isOpen) {
        window.addEventListener('scroll', hidePopOnScroll);
      } else {
        window.removeEventListener('scroll', hidePopOnScroll);
      }
    },
    [isOpen]
  );

  return (
    <Container>
      <Popup
        name={name}
        trigger={renderTrigger({ ref: triggerBtnRef, toggleShow, isOpen })}
        placement={placement}
        arrowSize={arrowSize}
        onHide={hidePopover}
        transitionIn={isOpen}
        hasTitle={hasTitle}
        disableRootClose={disableRootClose}
        disableFlipping={disableFlipping}
        popperRef={elem => {
          popperRef.current = elem;
        }}
      >
        <PopoverContainer role="dialog" ref={contentRef}>
          <PopoverHeader hasTitle={hasTitle}>
            {hasTitle && <TitleBar>{title}</TitleBar>}
            {hasAltCloseButton && altCloseButton}
            <CloseHelpText
              tabIndex={-1}
              ref={headerRef}
              aria-label="Press escape to close the Popover"
            />
          </PopoverHeader>

          <PopoverBody hasAltCloseWithNoTitle={hasAltCloseWithNoTitle}>
            <PopoverContent showCloseButton={showCloseButton}>
              {content}
            </PopoverContent>
            {showCloseButton && closeButton}
          </PopoverBody>
        </PopoverContainer>
      </Popup>
    </Container>
  );
}

Popover.propTypes = {
  /** The name of the popover. Used for differentiating popovers */
  name: PropTypes.string.isRequired,
  /** The text displayed in the popover title section */
  title: PropTypes.string.isRequired,
  /** The content displayed in the popover body */
  content: PropTypes.node.isRequired,
  /** The placement of the popover in relation to the link */
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  /** The size of the arrow on the popover box */
  arrowSize: PropTypes.oneOf(['sm', 'lg', 'none', 'default']),
  /** Prevents popover from closing when clicked outside of it */
  disableRootClose: PropTypes.bool,
  /** Display a close button in the bottom right of the popover body */
  hasCloseButton: PropTypes.bool,
  /** Display a close ('x') button in the popover title bar */
  hasAltCloseButton: PropTypes.bool,
  /** Function returning a button component to be used as the popover trigger */
  renderTrigger: PropTypes.func.isRequired,
  /** Disables popovers ability to change position to stay in viewport */
  disableFlipping: PropTypes.bool
};

Popover.defaultProps = {
  placement: 'bottom',
  arrowSize: 'default',
  disableRootClose: false,
  hasCloseButton: false,
  hasAltCloseButton: false,
  disableFlipping: false
};

export default Popover;
