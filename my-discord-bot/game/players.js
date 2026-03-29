const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'data', 'users.json');

function loadAll() {
	try {
		const raw = fs.readFileSync(dbPath, 'utf8');
		return JSON.parse(raw || '{}');
	} catch (error) {
		if (error.code === 'ENOENT') {
			fs.mkdirSync(path.dirname(dbPath), { recursive: true });
			fs.writeFileSync(dbPath, '{}', 'utf8');
			return {};
		}
		throw error;
	}
}

function saveAll(data) {
	fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function createDefault() {
	return {
		level: 1,
		xp: 0,
		hp: 100,
		maxHp: 100,
		attack: 10,
		defense: 5,
		gold: 100,
		inventory: [],
		equipment: {
			weapon: null,
			armor: null,
		},
	};
}

function getPlayer(userId) {
	const db = loadAll();
	if (!db[userId]) {
		db[userId] = createDefault();
		saveAll(db);
	}
	return db[userId];
}


function setPlayer(userId, playerData) {
	// Envanterde maksimum 10 eşya sınırı uygula (kuşanılanlar hariç)
	if (Array.isArray(playerData.inventory) && playerData.inventory.length > 10) {
		playerData.inventory = playerData.inventory.slice(0, 10);
	}
	const db = loadAll();
	db[userId] = playerData;
	saveAll(db);
}

module.exports = { getPlayer, setPlayer };