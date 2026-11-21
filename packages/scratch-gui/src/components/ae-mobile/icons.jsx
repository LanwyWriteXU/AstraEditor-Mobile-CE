import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import moreIcon from './icons/icon--more.svg';
import closeIcon from './icons/icon--close.svg';
import backIcon from './icons/icon--back.svg';
import plusIcon from './icons/icon--plus.svg';
import rotateStageIcon from './icons/icon--rotate-stage.svg';
import blocksIcon from './icons/icon--blocks.svg';

import styles from './icons.css';

/**
 * Icons are plain SVG files, not inline markup. They are painted with a CSS mask
 * so the shape comes from the file and the colour comes from `currentColor`,
 * which keeps them working in both light and dark themes.
 *
 * Callers still own the size: pass a className that sets width/height and
 * `background-color: currentColor`.
 */
export const MaskIcon = ({ className, src }) => (
  <span
    aria-hidden="true"
    className={classNames(styles.maskIcon, className)}
    style={{ '--mask-url': `url("${src}")` }}
  />
);

MaskIcon.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string
};

export const MoreIcon = (props) => <MaskIcon {...props} src={moreIcon} />;

export const CloseIcon = (props) => <MaskIcon {...props} src={closeIcon} />;

export const BackIcon = (props) => <MaskIcon {...props} src={backIcon} />;

export const PlusIcon = (props) => <MaskIcon {...props} src={plusIcon} />;

export const RotateStageIcon = (props) => <MaskIcon {...props} src={rotateStageIcon} />;

export const BlocksIcon = (props) => <MaskIcon {...props} src={blocksIcon} />;
