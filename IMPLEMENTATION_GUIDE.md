# e-Tracka Property Management System - Complete Implementation Guide

## Overview
This guide explains how to implement the e-Tracka property management system on both frontend and backend. The system allows:
- **Public Users**: Search properties, inquire, and apply for rentals without login
- **Landlords**: Manage properties, review applications, add tenants, track receipts
- **Tenants**: Receive updates, make payments, receive receipts

---

## System Workflow Architecture

### 1. Property Discovery & Inquiry Flow
```
User visits site → Views property list (no login) → Asks questions (inquiry) → Landlord responds
```

### 2. Application & Tenant Onboarding Flow
```
User views property → Submits application (no login) → Landlord approves → 
Landlord adds tenant to property → Tenant becomes active → Payments tracked
```

### 3. Payment & Receipt Flow
```
Transaction created → Receipt generated → Email sent to tenant → History tracked
```

---

## Database Models

### Property Model
```typescript
interface IProperty {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  year_built: number;
  number_of_bedrooms: number;
  number_of_bath: number;
  location: {
    city: string;
    state: string;
  };
  address: string;
  is_active?: boolean;
  status: 'RENT' | 'BUY' | 'SELL';
  apartmentType: 'Flat' | 'Duplex';
  image_list?: ObjectId[]; // References to FileItem documents
  tenant?: Array<{
    tenantId: string;
    status: 'INCOMPLETE' | 'COMPLETE';
    isActive: boolean;
  }>;
  category?: string;
  created_by: ObjectId; // References to User
  current_owner: ObjectId; // References to User
  createdAt: Date;
  updatedAt: Date;
}
```

