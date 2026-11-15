/**
 * Project statistics, using the same counting rules as the block-count addon:
 * shadow blocks are ignored, and a script is a block without a parent.
 * @param {object} vm the scratch-vm instance
 * @returns {{blockCount: number, scriptCount: number, spriteCount: number}}
 */
const getProjectStats = (vm) => {
  const stats = { blockCount: 0, scriptCount: 0, spriteCount: 0 };
  if (!vm || !vm.runtime || !vm.runtime.targets) return stats;

  const blockMaps = new Set();
  vm.runtime.targets.forEach((target) => {
    if (target && target.sprite && target.sprite.blocks && target.sprite.blocks._blocks) {
      blockMaps.add(target.sprite.blocks._blocks);
    }
  });

  blockMaps.forEach((blocks) => {
    Object.keys(blocks).forEach((blockId) => {
      const block = blocks[blockId];
      if (!block.shadow) stats.blockCount += 1;
      if (!block.parent) stats.scriptCount += 1;
    });
  });

  // The stage counts as a target, so it must be excluded from the sprite count.
  stats.spriteCount = Math.max(0, blockMaps.size - 1);
  return stats;
};

export { getProjectStats as default };
