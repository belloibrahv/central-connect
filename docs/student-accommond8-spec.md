# Student Accommond8 (CentralConnect) - Product Spec

## 1) Summary
Student Accommond8 is a hostel booking web portal called **CentralConnect**. It serves 7 hostels (6 in the South-West, 1 in Abuja) and 1k+ residents. It must support fast, safe, and smooth booking with very high traffic and many users booking at the same time. The portal must be very easy to use.

## 2) Goals
- Make booking simple and fast for residents.
- Stop double booking and reduce booking errors.
- Keep the site up even during heavy traffic.
- Provide clear reports for payments, residence, gender, date of birth, and issues.
- Let residents report issues and track resolution.

## 3) Non-Goals
- In-person check-in/out (handled by hostel staff).
- Building a full finance or accounting system.
- Multi-language support in phase 1 (can be added later).

## 4) Key Problems From Past
- Booking and onboarding failures.
- Site breaks during heavy traffic.
- Cannot handle over 1,000 residents.
- Simultaneous booking causes errors.
- Finance and maintenance are hard to manage due to poor data flow.

## 5) Users and Roles
### 5.1 Resident (student)
- Searches and books a bed/room.
- Pays for a booking.
- Reports issues in their hostel.
- Views booking and payment status.

### 5.2 Hostel Admin (per hostel)
- Manages rooms, beds, and prices.
- Reviews resident bookings.
- Tracks issues and resolves them.
- Views hostel-level reports.

### 5.3 Super Admin (central team)
- Manages all hostels and global settings.
- Views all reports.
- Manages roles and permissions.

### 5.4 Finance/Admin Staff
- Views payment reports.
- Exports payment data.

## 6) Hostels
There are 7 hostels (6 in the South-West, 1 in Abuja). The names below are the starting set for the platform:

South-West:
- Cocoa Grove (Male)
- Odua Court (Female)
- Lagoon View (Mixed)
- Hilltop House (Male)
- Sunrise Lodge (Female)
- Maple Court (Mixed)

Abuja:
- Unity Crest (Mixed)

Each hostel can have its own room types, bed count, and pricing. Gender rules can be changed per hostel if needed.

### 6.1 Room Types and Capacity (Default)
- Single: 1 bed
- Twin: 2 beds
- Triple: 3 beds
- Quad: 4 beds
- Premium: 2 beds (larger room, extra space)

### 6.2 Pricing (Default per bed, per term, in NGN)
South-West:
- Single: 280,000
- Twin: 220,000
- Triple: 190,000
- Quad: 170,000
- Premium: 320,000

Abuja:
- Single: 330,000
- Twin: 260,000
- Triple: 230,000
- Quad: 200,000
- Premium: 380,000

## 7) Core Features
### 7.1 Booking
- Search by hostel, room type, gender rules (if any), and dates.
- Real-time availability of rooms/beds.
- Step-by-step booking flow.
- Payment step with clear confirmation.
- Booking confirmation page and email/SMS (if available).
- Prevent double booking with a short time lock (hold) while user pays.

### 7.2 Issue Reporting
- Resident submits an issue with category, location, description, and images (optional).
- Admin sees the issue list and assigns a status:
  - New
  - In Progress
  - Resolved
- Resident can track issue status.

### 7.3 Reporting
Reports should be filterable by hostel, date range, and status:
- Payments (amount, date, status, method)
- Residence (room/bed by hostel)
- Gender (distribution)
- Date of Birth (age group summary)
- Issues and resolution time

### 7.4 Onboarding
- Simple account creation with basic profile details.
- Clear steps that tell users what to do next.
- Ability to continue where they stopped.

## 8) User Stories (Simple and Detailed)
### 8.1 Resident
1. As a resident, I want to create an account with my basic info so I can book a hostel.
   - Acceptance: I can sign up in less than 2 minutes.
2. As a resident, I want to see available beds so I can pick a hostel quickly.
   - Acceptance: The list shows only available beds.
