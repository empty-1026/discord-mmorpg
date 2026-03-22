const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'data', 'rooms.json');

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

function generateRoomId() {
	return `oda_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`;
}

function randomFrom(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function createDefaultRoom(ownerId, name = null) {
	const terrain = ['Gölgeli Mağara', 'Sisli Orman', 'Antik Harabe', 'Buğulu Bataklık', 'Lav Tapınağı'];
	const monsters = ['Kobold', 'Zombi', 'Cadı', 'Hayalet', 'Dev Örümcek'];
	const treasures = ['Eski Kılıç', 'Koruyucu Zırh', 'Büyülü İksir', 'Altın Kese', 'Nadir Mücevher'];
	
	const roomName = name || `${terrain[Math.floor(Math.random() * terrain.length)]} - ${Math.floor(Math.random() * 1000)}`;

	return {
		id: generateRoomId(),
		name: roomName,
		owner: ownerId,
		createdAt: new Date().toISOString(),
		terrain: randomFrom(terrain),
		monster: randomFrom(monsters),
		monsterHp: Math.floor(Math.random() * 50 + 50),
		monsterAttack: Math.floor(Math.random() * 10 + 5),
		treasure: randomFrom(treasures),
		lootGold: Math.floor(Math.random() * 50 + 20),
		players: [ownerId],
	};
}

function createRoom(ownerId, name) {
	const rooms = loadAll();
	const room = createDefaultRoom(ownerId, name);
	rooms[room.id] = room;
	saveAll(rooms);
	return room;
}

function getRoom(roomId) {
	const rooms = loadAll();
	return rooms[roomId] || null;
}

function getRoomsByOwner(ownerId) {
	const rooms = loadAll();
	return Object.values(rooms).filter((room) => room.owner === ownerId);
}

function joinRoom(roomId, userId) {
	const rooms = loadAll();
	const room = rooms[roomId];
	if (!room) return null;
	if (!room.players.includes(userId)) {
		room.players.push(userId);
		saveAll(rooms);
	}
	return room;
}

module.exports = { createRoom, getRoom, getRoomsByOwner, joinRoom };
