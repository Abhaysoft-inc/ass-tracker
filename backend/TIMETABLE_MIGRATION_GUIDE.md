# 🔄 Migration Guide: Existing Attendance → Timetable System

If you already have attendance data in your system, follow this guide to integrate it with the new timetable system **without losing any data**.

---

## ⚠️ Important: Your Existing Data is Safe

The new timetable system is **100% backward compatible**. Your existing attendance sessions will continue to work perfectly because:

✅ `AttendanceSession.timetableSlotId` is **optional** (`Int?`)  
✅ All existing sessions have `timetableSlotId = null`  
✅ The system works with or without timetable references  

---

## 📋 Migration Checklist

### Phase 1: Analyze Existing Data
```sql
-- Check how many attendance sessions you have
SELECT COUNT(*) FROM "AttendanceSession";

-- Check date range
SELECT MIN(date) as earliest, MAX(date) as latest 
FROM "AttendanceSession";

-- Check which subjects/batches are involved
SELECT DISTINCT s.name as subject, b."BatchName" as batch
FROM "AttendanceSession" a
JOIN "Subject" s ON a."subjectId" = s.id
JOIN "Batches" b ON a."batchId" = b."BatchId"
ORDER BY batch, subject;
```

### Phase 2: Create Historical Timetable Version (Optional)
This step is **optional** but recommended for clean data organization.

```typescript
// Create a "Legacy" timetable version
POST /timetable/hod/version
{
  "name": "Legacy Attendance (Pre-Timetable System)",
  "academicYear": "2024-25",
  "semester": 3, // Use appropriate semester
  "validFrom": "2024-01-01", // Earliest attendance date
  "validTo": "2024-11-06", // Today or last session date
  "isActive": false // Not active anymore
}
```

### Phase 3: Extract Patterns from Existing Data
```sql
-- Find recurring class patterns
SELECT 
  EXTRACT(DOW FROM date) as day_of_week,
  "startTime",
  "endTime",
  "subjectId",
  "batchId",
  "facultyId",
  COUNT(*) as occurrences
FROM "AttendanceSession"
GROUP BY day_of_week, "startTime", "endTime", "subjectId", "batchId", "facultyId"
HAVING COUNT(*) > 1 -- Only recurring patterns
ORDER BY day_of_week, "startTime";
```

This shows you which classes happen regularly (e.g., "Math on Monday at 9:00 AM").

### Phase 4: Create Current Timetable
Based on the patterns above, create your current timetable:

```typescript
// 1. Create version for current semester
POST /timetable/hod/version
{
  "name": "Odd Semester 2024-25",
  "academicYear": "2024-25",
  "semester": 3,
  "validFrom": "2024-11-07", // Today
  "validTo": "2024-12-31",
  "isActive": true
}

// 2. Add all recurring slots
POST /timetable/hod/version/:id/slots
{
  "slots": [
    {
      "dayOfWeek": 1, // Monday
      "startTime": "09:00",
      "endTime": "10:00",
      "subjectId": 5,
      "batchId": 2,
      "facultyId": 10,
      "roomNumber": "201",
      "sessionType": "LECTURE"
    },
    // Add all your recurring classes
  ]
}
```

### Phase 5: Link Future Attendance (Automatic)
Going forward, when faculty takes attendance:

```typescript
POST /faculty/attendance/session
{
  "subjectId": 5,
  "batchId": 2,
  "date": "2024-11-08",
  "startTime": "09:00",
  "endTime": "10:00",
  "timetableSlotId": 25, // ← Link to timetable slot
  "topic": "Calculus",
  "sessionType": "LECTURE",
  "attendance": [ /* ... */ ]
}
```

---

## 🔧 Optional: Backlink Old Sessions

If you want to link old attendance sessions to timetable slots (purely for analytics), you can create a migration script:

```typescript
// backend/prisma/backlink-attendance.ts
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function backlinkAttendance() {
  // Get the legacy timetable version
  const legacyVersion = await prisma.timetableVersion.findFirst({
    where: { name: { contains: 'Legacy' } }
  });

  if (!legacyVersion) {
    console.log('No legacy version found');
    return;
  }

  // Get all timetable slots in legacy version
  const slots = await prisma.timetableSlot.findMany({
    where: { timetableVersionId: legacyVersion.id }
  });

  // Match attendance sessions to slots
  for (const slot of slots) {
    const dayOfWeek = slot.dayOfWeek;
    
    // Update sessions that match this slot's pattern
    await prisma.attendanceSession.updateMany({
      where: {
        subjectId: slot.subjectId,
        batchId: slot.batchId,
        facultyId: slot.facultyId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timetableSlotId: null, // Only update unlinked sessions
        // Match day of week
        date: {
          // This is tricky in Prisma - you might need raw SQL
        }
      },
      data: {
        timetableSlotId: slot.id
      }
    });
  }

  console.log('Backlinking complete!');
}

backlinkAttendance();
```

**Note**: This is **completely optional**. Unlinking sessions work perfectly fine!

---

## 🎯 Recommended Approach

### For Most Users: **Soft Migration**
1. ✅ Keep existing attendance as-is (no timetableSlotId)
2. ✅ Create new timetable version starting today
3. ✅ Future attendance links to timetable
4. ✅ Reports/analytics work on both old and new data

**Pros:**
- Zero risk of data corruption
- Immediate start
- Clean separation of legacy vs. new

### For Data Perfectionists: **Full Migration**
1. Create legacy timetable version
2. Extract patterns from old sessions
3. Create slots in legacy version
4. Backlink old sessions
5. Create current timetable version
6. Link future sessions

**Pros:**
- Complete data linkage
- Better analytics
- Cleaner data model

**Cons:**
- More upfront work
- Risk of errors in pattern detection

---

## 📊 Verifying Migration

### Check Linked vs Unlinked Sessions
```sql
-- Sessions without timetable link (legacy)
SELECT COUNT(*) as legacy_sessions
FROM "AttendanceSession"
WHERE "timetableSlotId" IS NULL;

-- Sessions with timetable link (new)
SELECT COUNT(*) as new_sessions
FROM "AttendanceSession"
WHERE "timetableSlotId" IS NOT NULL;
```

### Verify Timetable Coverage
```sql
-- Check all active timetable slots
SELECT 
  tv.name as version,
  t."dayOfWeek",
  t."startTime",
  t."endTime",
  s.name as subject,
  b."BatchName" as batch
FROM "TimetableSlot" t
JOIN "TimetableVersion" tv ON t."timetableVersionId" = tv.id
JOIN "Subject" s ON t."subjectId" = s.id
JOIN "Batches" b ON t."batchId" = b."BatchId"
WHERE tv."isActive" = true
ORDER BY t."dayOfWeek", t."startTime";
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Can't find active timetable"
**Solution**: Make sure you've created a TimetableVersion with:
- `isActive = true`
- `validFrom <= today`
- `validTo >= today` OR `validTo = null`

### Issue 2: "Old attendance not showing"
**Solution**: This is expected! Old sessions have `timetableSlotId = null`, which is fine. They still work in:
- Attendance reports
- Student attendance view
- Faculty attendance history

### Issue 3: "Want to link old session to new timetable"
**Solution**: Don't! Old sessions should reference old timetables (if any). This preserves historical accuracy.

---

## ✅ Migration Complete Checklist

- [ ] Analyzed existing attendance data
- [ ] Decided on soft vs. full migration
- [ ] Created current timetable version
- [ ] Added all recurring slots
- [ ] Tested faculty attendance creation
- [ ] Verified students can see timetable
- [ ] Verified faculty can see their schedule
- [ ] Confirmed old attendance still works
- [ ] Documented any special cases

---

## 🎓 Key Takeaway

**You don't need to migrate old data!** The system is designed to work with:
- Old sessions without timetable links
- New sessions with timetable links
- Mix of both

Just create a timetable for **today onwards**, and you're good to go! 🚀

---

## 📞 Need Help?

If migration issues occur:
1. Check `TIMETABLE_DESIGN.md` for architecture details
2. Review API endpoints in `TIMETABLE_README.md`
3. Inspect database schema in `schema.prisma`
4. Check sample seed in `seed-timetable.ts`

**Remember**: The safest approach is to start fresh from today and leave old data unchanged! ✅
