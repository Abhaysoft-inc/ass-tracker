# 🎓 HOD Timetable Management - Complete API Reference

## 📋 Overview

The HOD now has **complete timetable management capabilities** with 15 powerful endpoints for creating, managing, and monitoring timetables.

---

## 🔐 Authentication

All endpoints require HOD authentication via the `authenticateHOD` middleware.

**Header Required:**
```
Authorization: Bearer <hod_token>
```

---

## 📊 Endpoint Categories

### 1️⃣ Timetable Version Management
- Create versions
- List versions
- Get specific version
- Update version
- Clone version

### 2️⃣ Slot Management
- Add slots to version
- Get all slots
- Update slot
- Delete slot (soft)

### 3️⃣ Batch Timetable Views
- View batch timetable
- Get batches for timetable

### 4️⃣ Resource Management
- Get subjects for timetable
- Get faculty for timetable

### 5️⃣ Analytics
- Get timetable statistics

---

## 🔧 Complete API Reference

### 1. Create Timetable Version

**Endpoint:** `POST /hod/timetable/version`

**Description:** Create a new timetable version for a semester. Automatically deactivates overlapping versions.

**Request Body:**
```json
{
  "name": "Odd Semester 2024-25",
  "academicYear": "2024-25",
  "semester": 3,
  "validFrom": "2024-08-01",
  "validTo": "2024-12-31"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timetable version created successfully",
  "data": {
    "id": 1,
    "name": "Odd Semester 2024-25",
    "academicYear": "2024-25",
    "semester": 3,
    "validFrom": "2024-08-01T00:00:00.000Z",
    "validTo": "2024-12-31T00:00:00.000Z",
    "isActive": true,
    "createdBy": 5,
    "createdAt": "2024-11-07T10:00:00.000Z",
    "updatedAt": "2024-11-07T10:00:00.000Z"
  }
}
```

**Validation:**
- ✅ Automatically deactivates overlapping active versions
- ✅ Validates required fields
- ✅ Creates active version by default

---

### 2. Get All Timetable Versions

**Endpoint:** `GET /hod/timetable/versions`

**Query Parameters:**
- `academicYear` (optional) - Filter by academic year
- `semester` (optional) - Filter by semester
- `isActive` (optional) - Filter by active status (true/false)

**Example Request:**
```
GET /hod/timetable/versions?semester=3&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Odd Semester 2024-25",
      "academicYear": "2024-25",
      "semester": 3,
      "validFrom": "2024-08-01T00:00:00.000Z",
      "validTo": "2024-12-31T00:00:00.000Z",
      "isActive": true,
      "createdBy": 5,
      "createdAt": "2024-11-07T10:00:00.000Z",
      "_count": {
        "slots": 25
      }
    }
  ]
}
```

---

### 3. Get Specific Timetable Version

**Endpoint:** `GET /hod/timetable/version/:versionId`

