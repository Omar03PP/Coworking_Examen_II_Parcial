import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function main() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const spacesData = [
    {
      name: 'Sala Ada Lovelace',
      description: 'Sala cerrada con ventanal, ideal para reuniones de equipo o sesiones de trabajo enfocado. Incluye pizarra blanca y conexión para videollamadas.',
      location: 'Piso 2 · Ala Norte',
      capacity: 6,
      type: 'SALA',
      imageUrl: '/images/sala-ada.jpg',
      amenities: ['Wifi', 'Proyector', 'Pizarra', 'Aire acondicionado'],
    },
    {
      name: 'Auditorio Margaret Hamilton',
      description: 'Auditorio amplio con capacidad para presentaciones y eventos. Equipado con sistema de sonido profesional y pantalla gigante.',
      location: 'Piso 1 · Ala Sur',
      capacity: 40,
      type: 'AUDITORIO',
      imageUrl: '/images/auditorio-margaret.jpg',
      amenities: ['Wifi', 'Proyector', 'Sonido', 'Café'],
    },
    {
      name: 'Escritorio Grace Hopper',
      description: 'Escritorio individual en área de coworking con luz natural. Perfecto para trabajo concentrado con todas las comodidades.',
      location: 'Piso 3 · Terraza',
      capacity: 1,
      type: 'ESCRITORIO',
      imageUrl: '/images/escritorio-grace.jpg',
      amenities: ['Wifi', 'Café', 'Ventanal'],
    },
    {
      name: 'Sala Alan Turing',
      description: 'Sala pequeña y acogedora para reuniones rápidas o llamadas privadas. Cuenta con pantalla y conexión HDMI.',
      location: 'Piso 2 · Ala Sur',
      capacity: 4,
      type: 'SALA',
      imageUrl: '/images/sala-alan.jpg',
      amenities: ['Wifi', 'Pantalla', 'Aire acondicionado'],
    },
    {
      name: 'Sala Katherine Johnson',
      description: 'Sala de reuniones ejecutiva con mobiliario ergonómico y equipo de videoconferencia. Ideal para presentaciones importantes.',
      location: 'Piso 1 · Ala Norte',
      capacity: 8,
      type: 'SALA',
      imageUrl: '/images/sala-katherine.jpg',
      amenities: ['Wifi', 'Proyector', 'Café', 'Pizarra', 'Sonido'],
    },
    {
      name: 'Escritorio Dennis Ritchie',
      description: 'Espacio colaborativo para dos personas, ideal para pair programming o trabajo en equipo. Incluye monitor adicional.',
      location: 'Piso 3 · Ala Este',
      capacity: 2,
      type: 'ESCRITORIO',
      imageUrl: '/images/escritorio-dennis.jpg',
      amenities: ['Wifi', 'Café', 'Monitor'],
    },
    {
      name: 'Auditorio Hedy Lamarr',
      description: 'Gran auditorio para conferencias y talleres. Cuenta con escenario, luces profesionales y sistema de transmisión en vivo.',
      location: 'Piso 2 · Sótano',
      capacity: 60,
      type: 'AUDITORIO',
      imageUrl: '/images/auditorio-hedy.jpg',
      amenities: ['Wifi', 'Proyector', 'Sonido', 'Café', 'Microfonos'],
    },
    {
      name: 'Sala Marta Peirano',
      description: 'Sala privada con ambiente tranquilo y decoración moderna. Perfecta para sesiones de trabajo profundo o lectura.',
      location: 'Piso 1 · Ala Oeste',
      capacity: 4,
      type: 'SALA',
      imageUrl: '/images/sala-marta.jpg',
      amenities: ['Wifi', 'Café', 'Ventanal', 'Aire acondicionado'],
    },
  ];

  const testUser = {
    name: 'Estudiante Uno',
    email: 'user1@test.com',
    password: await bcrypt.hash('password123', SALT_ROUNDS),
    role: 'USER',
  };

  const adminUser = {
    name: 'Admin Uno',
    email: 'admin@test.com',
    password: await bcrypt.hash('admin123', SALT_ROUNDS),
    role: 'ADMIN',
  };

  await prisma.user.upsert({ where: { email: testUser.email }, update: {}, create: testUser });
  await prisma.user.upsert({ where: { email: adminUser.email }, update: {}, create: adminUser });
  console.log('✓ Usuarios creados');

  for (const s of spacesData) {
    const existing = await prisma.space.findFirst({ where: { name: s.name } });
    if (!existing) {
      const { amenities, ...spaceData } = s;
      const space = await prisma.space.create({ data: spaceData });
      await prisma.amenity.createMany({
        data: amenities.map((name) => ({ name, icon: name.toLowerCase(), spaceId: space.id })),
      });
      console.log(`  + ${s.name}`);
    } else {
      console.log(`  = ${s.name} (ya existe)`);
    }
  }
  console.log('✓ Espacios y amenidades creados');

  const user1 = await prisma.user.findUnique({ where: { email: 'user1@test.com' } });
  const spaces = await prisma.space.findMany();
  if (user1 && spaces.length > 0) {
    const reviewData = [
      { spaceIdx: 0, rating: 5, comment: 'Excelente sala, muy cómoda y bien equipada. La pizarra y el proyector funcionan perfectamente.' },
      { spaceIdx: 1, rating: 4, comment: 'Auditorio amplio y con buen sonido. Ideal para presentaciones.' },
      { spaceIdx: 2, rating: 5, comment: 'Mi lugar favorito para trabajar. Mucha luz natural y ambiente tranquilo.' },
      { spaceIdx: 3, rating: 3, comment: 'Sala funcional pero algo pequeña para 4 personas. El wifi es estable.' },
      { spaceIdx: 4, rating: 5, comment: 'Perfecta para reuniones ejecutivas. El equipo de videoconferencia es de primera.' },
      { spaceIdx: 5, rating: 4, comment: 'Buen espacio para pair programming. El monitor adicional es muy útil.' },
      { spaceIdx: 6, rating: 5, comment: 'Auditorio impresionante. El sonido y la iluminación son de calidad profesional.' },
      { spaceIdx: 7, rating: 4, comment: 'Sala tranquila y bien decorada. Ideal para concentrarse y leer.' },
    ];

    for (const r of reviewData) {
      const sp = spaces[r.spaceIdx];
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 15) - 5);

      const existingReservation = await prisma.reservation.findFirst({
        where: { userId: user1.id, spaceId: sp.id, status: 'FINALIZED' },
      });

      if (!existingReservation) {
        const reservation = await prisma.reservation.create({
          data: {
            userId: user1.id,
            spaceId: sp.id,
            startTime: pastDate,
            endTime: new Date(pastDate.getTime() + 3600000),
            status: 'FINALIZED',
          },
        });

        const existingReview = await prisma.review.findUnique({
          where: { reservationId: reservation.id },
        });

        if (!existingReview) {
          await prisma.review.create({
            data: {
              rating: r.rating,
              comment: r.comment,
              userId: user1.id,
              spaceId: sp.id,
              reservationId: reservation.id,
            },
          });
          console.log(`  ★ Reseña para "${sp.name}" (${r.rating}/5)`);
        }
      }
    }
    console.log('✓ Reseñas de ejemplo creadas');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
