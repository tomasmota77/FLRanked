const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve('./dev.db') });
const db = new PrismaClient({ adapter });

async function main() {
  const msgs = await db.message.deleteMany();
  console.log('Deleted messages:', msgs.count);
  const players = await db.roomPlayer.deleteMany();
  console.log('Deleted room players:', players.count);
  const rooms = await db.room.deleteMany();
  console.log('Deleted rooms:', rooms.count);
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