3. As a resident, I want to book a bed and pay in one flow so I don’t lose my spot.
   - Acceptance: Once I pay, the bed is reserved for me.
4. As a resident, I want to see my booking status so I know if it is confirmed.
   - Acceptance: I can see “Pending”, “Confirmed”, or “Cancelled”.
5. As a resident, I want to report an issue so the hostel can fix it.
   - Acceptance: I can submit an issue in less than 1 minute.

### 8.2 Hostel Admin
1. As a hostel admin, I want to add rooms and beds so residents can book them.
   - Acceptance: I can create room types and bed counts.
2. As a hostel admin, I want to see all bookings for my hostel.
   - Acceptance: I can filter by date and status.
3. As a hostel admin, I want to manage issues so I can resolve them.
   - Acceptance: I can change issue status and add notes.

### 8.3 Super Admin
1. As a super admin, I want to manage all hostels in one place.
   - Acceptance: I can view all hostels and edit settings.
2. As a super admin, I want global reports.
   - Acceptance: I can filter reports by hostel and date range.

### 8.4 Finance/Admin Staff
1. As finance staff, I want to view payment reports.
   - Acceptance: I can export reports as CSV.

## 9) Booking Rules (Draft)
- A bed can only be booked by one resident at a time.
- When a resident starts payment, the bed is held for 10 minutes.
- If payment fails or time expires, the bed is released.
- If payment succeeds, the booking is confirmed.
- Term types:
  - Full session: 10 months (default).
  - Semester: 5 months (optional per hostel).
- Start and end dates are set per hostel each year.
- One active booking per resident per term.
- No self-cancel in v1. Cancellation requests go to hostel admin.
- Transfers are admin-only in v1.

## 10) Data to Capture
### 10.1 Resident Profile
- Full name
- Email or phone
- Gender
- Date of birth
- Hostel choice

### 10.2 Booking
- Hostel
- Room type
- Bed ID
- Start date / end date (if needed)
- Booking status
- Payment status

### 10.3 Issue
- Hostel
- Room/area
- Category (e.g., water, power, repair)
- Description
- Status
- Resolution notes

## 11) UI/UX Rules (Very Important)
- Use large buttons and clear labels.
- Keep forms short and split into steps.
- Show progress in the booking flow.
- Use plain words (no jargon).
- Provide clear success and error messages.
- Keep pages fast on mobile.

## 12) Performance and Reliability
- Target: handle 1,000+ residents and high traffic spikes.
- Pages should load in under 3 seconds on average.
- Booking actions should respond in under 2 seconds.
- Use caching for read-only data (hostel list, room types).
- Use a safe transaction system to avoid double booking.

## 13) Security and Privacy
- Secure login (hashed passwords, HTTPS).
- Role-based access control.
- Protect personal data (DOB, gender).
- Log all admin changes.

## 14) Tech Stack (Planned)
- Frontend: Advanced Fullstack Next.js tools
- Backend: API routes or separate API service (to be confirmed)
- Database: relational DB (PostgreSQL recommended)
- Hosting: scalable cloud setup (to be confirmed)

## 15) Actionable Steps (Phase Plan)
### Phase 1: Discovery
- Confirm hostel names and room types.
- Confirm pricing and payment flow.
- Confirm booking rules (duration, cancellation).
- Confirm data needed for reports.

### Phase 2: Design
- Create user flow diagrams.
- Create low-fidelity wireframes.
- Build a simple UI style guide.

### Phase 3: Build Core
- User auth and profile.
- Hostel and room setup.
- Booking flow with payment.
- Issue reporting and status updates.

### Phase 4: Reporting
- Build report filters.
- Add CSV export.

### Phase 5: Scale and Test
- Load test for traffic.
- Fix performance issues.
- Add monitoring and alerts.

### Phase 6: Launch
- Soft launch with one hostel.
- Collect feedback.
- Full launch to all hostels.

## 16) Open Questions
- What payment gateway will be used?
- Do we need email, SMS, or both for notifications?

---
End of document.