**Description:** Get detailed information about a specific timetable version including all slots.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Odd Semester 2024-25",
    "academicYear": "2024-25",
    "semester": 3,
    "validFrom": "2024-08-01T00:00:00.000Z",
    "validTo": "2024-12-31T00:00:00.000Z",
    "isActive": true,
    "slots": [
      {
        "id": 1,
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "10:00",
        "roomNumber": "201",
        "sessionType": "LECTURE",
        "isActive": true,
        "subject": {
          "id": 5,
          "name": "Mathematics",
          "code": "MATH101"
        },
        "batch": {
          "BatchId": 2,
          "BatchName": "CSE-A"
        },
        "faculty": {
          "id": 10,
          "name": "Dr. John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "_count": {
      "slots": 25
    }
  }
}
```

---

### 4. Update Timetable Version

**Endpoint:** `PUT /hod/timetable/version/:versionId`

**Description:** Update timetable version details (name, dates, status).

**Request Body:**
```json
{
  "name": "Odd Semester 2024-25 (Updated)",
  "validTo": "2024-12-31",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timetable version updated successfully",
  "data": {
    "id": 1,
    "name": "Odd Semester 2024-25 (Updated)",
    // ... updated fields
  }
}
```

**Use Cases:**
- Close old version (set `validTo` and `isActive: false`)
- Rename version
- Extend validity period

---

### 5. Add Slots to Version

**Endpoint:** `POST /hod/timetable/version/:versionId/slots`

**Description:** Add multiple timetable slots to a version. Validates all subjects, batches, and faculty exist.

**Request Body:**
```json
{
  "slots": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "subjectId": 5,
      "batchId": 2,
      "facultyId": 10,
      "roomNumber": "201",
      "sessionType": "LECTURE"
    },
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "11:00",
      "subjectId": 6,
      "batchId": 2,
      "facultyId": 11,
      "roomNumber": "202",
      "sessionType": "LAB"
    }
  ]
}
```

**Day of Week Values:**
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday
- 7 = Sunday

**Session Types:**
- LECTURE
- LAB
- TUTORIAL

**Response:**
```json
{
  "success": true,
  "message": "2 slots added successfully",
  "data": {
    "count": 2
  }
}
```

**Validation:**
- ✅ Checks if timetable version exists
- ✅ Validates all subjects exist
- ✅ Validates all batches exist
- ✅ Validates all faculty exist and are FACULTY type

---

### 6. Get All Slots for Version

**Endpoint:** `GET /hod/timetable/version/:versionId/slots`

**Query Parameters:**
- `batchId` (optional) - Filter by batch
- `dayOfWeek` (optional) - Filter by day (1-7)

**Example:**
```
GET /hod/timetable/version/1/slots?batchId=2&dayOfWeek=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "roomNumber": "201",
      "sessionType": "LECTURE",
      "isActive": true,
      "subject": {
        "id": 5,
        "name": "Mathematics",
        "code": "MATH101"
      },
      "batch": {
        "BatchId": 2,
        "BatchName": "CSE-A"
      },
      "faculty": {
        "id": 10,
        "name": "Dr. John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

### 7. Update Timetable Slot

**Endpoint:** `PUT /hod/timetable/slot/:slotId`

**Description:** Update any field of a timetable slot.

**Request Body:**
```json
{
  "facultyId": 15,
  "roomNumber": "301",
  "startTime": "09:30",
  "endTime": "10:30"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timetable slot updated successfully",
  "data": {
    "id": 1,
    "dayOfWeek": 1,
    "startTime": "09:30",
    "endTime": "10:30",
    "roomNumber": "301",
    "facultyId": 15,
    // ... complete slot data
  }
}
```

**Note:** Only update slot if no attendance has been taken. For slots with attendance history, create a new version instead!

---

### 8. Delete Timetable Slot

**Endpoint:** `DELETE /hod/timetable/slot/:slotId`

**Description:** Soft delete a timetable slot (sets `isActive = false`).

**Response:**
```json
{
  "success": true,
  "message": "Timetable slot deleted successfully",
  "data": {
    "id": 1,
    "isActive": false,
    // ... slot data
  }
}
```

**Note:** This is a soft delete. The slot remains in database for historical reference.

---

### 9. Get Batch Timetable

**Endpoint:** `GET /hod/timetable/batch/:batchId`

**Query Parameters:**
- `versionId` (optional) - Specific version ID, otherwise uses active version

**Description:** Get the complete timetable for a batch. Auto-selects active version if not specified.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": {
      "id": 1,
      "name": "Odd Semester 2024-25",
      "academicYear": "2024-25",
      "semester": 3,
      "isActive": true
    },
    "slots": [
      {
        "id": 1,
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "10:00",
        "subject": { "name": "Mathematics" },
        "faculty": { "name": "Dr. John Doe" },
        "roomNumber": "201"
      }
      // ... all slots for this batch
    ]
  }
}
```

---

### 10. Get All Batches

**Endpoint:** `GET /hod/timetable/batches`

**Description:** Get all active batches for timetable assignment.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "BatchId": 1,
      "BatchName": "CSE-A",
      "course": "Computer Science",
      "currentSemester": 3
    },
    {
      "BatchId": 2,
      "BatchName": "CSE-B",
      "course": "Computer Science",
      "currentSemester": 3
    }
  ]
}
```

