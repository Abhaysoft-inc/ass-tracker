# 📊 Timetable System - Visual Architecture

## 🏗️ System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        TIMETABLE SYSTEM                            │
│                   (Versioned & Future-Proof)                       │
└───────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
        ┌───────────▼──────────┐  ┌─────────▼─────────┐
        │  TimetableVersion    │  │  TimetableVersion │
        │  "Odd Sem 2024-25"   │  │  "Updated"        │
        ├──────────────────────┤  ├───────────────────┤
        │ validFrom: Aug 1     │  │ validFrom: Nov 1  │
        │ validTo: Oct 31      │  │ validTo: Dec 31   │
        │ isActive: false      │  │ isActive: true    │
        │ semester: 3          │  │ semester: 3       │
        └──────────┬───────────┘  └─────────┬─────────┘
                   │                        │
           ┌───────┴────────┐       ┌───────┴────────┐
           │  25 Slots      │       │  25 Slots      │
           │  (Aug-Oct)     │       │  (Nov-Dec)     │
           └───────┬────────┘       └────────┬───────┘
                   │                         │
    ┌──────────────┼──────────────┐         │
    │              │              │         │
┌───▼────┐  ┌──────▼────┐  ┌─────▼──┐  ┌───▼────┐
│ Slot 1 │  │  Slot 2   │  │ Slot 3 │  │ Slot 1'│
├────────┤  ├───────────┤  ├────────┤  ├────────┤
│Mon 9-10│  │Mon 10-11  │  │Tue 9-10│  │Mon 9-10│
│Math    │  │Physics    │  │Math    │  │Math    │
│Fac: A  │  │Fac: B     │  │Fac: A  │  │Fac: C  │ ← Changed!
│Rm: 201 │  │Rm: 202    │  │Rm: 201 │  │Rm: 301 │ ← Changed!
└────┬───┘  └─────┬─────┘  └────┬───┘  └────┬───┘
     │            │              │           │
     │ optional   │              │           │ optional
     │ reference  │              │           │ reference
     │            │              │           │
┌────▼────────────▼──────────────▼───────────▼────────┐
│              ATTENDANCE SESSIONS                     │
│         (Independent, Never Changed)                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Session: Sep 20, 2024                              │
│  ├── subjectId: Math                                │
│  ├── facultyId: Faculty A  ← PRESERVED!             │
│  ├── batchId: Batch 2                               │
│  ├── roomNumber: (from slot) → 201                  │
│  ├── timetableSlotId: Slot 1                        │
│  └── AttendanceRecords:                             │
│      ├── Student 1: PRESENT                         │
│      ├── Student 2: ABSENT                          │
│      └── Student 3: LATE                            │
│                                                      │
│  Session: Oct 15, 2024                              │
│  ├── subjectId: Math                                │
│  ├── facultyId: Faculty A  ← PRESERVED!             │
│  ├── timetableSlotId: Slot 1                        │
│  └── AttendanceRecords: [ ... ]                     │
│                                                      │
│  Session: Nov 8, 2024                               │
│  ├── subjectId: Math                                │
│  ├── facultyId: Faculty C  ← NEW FACULTY!           │
│  ├── timetableSlotId: Slot 1' (new version)         │
│  └── AttendanceRecords: [ ... ]                     │
│                                                      │
│  Session: Nov 15, 2024 (Ad-hoc makeup class)        │
│  ├── subjectId: Math                                │
│  ├── facultyId: Faculty C                           │
│  ├── timetableSlotId: null  ← NOT FROM TIMETABLE!   │
│  └── AttendanceRecords: [ ... ]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Creating a Timetable

```
   HOD
    │
    │ 1. Create Version
    ▼
┌─────────────────┐
│TimetableVersion │
│   (Template)    │
└────────┬────────┘
         │
         │ 2. Add Slots
         ▼
┌─────────────────┐
│ TimetableSlot   │ ───┐
│  Mon 9-10 Math  │    │
└─────────────────┘    │
┌─────────────────┐    │
│ TimetableSlot   │    │  Weekly
│  Mon 10-11 Phy  │    ├─ Schedule
└─────────────────┘    │  (25 slots)
┌─────────────────┐    │
│ TimetableSlot   │    │
│  Tue 9-10 Math  │    │
└─────────────────┘ ───┘
```

