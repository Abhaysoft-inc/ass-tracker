const { PrismaClient } = require('./src/generated/prisma');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'thisissecret';

async function debugAuth(email = 'hod@example.com') {
    try {
        console.log('Debugging authentication for:', email);
        
        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                hod: true
            }
        });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('✅ User found:', {
            id: user.id,
            name: user.name,
            email: user.email,
            type: user.type,
            hasHodRecord: !!user.hod
        });
        
        // 2. Check user type
        if (user.type !== 'HOD') {
            console.log('❌ User type is not HOD, it is:', user.type);
            return;
        }
        
        console.log('✅ User type is correct: HOD');
        
        // 3. Check HOD record
        if (!user.hod) {
            console.log('❌ No HOD record found for this user');
            return;
        }
        
        console.log('✅ HOD record found:', {
            department: user.hod.department,
            phone: user.hod.phone
        });
        
        // 4. Test token generation
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                type: user.type
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('✅ Token generated successfully');
        
        // 5. Test token verification
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified successfully:', decoded);
        
        // 6. Test assignments query
        const assignments = await prisma.assignment.findMany({
            where: {
                subject: {
                    department: user.hod.department
                }
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                batch: {
                    select: { BatchId: true, BatchName: true, course: true }
                },
                faculty: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        
        console.log(`✅ Found ${assignments.length} assignments for department: ${user.hod.department}`);
        
    } catch (error) {
        console.log('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run with the email provided as argument or default
const email = process.argv[2];
debugAuth(email);