---

### 11. Get All Subjects

**Endpoint:** `GET /hod/timetable/subjects`

**Query Parameters:**
- `semester` (optional) - Filter by semester
- `department` (optional) - Filter by department

**Example:**
```
GET /hod/timetable/subjects?semester=3&department=CSE
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Mathematics",
      "code": "MATH101",
      "department": "CSE",
      "semester": 3,
      "credits": 4
    },
    {
      "id": 6,
      "name": "Data Structures",
      "code": "CS201",
      "department": "CSE",
      "semester": 3,
      "credits": 3
    }
  ]
}
```

---

### 12. Get All Faculty

**Endpoint:** `GET /hod/timetable/faculty`

**Query Parameters:**
- `department` (optional) - Filter by department

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Dr. John Doe",
      "email": "john@example.com",
      "faculty": {
        "department": "CSE",
        "phone": "1234567890"
      }
    },
    {
      "id": 11,
      "name": "Dr. Jane Smith",
      "email": "jane@example.com",
      "faculty": {
        "department": "CSE",
        "phone": "0987654321"
      }
    }
  ]
}
```

---

### 13. Clone Timetable Version

**Endpoint:** `POST /hod/timetable/version/:versionId/clone`

**Description:** Create a copy of an existing timetable version with all its slots. Perfect for creating next semester's timetable based on current one.

**Request Body:**
```json
{
  "name": "Even Semester 2025-26",
  "academicYear": "2025-26",
  "semester": 4,
  "validFrom": "2025-01-01",
  "validTo": "2025-05-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timetable version cloned successfully",
  "data": {
    "id": 2,
    "name": "Even Semester 2025-26",
    "academicYear": "2025-26",
    "semester": 4,
    "isActive": false,
    "_count": {
      "slots": 25
    }
  }
}
```

**Use Cases:**
- Create next semester's timetable from current
- Create timetable for parallel batch
- Backup current timetable before major changes

---

### 14. Get Timetable Statistics

**Endpoint:** `GET /hod/timetable/stats`

**Description:** Get overall timetable system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVersions": 5,
    "activeVersions": 2,
    "totalSlots": 125,
    "activeSlots": 100,
    "slotsPerBatch": 4,
    "slotsPerFaculty": 8
  }
}
```

---

## 🔄 Common Workflows

### Workflow 1: Create New Semester Timetable

```bash
# Step 1: Create version
POST /hod/timetable/version
{
  "name": "Odd Semester 2024-25",
  "academicYear": "2024-25",
  "semester": 3,
  "validFrom": "2024-08-01",
  "validTo": "2024-12-31"
}
# Response: { "data": { "id": 1 } }

# Step 2: Get resources
GET /hod/timetable/batches
GET /hod/timetable/subjects?semester=3
GET /hod/timetable/faculty?department=CSE

# Step 3: Add all slots
POST /hod/timetable/version/1/slots
{
  "slots": [
    { "dayOfWeek": 1, "startTime": "09:00", ... },
    { "dayOfWeek": 1, "startTime": "10:00", ... },
    // ... 25 slots total
  ]
}

# Step 4: Verify
GET /hod/timetable/version/1
GET /hod/timetable/batch/2
```

---

### Workflow 2: Update Timetable Mid-Semester

```bash
# Step 1: Close old version
PUT /hod/timetable/version/1
{
  "validTo": "2024-10-31",
  "isActive": false
}

# Step 2: Clone old version
POST /hod/timetable/version/1/clone
{
  "name": "Odd Semester 2024-25 (Updated)",
  "validFrom": "2024-11-01"
}
# Response: { "data": { "id": 2 } }

# Step 3: Update specific slots
PUT /hod/timetable/slot/5
{
  "facultyId": 15,  // New faculty
  "roomNumber": "301"  // New room
}

# Step 4: Activate new version
PUT /hod/timetable/version/2
{
  "isActive": true
}
```

---

### Workflow 3: View Batch Schedule

