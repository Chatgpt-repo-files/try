const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

const DATA_FILE = path.join(__dirname, 'paymentData.json');

app.use(bodyParser.json());

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({users: [], transactions: []}, null, 2));
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Create a new user with a starting balance of 0
app.post('/api/users', (req, res) => {
  const { name } = req.body;
  const data = loadData();
  const id = data.users.length + 1;
  const newUser = { id, name, balance: 0 };
  data.users.push(newUser);
  saveData(data);
  res.json(newUser);
});

// Get balance for a user
app.get('/api/balance/:id', (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ balance: user.balance });
});

// Get transaction history for a user
app.get('/api/transactions/:id', (req, res) => {
  const data = loadData();
  const id = parseInt(req.params.id, 10);
  const transactions = data.transactions.filter(t => t.from === id || t.to === id);
  res.json(transactions);
});

// Send money from one user to another
app.post('/api/send', (req, res) => {
  const { fromId, toId, amount } = req.body;
  const data = loadData();
  const fromUser = data.users.find(u => u.id === fromId);
  const toUser = data.users.find(u => u.id === toId);
  if (!fromUser || !toUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (fromUser.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  fromUser.balance -= amount;
  toUser.balance += amount;
  const transaction = { id: data.transactions.length + 1, from: fromId, to: toId, amount, date: new Date().toISOString() };
  data.transactions.push(transaction);
  saveData(data);
  res.json(transaction);
});

app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
});
