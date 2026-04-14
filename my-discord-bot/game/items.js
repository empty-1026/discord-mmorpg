const items = {
	"Küçük Kılıç": {
		price: 50,
		type: 'weapon',
		img:"assets/items/small_sword.png",
		effect: { attack: 3 },
		description: 'Saldırınızı hafifçe arttırır',
	},
	"Büyük Kılıç": {
		price: 150,
		type: 'weapon',
		img:"assets/items/big_sword.png",
		effect: { attack: 8 },
		description: 'Güçlü saldırı sağlar',
	},
	"Derin Zırh": {
		price: 80,
		type: 'armor',
		img:"assets/items/deep_armor.png",
		effect: { defense: 4 },
		description: 'Savunmayı arttırır',
	},
	"Ejderha Zırhı": {
		price: 250,
		type: 'armor',
		img:"assets/items/dragon_armor.png",
		effect: { defense: 10 },
		description: 'İleri savunma sağlar',
	},
	"Can iksiri": {
		price: 40,
		type: 'potion',
		img:"assets/items/health_potion.png",
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
	if(exact) return exact;

const loose = Object.keys(items).find(key => normalizeName(key).includes(normalized));
	return loose || null;
}

function getItem(name) {
const itemname = getItemName(name);
return itemname ? items[itemname] : null;
}

	function formatitemname(name) {
		const itemname = getItemName(name);
		if (!itemname) return name;
	}

	function getitemimagepath(name) {
		const item = getItem(name);
		if (!item) return null;
	}

	module.exports = { getItems, getItem, getItemName, formatItemName, getitemimagepath };

// /**
//  * Format item name with emoji
//  * @param {string} name - Item name
//  * @returns {string} Formatted item name with emoji (e.g., "🧪 Can iksiri")
//  */
// function formatItemName(name) {
// 	const item = getItem(name);
// 	if (!item) return name;
// 	const itemKey = getItemName(name);
// 	return `${item.emoji} ${itemKey}`;
// }

// module.exports = { getItems, getItem, getItemName, formatItemName };