```bash
# Option 1: View active timetable
GET /hod/timetable/batch/2

# Option 2: View specific version
GET /hod/timetable/batch/2?versionId=1

# Option 3: View specific day
GET /hod/timetable/version/1/slots?batchId=2&dayOfWeek=1
```

---

## 📊 Data Model Reference

### TimetableVersion
```typescript
{
  id: number
  name: string
  academicYear: string
  semester: number (1-8)
  validFrom: Date
  validTo: Date | null
  isActive: boolean
  createdBy: number (HOD user ID)
  createdAt: Date
  updatedAt: Date
}
```

### TimetableSlot
```typescript
{
  id: number
  timetableVersionId: number
  dayOfWeek: number (1-7, Mon-Sun)
  startTime: string ("HH:MM")
  endTime: string ("HH:MM")
  subjectId: number
  batchId: number
  facultyId: number
  roomNumber: string | null
  sessionType: "LECTURE" | "LAB" | "TUTORIAL"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## ✅ Validation Rules

### Version Creation
- ✅ Name, academicYear, semester, validFrom are required
- ✅ Semester must be 1-8
- ✅ validFrom must be a valid date
- ✅ Overlapping active versions are auto-deactivated

### Slot Creation
- ✅ All fields except roomNumber are required
- ✅ dayOfWeek must be 1-7
- ✅ Time format must be "HH:MM"
- ✅ startTime must be before endTime
- ✅ subjectId must exist in Subject table
- ✅ batchId must exist in Batches table
- ✅ facultyId must exist and be type FACULTY

---

## 🔒 Security Features

- ✅ All endpoints require HOD authentication
- ✅ Soft deletes preserve data integrity
- ✅ Cascade restrictions prevent accidental deletion
- ✅ Validation prevents invalid data entry
- ✅ Audit trail via createdBy field

---

## 🎯 Best Practices

### DO ✅
- Create new version for semester changes
- Clone existing version for minor updates
- Soft delete slots instead of updating (if attendance exists)
- Use descriptive version names
- Set validity dates clearly

### DON'T ❌
- Update slots that have attendance records
- Hard delete versions or slots
- Create overlapping active versions manually (system handles it)
- Delete subjects/batches/faculty in use by timetable

---

## 📱 Frontend Integration Guide

### HOD Dashboard Should Have:

1. **Timetable Overview**
   - List all versions (active/inactive)
   - Statistics cards (versions, slots, coverage)
   - Quick actions (create new, clone, view)

2. **Version Management**
   - Create new version form
   - Edit version details
   - Close/archive old versions
   - Clone version wizard

3. **Slot Editor**
   - Weekly grid view (7 days × time slots)
   - Drag-and-drop slot assignment
   - Batch/subject/faculty filters
   - Bulk operations (add multiple slots)

4. **Batch View**
   - Select batch dropdown
   - Weekly timetable display
   - Print/export functionality

5. **Resource Management**
   - View all subjects (with semester filter)
   - View all faculty (with department filter)
   - View all batches

---

## 🚀 Next Steps

### Backend: ✅ COMPLETE
- [x] All 14 HOD timetable endpoints implemented
- [x] Full CRUD operations
- [x] Validation and error handling
- [x] Resource management endpoints
- [x] Statistics and analytics

### Frontend: ⏳ PENDING
- [ ] HOD timetable management UI
- [ ] Weekly grid component
- [ ] Slot editor with drag-drop
- [ ] Version management screens
- [ ] Batch timetable viewer

---

## 📖 Summary

The HOD now has **complete timetable management power** with:

✅ **14 Dedicated Endpoints** - Full CRUD + analytics  
✅ **Version Control** - Create, update, clone, archive  
✅ **Slot Management** - Add, update, delete (soft)  
✅ **Batch Views** - Complete timetable for any batch  
✅ **Resource Access** - Subjects, faculty, batches  
✅ **Analytics** - Statistics and insights  
✅ **Data Integrity** - Validation + soft deletes  
✅ **Future-Proof** - Versioning preserves history  

**All ready for frontend implementation! 🎉**
