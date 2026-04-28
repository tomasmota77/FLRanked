import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
  // Build an absolute file path for the SQLite database
  const dbFile = path.resolve(process.cwd(), "dev.db");
  const url = `file:${dbFile}`;

  console.log("DB_INIT: Connecting to SQLite at", url);

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
