# Faculty Authentication - Quick Test Guide

## 🧪 How to Test Faculty Login

### Step 1: Create a Faculty Account (via HOD)

1. **Login as HOD**
   - Email: (your HOD email)
   - Password: (your HOD password)

2. **Navigate to Faculty Management**
   - Click on "Faculty" in HOD dashboard
   - Click "Add Faculty" button

3. **Create Test Faculty**
   ```
   Name: Test Faculty
   Email: faculty@test.com
   Password: faculty123
   Phone: 1234567890
   Department: Computer Science
   ```

4. **Submit** - Faculty account is created!

---

### Step 2: Login as Faculty

1. **Navigate to Faculty Login**
   - Go to `/faculty/login` screen

2. **Enter Credentials**
   ```
   Email: faculty@test.com
   Password: faculty123
   ```

3. **Click "Login as Faculty"**
   - You should see a loading spinner
   - On success: "Login successful!" alert
   - Click OK to navigate to dashboard

4. **Verify Token Storage**
   - Token is stored in SecureStore as `facultyToken`
   - User data stored as `facultyUser`

---

### Step 3: Test Protected Routes

Once logged in, test these features:

#### Take Attendance
1. Navigate to "Take Attendance"
2. Should see teaching assignments (if any)
3. Select a class
4. Mark attendance
5. Submit successfully ✅

#### View Sessions
1. Navigate to attendance history
2. Should see past sessions
3. All data authenticated ✅

---

## 🔍 Verify Authentication

### Check Token in Code
```typescript
import * as SecureStore from 'expo-secure-store';

// Get token
const token = await SecureStore.getItemAsync('facultyToken');
console.log('Faculty Token:', token);

// Get user data
const userData = await SecureStore.getItemAsync('facultyUser');
const user = JSON.parse(userData);
console.log('Faculty User:', user);
// Output: { id: 1, name: "Test Faculty", email: "faculty@test.com", type: "FACULTY", department: "Computer Science" }
```

### Test API Call
```typescript
const response = await fetch(`${BASE_URL}/faculty/attendance/assignments`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## ❌ Test Error Cases

### Invalid Credentials
```
Email: wrong@email.com
Password: wrongpass
```
Expected: Alert "Invalid email or password" ✅

### Missing Fields
```
Email: (empty)
Password: test
```
Expected: Alert "Please enter email and password" ✅

### Wrong User Type
Login with student/HOD credentials at faculty login
Expected: Alert "Invalid email or password" ✅

---

## 🎯 Expected Behavior

### ✅ Success Flow
1. Enter valid faculty email/password
2. Click login button → shows loading spinner
3. API call to `/auth/faculty/login`
4. Token stored in SecureStore
5. Alert "Login successful!"
6. Click OK → Navigate to `/faculty/dashboard`
7. All protected routes work with token

### ❌ Failure Flow
1. Enter invalid credentials
2. Click login button → shows loading spinner
3. API returns error
4. Alert shows error message
5. Stay on login screen
6. Can try again

---

## 🔐 Security Checks

### Token Validation
- ✅ Token expires in 7 days
- ✅ Token includes: id, email, type, name (no password!)
- ✅ Token stored encrypted in SecureStore
- ✅ All faculty routes check token validity

### Password Security
- ✅ Password hashed with bcrypt
- ✅ Never sent/stored in plain text
- ✅ Minimum 6 characters enforced
- ✅ Compared securely on login

### User Type Verification
- ✅ Backend checks `user.type === 'FACULTY'`
- ✅ Middleware validates on every request
- ✅ Cannot login as student/HOD at faculty endpoint

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to server"
**Solution:** Check if backend is running on correct port
```bash
cd backend
npm run dev
```

### Issue: "Invalid email or password" (but credentials are correct)
**Solution:** Check if faculty exists in database
- Login as HOD
- Go to Faculty Management
- Verify faculty email exists

### Issue: Navigation fails after login
**Solution:** Check SecureStore permissions
- Ensure expo-secure-store is installed
- Token should be stored successfully

### Issue: Protected routes return 401
**Solution:** Verify token is being sent
```typescript
const token = await SecureStore.getItemAsync('facultyToken');
console.log('Token:', token); // Should not be null
```

---

## 📱 Sample Faculty Dashboard Flow

After successful login:

```
Faculty Dashboard
├── Take Attendance → Select class, mark students, submit
├── View Sessions → See history of conducted classes
├── Assignments → View teaching assignments
└── Profile → View/edit faculty profile
```

All routes authenticated with `facultyToken` ✅

---

## ✅ Checklist

Before reporting issues, verify:

- [ ] Backend server is running
- [ ] BASE_URL is correct in config/api.ts
- [ ] Faculty account exists (created by HOD)
- [ ] Email and password are correct
- [ ] Internet connection is stable
- [ ] SecureStore permissions granted
- [ ] Token is stored after login
- [ ] Navigation works after success alert

---

## 🎉 Success Criteria

Faculty authentication is working when:

1. ✅ Can login with valid credentials
2. ✅ Token is stored in SecureStore
3. ✅ Navigate to dashboard after login
4. ✅ Can access protected routes (attendance, etc.)
5. ✅ Invalid credentials show error
6. ✅ Loading states work correctly
7. ✅ Success/error alerts appear

**All criteria met = Faculty auth is fully functional!** 🚀
