const admin = require('firebase-admin');
const serviceAccount = require('./firebaseKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const seedData = [
  {
    id: "demo-item-1",
    sellerId: "seller1",
    sellerName: "Rathi Steel Impex",
    title: "Mixed Heavy Melt Iron Scrap (HMS-1)",
    category: "Metal",
    description: "Available approximately 4,500 KG of Grade A Heavy Melting Steel (HMS 1). Consists of cut beams, industrial plates, and machinery offcuts. Free from excessive rust and perfectly suitable for direct blast furnace melting. Loading must be arranged by the buyer.",
    images: ["https://img.freepik.com/free-photo/dirty-dumped-objects-arrangement_23-2148996943.jpg?semt=ais_incoming&w=740&q=80"],
    address: "MIDC Industrial Estate, Andheri East, Mumbai, Maharashtra 400093",
    phone: "+91 98201 54321",
    status: "approved",
    createdAt: new Date().toISOString(),
    isPremium: true
  },
  {
    id: "demo-item-2",
    sellerId: "seller1",
    sellerName: "Balaji Extrusions Ltd.",
    title: "Bare Bright Copper Millberry Scrap",
    category: "Copper",
    description: "99.9% pure Bare Bright Copper Wire Scrap (Millberry). Unalloyed, uncoated, and stripped clean from heavy-duty power cables. Current available volume is roughly 1,200 KG. Packed in standard 50kg gunny bags. Ready for immediate transport.",
    images: ["https://etimg.etb2bimg.com/photo/110858968.cms"],
    address: "Plot 42, Peenya 2nd Stage, Bengaluru, Karnataka 560058",
    phone: "+91 94480 12345",
    status: "approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-item-3",
    sellerId: "seller2",
    sellerName: "Gujarat Polymer Recyclers",
    title: "HDPE Industrial Plastic Pallets",
    category: "Plastic",
    description: "Scrap lot of 350+ heavy-duty High-Density Polyethylene (HDPE) injection-molded pallets. Most are slightly cracked or structurally unviable for warehouse racking but perfect for shredding and regrinding. Blue and yellow mixed colors. Total estimated weight 4.2 Tons.",
    images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80"],
    address: "GIDC Vatva, Phase 4, Ahmedabad, Gujarat 382445",
    phone: "+91 97234 88990",
    status: "approved",
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  console.log("Seeding Database...");
  const batch = db.batch();
  
  seedData.forEach(item => {
    const docRef = db.collection('items').doc(item.id);
    batch.set(docRef, item);
  });

  // Adding dummy sellers
  batch.set(db.collection('users').doc('seller1'), {
    id: 'seller1',
    name: 'Rathi Steel Impex',
    email: 'rathi@steel.com',
    password: 'password',
    role: 'seller',
    isPremium: true
  });
  
  batch.set(db.collection('users').doc('seller2'), {
    id: 'seller2',
    name: 'Gujarat Polymer Recyclers',
    email: 'info@gujaratpoly.com',
    password: 'password',
    role: 'seller',
    isPremium: false
  });

  await batch.commit();
  console.log("✅ Seed complete! Your dummy data is now safely inside Firebase.");
  process.exit();
}

seed();
