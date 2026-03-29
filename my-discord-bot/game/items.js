const items = {
	"Küçük Kılıç": {
		price: 50,
		effect: { attack: 3 },
		description: 'Saldırınızı hafifçe arttırır',
	},
	"Büyük Kılıç": {
		price: 150,
		effect: { attack: 8 },
		description: 'Güçlü saldırı sağlar',
	},
	"Derin Zırh": {
		price: 80,
		effect: { defense: 4 },
		description: 'Savunmayı arttırır',
	},
	"Ejderha Zırhı": {
		price: 250,
		effect: { defense: 10 },
		description: 'İleri savunma sağlar',
	},
	"Can iksiri": {
		price: 40,
		effect: { hp: 30 },
		description: 'HP yeniler',
	},
};

function getItems() {
	return items;
}

function normalizeName(name) {
	return name
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ ]/g, '')
		.trim();
}

function getItem(name) {
	if (!name) return null;
	if (items[name]) return items[name];

	const normalized = normalizeName(name);
	const foundKey = Object.keys(items).find(key => normalizeName(key) === normalized);
	if (foundKey) return items[foundKey];

	const foundLoose = Object.keys(items).find(key => normalizeName(key).includes(normalized));
	return foundLoose ? items[foundLoose] : null;
}

function getItemName(name) {
	if (!name) return null;
	if (items[name]) return name;

	const normalized = normalizeName(name);
	const foundKey = Object.keys(items).find(key => normalizeName(key) === normalized);
	if (foundKey) return foundKey;

	const foundLoose = Object.keys(items).find(key => normalizeName(key).includes(normalized));
	return foundLoose || null;
}

/**
 * Format item name with emoji
 * @param {string} name - Item name
 * @returns {string} Formatted item name with emoji (e.g., "🧪 Can iksiri")
 */
function formatItemName(name) {
	const item = getItem(name);
	if (!item) return name;
	const itemKey = getItemName(name);
	return `${item.emoji} ${itemKey}`;
}

module.exports = { getItems, getItem, getItemName, formatItemName };