'use strict';
/**
 * Mock Data Seeder
 * Run: node seed.js --project disaster-response-app-f17ab
 */

const admin = require('firebase-admin');
const { computeUrgencyScore } = require('./scoring');

const PROJECT_ID = process.argv[2] === '--project' ? process.argv[3] : 'disaster-response-app-f17ab';

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

const NEEDS = [
  { area: 'Hadapsar, Pune', lat: 18.5018, lng: 73.9260, category: 'medical', severity: 'critical', reportedCount: 28, daysAgo: 0, description: 'Severe shortage of medicines. Many injured residents need immediate medical attention after flooding.' },
  { area: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077, category: 'food_distribution', severity: 'high', reportedCount: 22, daysAgo: 1, description: 'Families displaced by landslide have no food. 200+ people in temporary shelter need daily meals.' },
  { area: 'Nashik', lat: 19.9975, lng: 73.7898, category: 'shelter', severity: 'high', reportedCount: 18, daysAgo: 2, description: 'Flood waters damaged 40+ homes. Families sleeping in open. Need tarpaulins and temporary shelter.' },
  { area: 'Aurangabad', lat: 19.8762, lng: 75.3433, category: 'water_sanitation', severity: 'critical', reportedCount: 15, daysAgo: 1, description: 'Contaminated water supply after flooding. Risk of cholera outbreak. Need water purification.' },
  { area: 'Kolhapur', lat: 16.7050, lng: 74.2433, category: 'medical', severity: 'high', reportedCount: 12, daysAgo: 3, description: 'Vaccination camp needed for children under 5. Polio risk elevated in flood-affected areas.' },
  { area: 'Solapur', lat: 17.6868, lng: 75.9064, category: 'food_distribution', severity: 'medium', reportedCount: 10, daysAgo: 4, description: 'Drought-affected village. Grain stocks depleted. 150 families need food rations.' },
  { area: 'Nanded', lat: 19.1383, lng: 77.3210, category: 'education', severity: 'medium', reportedCount: 8, daysAgo: 5, description: 'School building damaged. 300 students without classroom. Need temporary learning space.' },
  { area: 'Latur', lat: 18.4088, lng: 76.5604, category: 'shelter', severity: 'high', reportedCount: 14, daysAgo: 2, description: 'Earthquake tremors damaged walls of 20 homes. Elderly residents need safe accommodation.' },
  { area: 'Amravati', lat: 20.9320, lng: 77.7523, category: 'general', severity: 'low', reportedCount: 5, daysAgo: 7, description: 'General relief needed for flood-affected families. Clothing, blankets, and basic supplies.' },
  { area: 'Dhule', lat: 20.9042, lng: 74.7749, category: 'water_sanitation', severity: 'high', reportedCount: 9, daysAgo: 3, description: 'Village well contaminated. 80 families without clean drinking water for 3 days.' },
];

const VOLUNTEERS = [
  { name: 'Priya Sharma', lat: 18.5100, lng: 73.9200, skills: ['Medical', 'First Aid'], availability: ['monday', 'wednesday', 'saturday'] },
  { name: 'Rahul Patil', lat: 18.5200, lng: 73.8500, skills: ['Driving', 'Logistics'], availability: ['tuesday', 'thursday', 'sunday'] },
  { name: 'Sneha Kulkarni', lat: 18.4900, lng: 73.9100, skills: ['Cooking', 'Logistics'], availability: ['monday', 'friday', 'saturday'] },
  { name: 'Amit Desai', lat: 18.5300, lng: 73.9400, skills: ['Construction', 'Logistics'], availability: ['wednesday', 'saturday', 'sunday'] },
  { name: 'Kavita Joshi', lat: 18.5050, lng: 73.8900, skills: ['Teaching', 'Counseling'], availability: ['monday', 'tuesday', 'friday'] },
  { name: 'Suresh Nair', lat: 18.4800, lng: 73.8700, skills: ['Medical', 'Water Sanitation'], availability: ['thursday', 'saturday', 'sunday'] },
  { name: 'Meera Iyer', lat: 18.5150, lng: 73.9300, skills: ['Communication', 'Logistics'], availability: ['monday', 'wednesday', 'friday'] },
  { name: 'Vikram Rao', lat: 18.5250, lng: 73.8600, skills: ['First Aid', 'Driving'], availability: ['tuesday', 'saturday', 'sunday'] },
  { name: 'Anita Bhosale', lat: 18.4950, lng: 73.9000, skills: ['Cooking', 'Teaching'], availability: ['monday', 'thursday', 'saturday'] },
  { name: 'Deepak Wagh', lat: 18.5350, lng: 73.9500, skills: ['Construction', 'Water Sanitation'], availability: ['wednesday', 'friday', 'sunday'] },
  { name: 'Pooja Gaikwad', lat: 18.5000, lng: 73.8800, skills: ['Medical', 'Counseling'], availability: ['tuesday', 'thursday', 'saturday'] },
  { name: 'Nikhil Chavan', lat: 18.5180, lng: 73.9150, skills: ['Driving', 'Communication'], availability: ['monday', 'friday', 'sunday'] },
  { name: 'Sunita Pawar', lat: 18.4870, lng: 73.8950, skills: ['First Aid', 'Cooking'], availability: ['wednesday', 'saturday', 'sunday'] },
  { name: 'Rajesh Mane', lat: 18.5280, lng: 73.8750, skills: ['Logistics', 'Construction'], availability: ['tuesday', 'thursday', 'friday'] },
  { name: 'Lata Jadhav', lat: 18.4920, lng: 73.8850, skills: ['Medical', 'First Aid', 'Counseling'], availability: ['monday', 'tuesday', 'friday'] },
];

async function seed() {
  console.log(`Seeding project: ${PROJECT_ID}\n`);

  // Seed needs
  console.log('Seeding needs...');
  const needIds = [];
  for (const n of NEEDS) {
    const { daysAgo, ...needData } = n;
    const createdAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - daysAgo * 86400000)
    );
    const score = computeUrgencyScore({ ...needData, createdAt });
    const ref = db.collection('needs').doc();
    await ref.set({
      needId: ref.id, ...needData,
      urgencyScore: score.total,
      scoreBreakdown: score.breakdown,
      status: 'open', createdAt, createdBy: 'seeder',
    });
    needIds.push(ref.id);
    console.log(`  ${needData.area} → score=${score.total}`);
  }

  // Seed volunteers
  console.log('\nSeeding volunteers...');
  const volIds = [];
  const reliabilities = [72, 80, 85, 90, 95, 100];
  for (let i = 0; i < VOLUNTEERS.length; i++) {
    const v = VOLUNTEERS[i];
    const uid = `vol_demo_${String(i + 1).padStart(2, '0')}`;
    const reliability = reliabilities[i % reliabilities.length];
    await db.collection('volunteers').doc(uid).set({
      uid, email: `${v.name.toLowerCase().replace(' ', '.')}@demo.com`,
      phone: `+91900000${String(i).padStart(4, '0')}`,
      address: 'Pune, Maharashtra',
      reliabilityScore: reliability,
      tasksCompleted: Math.floor(Math.random() * 10) + 2,
      tasksDeclined: Math.floor(Math.random() * 3),
      isAvailable: true, fcmTokens: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...v,
    });
    await db.collection('users').doc(uid).set({
      uid, role: 'volunteer',
      email: `${v.name.toLowerCase().replace(' ', '.')}@demo.com`,
      displayName: v.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    volIds.push(uid);
    console.log(`  ${v.name} (reliability=${reliability}%)`);
  }

  console.log('\n✓ Seeding complete!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
