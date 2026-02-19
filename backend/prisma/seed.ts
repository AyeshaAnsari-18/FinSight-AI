/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient, UserRole, JournalStatus } from '@prisma/client';
import * as argon2 from 'argon2'; 

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Secure Seed...');

  
  const passwordHash = await argon2.hash('password123');

  

   await prisma.user.upsert({
    where: { email: 'accountant@finsight.ai' },
    update: {},
    create: {
      email: 'accountant@finsight.ai',
      password: passwordHash, 
      name: 'Sarah Accountant',
      role: UserRole.ACCOUNTANT,
    },
  });

  

  await prisma.user.upsert({
    where: { email: 'manager@finsight.ai' },
    update: {},
    create: {
      email: 'manager@finsight.ai',
      password: passwordHash, 
      name: 'Mike Manager',
      role: UserRole.MANAGER,
    },
  });

  console.log('Users created with secure password: "password123"');

  
  await prisma.journalEntry.createMany({
    data: [
      {
        date: new Date('2026-01-15'),
        description: 'Office Supplies - January',
        reference: 'INV-2024-001',
        debit: 500.00,
        credit: 0.00,
        status: JournalStatus.POSTED,
      },
      {
        date: new Date('2026-01-20'),
        description: 'Duplicate Payment (Potential Error)',
        reference: 'INV-2024-001',
        debit: 500.00,
        credit: 0.00,
        status: JournalStatus.DRAFT,
        flagReason: 'Duplicate Reference Detected',
        riskScore: 85,
      },
    ],
  });

  console.log('Financial Records seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });