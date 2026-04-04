const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');

let serviceAccount;
let firebaseError = null;
let db;

try {
  try {
    serviceAccount = require('./firebaseKey.json');
  } catch (error) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env variable.");
    }
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (serviceAccount && serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
} catch (err) {
  firebaseError = err.message;
  console.error("FIREBASE INIT FATAL ERROR:", err);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware to catch the exact error if Firebase failed to boot
app.use((req, res, next) => {
  if (firebaseError) {
    return res.status(500).json({ error: `Backend Boot Error: ${firebaseError}. Please check Vercel ENV Variables.` });
  }
  next();
});

// ----------------------------------------
// AUTHENTICATION
// ----------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const id = crypto.randomUUID();
    const user = { id, name, email, password, role, isPremium: false };
    await usersRef.doc(id).set(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, isPremium: user.isPremium } });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded Admin login check
    if (email === 'admin@admin.com' && password === 'admin') {
       return res.json({ user: { id: 'admin-id', name: 'Super Admin', email, role: 'admin' } });
    }

    const snapshot = await db.collection('users').where('email', '==', email).where('password', '==', password).get();
    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = snapshot.docs[0].data();
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, isPremium: user.isPremium } });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/users/:id/premium', async (req, res) => {
  try {
    const id = req.params.id;
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Not found" });
    
    await userRef.update({ isPremium: true });
    
    const updatedUser = (await userRef.get()).data();
    res.json({ user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, isPremium: updatedUser.isPremium } });
  } catch(e) { res.status(500).json({error: e.message}); }
});

// ----------------------------------------
// SCRAP ITEMS
// ----------------------------------------

app.get('/api/items/approved', async (req, res) => {
  try {
    const snap = await db.collection('items').where('status', '==', 'approved').get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/items', async (req, res) => {
  try {
    const snap = await db.collection('items').get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/items/seller/:sellerId', async (req, res) => {
  try {
    const snap = await db.collection('items').where('sellerId', '==', req.params.sellerId).get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({message: "Not found"});
    res.json(doc.data());
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/items', async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const item = { ...req.body, id, status: 'pending', createdAt: new Date().toISOString() };
    if (!item.isPremium) item.isPremium = false;
    await db.collection('items').doc(id).set(item);
    res.json(item);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/items/:id/status', async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
    const doc = await itemRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Not found" });
    
    await itemRef.update({ status: req.body.status });
    res.json((await itemRef.get()).data());
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/items/:id/premium', async (req, res) => {
  try {
    const itemRef = db.collection('items').doc(req.params.id);
    const doc = await itemRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Not found" });
    
    const currentStatus = doc.data().isPremium || false;
    await itemRef.update({ isPremium: !currentStatus });
    res.json((await itemRef.get()).data());
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/users', async (req, res) => {
  try {
    const snap = await db.collection('users').get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/bids', async (req, res) => {
  try {
    const snap = await db.collection('bids').get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

// ----------------------------------------
// BIDDING SYSTEM
// ----------------------------------------

app.post('/api/bids', async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const bid = { ...req.body, id, status: 'pending', createdAt: new Date().toISOString() };
    await db.collection('bids').doc(id).set(bid);
    res.json(bid);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/items/:itemId/bids', async (req, res) => {
  try {
    const snap = await db.collection('bids').where('itemId', '==', req.params.itemId).get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/bids/seller/:sellerId', async (req, res) => {
  try {
    // First get all items belonging to seller
    const itemsSnap = await db.collection('items').where('sellerId', '==', req.params.sellerId).get();
    const itemIds = itemsSnap.docs.map(d => d.id);
    
    if (itemIds.length === 0) return res.json([]);

    // Firestore `in` query accepts max 10 elements. Assuming few items for a demo, otherwise process chunks.
    const chunks = [];
    for (let i = 0; i < itemIds.length; i += 10) {
      chunks.push(itemIds.slice(i, i + 10));
    }
    
    let allBids = [];
    for (const chunk of chunks) {
      const bidSnap = await db.collection('bids').where('itemId', 'in', chunk).get();
      allBids = allBids.concat(bidSnap.docs.map(d => d.data()));
    }
    
    res.json(allBids);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/bids/buyer/:buyerId', async (req, res) => {
  try {
    const snap = await db.collection('bids').where('buyerId', '==', req.params.buyerId).get();
    res.json(snap.docs.map(d => d.data()));
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/bids/:id/status', async (req, res) => {
  try {
    const bidRef = db.collection('bids').doc(req.params.id);
    const bidDoc = await bidRef.get();
    if (!bidDoc.exists) return res.status(404).json({ message: "Not found" });
    
    const bid = bidDoc.data();
    await bidRef.update({ status: req.body.status });
    
    // Auto-reject other bids for this item and mark item sold
    if (req.body.status === 'accepted') {
      const itemRef = db.collection('items').doc(bid.itemId);
      await itemRef.update({ status: 'sold' });
      
      const otherBidsSnap = await db.collection('bids')
        .where('itemId', '==', bid.itemId)
        .where('status', '==', 'pending')
        .get();
        
      const batch = db.batch();
      otherBidsSnap.docs.forEach(doc => {
        if (doc.id !== bid.id) batch.update(doc.ref, { status: 'rejected' });
      });
      await batch.commit();
    }
    
    res.json((await bidRef.get()).data());
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/stats', async (req, res) => {
  try {
    const users = (await db.collection('users').count().get()).data().count;
    const items = (await db.collection('items').count().get()).data().count;
    const pending = (await db.collection('items').where('status', '==', 'pending').count().get()).data().count;
    const bids = (await db.collection('bids').count().get()).data().count;
    
    res.json({
      totalUsers: users,
      totalItems: items,
      pendingApprovals: pending,
      totalBids: bids
    });
  } catch(e) { res.status(500).json({error: e.message}); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Firebase Backend running on port ${PORT}`);
});

module.exports = app;
