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

const FieldValue = admin.firestore.FieldValue;
const { sendNewBidSms } = require('./smsNotify');

const BASIC_LISTING_CAP_PER_MONTH = 5;
const BASIC_COMMISSION_PCT = 5;

/** Safe JSON for clients (never includes password). */
function userPublicView(d) {
  return {
    id: d.id,
    name: d.name,
    email: d.email,
    role: d.role,
    isPremium: !!d.isPremium,
    kycStatus: d.kycStatus ?? null,
    kycPhone: d.kycPhone ?? null,
    kycIdType: d.kycIdType ?? null,
    kycIdNumber: d.kycIdNumber ?? null,
    kycAddress: d.kycAddress ?? null,
    kycSubmittedAt: d.kycSubmittedAt ?? null,
    kycRejectionReason: d.kycRejectionReason ?? null,
  };
}

/** Legacy accounts (no KYC submission) stay usable until they re-register flow; new signups require approval. */
function isKycApproved(data) {
  if (!data || data.role === 'admin') return true;
  if (data.kycStatus === 'approved') return true;
  if (!data.kycSubmittedAt && (data.kycStatus == null || data.kycStatus === undefined)) return true;
  return false;
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
    const { name, email, password, role, kycPhone, kycIdType, kycIdNumber, kycAddress } = req.body;
    
    // Check if user exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!kycPhone || !kycIdType || !kycIdNumber || !kycAddress) {
      return res.status(400).json({ message: "KYC details are required (phone, ID type, ID number, address)." });
    }

    const phoneDigits = String(kycPhone).replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
    }
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const user = {
      id,
      name,
      email,
      password,
      role,
      isPremium: false,
      kycPhone: phoneDigits,
      kycIdType: String(kycIdType).trim(),
      kycIdNumber: String(kycIdNumber).trim(),
      kycAddress: String(kycAddress).trim(),
      kycStatus: 'pending',
      kycSubmittedAt: now,
    };
    await usersRef.doc(id).set(user);
    res.json({ user: userPublicView(user) });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded Admin login check
    if (email === 'admin@admin.com' && password === 'admin') {
       return res.json({
         user: {
           id: 'admin-id',
           name: 'Super Admin',
           email,
           role: 'admin',
           isPremium: false,
           kycStatus: 'approved',
           kycPhone: null,
           kycIdType: null,
           kycIdNumber: null,
           kycAddress: null,
           kycSubmittedAt: null,
           kycRejectionReason: null,
         },
       });
    }

    const snapshot = await db.collection('users').where('email', '==', email).where('password', '==', password).get();
    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = snapshot.docs[0].data();
    res.json({ user: userPublicView(user) });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/users/:id/premium', async (req, res) => {
  try {
    const id = req.params.id;
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Not found" });

    const data = doc.data();
    if (!isKycApproved(data)) {
      return res.status(403).json({ message: "Complete KYC verification before upgrading to Premium." });
    }
    
    await userRef.update({ isPremium: true });

    const listed = await db.collection('items').where('sellerId', '==', id).get();
    const batch = db.batch();
    listed.docs.forEach((d) => batch.update(d.ref, { sellerIsPremium: true }));
    if (!listed.empty) await batch.commit();
    
    const updatedUser = (await userRef.get()).data();
    res.json({ user: userPublicView(updatedUser) });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Not found" });
    res.json({ user: userPublicView(doc.data()) });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/users/:id/kyc', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }
    const userRef = db.collection('users').doc(req.params.id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Not found" });

    const updates = { kycStatus: status };
    if (status === 'rejected') {
      updates.kycRejectionReason = (rejectionReason && String(rejectionReason).trim()) || 'Verification failed. Please contact support with updated documents.';
    } else {
      updates.kycRejectionReason = FieldValue.delete();
    }
    await userRef.update(updates);
    const updated = (await userRef.get()).data();
    res.json({ user: userPublicView(updated) });
  } catch(e) { res.status(500).json({error: e.message}); }
});

// ----------------------------------------
// SCRAP ITEMS
// ----------------------------------------

