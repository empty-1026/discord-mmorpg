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
	"Can Pojesyonu": {
		price: 40,
		effect: { hp: 30 },
		description: 'HP yeniler',
	},
};

function getItems() {
	return items;
}

function getItem(name) {
	return items[name] || null;
}

module.exports = { getItems, getItem };