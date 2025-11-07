import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function seedTimetable() {
    console.log('🌱 Starting timetable seed...\n');

    try {
        // 1. Get or create a HOD user
        const hod = await prisma.user.findFirst({
            where: { type: 'HOD' }
        });

        if (!hod) {
            console.log('❌ No HOD found. Please create a HOD user first.');
            return;
        }

        console.log(`✅ Found HOD: ${hod.name}\n`);

        // 2. Create a timetable version
        const timetableVersion = await prisma.timetableVersion.create({
            data: {
                name: 'Odd Semester 2024-25',
                academicYear: '2024-25',
                semester: 3,
                validFrom: new Date('2024-08-01'),
                validTo: new Date('2024-12-31'),
                createdBy: hod.id,
                isActive: true
            }
        });

        console.log(`✅ Created timetable version: ${timetableVersion.name}`);
        console.log(`   Valid from ${timetableVersion.validFrom} to ${timetableVersion.validTo}\n`);

        // 3. Get some sample data
        const batch = await prisma.batches.findFirst();
        const subjects = await prisma.subject.findMany({ take: 5 });
        const faculty = await prisma.user.findMany({
            where: { type: 'FACULTY' },
            take: 3
        });

        if (!batch || subjects.length === 0 || faculty.length === 0) {
            console.log('❌ Need at least 1 batch, 5 subjects, and 3 faculty members');
            return;
        }

        console.log(`📚 Using batch: ${batch.BatchName}`);
        console.log(`👨‍🏫 Using ${faculty.length} faculty members`);
        console.log(`📖 Using ${subjects.length} subjects\n`);

        // 4. Create timetable slots for a week
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const timeSlots = [
            { start: '09:00', end: '10:00' },
            { start: '10:00', end: '11:00' },
            { start: '11:00', end: '12:00' },
            { start: '14:00', end: '15:00' },
            { start: '15:00', end: '16:00' }
        ];

        let slotCount = 0;
        const createdSlots = [];

        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
            const dayOfWeek = dayIndex + 1; // 1=Monday, 5=Friday

            for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
                const subject = subjects[slotCount % subjects.length];
                const facultyMember = faculty[slotCount % faculty.length];
                const time = timeSlots[timeIndex];

                const slot = await prisma.timetableSlot.create({
                    data: {
                        timetableVersionId: timetableVersion.id,
                        dayOfWeek,
                        startTime: time.start,
                        endTime: time.end,
                        subjectId: subject.id,
                        batchId: batch.BatchId,
                        facultyId: facultyMember.id,
                        roomNumber: `Room ${201 + slotCount}`,
                        sessionType: timeIndex === 3 ? 'LAB' : 'LECTURE'
                    },
                    include: {
                        subject: true,
                        faculty: { select: { name: true } }
                    }
                });

                createdSlots.push(slot);
                console.log(`   ✅ ${days[dayIndex]} ${time.start}-${time.end}: ${subject.name} by ${facultyMember.name}`);

                slotCount++;
                if (slotCount >= 25) break; // 5 classes per day × 5 days
            }
            if (slotCount >= 25) break;
        }

        console.log(`\n✅ Created ${createdSlots.length} timetable slots\n`);

        // 5. Demonstrate versioning by creating an updated version
        console.log('📝 Simulating a timetable change (faculty replacement)...\n');

        // Deactivate the old version
        await prisma.timetableVersion.update({
            where: { id: timetableVersion.id },
            data: {
                validTo: new Date('2024-10-31'),
                isActive: false
            }
        });

        // Create new version
        const updatedVersion = await prisma.timetableVersion.create({
            data: {
                name: 'Odd Semester 2024-25 (Updated)',
                academicYear: '2024-25',
                semester: 3,
                validFrom: new Date('2024-11-01'),
                validTo: new Date('2024-12-31'),
                createdBy: hod.id,
                isActive: true
            }
        });

        console.log(`✅ Created updated version: ${updatedVersion.name}`);
        console.log(`   Valid from ${updatedVersion.validFrom}\n`);

        // Copy some slots with changes
        const firstSlot = createdSlots[0];
        const newFaculty = faculty.find(f => f.id !== firstSlot.facultyId) || faculty[0];

        await prisma.timetableSlot.create({
            data: {
                timetableVersionId: updatedVersion.id,
                dayOfWeek: firstSlot.dayOfWeek,
                startTime: firstSlot.startTime,
                endTime: firstSlot.endTime,
                subjectId: firstSlot.subjectId,
                batchId: firstSlot.batchId,
                facultyId: newFaculty.id, // ← Changed faculty!
                roomNumber: 'Room 301', // ← Changed room!
                sessionType: firstSlot.sessionType
            }
        });

        console.log(`   ✅ Changed Monday 09:00-10:00 faculty from ${firstSlot.faculty.name} to ${newFaculty.name}`);
        console.log(`   ✅ Both versions preserved in database!\n`);

        console.log('🎉 Timetable seed completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Created ${createdSlots.length} slots in version 1`);
        console.log(`   - Created version 2 with updated faculty`);
        console.log(`   - Historical data integrity maintained`);
        console.log(`   - Old attendance sessions will still reference version 1`);
        console.log(`   - New attendance sessions will use version 2\n`);

    } catch (error) {
        console.error('❌ Error seeding timetable:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTimetable();