app.get('/api/items/approved', async (req, res) => {
  try {
    const snap = await db.collection('items').where('status', '==', 'approved').get();
    let list = snap.docs.map((d) => d.data());
    const sellerIds = [...new Set(list.map((i) => i.sellerId).filter(Boolean))];
    const premiumMap = {};
    await Promise.all(
      sellerIds.map(async (sid) => {
        const u = await db.collection('users').doc(sid).get();
        if (u.exists) premiumMap[sid] = !!u.data().isPremium;
      }),
    );
    list = list.map((i) => ({
      ...i,
      sellerIsPremium: i.sellerIsPremium ?? !!premiumMap[i.sellerId],
    }));
    /** Enterprise Pro sellers & premium-tagged listings surface first */
    list.sort((a, b) => {
      const score = (x) => (x.sellerIsPremium ? 2 : 0) + (x.isPremium ? 1 : 0);
      const diff = score(b) - score(a);
      if (diff !== 0) return diff;
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    res.json(list);
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
    const row = doc.data();
    let sellerIsPremium = row.sellerIsPremium;
    if (sellerIsPremium === undefined && row.sellerId) {
      const u = await db.collection('users').doc(row.sellerId).get();
      sellerIsPremium = u.exists ? !!u.data().isPremium : false;
    }
    res.json({ ...row, sellerIsPremium: !!sellerIsPremium });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/items', async (req, res) => {
  try {
    const sellerId = req.body.sellerId;
    if (!sellerId) return res.status(400).json({ message: "sellerId required" });
    const sellerDoc = await db.collection('users').doc(sellerId).get();
    if (!sellerDoc.exists) return res.status(404).json({ message: "Seller not found" });
    if (!isKycApproved(sellerDoc.data())) {
      return res.status(403).json({ message: "Your account must be KYC-approved by an admin before you can list scrap." });
    }

    const listingPhoneDigits = String(req.body.phone ?? '').replace(/\D/g, '');
    if (listingPhoneDigits.length !== 10) {
      return res.status(400).json({ message: "Listing phone number must be exactly 10 digits." });
    }

    const sellerData = sellerDoc.data();
    const sellerPremium = !!sellerData.isPremium;
    if (!sellerPremium) {
      const sellerItemsSnap = await db.collection('items').where('sellerId', '==', sellerId).get();
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const thisMonthCount = sellerItemsSnap.docs.filter((doc) => {
        const c = doc.data().createdAt;
        return typeof c === 'string' && c.slice(0, 7) === ym;
      }).length;
      if (thisMonthCount >= BASIC_LISTING_CAP_PER_MONTH) {
        return res.status(403).json({
          message: 'Basic plan allows up to 5 new listings per calendar month. Upgrade to Enterprise Pro for unlimited listings.',
        });
      }
    }

    const id = crypto.randomUUID();
    const item = {
      ...req.body,
      phone: listingPhoneDigits,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      sellerIsPremium: sellerPremium,
    };
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
    res.json(snap.docs.map((d) => {
      const u = d.data();
      const { password: _p, ...rest } = u;
      return rest;
    }));
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
    const buyerId = req.body.buyerId;
    if (!buyerId) return res.status(400).json({ message: "buyerId required" });
    const buyerDoc = await db.collection('users').doc(buyerId).get();
    if (!buyerDoc.exists) return res.status(404).json({ message: "Buyer not found" });
    if (!isKycApproved(buyerDoc.data())) {
      return res.status(403).json({ message: "Your account must be KYC-approved by an admin before you can place bids." });
    }

    const itemId = req.body.itemId;
    if (!itemId) return res.status(400).json({ message: 'itemId required' });
    const itemRef = db.collection('items').doc(itemId);
    const itemSnap = await itemRef.get();
    if (!itemSnap.exists) return res.status(404).json({ message: 'Listing not found' });
    const itemRow = itemSnap.data();
    if (itemRow.status !== 'approved') {
      return res.status(400).json({ message: 'Bids are only allowed on approved listings.' });
    }

    const id = crypto.randomUUID();
    const bid = { ...req.body, id, status: 'pending', createdAt: new Date().toISOString() };
    await db.collection('bids').doc(id).set(bid);

    sendNewBidSms({
      toDigits: itemRow.phone,
      itemTitle: itemRow.title,
      amount: bid.amount,
    }).catch((err) => console.error('[EcoTrade SMS]', err.message));

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
    const newStatus = req.body.status;
    const updates = { status: newStatus };

    if (newStatus === 'accepted') {
      const itemRef = db.collection('items').doc(bid.itemId);
      const itemSnap = await itemRef.get();
      const itemRow = itemSnap.exists ? itemSnap.data() : {};
      const sellerSnap = itemRow.sellerId ? await db.collection('users').doc(itemRow.sellerId).get() : null;
      const sellerPremium = sellerSnap && sellerSnap.exists && !!sellerSnap.data().isPremium;
      const pct = sellerPremium ? 0 : BASIC_COMMISSION_PCT;
      const amount = Number(bid.amount) || 0;
      const commissionAmount = Math.round((amount * pct) / 100);
      updates.commissionPct = pct;
      updates.commissionAmount = commissionAmount;
      updates.netToSeller = amount - commissionAmount;
    }

    await bidRef.update(updates);
    
    // Auto-reject other bids for this item and mark item sold
    if (newStatus === 'accepted') {
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
    const pendingKyc = (await db.collection('users').where('kycStatus', '==', 'pending').count().get()).data().count;
    
    res.json({
      totalUsers: users,
      totalItems: items,
      pendingApprovals: pending,
      totalBids: bids,
      pendingKyc,
    });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/contact', async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const contactMsg = { ...req.body, id, createdAt: new Date().toISOString() };
    await db.collection('contacts').doc(id).set(contactMsg);
    res.json({ success: true, message: "Contact message saved successfully." });
  } catch(e) { res.status(500).json({error: e.message}); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Firebase Backend running on port ${PORT}`);
});

module.exports = app;
