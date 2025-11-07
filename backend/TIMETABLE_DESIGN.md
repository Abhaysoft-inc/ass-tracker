# Robust Timetable System - Design & Implementation

## 🎯 Core Design Principles

This timetable system is designed with **data integrity** and **historical preservation** as top priorities. Even when timetables change, all attendance records remain intact and accurate.

---

## 🏗️ Architecture Overview

### 1. **Versioned Timetable System**
The system uses **TimetableVersion** to create snapshots of timetables:

```
TimetableVersion (Odd Sem 2024-25)
├── validFrom: 2024-08-01
├── validTo: 2024-12-31
└── TimetableSlots[]
    ├── Monday 9:00-10:00: Math (Batch A, Faculty X)
    ├── Monday 10:00-11:00: Physics (Batch A, Faculty Y)
    └── ...
```

### 2. **Separation of Concerns**
```
┌─────────────────────┐
│ TimetableVersion    │ ← Template/Schedule
├─────────────────────┤
│ TimetableSlot       │ ← Recurring class definitions
└─────────────────────┘
         ↓ (optional reference)
┌─────────────────────┐
│ AttendanceSession   │ ← Actual class instances
├─────────────────────┤
│ AttendanceRecord    │ ← Student attendance
└─────────────────────┘
```

**Key Point**: Attendance sessions are **independent** from timetable slots. They only optionally reference them for tracking purposes.

---

## 🔒 How Data Integrity is Maintained

### Scenario 1: **Timetable Changes Mid-Semester**

**Problem**: Faculty changes, room changes, or time changes shouldn't affect past attendance.

**Solution**:
1. **Create a new TimetableVersion** with `validFrom` = change date
2. Old version's `validTo` is set to the day before the change
3. **Past attendance sessions** reference the old version (if linked)
4. **New attendance sessions** can reference the new version
5. Both versions coexist peacefully in the database

```typescript
// Example: Faculty change on Oct 15, 2024

// Old Version (still valid for historical data)
TimetableVersion {
  id: 1,
  name: "Odd Sem 2024-25",
  validFrom: "2024-08-01",
  validTo: "2024-10-14",  // ← Closed
  isActive: false
}

// New Version (active going forward)
TimetableVersion {
  id: 2,
  name: "Odd Sem 2024-25 (Updated)",
  validFrom: "2024-10-15",
  validTo: null,
  isActive: true
}

// Past attendance sessions still reference version 1
AttendanceSession {
  date: "2024-09-20",
  timetableSlotId: 5,  // ← Points to old version's slot
  facultyId: 10,       // ← Old faculty
  ...
}

// New attendance sessions reference version 2
AttendanceSession {
  date: "2024-10-16",
  timetableSlotId: 25, // ← Points to new version's slot
  facultyId: 15,       // ← New faculty
  ...
}
```

### Scenario 2: **Complete Timetable Overhaul**

**Problem**: New academic year with completely different subjects/schedules.

**Solution**:
1. Create entirely new TimetableVersion for the new semester
2. Old version remains in database with `isActive: false`
3. All old attendance sessions remain linked to old timetable slots
4. Queries filter by date ranges automatically

```typescript
// Semester 3 Timetable (completed)
TimetableVersion {
  id: 1,
  semester: 3,
  validFrom: "2024-01-01",
  validTo: "2024-05-31",
  isActive: false
}

// Semester 4 Timetable (new)
TimetableVersion {
  id: 2,
  semester: 4,
  validFrom: "2024-08-01",
  validTo: null,
  isActive: true
}

// Attendance from Sem 3 still references old subjects/faculty
AttendanceSession (Sem 3) {
  date: "2024-03-15",
  subjectId: 5,  // ← Old subject (may not exist in Sem 4)
  ...
}
```

### Scenario 3: **Subject Deletion**

**Problem**: A subject is removed from the curriculum but has historical attendance.

**Solution**:
- **TimetableSlot** uses `onDelete: Restrict` for subjects
- Can't delete a subject if timetable slots reference it
- Instead, mark slot as `isActive: false` (soft delete)
- Historical data remains intact

```prisma
subject Subject @relation(..., onDelete: Restrict)
// ↑ Prevents accidental deletion
```

### Scenario 4: **Faculty Leaves Mid-Semester**

**Problem**: Faculty has taken attendance in past, but leaves the institution.

**Solution**:
1. **Don't delete the User record** (onDelete: Restrict protects it)
2. Set `user.isActive = false`
3. Update timetable slots with new faculty
4. Old attendance sessions still show who marked them

```typescript
// Old sessions preserve history
AttendanceSession {
  date: "2024-09-10",
  facultyId: 10,  // ← Old faculty (now inactive)
  markedBy: 10,   // ← Shows who took attendance
}

// New sessions use new faculty
AttendanceSession {
  date: "2024-10-20",
  facultyId: 15,  // ← New faculty
}
```

---

## 📊 Database Design Features

### 1. **Optional Linking**
```prisma
model AttendanceSession {
  timetableSlotId Int? // ← Optional!
  // Can create ad-hoc sessions not from timetable
}
```