### Taking Attendance

```
  Faculty
     │
     │ Views Today's Timetable
     ▼
┌──────────────────┐
│GET /today        │
│Returns:          │
│ - Mon 9-10 Math  │ ← From active TimetableSlot
│ - Mon 10-11 Phy  │
│ - Mon 11-12 Chem │
└─────────┬────────┘
          │
          │ Selects Class
          ▼
┌──────────────────┐
│POST /session     │
│ {               │
│   slotId: 5,    │ ← Links to timetable
│   date: today,  │
│   attendance: []│
│ }               │
└─────────┬────────┘
          │
          │ Creates
          ▼
┌──────────────────┐
│AttendanceSession │  ← Independent record!
│ + 30 Records     │
└──────────────────┘
```

### Changing Timetable

```
   HOD detects: Faculty A leaving, Faculty C joining
     │
     │ 1. Close old version
     ▼
┌─────────────────────┐
│ TimetableVersion 1  │
│ validTo: Oct 31     │ ← CLOSED
│ isActive: false     │
└─────────────────────┘
     │
     │ 2. Create new version
     ▼
┌─────────────────────┐
│ TimetableVersion 2  │
│ validFrom: Nov 1    │ ← ACTIVE
│ isActive: true      │
└──────────┬──────────┘
           │
           │ 3. Add slots with new faculty
           ▼
     ┌──────────────┐
     │ Slot: Mon    │
     │ Faculty: C   │ ← Changed from A!
     └──────────────┘

Result:
┌─────────────────────────────────────────┐
│ Old Sessions (Sep, Oct)                 │
│   ├── Link to Version 1                 │
│   └── Show Faculty A  ← PRESERVED!      │
│                                         │
│ New Sessions (Nov, Dec)                 │
│   ├── Link to Version 2                 │
│   └── Show Faculty C  ← UPDATED!        │
└─────────────────────────────────────────┘
```

---

## 🎯 Key Relationships

```
TimetableVersion ──┬── TimetableSlot ──┬── (optional) AttendanceSession
                   │                   │
                   └── TimetableSlot ──┘
                   
ONE VERSION → MANY SLOTS → MANY SESSIONS (optional)

AttendanceSession
├── MUST have: subjectId, facultyId, batchId, date
├── OPTIONAL: timetableSlotId (can be null)
└── HAS MANY: AttendanceRecords (student attendance)

Why optional?
✅ Allows ad-hoc sessions (makeup classes, guest lectures)
✅ Preserves old sessions when timetable changes
✅ System works with or without timetable reference
```

---

## 🔐 Data Protection Layers

```
Layer 1: Versioning
├── Multiple versions coexist
├── Date-based validity
└── No version can affect another

Layer 2: Soft Deletes
├── isActive flag (never hard delete)
├── Can recover deleted slots
└── Historical data visible in reports

Layer 3: Cascade Protection
├── onDelete: Restrict for Subject
├── onDelete: Restrict for Batch
├── onDelete: Restrict for Faculty
└── Can't delete if timetable references it

Layer 4: Optional Linking
├── AttendanceSession.timetableSlotId is nullable
├── Works with or without timetable
└── Ad-hoc sessions fully supported

Layer 5: Independent Storage
├── AttendanceSession stores: facultyId, subjectId, etc.
├── Not dependent on timetable for these values
└── Timetable change = no impact on attendance
```

---

## 📅 Timeline Example

