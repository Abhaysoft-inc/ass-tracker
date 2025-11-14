import { PrismaClient } from '../src/generated/prisma';
import hashPassword from '../src/utils/hashPassword';

const prisma = new PrismaClient();

interface FacultyData {
    name: string;
    code: string;
    designation: string;
    email: string;
    password: string;
    department: string;
    phone: string;
}

const facultyMembers: FacultyData[] = [
    {
        name: "Dr. Y.K. Chauhan",
        code: "YKC",
        designation: "Professor",
        email: "yk.chauhan@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543201"
    },
    {
        name: "Dr. S. M. Tripathi",
        code: "SMT",
        designation: "Associate Professor",
        email: "sm.tripathi@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543202"
    },
    {
        name: "Dr. Varun Kumar",
        code: "VK",
        designation: "Assistant Professor",
        email: "varun.kumar@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543203"
    },
    {
        name: "Dr. Dilip Kumar Patel",
        code: "DKP",
        designation: "Guest Faculty",
        email: "dilip.patel@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543204"
    },
    {
        name: "Dr. Baghat Singh Prajapati",
        code: "BSP",
        designation: "Guest Faculty",
        email: "baghat.singh@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543205"
    },
    {
        name: "Mr. P. N. Verma",
        code: "PNV",
        designation: "Guest Faculty",
        email: "pn.verma@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543206"
    },
    {
        name: "Mr. Nitish Kumar Rai",
        code: "NKR",
        designation: "Guest Faculty",
        email: "nitish.rai@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543207"
    },
    {
        name: "Mr. Ashutosh K. Singh",
        code: "AKS",
        designation: "Guest Faculty",
        email: "ashutosh.singh@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543208"
    },
    {
        name: "Mr. Manoj Kumar Yadav",
        code: "MKY",
        designation: "Guest Faculty",
        email: "manoj.yadav@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543209"
    },
    {
        name: "Ms. Stuti Kushawaha",
        code: "SK",
        designation: "Guest Faculty",
        email: "stuti.kushawaha@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543210"
    },
    {
        name: "Mr. Manish K. Singh",
        code: "MKS",
        designation: "Research Scholar",
        email: "manish.singh@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543211"
    },
    {
        name: "Mr. Pankaj K Dubey",
        code: "PKD",
        designation: "Research Scholar",
        email: "pankaj.dubey@knit.ac.in",
        password: "faculty@123",
        department: "Computer Science & Engineering",
        phone: "+91-9876543212"
    }
];

async function seedFaculty() {
    console.log('🌱 Starting faculty seed...\n');

    try {
        let createdCount = 0;
        let existingCount = 0;

        for (const facultyData of facultyMembers) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: facultyData.email }
            });

            if (existingUser) {
                console.log(`⏭️  ${facultyData.name} (${facultyData.code}) already exists`);
                existingCount++;
                continue;
            }

            // Hash the password
            const hashedPassword = await hashPassword(facultyData.password);

            // Create user and faculty in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        name: facultyData.name,
                        email: facultyData.email,
                        password: hashedPassword,
                        type: 'FACULTY',
                        isActive: true
                    }
                });

                // Create faculty profile
                const faculty = await tx.faculty.create({
                    data: {
                        userId: user.id,
                        phone: facultyData.phone,
                        department: facultyData.department,
                        isHOD: false
                    }
                });

                return { user, faculty };
            });

            console.log(`✅ Created ${facultyData.name} (${facultyData.code}) - ${facultyData.designation}`);
            console.log(`   📧 Email: ${facultyData.email}`);
            console.log(`   🔐 Password: ${facultyData.password}`);
            console.log(`   📱 Phone: ${facultyData.phone}\n`);

            createdCount++;
        }

        console.log('🎉 Faculty seeding completed!');
        console.log(`📊 Summary:`);
        console.log(`   ✅ Created: ${createdCount} faculty members`);
        console.log(`   ⏭️  Existing: ${existingCount} faculty members`);
        console.log(`   📝 Total processed: ${facultyMembers.length} faculty members\n`);

        // Display login credentials summary
        console.log('🔑 LOGIN CREDENTIALS SUMMARY:');
        console.log('='.repeat(80));
        console.log('| Name                        | Code | Email                      | Password    |');
        console.log('|' + '-'.repeat(78) + '|');

        for (const faculty of facultyMembers) {
            const nameCol = faculty.name.padEnd(27);
            const codeCol = faculty.code.padEnd(4);
            const emailCol = faculty.email.padEnd(26);
            const passCol = faculty.password.padEnd(11);
            console.log(`| ${nameCol} | ${codeCol} | ${emailCol} | ${passCol} |`);
        }
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error seeding faculty:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
if (require.main === module) {
    seedFaculty()
        .then(() => {
            console.log('✅ Faculty seed completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Faculty seed failed:', error);
            process.exit(1);
        });
}

export default seedFaculty;