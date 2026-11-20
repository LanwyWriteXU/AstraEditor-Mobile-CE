import Blockly from 'scratch-blocks';
import { closestFromPoint } from './drag-zone';

/**
 * In this layout the backpack and the sprite panel float above the blocks workspace, so
 * a drop on either of them is still inside Scratch-Blocks' blocks area rectangle. Blockly
 * then reports the drag as "inside the workspace", `BLOCK_DRAG_END` never fires with
 * `isOutside`, and neither the backpack nor another sprite ever receives the dragged
 * stack.
 *
 * Treating those overlays as outside the blocks area restores the desktop behaviour: the
 * drag ends outside, the stack is handed over, and the workspace drops it.
 */

const OVERLAYS = '[data-ae-backpack], [data-ae-sprite-panel]';

let installed = false;

const installBackpackDropZonePatch = () => {
  if (installed) return;
  const proto = Blockly.WorkspaceSvg && Blockly.WorkspaceSvg.prototype;
  if (!proto || typeof proto.isInsideBlocksArea !== 'function') return;
  installed = true;

  const isInsideBlocksArea = proto.isInsideBlocksArea;
  proto.isInsideBlocksArea = function (e) {
    if (e && typeof e.clientX === 'number' && closestFromPoint(e.clientX, e.clientY, OVERLAYS)) {
      return false;
    }
    return isInsideBlocksArea.call(this, e);
  };
};

export default installBackpackDropZonePatch;
