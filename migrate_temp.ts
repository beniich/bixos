import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9sNmvPQW83Ov6qD-Wxt8yhS87X8Zq9-A",
  authDomain: "tribal-domain-j9v0l.firebaseapp.com",
  projectId: "tribal-domain-j9v0l",
  storageBucket: "tribal-domain-j9v0l.firebasestorage.app",
  messagingSenderId: "326625297127",
  appId: "1:326625297127:web:275b317393e7b2376fd842"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-sovereigndevicen-18bec7a3-9311-456d-986d-a6c8f02a8c94");

const serverOrganizations = [
  { id: 'org-01', name: 'Spaceflow Paris Central', slug: 'spaceflow-paris-central', plan: 'ENTERPRISE', address: '42 Rue de la Paix, 75002 Paris', city: 'Paris', totalSpacesCount: 18, totalMembersCount: 142, monthlyRevenue: 12400, mrrGrowthPercent: 14.8 },
  { id: 'org-02', name: 'TechHub Station F Loft', slug: 'techhub-station-f', plan: 'PRO', address: '55 Boulevard Vincent Auriol, 75013 Paris', city: 'Paris', totalSpacesCount: 10, totalMembersCount: 88, monthlyRevenue: 8200, mrrGrowthPercent: 9.2 }
];

