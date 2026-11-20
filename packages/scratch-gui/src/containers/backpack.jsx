import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import BackpackComponent from '../components/backpack/backpack.jsx';
import {
  getBackpackContents,
  saveBackpackObject,
  deleteBackpackObject,
  updateBackpackObject,
  soundPayload,
  costumePayload,
  spritePayload,
  codePayload,
  LOCAL_API
} from '../lib/backpack-api';
import DragConstants from '../lib/drag-constants';
import DropAreaHOC from '../lib/drop-area-hoc.jsx';
import { isOverBackpack } from '../lib/drag-zone';
import installBackpackDropZonePatch from '../lib/backpack-drop-zone';

import { connect } from 'react-redux';
import storage from '../lib/storage';
import VM from 'scratch-vm';

const dragTypes = [DragConstants.COSTUME, DragConstants.SOUND, DragConstants.SPRITE];
const DroppableBackpack = DropAreaHOC(dragTypes)(BackpackComponent);

const messages = defineMessages({
  rename: {
    defaultMessage: 'New name:',
    description: 'Renaming a backpack item',
    id: 'tw.backpack.rename'
  }
});

class Backpack extends React.Component {
  constructor(props) {
    super(props);
    bindAll(this, [
      'handleDrop',
      'handleToggle',
      'handleDelete',
      'handleRename',
      'getBackpackAssetURL',
      'getContents',
      'handleMouseEnter',
      'handleMouseLeave',
      'handlePointerMove',
      'handleTouchMove',
      'updateBlockDragOver',
      'handleBlockDragEnd',
      'handleBlockDragUpdate',
      'notifyResize',
      'handleMore'
    ]);
    this.pointer = { x: 0, y: 0 };
    // True while the list is open because something is being dragged onto it, as opposed
    // to the user opening it by tapping the header.
    this.expandedByDrag = false;
    this.state = {
      // While the DroppableHOC manages drop interactions for asset tiles,
      // we still need to micromanage drops coming from the block workspace.
      // TODO this may be refactorable with the share-the-love logic in SpriteSelectorItem
      blockDragOutsideWorkspace: false,
      blockDragOverBackpack: false,
      error: false,
      itemsPerPage: 20,
      moreToLoad: false,
      loading: false,
      expanded: false,
      contents: []
    };

    // If a host is given, add it as a web source to the storage module
    // TODO remove the hacky flag that prevents double adding
    if (props.host && !storage._hasAddedBackpackSource && props.host !== LOCAL_API) {
      storage.addWebSource(
        [storage.AssetType.ImageVector, storage.AssetType.ImageBitmap, storage.AssetType.Sound],
        this.getBackpackAssetURL
      );
      storage._hasAddedBackpackSource = true;
    }
  }
  componentDidMount() {
    installBackpackDropZonePatch();
    this.props.vm.addListener('BLOCK_DRAG_END', this.handleBlockDragEnd);
    this.props.vm.addListener('BLOCK_DRAG_UPDATE', this.handleBlockDragUpdate);
    document.addEventListener('pointermove', this.handlePointerMove);
    document.addEventListener('touchmove', this.handleTouchMove, { passive: true });
  }
  componentWillUnmount() {
    this.props.vm.removeListener('BLOCK_DRAG_END', this.handleBlockDragEnd);
    this.props.vm.removeListener('BLOCK_DRAG_UPDATE', this.handleBlockDragUpdate);
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('touchmove', this.handleTouchMove, { passive: true });
  }
  handlePointerMove(e) {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.updateBlockDragOver();
  }
  handleTouchMove(e) {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    this.pointer.x = touch.clientX;
    this.pointer.y = touch.clientY;
    this.updateBlockDragOver();
  }
  /**
   * Highlight the backpack while a stack is dragged over it. `mouseenter` alone is not
   * enough: the list can expand under a pointer that never moves.
   */
  updateBlockDragOver() {
    if (!this.state.blockDragOutsideWorkspace) return;
    const blockDragOverBackpack = isOverBackpack(this.pointer.x, this.pointer.y);
    if (blockDragOverBackpack !== this.state.blockDragOverBackpack) {
      this.setState({ blockDragOverBackpack });
    }
  }
  UNSAFE_componentWillReceiveProps(newProps) {
    const wasForced = Boolean(this.props.forceExpanded);
    const isForced = Boolean(newProps.forceExpanded);
    if (isForced && !wasForced && !this.state.expanded) {
      // Dragging something onto the backpack opens it. Load the contents here: the list
      // is only ever filled by an explicit toggle otherwise, which made it read as empty.
      this.expandedByDrag = true;
      this.setState({ expanded: true }, this.notifyResize);
      if (!this.state.loading && this.state.contents.length === 0) {
        this.getContents();
      }
    } else if (!isForced && wasForced && this.expandedByDrag) {
      this.expandedByDrag = false;
      this.setState({ expanded: false }, this.notifyResize);
    }
  }
  // The backpack is a row of the layout: when it grows the workspace shrinks, and
  // Scratch-Blocks has to recompute its size.
  notifyResize() {
    window.dispatchEvent(new Event('resize'));
  }
  getBackpackAssetURL(asset) {
    return `${this.props.host}/${asset.assetId}.${asset.dataFormat}`;
  }
  handleToggle() {
    const newState = !this.state.expanded;
    this.expandedByDrag = false;
    this.setState({ expanded: newState, contents: [] }, this.notifyResize);
    if (newState) {
      this.getContents();
    }
  }
  handleError(error) {
    this.setState({
      error: `${error}`,
      loading: false
    });
    // Log error to console and make the Promise reject.
    throw error;
  }
  handleDrop(dragInfo) {
    let payloader = null;
    let presaveAsset = null;
    switch (dragInfo.dragType) {
      case DragConstants.COSTUME:
        payloader = costumePayload;
        presaveAsset = dragInfo.payload.asset;
        break;
      case DragConstants.SOUND:
        payloader = soundPayload;
        presaveAsset = dragInfo.payload.asset;
        break;
      case DragConstants.SPRITE:
        payloader = spritePayload;
        break;
      case DragConstants.CODE:
        payloader = codePayload;
        break;
    }
    if (!payloader) return;

    // Creating the payload is async, so set loading before starting
    this.setState({ loading: true }, () => {
      payloader(dragInfo.payload, this.props.vm)
        .then((payload) => {
          // Force the asset to save to the asset server before storing in backpack
          // Ensures any asset present in the backpack is also on the asset server
          if (presaveAsset && !presaveAsset.clean && this.props.host !== LOCAL_API) {
            return storage
              .store(presaveAsset.assetType, presaveAsset.dataFormat, presaveAsset.data, presaveAsset.assetId)
              .then(() => payload);
          }
          return payload;
        })
        .then((payload) =>
          saveBackpackObject({
            host: this.props.host,
            token: this.props.token,
            username: this.props.username,
            ...payload
          })
        )
        .then((item) => {
          this.setState({
            loading: false,
            contents: [item].concat(this.state.contents)
          });
        })
        .catch((error) => {
          this.handleError(error);
        });
    });
  }
  handleDelete(id) {
    this.setState({ loading: true }, () => {
      deleteBackpackObject({
        host: this.props.host,
        token: this.props.token,
        username: this.props.username,
        id: id
      })
        .then(() => {
          this.setState({
            loading: false,
            contents: this.state.contents.filter((o) => o.id !== id)
          });
        })
        .catch((error) => {
          this.handleError(error);
        });
    });
  }
  findItemById(id) {
    return this.state.contents.find((i) => i.id === id);
  }
  async handleRename(id) {
    const item = this.findItemById(id);
    // prompt() returns Promise in desktop app
    // eslint-disable-next-line no-alert
    const newName = await prompt(this.props.intl.formatMessage(messages.rename), item.name);
    if (!newName) {
      return;
    }
    this.setState({ loading: true }, () => {
      updateBackpackObject({
        host: this.props.host,
        ...item,
        name: newName
      })
        .then((newItem) => {
          this.setState({
            loading: false,
            contents: this.state.contents.map((i) => (i === item ? newItem : i))
          });
        })
        .catch((error) => {
          this.handleError(error);
        });
    });
  }
  getContents() {
    if ((this.props.token && this.props.username) || this.props.host === LOCAL_API) {
      this.setState({ loading: true, error: false }, () => {
        getBackpackContents({
          host: this.props.host,
          token: this.props.token,
          username: this.props.username,
          offset: this.state.contents.length,
          limit: this.state.itemsPerPage
        })
          .then((contents) => {
            this.setState({
              contents: this.state.contents.concat(contents),
              moreToLoad: contents.length === this.state.itemsPerPage,
              loading: false
            });
          })
          .catch((error) => {
            this.handleError(error);
          });
      });
    }
  }
  handleBlockDragUpdate(isOutsideWorkspace) {
    this.setState({ blockDragOutsideWorkspace: isOutsideWorkspace }, this.updateBlockDragOver);
  }
  handleMouseEnter() {
    if (this.state.blockDragOutsideWorkspace) {
      this.setState({
        blockDragOverBackpack: true
      });
    }
  }
  handleMouseLeave() {
    this.setState({
      blockDragOverBackpack: false
    });
  }
  handleBlockDragEnd(blocks, topBlockId) {
    // `mouseenter` is not enough: the list expands while the pointer is already over it,
    // so no enter event fires. Fall back to the pointer position for the final decision.
    const overBackpack = this.state.blockDragOverBackpack || isOverBackpack(this.pointer.x, this.pointer.y);
    if (overBackpack && blocks && blocks.length > 0) {
      this.handleDrop({
        dragType: DragConstants.CODE,
        payload: {
          blockObjects: this.props.vm.exportStandaloneBlocks(blocks),
          topBlockId: topBlockId
        }
      });
    }
    this.setState({
      blockDragOverBackpack: false,
      blockDragOutsideWorkspace: false
    });
  }
  handleMore() {
    this.getContents();
  }
  render() {
    return (
      <DroppableBackpack
        blockDragOver={this.state.blockDragOverBackpack}
        contents={this.state.contents}
        error={this.state.error}
        expanded={this.state.expanded}
        loading={this.state.loading}
        showMore={this.state.moreToLoad}
        onDelete={this.handleDelete}
        onRename={this.handleRename}
        onDrop={this.handleDrop}
        onMore={this.handleMore}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onToggle={this.props.host ? this.handleToggle : null}
      />
    );
  }
}

Backpack.propTypes = {
  forceExpanded: PropTypes.bool,
  intl: intlShape,
  host: PropTypes.string,
  token: PropTypes.string,
  username: PropTypes.string,
  vm: PropTypes.instanceOf(VM)
};

const getTokenAndUsername = (state) => {
  // Look for the session state provided by scratch-www
  if (state.session && state.session.session && state.session.session.user) {
    return {
      token: state.session.session.user.token,
      username: state.session.session.user.username
    };
  }
  // Otherwise try to pull testing params out of the URL, or return nulls
  // TODO a hack for testing the backpack
  const tokenMatches = window.location.href.match(/[?&]token=([^&]*)&?/);
  const usernameMatches = window.location.href.match(/[?&]username=([^&]*)&?/);
  return {
    token: tokenMatches ? tokenMatches[1] : null,
    username: usernameMatches ? usernameMatches[1] : null
  };
};

const mapStateToProps = (state) =>
  Object.assign(
    {
      dragInfo: state.scratchGui.assetDrag,
      vm: state.scratchGui.vm,
      blockDrag: state.scratchGui.blockDrag
    },
    getTokenAndUsername(state)
  );

const mapDispatchToProps = () => ({});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Backpack));
