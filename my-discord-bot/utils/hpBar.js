/**
 * Creates a visual HP bar representation
 * @param {number} current - Current HP
 * @param {number} max - Maximum HP
 * @param {number} width - Width of the bar (default 10)
 * @returns {string} Formatted HP bar
 */
function createHpBar(current, max, width = 10) {
	const percentage = Math.max(0, Math.min(100, (current / max) * 100));
	const filledBlocks = Math.round((percentage / 100) * width);
	const emptyBlocks = width - filledBlocks;

	const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
	
	return bar;
}

/**
 * Creates a full HP display with both bar and text
 * @param {number} current - Current HP
 * @param {number} max - Maximum HP
 * @param {string} name - Character/mob name (optional)
 * @returns {string} Formatted HP display
 */
function formatHpDisplay(current, max, name = '') {
	const bar = createHpBar(current, max);
	const displayName = name ? `${name}\n` : '';
	return `${displayName}${bar} ${current}/${max}`;
}

module.exports = {
	createHpBar,
	formatHpDisplay,
};
