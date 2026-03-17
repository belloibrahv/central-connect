import "dotenv/config";
import { PrismaClient, GenderPolicy, TermType, TermStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hostels = [
  {
    name: "Cocoa Grove",
    city: "Ibadan",
    region: "South-West",
    genderPolicy: GenderPolicy.MALE
  },
  {
    name: "Odua Court",
    city: "Osogbo",
    region: "South-West",
    genderPolicy: GenderPolicy.FEMALE
  },
  {
    name: "Lagoon View",
    city: "Lagos",
    region: "South-West",
    genderPolicy: GenderPolicy.MIXED
  },
  {
    name: "Hilltop House",
    city: "Abeokuta",
    region: "South-West",
    genderPolicy: GenderPolicy.MALE
  },
  {
    name: "Sunrise Lodge",
    city: "Akure",
    region: "South-West",
    genderPolicy: GenderPolicy.FEMALE
  },
  {
    name: "Maple Court",
    city: "Ado-Ekiti",
    region: "South-West",
    genderPolicy: GenderPolicy.MIXED
  },
  {
    name: "Unity Crest",
    city: "Abuja",
    region: "Abuja",
    genderPolicy: GenderPolicy.MIXED
  }
];

const roomTypes = [
  { name: "Single", capacity: 1 },
  { name: "Twin", capacity: 2 },
  { name: "Triple", capacity: 3 },
  { name: "Quad", capacity: 4 },
  { name: "Premium", capacity: 2 }
];

const pricing = {
  "South-West": {
    Single: 280000,
    Twin: 220000,
    Triple: 190000,
    Quad: 170000,
    Premium: 320000
  },
  Abuja: {
    Single: 330000,
    Twin: 260000,
    Triple: 230000,
    Quad: 200000,
    Premium: 380000
  }
};

async function main() {
  const termStart = new Date("2026-09-01T00:00:00.000Z");
  const termEnd = new Date("2027-06-30T00:00:00.000Z");

  for (const hostel of hostels) {
    const created = await prisma.hostel.upsert({
      where: { name: hostel.name },
      update: hostel,
      create: hostel
    });

    const roomTypesData = [];

    for (const type of roomTypes) {
      const basePrice = pricing[hostel.region as keyof typeof pricing][type.name as keyof typeof pricing["South-West"]];

      const roomType = await prisma.roomType.upsert({
        where: { hostelId_name: { hostelId: created.id, name: type.name } },
        update: { capacity: type.capacity, basePrice },
        create: {
          hostelId: created.id,
          name: type.name,
          capacity: type.capacity,
          basePrice
        }
      });
      roomTypesData.push(roomType);
    }

    await prisma.term.upsert({
      where: {
        hostelId_termType_startDate_endDate: {
          hostelId: created.id,
          termType: TermType.FULL_SESSION,
          startDate: termStart,
          endDate: termEnd
        }
      },
      update: { status: TermStatus.OPEN },
      create: {
        hostelId: created.id,
        termType: TermType.FULL_SESSION,
        startDate: termStart,
        endDate: termEnd,
        status: TermStatus.OPEN
      }
    });

    const floors = ["Ground", "1st", "2nd", "3rd", "4th"];
    const roomsPerType = 8;

    for (const roomType of roomTypesData) {
      for (let r = 1; r <= roomsPerType; r++) {
        const floor = floors[Math.floor((r - 1) / 4)] || "Ground";
        const roomLabel = `${roomType.name}-${r.toString().padStart(2, "0")}`;

        const room = await prisma.room.upsert({
          where: {
            hostelId_label: { hostelId: created.id, label: roomLabel }
          },
          update: { roomTypeId: roomType.id, floor },
          create: {
            hostelId: created.id,
            roomTypeId: roomType.id,
            label: roomLabel,
            floor
          }
        });

        for (let b = 1; b <= roomType.capacity; b++) {
          const bedLabel = `${String.fromCharCode(64 + b)}`;

          await prisma.bed.upsert({
            where: {
              roomId_label: { roomId: room.id, label: bedLabel }
            },
            update: { hostelId: created.id },
            create: {
              roomId: room.id,
              hostelId: created.id,
              label: bedLabel
            }
          });
        }
      }
    }

    console.log(`Seeded ${created.name}: ${roomTypesData.length} room types, ${roomsPerType * roomTypesData.length} rooms`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
