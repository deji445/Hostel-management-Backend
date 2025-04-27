# Hostel Management Backend
---

## Requirements & Features

### 1. Student Registration & Housing Application✅
- **Register / Login**  
  - Students sign up (name, email, password) → JWT stored in `localStorage`  
  - Login with email/password → redirected to Student Dashboard  
- **Apply for Housing**  
  - “Available Rooms” shown as scrollable cards  
  - Click **Apply** → prompt for free‐form “preference” (e.g. “near window”)  
  - Creates an application record with `room_id` + `preference`  

### 2. Room Listings & Availability ✅
- **Display Hostels & Rooms**  
  - `/api/hostels` → list of hostel names + descriptions  
  - `/api/rooms/available` → rooms with `occupancy < capacity`  
- **Photos & Descriptions**  
  - Each room‐card shows an image (from `/images/…`) and a short description  
  - there is a Responsive grid   

### 3. Application Processing & Notification ✅
- **Admin Review**  
  - `/api/applications` → all student submissions with status  
  - there are  **Accept** / **Reject** buttons in one filterable table  

- **Notifications**  
  - On status change → student gets a dashboard notification badge  
  - Student “Notifications” card shows latest + “View All” toggle  

### 4. Allotment & Room Management ✅
- **View Assigned Rooms**  
  - Student Dashboard → “Your Assigned Room” panel updates on acceptance  
- **Manage Rooms**  
  - the Admin can “Create Room” form (choose image from a preset list)  
  - Edit room number & capacity via modal; status auto‐updates when full  
  - Delete rooms (fails if capacity/occupancy mismatch)  
- **Allotted Students**  
  - Admin panel “Allotted Students” shows who’s in which room  

---

----🛠 How to Operate-----

---for Student Workflow----

1-Register via register.html → auto-login

2-Browse Rooms on student.html

3-Click Apply → enter preference → see confirmation

4-Notifications card shows “pending”

5-After Admin decision → notification updates & “Your Assigned Room” shows


-----the Admin Workflow-----

-Login with the only admin username and password (username-admin@yourdomain.com///password-MySecretAdminPass)

Create Room: fill hostel_id, room_number, capacity, select from image dropdown, description

To view Applications:

Use filter buttons [All, Pending, Accepted, Rejected]

✔️ / ✖️ to accept/reject

also the allotted Students panel updates automatically

Edit Room: click “Edit” → modal popup → change number or capacity

Delete Room: click “Delete” (only if no conflicting occupancy)



-----How to run locally-----








-----Readings & Resources utilized i used  -----

Express and CORS -  https://expressjs.com/en/resources/middleware/cors.html

JWT Authentication - https://jwt.io/introduction

how to an Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
