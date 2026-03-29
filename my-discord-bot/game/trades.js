const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'data', 'trades.json');

function loadAll() {
	try {
		if (!fs.existsSync(dbPath)) {
			fs.mkdirSync(path.dirname(dbPath), { recursive: true });
			fs.writeFileSync(dbPath, '{}', 'utf8');
		}
		const raw = fs.readFileSync(dbPath, 'utf8');
		return JSON.parse(raw || '{}');
	} catch (error) {
		throw error;
	}
}

function saveAll(data) {
	fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function createTrade({ id, from, to, offer, request }) {
	const trades = loadAll();
	trades[id] = {
		id,
		from,
		to,
		offer,
		request,
		status: 'pending',
		createdAt: Date.now(),
	};
	saveAll(trades);
	return trades[id];
}

function getTrade(id) {
	const trades = loadAll();
	return trades[id] || null;
}

function setTrade(id, tradeData) {
	const trades = loadAll();
	trades[id] = tradeData;
	saveAll(trades);
	return trades[id];
}

module.exports = { createTrade, getTrade, setTrade };
