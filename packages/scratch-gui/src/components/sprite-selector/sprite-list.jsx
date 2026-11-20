import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import DragConstants from '../../lib/drag-constants';

import Box from '../box/box.jsx';
import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import SortableHOC from '../../lib/sortable-hoc.jsx';
import SortableAsset from '../asset-panel/sortable-asset.jsx';
import ThrottledPropertyHOC from '../../lib/throttled-property-hoc.jsx';

import styles from './sprite-selector.css';

const ThrottledSpriteSelectorItem = ThrottledPropertyHOC('asset', 500)(SpriteSelectorItem);

const SpriteList = function (props) {
  const {
    containerRef,
    editingTarget,
    draggingIndex,
    draggingType,
    hoveredTarget,
    onDeleteSprite,
    onDuplicateSprite,
    onExportSprite,
    onSelectSprite,
    onAddSortable,
    onRemoveSortable,
    ordering,
    raised,
    selectedId,
    items
  } = props;

  const isSpriteDrag = draggingType === DragConstants.SPRITE;

  return (
    <Box
      className={classNames(styles.scrollWrapper, {
        [styles.scrollWrapperDragging]: draggingType === DragConstants.BACKPACK_SPRITE,
        // Enables the pure-CSS hover highlight below while a drag is in progress.
        [styles.dragging]: Boolean(draggingType) || Boolean(raised)
      })}
      componentRef={containerRef}
    >
      <Box className={styles.itemsWrapper}>
        {items.map((sprite, index) => {
          // If the sprite has just received a block drop, used for green highlight
          const receivedBlocks =
            hoveredTarget.sprite === sprite.id && sprite.id !== editingTarget && hoveredTarget.receivedBlocks;

          // Only the tile under the pointer is highlighted. Highlighting every tile made
          // the whole panel light up, which read as a full-panel overlay rather than as
          // "this sprite is the one that will receive the drop".
          const isDragging = Boolean(draggingType) || Boolean(raised);
          const isHovered = hoveredTarget.sprite === sprite.id;
          // A sprite may share a costume or sound with itself while one is being dragged
          // (a quirk of 2.0 that allows quick duplication), but a block stack only goes
          // to another sprite.
          const canReceive = Boolean(draggingType) || sprite.id !== editingTarget;
          const isRaised = isDragging && isHovered && canReceive && !receivedBlocks;

          return (
            <SortableAsset
              className={classNames(styles.spriteWrapper, {
                [styles.placeholder]: isSpriteDrag && index === draggingIndex
              })}
              index={isSpriteDrag ? ordering.indexOf(index) : index}
              key={sprite.name}
              onAddSortable={onAddSortable}
              onRemoveSortable={onRemoveSortable}
            >
              <ThrottledSpriteSelectorItem
                asset={sprite.costume && sprite.costume.asset}
                className={classNames(styles.sprite, {
                  [styles.raised]: isRaised,
                  [styles.receivedBlocks]: receivedBlocks
                })}
                dragPayload={sprite.id}
                dragType={DragConstants.SPRITE}
                id={sprite.id}
                index={index}
                key={sprite.id}
                name={sprite.name}
                selected={sprite.id === selectedId}
                onClick={onSelectSprite}
                onDeleteButtonClick={onDeleteSprite}
                onDuplicateButtonClick={onDuplicateSprite}
                onExportButtonClick={onExportSprite}
              />
            </SortableAsset>
          );
        })}
      </Box>
    </Box>
  );
};

SpriteList.propTypes = {
  containerRef: PropTypes.func,
  draggingIndex: PropTypes.number,
  draggingType: PropTypes.oneOf(Object.keys(DragConstants)),
  editingTarget: PropTypes.string,
  hoveredTarget: PropTypes.shape({
    hoveredSprite: PropTypes.string,
    receivedBlocks: PropTypes.bool,
    sprite: PropTypes.string
  }),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      costume: PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string.isRequired,
        bitmapResolution: PropTypes.number.isRequired,
        rotationCenterX: PropTypes.number.isRequired,
        rotationCenterY: PropTypes.number.isRequired
      }),
      name: PropTypes.any, // modified by folders addon
      order: PropTypes.number.isRequired
    })
  ),
  onAddSortable: PropTypes.func,
  onDeleteSprite: PropTypes.func,
  onDuplicateSprite: PropTypes.func,
  onExportSprite: PropTypes.func,
  onRemoveSortable: PropTypes.func,
  onSelectSprite: PropTypes.func,
  ordering: PropTypes.arrayOf(PropTypes.number),
  raised: PropTypes.bool,
  selectedId: PropTypes.string
};

export default SortableHOC(SpriteList);