**Why?**: 
- Extra classes (makeup/doubt sessions)
- Guest lectures
- Special workshops

### 2. **Soft Deletes**
```prisma
model TimetableSlot {
  isActive Boolean @default(true)
}
```

**Why?**: Never lose data, just hide it from current views

### 3. **Cascade Protection**
```prisma
subject Subject @relation(..., onDelete: Restrict)
batch   Batches @relation(..., onDelete: Restrict)
faculty User    @relation(..., onDelete: Restrict)
```

**Why?**: Prevent accidental deletion of referenced data

### 4. **Date-Based Validity**
```prisma
model TimetableVersion {
  validFrom DateTime
  validTo   DateTime?
}
```

**Why?**: Auto-select correct timetable based on date

---

## 🔄 Workflow Examples

### Creating a New Timetable

```typescript
// Step 1: HOD creates version
POST /timetable/hod/version
{
  "name": "Odd Semester 2024-25",
  "academicYear": "2024-25",
  "semester": 3,
  "validFrom": "2024-08-01",
  "validTo": "2024-12-31"
}

// Step 2: Add all slots
POST /timetable/hod/version/1/slots
{
  "slots": [
    {
      "dayOfWeek": 1,  // Monday
      "startTime": "09:00",
      "endTime": "10:00",
      "subjectId": 5,
      "batchId": 2,
      "facultyId": 10,
      "roomNumber": "201",
      "sessionType": "LECTURE"
    },
    // ... more slots
  ]
}
```

### Changing a Single Slot

```typescript
// Option 1: Soft delete old slot, create new one
DELETE /timetable/hod/slot/5  // Sets isActive = false

POST /timetable/hod/version/1/slots
{
  "slots": [{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "10:00",
    "subjectId": 5,
    "batchId": 2,
    "facultyId": 15,  // ← New faculty
    "roomNumber": "301"  // ← New room
  }]
}

// Option 2: Update existing (not recommended if attendance exists)
PUT /timetable/hod/slot/5
{
  "facultyId": 15,
  "roomNumber": "301"
}
```

### Faculty Taking Attendance

```typescript
// Faculty creates attendance session
POST /faculty/attendance/session
{
  "subjectId": 5,
  "batchId": 2,
  "date": "2024-09-20",
  "startTime": "09:00",
  "endTime": "10:00",
  "timetableSlotId": 5,  // ← Optional link to timetable
  "topic": "Differentiation",
  "sessionType": "LECTURE",
  "attendance": [
    { "studentId": 1, "status": "PRESENT" },
    { "studentId": 2, "status": "ABSENT" }
  ]
}
```

**Note**: Even if slot #5 is later deleted/changed, this session's data remains intact!

---

## 🎓 Benefits of This Design

### ✅ **Future-Proof**
- Timetables can change anytime
- No impact on historical data
- Supports multiple academic years

### ✅ **Accurate Reporting**
- Attendance reports show correct faculty/subject at that time
- No confusion about "who taught what when"
- Audit trail preserved

### ✅ **Flexible**
- Can create ad-hoc sessions outside timetable
- Supports makeup classes, extra sessions
- Faculty substitutions handled gracefully

### ✅ **Safe**
- Can't accidentally delete critical data
- Soft deletes allow recovery
- Restrict policies prevent cascading deletions

---

## 📱 API Endpoints Summary

### HOD Endpoints
- `POST /timetable/hod/version` - Create new timetable version
- `GET /timetable/hod/versions` - List all versions
- `POST /timetable/hod/version/:id/slots` - Add slots to version
- `PUT /timetable/hod/slot/:id` - Update a slot
- `DELETE /timetable/hod/slot/:id` - Soft delete slot
- `GET /timetable/hod/batch/:id/timetable` - View batch timetable

### Faculty Endpoints
- `GET /timetable/faculty/my-timetable` - View personal timetable
- `GET /timetable/faculty/today` - Today's classes

### Student Endpoints
- `GET /timetable/student/my-timetable` - View batch timetable
- `GET /timetable/student/today` - Today's classes

---

## 🔐 Security Considerations

1. **Authorization**: Only HODs can create/modify timetables
2. **Validation**: Date ranges validated to prevent overlaps
3. **Integrity**: Restrict deletes protect referenced data
4. **Audit**: CreatedBy field tracks who made changes

---

## 🚀 Migration Path

If you have existing attendance data:

1. Create a TimetableVersion for "Before Timetable System"
2. Set validFrom to earliest attendance date
3. Set validTo to today
4. Create TimetableSlots from existing patterns
5. Optionally link old AttendanceSessions to slots

---

## 📝 Summary

This timetable system ensures:
- ✅ **Historical attendance is never affected** by timetable changes
- ✅ **Complete audit trail** of what was taught, when, and by whom
- ✅ **Flexibility** for future changes without data loss
- ✅ **Safety** through restrict deletes and soft deletes
- ✅ **Scalability** for multiple semesters/years

**The key insight**: Timetables are **templates**, attendance sessions are **instances**. They can reference each other but are independent, ensuring data integrity forever! 🎯
