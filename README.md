# TypeFast

A high-performance, minimalist typing test platform inspired by Monkeytype. Built to help users test and improve their typing speed, accuracy, and consistency in a clean, distraction-free environment.

## 🚀 Features

- **Multiple Typing Modes:** "Words" mode with configurable word counts and adjustable difficulty levels (easy, medium, hard).
- **Advanced Metrics:** Accurate WPM (Words Per Minute) calculation, accuracy tracking with cumulative mistakes, and detailed statistics.
- **Fair Play Logic:** Controlled backspace functionality that restricts corrections within the current word for a true typing test experience.
- **Smooth UX/UI:** A full-width, cardless layout featuring smooth JS-driven caret animations and responsive design.
- **User Accounts & Leaderboards:** Secure authentication system to save personal best scores, track progress over time, and compete on the global leaderboard.
- **Theme Selection:** Customizable themes and an intuitive results/statistics display using charts.

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Recharts (for statistics visualization)
- Vanilla CSS / Tailwind (for minimalist styling)

**Backend:**
- Node.js & Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication & bcryptjs

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/typefast.git
   cd typefast
   ```

2. **Frontend Setup**
   ```bash
   # Install dependencies
   npm install

   # Start the development server
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd typefast-server

   # Install dependencies
   npm install

   # Set up environment variables
   # Create a .env file based on a .env.example (if available) with your DATABASE_URL and JWT_SECRET

   # Run database migrations
   npm run db:migrate

   # Start the backend server
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License.
