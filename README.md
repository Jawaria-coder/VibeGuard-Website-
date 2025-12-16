# VibeGuard  

See live at https://vibeguard-sigma.vercel.app/

VibeGuard is a **healthcare web application** designed to help users **check symptoms, explore possible causes, remedies, treatments, lifestyle tips, and connect with doctors**. It also provides users with a personalized **health dashboard** where they can track vital health metrics, download symptom reports, and manage their profile.  

The system also includes an **Admin Panel** for managing body parts, symptoms, doctors, medicines, and users.  

Deployed live on **Render**, VibeGuard is fully **responsive** (mobile & desktop) and secure, with authentication, JWT tokens, cookies, and database-backed storage.  

---

##  Features  

###  Public Features (No Login Required)  
- **Homepage**  
  - Responsive UI for mobile and desktop  
  - `Get Started` button → Login Page  
  - `Symptom Checker` button → Directly access symptom checking without login  

- **Symptom Checker**  
  - Browse or search by body parts (e.g., Heart, Head, Stomach, etc.)  
  - Select a body part → Choose related symptoms  
  - View:  
    - Overview & description  
    - Possible causes  
    - Precautions  
    - Remedies & lifestyle tips  
    - Recommended treatments  
    - Medicines with recommended doses  
  - `Find Doctors` option (doctor dataset with names, location, contact info, WhatsApp/Call placeholders)  

- **About Us Page**  
  - Learn about VibeGuard, its purpose, and team vision  

---

###  User Features (After Login/Signup)  

- **Authentication**  
  - Register/Login system with email verification  
  - Forgot Password (email reset with verification code)  
  - Secure login using **JWT tokens & cookies**  

- **User Dashboard**  
  - First-time setup: Add **name, age, gender, optional profile picture**  
  - Track health metrics:  
    - Weight  
    - Heart Rate  
    - Blood Pressure  
    - BMI  
  - Sidebar Navigation with:  
    - **Profile Settings** (update profile pic, username, password, delete account)  
    - **Find Doctors** (same dataset page)  
    - **Symptom Checker** (with logged-in benefits)  
    - **Symptom Report** (history of selected symptoms with date/time → Downloadable PDF)  
    - **Feedback Page** (submit feedback, see feedback summary)  
    - **Logout**  

---

###  Admin Features  

Accessible only with **admin credentials**:  

- Manage all entities:  
  - Body Parts (add/edit/delete)  
  - Symptoms (with details)  
  - Doctors dataset  
  - Medicines  
- Manage Users:  
  - View all registered users  
  - Suspend inactive users (>4–5 months) → automatic email notification  
  - Unsuspend upon user request via email  
- View & manage **Feedbacks**  
- Download **Admin Reports (PDF)** showing system activity & statistics  

---

##  Tech Stack  

### **Frontend**  
- HTML  
- CSS  
- JavaScript (Vanilla)  

### **Backend**  
- Node.js  
- Express.js  
- Express-Layouts  
- Middlewares for auth & session handling  

### **Database**  
- MongoDB  

### **Other Tools & Libraries**  
- **PDFKit** – Generate PDF reports  
- **Multer** – File uploads (profile pictures, etc.)  
- **Cookies & JWT Tokens** – Authentication & session management  
- **Nodemailer** – Email verification & password reset  
- **JSON Handling** – API responses & data handling  

---

##  How It Works  

1. Open the **live site on Render**  
2. Navigate through the homepage:  
   - Click **Get Started** → Login/Register  
   - OR use **Symptom Checker** directly  
3. Login/Register → Verify email → Access Dashboard  
4. Use **Dashboard** to:  
   - Track health stats  
   - Check & save symptom reports  
   - Generate PDF reports  
   - Find doctors & explore treatments  
5. Admins manage the system via **Admin Panel**  

---

##  Security  

- Only **authenticated users** can access their dashboard & reports  
- Passwords are **hashed** and stored securely  
- Session managed via **cookies & JWT**  
- Admin controls user suspensions for inactivity  

---

##  Project Structure  

```
VibeGuard/
├── public/ # Static files (CSS, JS, Images)
├── views/ # EJS views for frontend rendering
│ ├── home.ejs
│ ├── dashboard.ejs
│ ├── symptomChecker.ejs
│ └── admin-panel/
├── routes/ # Express routes (user, admin, doctors, symptoms)
├── models/ # Mongoose models (User, Doctor, Symptoms, etc.)
├── controllers/ # Business logic
├── middlewares/ # Auth & session middleware
├── utils/ # Helper functions (PDF, Email, etc.)
├── app.js # Main entry file
├── package.json
└── README.md
```


---

##  Installation  

### Live Run
- https://vibeguard-sigma.vercel.app/


### Run Locally

```bash
# Clone the repository
git clone https://github.com/Vibe-Guard/LocalRepo.git

# Navigate to project folder
cd VibeGuard

# Install dependencies
npm install

# Add your environment variables (MongoDB URI, Email credentials, JWT Secret)
touch .env

# Run locally
nodemon app.js

