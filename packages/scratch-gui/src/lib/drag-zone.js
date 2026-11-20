/**
 * Helpers for working out which drop zone sits under the pointer.
 *
 * Neither `event.target` nor a plain `elementFromPoint` is reliable while dragging:
 * HTML5 drag events report the drag image or the body as their target, and
 * Scratch-Blocks moves the dragged stack on a drag surface that sits directly under
 * the cursor. In both cases we want the element *behind* the thing being dragged.
 */

const BLOCK_DRAG_SURFACE = '.blocklyBlockDragSurface, .blocklyWsDragSurface';

/**
 * Topmost element at the given point that is not part of a Blockly drag surface.
 * @param {number} x Client x coordinate
 * @param {number} y Client y coordinate
 * @returns {?Element} The element, or null when the point is outside the viewport
 */
const elementAtPoint = (x, y) => {
  if (typeof document.elementsFromPoint !== 'function') {
    return document.elementFromPoint(x, y);
  }
  const stack = document.elementsFromPoint(x, y);
  for (let i = 0; i < stack.length; i++) {
    const element = stack[i];
    if (element.closest && element.closest(BLOCK_DRAG_SURFACE)) continue;
    return element;
  }
  return stack[0] || null;
};

/**
 * Closest ancestor matching a selector, ignoring Blockly drag surfaces.
 * @param {number} x Client x coordinate
 * @param {number} y Client y coordinate
 * @param {string} selector CSS selector
 * @returns {?Element} The matching ancestor, or null
 */
const closestFromPoint = (x, y, selector) => {
  const element = elementAtPoint(x, y);
  if (!element || !element.closest) return null;
  return element.closest(selector);
};

const isOverBackpack = (x, y) => Boolean(closestFromPoint(x, y, '[data-ae-backpack]'));

export { elementAtPoint, closestFromPoint, isOverBackpack };