const serverMembers = [
  { id: 'mem-101', email: 'jean.dupont@techcorp.io', firstName: 'Jean', lastName: 'Dupont', companyName: 'TechCorp SAS', phone: '+33 6 12 34 56 78', plan: 'HOT_DESK', status: 'ACTIVE', orgId: 'org-01', joinedDate: '2025-09-15', monthlyFee: 250, totalBookingsCount: 24, lastCheckIn: 'Aujourd\'hui, 09:15', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'mem-102', email: 'marie.martin@designstudio.fr', firstName: 'Marie', lastName: 'Martin', companyName: 'Studio Graphique MM', phone: '+33 6 98 76 54 32', plan: 'DEDICATED', status: 'ACTIVE', orgId: 'org-01', joinedDate: '2025-06-01', monthlyFee: 450, totalBookingsCount: 42, lastCheckIn: 'Hier, 14:20', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'mem-103', email: 'paul.bernard@freelance.net', firstName: 'Paul', lastName: 'Bernard', companyName: 'DevConsulting', phone: '+33 7 44 11 22 33', plan: 'DAY_PASS', status: 'PENDING', orgId: 'org-01', joinedDate: '2026-01-10', monthlyFee: 80, totalBookingsCount: 6, lastCheckIn: '10/01/2026', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'mem-104', email: 'sophie.leblanc@nexusai.com', firstName: 'Sophie', lastName: 'Leblanc', companyName: 'Nexus AI Systems', phone: '+33 6 55 66 77 88', plan: 'PRIVATE_OFFICE', status: 'ACTIVE', orgId: 'org-01', joinedDate: '2025-01-15', monthlyFee: 1800, totalBookingsCount: 98, lastCheckIn: 'Aujourd\'hui, 08:30', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: 'mem-105', email: 'thomas.moreau@dataflow.org', firstName: 'Thomas', lastName: 'Moreau', companyName: 'DataFlow Inc', phone: '+33 6 22 33 44 55', plan: 'HOT_DESK', status: 'ACTIVE', orgId: 'org-01', joinedDate: '2025-11-20', monthlyFee: 250, totalBookingsCount: 18, lastCheckIn: 'Aujourd\'hui, 11:00', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
];

const serverSpaces = [
  { id: 'spc-01', name: 'Open Space - Desk Flex #12', type: 'DESK', capacity: 1, hourlyRate: 8, dailyRate: 35, floor: 'Étage 1 - Zone B', orgId: 'org-01', status: 'AVAILABLE', amenities: ['Écran 27"', 'Prise USB-C 65W', 'Café Illimité', 'Fibre 1Gbps'], imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', description: 'Poste de travail individuel ergomique avec écran de contrôle et réseau haute vitesse.' },
  { id: 'spc-02', name: 'Salle de Réunion Alpha (Verrière)', type: 'MEETING_ROOM', capacity: 10, hourlyRate: 45, dailyRate: 280, floor: 'Étage 2 - Atrium', orgId: 'org-01', status: 'OCCUPIED', amenities: ['Écran 4K 75"', 'Visioconférence Jabra', 'Tableau Blanc', 'Climatisation'], imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600', description: 'Grande salle de réunion lumineuse idéale pour présentations clients et brainstormings d\'équipe.' },
  { id: 'spc-03', name: 'Espace Événementiel Loft', type: 'EVENT_SPACE', capacity: 50, hourlyRate: 150, dailyRate: 950, floor: 'Rez-de-Chaussée', orgId: 'org-01', status: 'AVAILABLE', amenities: ['Sonorisation Dolby', 'Microphones Sans Fil', 'Bar Cisterne', 'Rétroprojecteur HD'], imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600', description: 'Espace polyvalent adaptable pour conférences, keynotes, évènements de networking et ateliers.' },
  { id: 'spc-04', name: 'Bureau Privé Executive Suite B4', type: 'PRIVATE_OFFICE', capacity: 6, hourlyRate: 80, dailyRate: 450, floor: 'Étage 3 - Aile Est', orgId: 'org-01', status: 'OCCUPIED', amenities: ['Accès Badge 24/7', 'Ligne Téléphonique Dédiée', 'Bureaux Assis-Debout', 'Armoires Sécurisées'], imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', description: 'Bureau fermé et insonorisé réservé aux équipes recherchant confidentialité et standing.' }
];

const serverBookings = [
  { id: 'bkg-801', spaceId: 'spc-02', spaceName: 'Salle de Réunion Alpha (Verrière)', spaceType: 'MEETING_ROOM', memberId: 'mem-101', memberName: 'Jean Dupont', memberEmail: 'jean.dupont@techcorp.io', startTime: new Date(Date.now() - 1*3600*1000).toISOString(), endTime: new Date(Date.now() + 2*3600*1000).toISOString(), status: 'CONFIRMED', amount: 135, orgId: 'org-01', notes: 'Réunion d\'équipe projet IA', qrCodeToken: 'SPF-BKG-801-QR-9942', checkInTime: new Date(Date.now() - 50*60*1000).toISOString() },
  { id: 'bkg-802', spaceId: 'spc-01', spaceName: 'Open Space - Desk Flex #12', spaceType: 'DESK', memberId: 'mem-102', memberName: 'Marie Martin', memberEmail: 'marie.martin@designstudio.fr', startTime: new Date(Date.now() + 18*3600*1000).toISOString(), endTime: new Date(Date.now() + 26*3600*1000).toISOString(), status: 'CONFIRMED', amount: 35, orgId: 'org-01', notes: 'Session design UX UI', qrCodeToken: 'SPF-BKG-802-QR-3310' },
  { id: 'bkg-803', spaceId: 'spc-03', spaceName: 'Espace Événementiel Loft', spaceType: 'EVENT_SPACE', memberId: 'mem-104', memberName: 'Sophie Leblanc', memberEmail: 'sophie.leblanc@nexusai.com', startTime: new Date(Date.now() + 48*3600*1000).toISOString(), endTime: new Date(Date.now() + 54*3600*1000).toISOString(), status: 'CONFIRMED', amount: 900, orgId: 'org-01', notes: 'Lancement Produit Version 3.0', qrCodeToken: 'SPF-BKG-803-QR-1100' }
];

async function migrate() {
  console.log('Starting migration (Local TSX)...');

  for (const org of serverOrganizations) {
    await setDoc(doc(db, 'organizations', org.id), org);
    console.log('Migrated Organization:', org.id);
  }

  for (const member of serverMembers) {
    await setDoc(doc(db, 'members', member.id), member);
    console.log('Migrated Member:', member.id);
  }

  for (const space of serverSpaces) {
    await setDoc(doc(db, 'spaces', space.id), space);
    console.log('Migrated Space:', space.id);
  }

  for (const booking of serverBookings) {
    await setDoc(doc(db, 'bookings', booking.id), booking);
    console.log('Migrated Booking:', booking.id);
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
