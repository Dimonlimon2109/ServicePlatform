import { PrismaClient, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@example.com';

    // Проверяем, есть ли уже администратор
    const admin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!admin) {
        const hashedPassword = await bcrypt.hash('AdminPassword123', 10);

        await prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: hashedPassword,
                phone: '+1234567890',
                userType: UserType.ADMIN,
            },
        });

        console.log('✅ Администратор успешно создан');
    } else {
        console.log('ℹ️ Администратор уже существует');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
