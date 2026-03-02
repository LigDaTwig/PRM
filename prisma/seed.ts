import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const groups = [
    "Friends",
    "Tepper",
    "Work: Labra",
    "Work: Scalar",
    "Would Like to Know",
  ];

  for (const name of groups) {
    await prisma.group.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeded default groups:", groups.join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
