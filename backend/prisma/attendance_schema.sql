-- Add attendance schema to Prisma

-- Subject model (for tracking subjects taught in each batch)
model Subject {
  id          Int      @id @default(autoincrement())
  name        String
  code        String   @unique
  department  String
  semester    Int
  credits     Int      @default(3)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt

  sessions    AttendanceSession[]
  
  @@index([department])
  @@index([semester])
  @@index([code])
}

-- Faculty-Batch-Subject mapping (which faculty teaches which subject to which batch)
model FacultyBatchSubject {
  id          Int      @id @default(autoincrement())
  facultyId   Int
  batchId     Int
  subjectId   Int
  academicYear String  // e.g., "2024-25"
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt

  faculty     User     @relation("FacultyTeaching", fields: [facultyId], references: [id], onDelete: Cascade)
  batch       Batches  @relation(fields: [batchId], references: [BatchId], onDelete: Cascade)
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([facultyId, batchId, subjectId, academicYear])
  @@index([facultyId])
  @@index([batchId])
  @@index([subjectId])
}

-- Attendance Session (each class session)
model AttendanceSession {
  id          Int      @id @default(autoincrement())
  subjectId   Int
  batchId     Int
  facultyId   Int
  date        DateTime
  startTime   String   // e.g., "09:00"
  endTime     String   // e.g., "10:00"
  topic       String?  // Optional topic covered
  sessionType String   @default("LECTURE") // LECTURE, LAB, TUTORIAL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt

  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  batch       Batches  @relation("SessionBatch", fields: [batchId], references: [BatchId], onDelete: Cascade)
  faculty     User     @relation("SessionFaculty", fields: [facultyId], references: [id], onDelete: Cascade)
  records     AttendanceRecord[]

  @@index([subjectId])
  @@index([batchId])
  @@index([facultyId])
  @@index([date])
}

-- Individual attendance records
model AttendanceRecord {
  id          Int      @id @default(autoincrement())
  sessionId   Int
  studentId   Int
  status      AttendanceStatus @default(ABSENT)
  markedAt    DateTime @default(now())
  markedBy    Int      // Faculty who marked
  remarks     String?  // Optional remarks

  session     AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student     User     @relation("StudentAttendance", fields: [studentId], references: [id], onDelete: Cascade)
  faculty     User     @relation("MarkedBy", fields: [markedBy], references: [id], onDelete: Cascade)

  @@unique([sessionId, studentId])
  @@index([sessionId])
  @@index([studentId])
  @@index([status])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

-- Update existing models:

model User {
  // ... existing fields ...
  
  // Add these relations:
  teachingSessions     FacultyBatchSubject[] @relation("FacultyTeaching")
  conductedSessions    AttendanceSession[]   @relation("SessionFaculty")
  attendanceRecords    AttendanceRecord[]    @relation("StudentAttendance")
  markedAttendance     AttendanceRecord[]    @relation("MarkedBy")
}

model Batches {
  // ... existing fields ...
  
  // Add these relations:
  facultySubjects      FacultyBatchSubject[]
  attendanceSessions   AttendanceSession[]   @relation("SessionBatch")
}