### Inquiry Model
```typescript
interface IInquiry {
  _id: ObjectId;
  propertyId: ObjectId;
  propertyName: string;
  landlordId: ObjectId;
  inquirerEmail: string;
  inquirerName: string;
  inquirerPhone: string;
  message: string;
  status: 'PENDING' | 'CONTACTED' | 'CLOSED';
  landlordResponse?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking (Application) Model
```typescript
interface IBooking {
  _id: ObjectId;
  propertyId: string;
  propertyName: string;
  landlordId: string;
  tenantId: string;
  tenantEmail: string;
  tenantName: string;
  tenantPhone: string;
  requestedMonth: string; // Format: "2026-02" (YYYY-MM)
  specialRequests?: string;
  moveInDate?: Date; // Set by landlord AFTER approval
  noOfMonths?: number; // Set by landlord AFTER approval
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  landlordApprovalDate?: Date;
  landlordRejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Receipt Model
```typescript
interface IReceipt {
  _id: ObjectId;
  transactionId?: ObjectId;
  pdfUrl?: string;
  category?: string;
  amount?: number;
  recipientEmail?: string;
  status?: 'SENT' | 'DELIVERED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

interface IReceiptHistory {
  _id: ObjectId;
  transactionId: ObjectId;
  recipientId: ObjectId;
  recipientEmail: string;
  category: string;
  amount: number;
  dueDate: Date;
  pdfUrl: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt: Date;
  createdBy: ObjectId;
  createdAt: Date;
}
```

### NewTenant Model (for property-specific tenants)
```typescript
interface INewTenant {
  _id: ObjectId;
  propertyId: ObjectId;
  tenantId: ObjectId;
  moveInDate: Date;
  moveOutDate?: Date;
  rentAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints Reference

### PUBLIC ENDPOINTS (No Authentication Required)

#### 1. Property Search & Browse
```
GET /api/v1/properties/public/list
Description: Get all available properties
Response:
{
  "success": true,
  "data": [
    {
      "_id": "prop123",
      "name": "Modern 2-Bedroom Apartment",
      "location": {
        "city": "Lagos",
        "state": "Lagos"
      },
      "address": "Lekki, Lagos",
      "price": 500000,
      "number_of_bedrooms": 2,
      "number_of_bath": 1,
      "status": "RENT",
      "apartmentType": "Flat"
    }
  ]
}

GET /api/v1/properties/public/:id
Description: Get property details
Response: Single property object with all fields

GET /api/v1/properties/public/status/:status
Description: Filter properties by status (RENT, BUY, SELL)
Response: Array of properties with matching status
```

---

#### 2. Inquiries (Questions about Properties)
```
POST /api/v1/inquiry/create
Description: Submit a question about a property (no login needed)
Request Body:
{
  "propertyId": "prop123",
  "propertyName": "Modern 2-Bedroom Apartment",
  "inquirerEmail": "user@example.com",
  "inquirerName": "John Doe",
  "inquirerPhone": "08012345678",
  "message": "Is this property still available?"
}
Response:
{
  "success": true,
  "data": {
    "_id": "inq456",
    "propertyId": "prop123",
    "inquirerEmail": "user@example.com",
    "status": "PENDING",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
Email Sent: Landlord receives notification about new inquiry

---

GET /api/v1/inquiry/inquirer/:email
Description: Check inquiries sent from a specific email
Response: Array of inquiries from that email

GET /api/v1/inquiry/property/:propertyId
Description: Get all inquiries for a property (public info)
Response: Array of inquiry summaries
```

---

#### 3. Applications (Booking a Property)
```
POST /api/v1/booking/create
Description: Submit application to rent property (no login needed)
Request Body:
{
  "propertyId": "prop123",
  "propertyName": "Modern 2-Bedroom Apartment",
  "tenantEmail": "tenant@example.com",
  "tenantName": "Jane Smith",
  "tenantPhone": "08087654321",
  "requestedMonth": "2026-02",
  "specialRequests": "Need by end of February"
}
Response:
{
  "success": true,
  "data": {
    "_id": "book789",
    "propertyId": "prop123",
    "tenantEmail": "tenant@example.com",
    "status": "PENDING",
    "requestedMonth": "2026-02",
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
Email Sent: Landlord receives notification about new application

---

GET /api/v1/booking/inquirer/:email
Description: Track your applications by email
Response: Array of bookings
```

---

### PROTECTED ENDPOINTS (Landlord - Requires Authentication)

#### 4. Application Management
```
PATCH /api/v1/booking/approve
Description: Approve a tenant's application
Request Body:
{
  "bookingId": "book789"
}
Response:
{
  "success": true,
  "data": {
    "status": "APPROVED",
    "updatedAt": "2025-01-15T12:00:00Z"
  }
}
Email Sent: Tenant receives approval notification

---

PATCH /api/v1/booking/reject
Description: Reject an application
Request Body:
{
  "bookingId": "book789",
  "reason": "Property is no longer available"
}
Response:
{
  "success": true,
  "data": {
    "status": "REJECTED",
    "updatedAt": "2025-01-15T12:05:00Z"
  }
}
Email Sent: Tenant receives rejection notification

---

GET /api/v1/booking/landlord/:landlordId
Description: View all applications for your properties
Response: Array of bookings by status

---

PATCH /api/v1/booking/cancel/:bookingId
Description: Cancel an approved booking (by landlord)
Response: Updated booking with CANCELLED status
```

---

#### 5. Tenant Management (After Application Approval)
```
POST /api/v1/landlord/addProperty
Description: Add an approved tenant to your property
Request Body:
{
  "propertyId": "prop123",
  "tenantId": "user456",  // From approved booking
  "moveInDate": "2026-02-15",
  "moveOutDate": "2027-02-15",
  "rentAmount": 500000
}
Response:
{
  "success": true,
  "data": {
    "_id": "tenant123",
    "propertyId": "prop123",
    "tenantId": "user456",
    "status": "ACTIVE",
    "moveInDate": "2026-02-15",
    "rentAmount": 500000
  }
}
Email Sent: Tenant receives confirmation

---

PATCH /api/v1/landlord/confirmTenant
Description: Confirm tenant is ready to move in (must call addProperty first)
Request Body:
{
  "propertyId": "prop123",
  "tenantId": "user456",
  "tenantIndex": 0
}
Response:
{
  "success": true,
  "data": { confirmed tenant details }
}

---

PATCH /api/v1/landlord/end-tenant-agreement
Description: End a tenant's lease
Request Body:
{
  "propertyId": "prop123",
  "tenantIndex": 0
}
Response:
{
  "success": true,
  "data": { removed tenant details }
}

---

POST /api/v1/landlord/notify/tenant
Description: Send notification to tenant
Request Body:
{
  "propertyId": "prop123",
  "tenantIndex": 0,
  "message": "Please check the water meter",
  "accountType": 2  // Required for accountType check
}
Response:
{
  "success": true,
  "message": "Notification sent to tenant"
}
```

---

#### 6. Inquiry Response (Landlord)
```
PATCH /api/v1/inquiry/respond
Description: Reply to a tenant's inquiry
Request Body:
{
  "inquiryId": "inq456",
  "response": "Yes, the property is still available. Let me know if interested!"
}
Response:
{
  "success": true,
  "data": {
    "status": "CONTACTED",
    "landlordResponse": "Yes, the property is still available...",
    "respondedAt": "2025-01-15T12:30:00Z"
  }
}
Email Sent: Inquirer receives landlord's response

---

PATCH /api/v1/inquiry/close/:inquiryId
Description: Mark inquiry as resolved
Response: Updated inquiry with CLOSED status
```

---

### PROTECTED ENDPOINTS (Transactions & Receipts)

#### 7. Transaction & Receipt Management
```
POST /api/v1/transaction/create-transaction
Description: Create a transaction for tenant payment
Request Body:
{
  "transactionType": "rent",
  "amount": 500000,
  "paidBy": "user456",
  "category": "Rent Payment",
  "propertyId": "prop123",
  "tenantId": "user456",
  "status": "completed"
}
Response:
{
  "success": true,
  "data": {
    "_id": "txn789",
    "amount": 500000,
    "status": "completed"
  }
}
Note: Receipt history is automatically created

---

GET /api/v1/receipt/receipt-history
Description: Get all receipt history records
Response: Array of receipt history items

---

GET /api/v1/receipt/receipt-history/recipient/:recipientId
Description: Get receipts for a specific tenant
Response: Array of receipts for that tenant

---

GET /api/v1/receipt/send-receipt
Description: Generate and send receipt to tenant
Query Params:
  - transactionId: ID of transaction to generate receipt for
  - pdfUrl: URL to the PDF receipt file
Response:
{
  "success": true,
  "message": "Receipt sent to tenant",
  "receiptData": {
    "pdfUrl": "...",
    "status": "SENT",
    "sentAt": "2025-01-15T13:00:00Z"
  }
}
Email Sent: Tenant receives receipt

---

GET /api/v1/receipt/upload-receipt
Description: Upload receipt to storage
Query Params:
  - receiptHistoryId: ID of receipt history record
  - pdfUrl: URL to uploaded PDF
Response:
{
  "success": true,
  "data": {
    "pdfUrl": "...",
    "uploadedAt": "2025-01-15T13:05:00Z"
  }
}
```

---

## Frontend Implementation Guide

### 1. Property Search Page
```
Location: Your site's home/properties page

Steps:
1. Make GET request to /api/v1/properties/public/list
2. Display properties in grid/list format with:
   - Image carousel (from image_list)
   - Name, location, price, bedrooms, bathrooms
   - Apartment type (Flat/Duplex)
   - "View Details" button
   - "Ask Question" button (for inquiry)
   - "Apply Now" button (for booking)

3. Add filtering by status: RENT, BUY, SELL

Code Example (React/Next.js):
```javascript
import { useState, useEffect } from 'react';

export default function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch properties
    fetch('/api/v1/properties/public/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperties(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading properties...</div>;

  return (
    <div className="properties-grid">
      {properties.map(property => (
        <div key={property._id} className="property-card">
          <img src={property.image_list?.[0]?.url} alt={property.name} />
          <h3>{property.name}</h3>
          <p className="location">{property.location.city}, {property.location.state}</p>
          <p className="address">{property.address}</p>
          <p className="price">₦{property.price.toLocaleString()}</p>
          <p>{property.number_of_bedrooms} bed • {property.number_of_bath} bath • {property.apartmentType}</p>
          <p className="status">{property.status}</p>
          <button onClick={() => viewDetails(property._id)}>View Details</button>
          <button onClick={() => openInquiryForm(property)}>Ask Question</button>
          <button onClick={() => openApplicationForm(property)}>Apply Now</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Property Details Page
```
Location: /property/:id page

Steps:
1. Get property ID from URL params
2. Make GET request to /api/v1/properties/public/:id
3. Display full property details, images, features
4. Add "Ask Question" and "Apply Now" buttons

Code Example:
```javascript
import { useParams } from 'react-router-dom';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    fetch(`/api/v1/properties/public/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperty(data.data);
        }
      });
  }, [id]);

  if (!property) return <div>Loading...</div>;

  return (
    <div className="property-details">
      <img src={property.image_list?.[0]?.url} alt={property.name} />
      <h1>{property.name}</h1>
      <p className="location">{property.location.city}, {property.location.state}</p>
      <p className="address">{property.address}</p>
      <p className="price">₦{property.price.toLocaleString()}</p>
      <p className="year-built">Year Built: {property.year_built}</p>
      <p className="apt-type">Type: {property.apartmentType}</p>
      <p className="description">{property.description}</p>
      <ul className="specs">
        <li>{property.number_of_bedrooms} Bedrooms</li>
        <li>{property.number_of_bath} Bathrooms</li>
        <li>{property.apartmentType}</li>
        <li>Status: {property.status}</li>
      </ul>
      <button onClick={() => openInquiryForm(property)}>Ask Landlord a Question</button>
      <button onClick={() => openApplicationForm(property)}>Apply to Rent/Buy</button>
    </div>
  );
}
```

### 3. Inquiry Form (Ask a Question)
```
Form Fields:
- Email (required)
- Name (required, 2+ chars)
- Phone (required, 10+ chars)
- Message (required)

