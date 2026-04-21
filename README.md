#  ExpenseMate — Professional Financial Management Dashboard

ExpenseMate is a high-performance, full-stack financial tracking application designed for individuals who demand precision and elegance in their personal finance management. Built with a modern **MERN (MongoDB, Express, React, Node)** stack, it offers a seamless blend of glassmorphic aesthetics and powerful analytical tools.

---

##  Key Features

- ** Advanced Financial Analytics**: Real-time visualization of income vs. expenses using interactive charts Powered by Recharts.
- ** Asset Distribution**: Gain clarity on your spending habits with intuitive asset allocation pie charts.
- ** Transaction Portability**: Effortlessly **Import** and **Export** your transaction history using Excel files for bulk management.
- ** Precise Savings Goals**: Set financial targets and track your progress with dynamic, real-time progress bars.
- ** Integrated Financial Tools**:
    - **Smart Calculator** for quick computations.
    - **Currency Converter** for international financial management.
    - **Personalized Reminders** to never miss a payment.
- ** Secure & Personal**: JWT-based authentication with comprehensive profile management and secure image uploads via Cloudinary.
- ** Glassmorphic UI/UX**: A premium design system with custom-built animations, responsive layouts, and a sophisticated color palette.

---

##  Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Custom UI Tokens)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Charts**: [Recharts](https://recharts.org/)
- **State & Networking**: [Axios](https://axios-http.com/) & Native React Hooks
- **Feedback**: [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose 9)
- **Security**: [JWT](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Storage**: [Cloudinary](https://cloudinary.com/) (Media Management)
- **Excel Processing**: [ExcelJS](https://github.com/exceljs/exceljs) & [Multer](https://github.com/expressjs/multer)
- **Email Services**: [Nodemailer](https://nodemailer.com/)

---

##  Local Setup

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Expanse-Tracker.git
    cd Expanse-Tracker
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Create a .env file based on .env.example
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../frontend
    npm install
    # Create a .env file with VITE_BACKEND_URL
    npm run dev
    ```

---

##  Design Philosophy

ExpenseMate focuses on **Visual Excellence**. By utilizing a custom **Glassmorphism** engine, the application provides a futuristic, lightweight feel that reduces cognitive load while maintaining high functionality.

---

*Built with ❤️ for better financial futures.*
