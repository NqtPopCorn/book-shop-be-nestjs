import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const password = await bcrypt.hash('change-me', 12);
  await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { email: 'admin@example.com', password, role: Role.ADMIN, firstName: 'Admin' } });
}
main().finally(() => prisma.$disconnect());