POST /api/v1/inquiry/create

Code Example:
```javascript
export default function InquiryForm({ property, onClose }) {
  const [formData, setFormData] = useState({
    inquirerEmail: '',
    inquirerName: '',
    inquirerPhone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/inquiry/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property._id || property.id,
          propertyName: property.name,
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Question sent! Landlord will respond soon.');
        onClose();
      } else {
        alert('Error: ' + data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inquiry-form">
      <h2>Ask {property.name} Landlord</h2>
      
      <input
        type="email"
        placeholder="Your Email"
        value={formData.inquirerEmail}
        onChange={(e) => setFormData({...formData, inquirerEmail: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Your Name"
        value={formData.inquirerName}
        onChange={(e) => setFormData({...formData, inquirerName: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Phone Number (10+ digits)"
        value={formData.inquirerPhone}
        onChange={(e) => setFormData({...formData, inquirerPhone: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Your Question"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        required
      ></textarea>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Question'}
      </button>
    </form>
  );
}
```

### 4. Application Form (Apply to Rent/Buy)
```
Form Fields:
- Email (required)
- Name (required, 2+ chars)
- Phone (required, 10+ chars)
- Requested Month (required, format: YYYY-MM like "2026-02")
- Special Requests (optional)

POST /api/v1/booking/create

Code Example:
```javascript
export default function ApplicationForm({ property, onClose }) {
  const [formData, setFormData] = useState({
    tenantEmail: '',
    tenantName: '',
    tenantPhone: '',
    requestedMonth: '', // Format: YYYY-MM
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate requestedMonth format
    if (!/^\d{4}-\d{2}$/.test(formData.requestedMonth)) {
      alert('Please enter month in format YYYY-MM (e.g., 2026-02)');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property._id || property.id,
          propertyName: property.name,
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Application submitted! Check your email for updates.');
        onClose();
      } else {
        alert('Error: ' + data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <h2>Apply for {property.name}</h2>
      
      <input
        type="email"
        placeholder="Your Email"
        value={formData.tenantEmail}
        onChange={(e) => setFormData({...formData, tenantEmail: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Your Full Name"
        value={formData.tenantName}
        onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.tenantPhone}
        onChange={(e) => setFormData({...formData, tenantPhone: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Requested Month (YYYY-MM, e.g., 2026-02)"
        value={formData.requestedMonth}
        onChange={(e) => setFormData({...formData, requestedMonth: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Any special requests or notes? (optional)"
        value={formData.specialRequests}
        onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
      ></textarea>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

### 5. Track Applications Page
```
Location: /my-applications page (user enters their email)

Steps:
1. User enters email used for application
2. Make GET request to /api/v1/booking/inquirer/:email
3. Display all applications with status and next steps

Code Example:
```javascript
export default function TrackApplications() {
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/v1/booking/inquirer/${email}`);
    const data = await response.json();
    
    if (data.success) {
      setApplications(data.data);
      setSearched(true);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Track Applications</button>
      </form>

      {searched && applications.length === 0 && (
        <p>No applications found for this email.</p>
      )}

      {applications.map(app => (
        <div key={app._id} className="application-card">
          <h3>{app.propertyName}</h3>
          <p>Status: <strong>{app.status}</strong></p>
          <p>Requested Month: {app.requestedMonth}</p>
          {app.status === 'APPROVED' && (
            <p className="success">Congratulations! Your application is approved. Landlord will contact you soon.</p>
          )}
          {app.status === 'REJECTED' && (
            <p className="error">Unfortunately, your application was rejected.</p>
          )}
          {app.status === 'PENDING' && (
            <p className="info">Waiting for landlord review...</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Landlord Dashboard Implementation

### 1. Applications Management Page
```
Location: Landlord dashboard → /landlord/applications

Steps:
1. User must be logged in
2. Make GET request to /api/v1/booking/landlord/:landlordId (use their user ID)
3. Display applications grouped by status: PENDING, APPROVED, REJECTED

Code Example:
```javascript
export default function ApplicationsManagement({ landlordId, authToken }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch landlord's applications
    fetch(`/api/v1/booking/landlord/${landlordId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApplications(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [landlordId, authToken]);

  const handleApprove = async (bookingId) => {
    const response = await fetch('/api/v1/booking/approve', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ bookingId }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Application approved! Tenant will be notified.');
      // Refresh applications
      setApplications(prev => 
        prev.map(app => app._id === bookingId ? {...app, status: 'APPROVED'} : app)
      );
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    const response = await fetch('/api/v1/booking/reject', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ bookingId, reason }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Application rejected! Tenant will be notified.');
      setApplications(prev => 
        prev.map(app => app._id === bookingId ? {...app, status: 'REJECTED'} : app)
      );
    }
  };

  if (loading) return <div>Loading applications...</div>;

  const pending = applications.filter(a => a.status === 'PENDING');
  const approved = applications.filter(a => a.status === 'APPROVED');
  const rejected = applications.filter(a => a.status === 'REJECTED');

  return (
    <div className="applications-management">
      <h1>Property Applications</h1>

      <section className="pending">
        <h2>Pending Applications ({pending.length})</h2>
        {pending.map(app => (
          <div key={app._id} className="application-item">
            <h3>{app.propertyName}</h3>
            <p><strong>From:</strong> {app.tenantName}</p>
            <p><strong>Email:</strong> {app.tenantEmail}</p>
            <p><strong>Phone:</strong> {app.tenantPhone}</p>
            <p><strong>Requested Month:</strong> {app.requestedMonth}</p>
            {app.specialRequests && <p><strong>Requests:</strong> {app.specialRequests}</p>}
            <button onClick={() => handleApprove(app._id)}>Approve</button>
            <button onClick={() => handleReject(app._id)}>Reject</button>
          </div>
        ))}
      </section>

      <section className="approved">
        <h2>Approved Applications ({approved.length})</h2>
        {approved.map(app => (
          <div key={app._id} className="application-item approved">
            <h3>{app.propertyName}</h3>
            <p><strong>Tenant:</strong> {app.tenantName}</p>
            <p><strong>Email:</strong> {app.tenantEmail}</p>
            <p><strong>Status:</strong> APPROVED - Next step: Add tenant to property</p>
            <button onClick={() => openAddTenantForm(app)}>Add as Tenant</button>
          </div>
        ))}
      </section>

      <section className="rejected">
        <h2>Rejected Applications ({rejected.length})</h2>
        {rejected.map(app => (
          <div key={app._id} className="application-item rejected">
            <h3>{app.propertyName}</h3>
            <p><strong>Applicant:</strong> {app.tenantName}</p>
            <p><strong>Status:</strong> REJECTED</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 2. Add Tenant to Property
```
Location: After approving application, landlord clicks "Add Tenant"

Steps:
1. Use approved booking data as pre-fill
2. Show form to set move-in date and lease terms
3. Make POST request to /api/v1/landlord/addProperty

Code Example:
```javascript
export default function AddTenantForm({ application, authToken }) {
  const [formData, setFormData] = useState({
    propertyId: application.propertyId,
    tenantId: application.tenantId || '',
    moveInDate: '',
    moveOutDate: '',
    rentAmount: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tenantId) {
      alert('Error: Tenant ID not available. Please contact support.');
      return;
    }

    const response = await fetch('/api/v1/landlord/addProperty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.success) {
      alert('Tenant added successfully!');
      // Close form, refresh list
    } else {
      alert('Error: ' + data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-tenant-form">
      <h2>Add Tenant: {application.tenantName}</h2>

      <div className="form-group">
        <label>Move-in Date *</label>
        <input
          type="date"
          value={formData.moveInDate}
          onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
          required
        />
        <small>This is the actual date the tenant moves in (from requested month: {application.requestedMonth})</small>
      </div>

      <div className="form-group">
        <label>Move-out Date *</label>
        <input
          type="date"
          value={formData.moveOutDate}
          onChange={(e) => setFormData({...formData, moveOutDate: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Monthly Rent Amount *</label>
        <input
          type="number"
          value={formData.rentAmount}
          onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
          placeholder="500000"
          required
        />
      </div>

      <button type="submit">Add Tenant to Property</button>
    </form>
  );
}
```

### 3. Inquiries Management
```
Location: Landlord dashboard → /landlord/inquiries

Steps:
1. Display all inquiries for landlord's properties
2. Show pending inquiries separately
3. Allow landlord to respond to each inquiry

Code Example:
```javascript
export default function InquiriesManagement({ landlordId, authToken }) {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    // Fetch inquiries (you may need to create this endpoint or filter by landlordId)
    fetch(`/api/v1/inquiry/landlord/${landlordId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInquiries(data.data);
        }
      });
  }, [landlordId, authToken]);

  const handleRespond = async (inquiryId, response) => {
    const res = await fetch('/api/v1/inquiry/respond', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ inquiryId, response }),
    });

    const data = await res.json();
    if (data.success) {
      alert('Response sent!');
      setInquiries(prev =>
        prev.map(inq => inq._id === inquiryId ? {...inq, status: 'CONTACTED'} : inq)
      );
    }
  };

  const pending = inquiries.filter(i => i.status === 'PENDING');
  const contacted = inquiries.filter(i => i.status === 'CONTACTED');

  return (
    <div className="inquiries-management">
      <h1>Property Inquiries</h1>

      <section className="pending">
        <h2>New Inquiries ({pending.length})</h2>
        {pending.map(inquiry => (
          <div key={inquiry._id} className="inquiry-card">
            <h3>{inquiry.propertyName}</h3>
            <p><strong>From:</strong> {inquiry.inquirerName} ({inquiry.inquirerEmail})</p>
            <p><strong>Phone:</strong> {inquiry.inquirerPhone}</p>
            <p><strong>Question:</strong> {inquiry.message}</p>
            <textarea
              placeholder="Your response..."
              onBlur={(e) => {
                if (e.target.value) {
                  handleRespond(inquiry._id, e.target.value);
                }
              }}
            />
          </div>
        ))}
      </section>

      <section className="contacted">
        <h2>Replied Inquiries ({contacted.length})</h2>
        {contacted.map(inquiry => (
          <div key={inquiry._id} className="inquiry-card contacted">
            <h3>{inquiry.propertyName}</h3>
            <p><strong>Inquirer:</strong> {inquiry.inquirerName}</p>
            <p><strong>Your Response:</strong> {inquiry.landlordResponse}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 4. Tenant Management
```
Location: Landlord dashboard → /landlord/tenants

Shows:
- Active tenants in each property
- When they moved in, when they move out
- Options to notify tenant, end agreement

Code Example:
```javascript
export default function TenantManagement({ landlordId, authToken }) {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Fetch landlord's properties with tenants
    fetch(`/api/v1/properties/landlord/${landlordId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperties(data.data);
        }
      });
  }, [landlordId, authToken]);

  const handleNotifyTenant = async (propertyId, tenantIndex, message) => {
    const response = await fetch('/api/v1/landlord/notify/tenant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        propertyId,
        tenantIndex,
        message,
        accountType: 2,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Notification sent to tenant!');
    }
  };

  const handleEndAgreement = async (propertyId, tenantIndex) => {
    if (!confirm('Are you sure? This will remove the tenant from the property.')) {
      return;
    }

    const response = await fetch('/api/v1/landlord/end-tenant-agreement', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ propertyId, tenantIndex }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Tenant removed successfully!');
      // Refresh properties
    }
  };

  return (
    <div className="tenant-management">
      <h1>Manage Your Tenants</h1>

      {properties.map(property => (
        <div key={property._id} className="property-section">
          <h2>{property.title}</h2>

          {property.tenants && property.tenants.length > 0 ? (
            <div className="tenants-list">
              {property.tenants.map((tenant, idx) => (
                <div key={idx} className="tenant-card">
                  <h3>{tenant.tenantName || 'Tenant'}</h3>
                  <p><strong>Move-in:</strong> {new Date(tenant.moveInDate).toLocaleDateString()}</p>
                  <p><strong>Move-out:</strong> {new Date(tenant.moveOutDate).toLocaleDateString()}</p>
                  <p><strong>Rent:</strong> ₦{tenant.rentAmount?.toLocaleString()}</p>
                  <p><strong>Status:</strong> {tenant.status}</p>

                  <button onClick={() => {
                    const msg = prompt('Message for tenant:');
                    if (msg) handleNotifyTenant(property._id, idx, msg);
                  }}>
                    Send Message
                  </button>

                  <button onClick={() => handleEndAgreement(property._id, idx)}>
                    End Agreement
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No active tenants for this property.</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 5. Receipts & Transactions
```
Location: Landlord dashboard → /landlord/receipts

Steps:
1. Show transaction history
2. Option to generate and send receipts
3. Track receipt delivery status

Code Example:
```javascript
export default function ReceiptsManagement({ landlordId, authToken }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Fetch transactions for landlord's properties/tenants
    fetch(`/api/v1/transaction/list?landlordId=${landlordId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTransactions(data.data);
        }
      });
  }, [landlordId, authToken]);

  const handleGenerateReceipt = async (transactionId) => {
    // 1. Generate PDF (you need PDF generation service)
    // 2. Upload to storage
    const pdfUrl = 'https://your-storage.com/receipt-' + transactionId + '.pdf';

    // 3. Send receipt to tenant
    const response = await fetch('/api/v1/receipt/send-receipt', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` },
      query: {
        transactionId,
        pdfUrl,
      }
    });

    const data = await response.json();
    if (data.success) {
      alert('Receipt sent to tenant!');
    }
  };

  return (
    <div className="receipts-management">
      <h1>Receipts & Transactions</h1>

      <table>
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn._id}>
              <td>{txn.tenantName}</td>
              <td>₦{txn.amount?.toLocaleString()}</td>
              <td>{txn.category || 'Payment'}</td>
              <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
              <td>{txn.status}</td>
              <td>
                <button onClick={() => handleGenerateReceipt(txn._id)}>
                  Send Receipt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Backend Integration Checklist

- [ ] Database connected (MongoDB)
- [ ] All models created (Property, Inquiry, Booking, Receipt, NewTenant, etc.)
- [ ] All routes registered in route-v1.index.ts
- [ ] Email service configured with SMTP
- [ ] Authentication middleware working
- [ ] CORS configured for frontend domain
- [ ] Public endpoints accessible without auth
- [ ] Protected endpoints require valid JWT token
- [ ] Error handling consistent with apiError/apiResponse
- [ ] Receipt history tracking implemented
- [ ] Tenant notification system working
- [ ] Inquiry response system working
- [ ] Application approval/rejection system working

---

## Testing Checklist

### Public User Flow
- [ ] User searches properties without login
- [ ] User views property details
- [ ] User submits inquiry (receives confirmation)
- [ ] Landlord receives inquiry email
- [ ] User submits application (receives confirmation)
- [ ] Landlord receives application email
- [ ] User tracks application status by email

### Landlord Flow
- [ ] Landlord logs in
- [ ] Views pending applications
- [ ] Approves/rejects application
- [ ] Tenant receives notification email
- [ ] Landlord adds approved tenant to property (sets moveInDate)
- [ ] Landlord confirms tenant is active
- [ ] Landlord can send messages to tenant
- [ ] Landlord can end tenant agreement

### Tenant (After Approval) Flow
- [ ] Receives application approval email
- [ ] Is added to property as active tenant
- [ ] Receives notifications from landlord
- [ ] Can make payments (transaction created)
- [ ] Receives receipt via email

---

## Email Templates Reference

### 1. New Inquiry Notification (to Landlord)
```
Subject: New Question About [Property Name]
From: noreply@etracker.com

Hi [Landlord Name],

[Inquirer Name] has asked a question about your property [Property Name]:

"[Message]"

Contact Information:
- Email: [Inquirer Email]
- Phone: [Inquirer Phone]

Please log in to your dashboard to respond.

Best regards,
e-Tracka Team
```

### 2. Inquiry Response (to User)
```
Subject: Response to Your Question About [Property Name]
From: noreply@etracker.com

Hi [Inquirer Name],

Thank you for your interest in [Property Name]! Here's the landlord's response:

"[Landlord Response]"

Next Steps: Contact the landlord directly or submit an application.

Best regards,
e-Tracka Team
```

### 3. New Application Notification (to Landlord)
```
Subject: New Application for [Property Name]
From: noreply@etracker.com

Hi [Landlord Name],

[Tenant Name] has submitted an application to occupy your property [Property Name].

Requested Month: [Requested Month]

Please log in to review and approve or reject the application.

Best regards,
e-Tracka Team
```

### 4. Application Approved (to Tenant)
```
Subject: Application Approved for [Property Name]
From: noreply@etracker.com

Hi [Tenant Name],

Congratulations! Your application for [Property Name] has been approved by [Landlord Name].

The landlord will contact you shortly to confirm the exact move-in date and payment details.

Best regards,
e-Tracka Team
```

### 5. Application Rejected (to Tenant)
```
Subject: Application Status for [Property Name]
From: noreply@etracker.com

Hi [Tenant Name],

Unfortunately, your application for [Property Name] has been rejected.

Reason: [Reason]

Please feel free to explore other properties on our platform.

Best regards,
e-Tracka Team
```

### 6. Tenant Added Confirmation (to Tenant)
```
Subject: You're Now an Active Tenant at [Property Name]
From: noreply@etracker.com

Hi [Tenant Name],

Great news! You've been added as a tenant to [Property Name].

Move-in Date: [Move-in Date]
Move-out Date: [Move-out Date]
Monthly Rent: ₦[Amount]

Please ensure payment is made before the move-in date. You can make payments through your tenant dashboard.

Best regards,
e-Tracka Team
```

### 7. Receipt (to Tenant)
```
Subject: Receipt - [Transaction Type] for [Property Name]
From: noreply@etracker.com

Hi [Tenant Name],

Please find attached your receipt for [Transaction Type].

Details:
- Property: [Property Name]
- Amount: ₦[Amount]
- Date: [Date]
- Reference: [Transaction ID]

Thank you for your payment!

Best regards,
e-Tracka Team

[PDF Attachment: receipt.pdf]
```

---

## Common Implementation Issues & Solutions

### Issue 1: Property field names don't match
**Solution**: 
- Property uses: `name` (not `title`), `number_of_bedrooms`, `number_of_bath`, `location` (object with city/state), `image_list`, `status` (RENT/BUY/SELL, not AVAILABLE/RENTED)
- Always reference actual field names from the model

### Issue 2: User submits application twice
**Solution**: Check if email + propertyId combination already exists before creating booking

### Issue 3: Landlord doesn't receive notification emails
**Solution**: 
- Verify email service is configured in environment variables
- Check landlord email is valid in database
- Check email logs for bounce-backs

### Issue 4: Tenant added but not showing in property
**Solution**:
- Ensure NewTenant record was created successfully
- Verify tenantId matches actual user ID
- Check property tenants array is populated correctly

### Issue 5: Receipt not reaching tenant
**Solution**:
- Verify tenant email is correct
- Check PDF URL is accessible
- Verify email service has the recipient's email

### Issue 6: Application stuck in PENDING status
**Solution**:
- Check landlord is actually clicking approve/reject
- Verify authorization check passes for landlord
- Check booking status enum is correct

---

## Environment Variables Required

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etracker

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-secret-key

# AWS S3 (for receipt uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=etracker-receipts
```

---

## Summary

This system provides a complete property management workflow:
1. **Users** can search, inquire, and apply for properties without login
2. **Landlords** can review and approve applications, set exact move-in dates, manage tenants
3. **Tenants** are tracked, notified, and can make payments
4. **Receipts** are automatically generated and sent to tenants
5. **Communication** is automated through email notifications

All endpoints follow RESTful principles with proper HTTP status codes and error handling.
