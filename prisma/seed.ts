import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // 1. Création de l'Organisation
  const org = await prisma.organization.upsert({
    where: { slug: 'ecoasset-demo' },
    update: {},
    create: {
      name: 'EcoAsset Demo',
      slug: 'ecoasset-demo',
      plan: 'PRO',
    },
  });
  console.log(`✅ Organisation créée: ${org.name}`);

  // 2. Création de l'Utilisateur Admin
  const passwordHash = await bcrypt.hash('Admin@123456!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecoasset.demo' },
    update: {},
    create: {
      email: 'admin@ecoasset.demo',
      passwordHash,
      displayName: 'Admin EcoAsset',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      organizationId: org.id,
    },
  });
  console.log(`✅ Utilisateur admin créé: ${admin.email}`);

  // 3. Création du Venue (Lieu)
  const venue = await prisma.venue.create({
    data: {
      name: 'Stade Olympique',
      address: '123 Avenue du Sport',
      city: 'Paris',
      country: 'FR',
      capacity: 50000,
    },
  });
  console.log(`✅ Lieu créé: ${venue.name}`);

  // 4. Création de l'Événement
  const event = await prisma.event.create({
    data: {
      title: 'Finale EcoAsset 2026',
      description: 'Le plus grand événement de l\'année.',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // dans 30 jours
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // + 4h
      venueId: venue.id,
      category: 'SPORT',
      type: 'MATCH',
      capacity: 50000,
      status: 'PUBLISHED',
      organizerId: admin.id,
      organizationId: org.id,
    },
  });
  console.log(`✅ Événement créé: ${event.title}`);

  // 5. Création des configurations de billets (TicketConfigs)
  await prisma.ticketConfig.createMany({
    data: [
      {
        eventId: event.id,
        name: 'VIP',
        tier: 'VIP',
        price: 250.00,
        quantityTotal: 1000,
      },
      {
        eventId: event.id,
        name: 'Premium',
        tier: 'PREMIUM',
        price: 120.00,
        quantityTotal: 5000,
      },
      {
        eventId: event.id,
        name: 'Standard',
        tier: 'STANDARD',
        price: 50.00,
        quantityTotal: 44000,
      }
    ],
  });
  console.log(`✅ Configurations de billets ajoutées`);

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
