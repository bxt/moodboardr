import { PrismaClient, User } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const bxt = await db.user.create({ data: {
    username: "bxt",
    passwordHash: "secret"
  }});

  for (const colorName of getColorNames({ bxt })) {
    await db.colorName.create({ data: colorName });
  }
}

seed();

function getColorNames({ bxt }: { bxt: User }) {
  return [
    {
      color: 'ff9900',
      name: 'Beatiful Orange',
      glossarist: { connect: { id: bxt.id } },
    },
    {
      color: 'c6f16d',
      name: 'XING Lime',
      glossarist: { connect: { id: bxt.id } },
    },
  ];
}