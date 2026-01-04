# Complete Property Management & Booking Flow

## **System Architecture**

The e-Tracka platform now provides a complete flow for managing properties, tenants, and bookings:

---

## **1. LANDLORD WORKFLOW**

### **A. Create & List Properties**
1. **Login** → Get authenticated
2. **Create Property** → Upload details (name, description, price, location, images, status: RENT/BUY/SELL)
3. **Property Auto-Listed** → Property appears in public search results
4. **Manage Property** → View inquiries, applications, and tenants

### **B. Receive & Manage Applications**
1. **Tenant/User Applies** → Submit application to occupy property
   - No login required (public endpoint)
   - Provide: email, name, phone, move-in date, special requests
2. **Landlord Notified** → Email alert when application received
3. **Landlord Reviews Application** → Login and check `/booking/my-bookings`
4. **Approve or Reject**
   - **Approve**: Tenant gets confirmation email, next step is adding to property
   - **Reject**: Tenant notified with rejection reason

### **C. Receive & Manage Inquiries**
1. **Tenant/User Inquires** → Send message about property
   - No login required (public endpoint)
   - Provide: email, name, phone, message
2. **Landlord Notified** → Email alert
3. **Landlord Responds** → Login and reply with message
4. **Tenant Notified** → Gets landlord response email

### **D. Add Tenant to Property (After Approval)**
After application is approved:
1. **Landlord Adds Tenant** → POST `/landlord/addProperty`
   - Sends property confirmation email to tenant
2. **Tenant Confirms** → Clicks confirmation link or via endpoint
   - Status updates to COMPLETE
3. **Tenant Now Active** → Can receive receipts, notifications

### **E. Issue Receipts & Send Payments**
1. **Create Transaction** → POST `/transaction/create-transaction`
   - Define category (rent, utilities, etc.)
   - Set amount & due date
   - Select tenant recipients
2. **Generate Receipt** → PDF generated automatically
3. **Send Receipt** → Email with PDF attachment
4. **Track Receipt** → Receipt history saved in database
5. **Notify Tenants** → POST `/landlord/notify/tenant` for messages

### **F. End Tenancy**
1. **End Agreement** → PATCH `/landlord/end-tenant-agreement`
   - Removes tenant from property
   - Sends end agreement email

---

## **2. TENANT/USER WORKFLOW**

### **A. Search & Browse Properties**
1. **Search Properties** → GET `/properties/public/list` (no login)
   - See all available properties
   - Filter by status (RENT/BUY/SELL)
2. **View Property Details** → GET `/properties/public/:id` (no login)
   - See: name, description, price, location, images, landlord

### **B. Inquire About Property**
1. **Send Inquiry** → POST `/inquiry/create` (no login)
   - Provide: email, name, phone, message
   - Landlord receives email
2. **Receive Response** → Email when landlord replies
3. **View Your Inquiries** → GET `/inquiry/inquirer/:email` (no login)
4. **Close Inquiry** → PATCH `/inquiry/close/:inquiryId` (optional, with login)

### **C. Apply to Property**
1. **Submit Application** → POST `/booking/create` (no login)
   - Provide: email, name, phone, move-in date, special requests
   - Landlord receives email
2. **Wait for Approval** → Landlord reviews application
3. **Check Status** → GET `/booking/tenant/:email` (no login)
4. **Get Approval Email** → Landlord approves
5. **Confirmation Email** → Property confirmation sent
6. **Confirm Property** → Click link or PATCH `/tenant/confirmProperty/:tenantId/:propertyId`
7. **Active Tenant** → Now added to property

### **D. Receive Receipts & Notices**
1. **Receive Receipt** → Email with PDF attachment
   - Rent payment receipt
   - Utility bills receipt
   - Service charge receipt
2. **Receive Notifications** → Messages from landlord
3. **View Transactions** → GET `/transaction/:accountType`

### **E. Cancel Application** (Optional)
1. **Cancel** → PATCH `/booking/cancel/:bookingId` (with login)
   - Only before approval
   - Status → CANCELLED

---

## **3. KEY ENDPOINTS SUMMARY**

### **Public (No Auth Required)**
```
GET  /properties/public/list               - Browse all properties
GET  /properties/public/:id                - View property details
GET  /properties/public/status/:status     - Filter by status

POST /inquiry/create                       - Send property inquiry
GET  /inquiry/inquirer/:email              - View your inquiries
GET  /inquiry/property/:propertyId         - View inquiries for property

POST /booking/create                       - Submit property application
GET  /booking/tenant/:email                - Check application status
GET  /booking/property/:propertyId         - View applications for property
```

### **Protected (Auth Required)**
```
LANDLORD:
GET  /landlord/tenant                      - View my tenants
POST /landlord/addProperty                 - Add tenant to property
PATCH /landlord/confirmTenant              - Confirm tenant
PATCH /landlord/end-tenant-agreement       - Remove tenant
PATCH /landlord/notify/tenant              - Send message to tenants
GET  /booking/my-bookings                  - View applications
PATCH /booking/approve                     - Approve application
PATCH /booking/reject                      - Reject application
GET  /inquiry/my-inquiries                 - View inquiries
PATCH /inquiry/respond                     - Reply to inquiry

TENANT:
PATCH /tenant/confirmProperty/:id/:id      - Confirm property
GET  /booking/my-bookings                  - View my applications
GET  /transaction/:accountType             - View receipts
```

---

## **4. DATA FLOW DIAGRAM**

```
USER SEARCHES PROPERTY
        ↓
(GET /properties/public/list)
        ↓
USER SEES PROPERTY DETAILS
        ↓
USER CHOOSES ACTION:
        ├── INQUIRE ABOUT PROPERTY
        │   ├── POST /inquiry/create
        │   ├── Landlord gets email
        │   └── Landlord responds
        │
        └── APPLY TO PROPERTY
            ├── POST /booking/create
            ├── Landlord gets email
            ├── Landlord approves/rejects
            ├── (If approved)
            │   ├── Landlord adds to property
            │   ├── Tenant confirms
            │   └── Tenant becomes ACTIVE
            └── (If active)
                ├── Receives receipts
                ├── Receives notifications
                └── Can end agreement
```

---

## **5. STATUS PROGRESSION**

### **Application Status**
```
PENDING → APPROVED → COMPLETED
       ↘ REJECTED
         ↓
       CANCELLED (anytime)
```

### **Tenant Assignment Status (in Property)**
```
INCOMPLETE → COMPLETE (Confirmed by tenant)
```

### **Inquiry Status**
```
PENDING → CONTACTED → CLOSED
```

---

## **6. EMAIL NOTIFICATIONS**

### **Automatic Emails Sent:**

**Landlord:**
- ✉️ New inquiry received
- ✉️ New application received
- ✉️ Application action notifications

**Tenant:**
- ✉️ Property confirmation link
- ✉️ Response to inquiry
- ✉️ Application approved/rejected
- ✉️ Receipt with PDF
- ✉️ Notifications from landlord
- ✉️ Tenancy agreement ended

---

## **SUMMARY**

✅ **Landlords can:**
- Create properties that auto-list publicly
- Receive applications without users needing to login
- Approve/reject applications
- Manually add approved tenants to properties
- Send receipts and notifications to tenants

✅ **Users/Tenants can:**
- Browse properties without logging in
- Inquire about properties without logging in
- Apply to properties without logging in
- Check application status anytime
- Get approved and become active tenants
- Receive receipts and messages

✅ **Complete Lifecycle:**
Property Created → User Finds It → User Applies → Landlord Approves → Tenant Added → Tenant Receives Receipts → Tenancy Ended