```
August 2024
├── Create TimetableVersion 1 (Odd Sem 2024-25)
├── Add 25 slots (Faculty A teaches Math)
└── validFrom: Aug 1, validTo: null

September-October 2024
├── Faculty takes attendance using TimetableVersion 1
├── 50 attendance sessions created
└── All sessions link to Version 1 slots

November 2024 - Faculty Change!
├── Faculty A leaves, Faculty C joins
├── Close Version 1 (set validTo = Oct 31)
├── Create Version 2 (validFrom = Nov 1)
├── Add 25 slots (Faculty C teaches Math now)
└── Version 1 isActive = false, Version 2 isActive = true

November-December 2024
├── Faculty takes attendance using TimetableVersion 2
├── 40 attendance sessions created
└── All sessions link to Version 2 slots

Database State (Dec 31, 2024)
├── TimetableVersion 1 (Aug-Oct) [INACTIVE]
│   ├── 25 slots (Faculty A)
│   └── Referenced by 50 attendance sessions
│
├── TimetableVersion 2 (Nov-Dec) [ACTIVE]
│   ├── 25 slots (Faculty C)
│   └── Referenced by 40 attendance sessions
│
└── All 90 attendance sessions INTACT!
    ├── Sep sessions show Faculty A ✅
    ├── Oct sessions show Faculty A ✅
    ├── Nov sessions show Faculty C ✅
    └── Dec sessions show Faculty C ✅
```

---

## 🎓 The Magic of Independence

```
┌─────────────────────────────────────────────┐
│  WHY ATTENDANCE IS NEVER AFFECTED           │
├─────────────────────────────────────────────┤
│                                             │
│  AttendanceSession {                        │
│    id: 1,                                   │
│    subjectId: 5,        ← Stored directly! │
│    batchId: 2,          ← Stored directly! │
│    facultyId: 10,       ← Stored directly! │
│    date: "2024-09-20",  ← Stored directly! │
│    startTime: "09:00",  ← Stored directly! │
│    endTime: "10:00",    ← Stored directly! │
│    timetableSlotId: 15  ← Optional link    │
│  }                                          │
│                                             │
│  Even if:                                   │
│  ❌ TimetableSlot 15 is deleted             │
│  ❌ TimetableSlot 15 faculty is changed     │
│  ❌ TimetableSlot 15 room is changed        │
│  ❌ Entire TimetableVersion is deleted      │
│                                             │
│  This session's data remains UNCHANGED!     │
│  Because all critical fields are stored     │
│  directly in AttendanceSession, NOT         │
│  fetched from TimetableSlot!                │
│                                             │
│  timetableSlotId is just for:               │
│  - Analytics ("which slot was this?")       │
│  - Reporting ("compare plan vs actual")     │
│  - Auditing ("was this scheduled?")         │
│                                             │
│  But NOT for core attendance data! ✅       │
└─────────────────────────────────────────────┘
```

---

## 🚀 System Workflow Summary

1. **Setup Phase (HOD)**
   ```
   Create TimetableVersion
      ↓
   Add TimetableSlots (weekly schedule)
      ↓
   System activates version
   ```

2. **Daily Use (Faculty)**
   ```
   View today's timetable (from active version)
      ↓
   Select a class
      ↓
   Mark attendance (creates AttendanceSession)
      ↓
   Session stores all data independently
   ```

3. **Change Phase (HOD)**
   ```
   Detect need for change (faculty/room/time)
      ↓
   Close old TimetableVersion (set validTo)
      ↓
   Create new TimetableVersion (set validFrom)
      ↓
   Add new TimetableSlots with changes
      ↓
   Old sessions still reference old version ✅
   New sessions reference new version ✅
   ```

4. **Reporting Phase (All)**
   ```
   Query AttendanceSession
      ↓
   Each session has complete data
      ↓
   Historical accuracy preserved
      ↓
   No broken references, no data corruption ✅
   ```

---

## ✨ The Result

```
╔═══════════════════════════════════════════════════╗
║  GUARANTEE: Attendance Data is IMMORTAL           ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  ✅ Change faculty → Old attendance unchanged     ║
║  ✅ Change rooms → Old attendance unchanged       ║
║  ✅ Change timings → Old attendance unchanged     ║
║  ✅ Delete timetable → Old attendance unchanged   ║
║  ✅ New semester → Old attendance unchanged       ║
║  ✅ System upgrade → Old attendance unchanged     ║
║                                                   ║
║  Because: AttendanceSession is INDEPENDENT        ║
║           from TimetableSlot!                     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

**That's how we built a truly ROBUST timetable system! 🎉**

See `TIMETABLE_COMPLETE.md` for full documentation.
