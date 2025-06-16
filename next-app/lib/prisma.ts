import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV !== "production"
        ? ["query", "error", "warn"]
        : ["error"],   // en prod solo errores
  });


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
