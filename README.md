# 🚗 Car Rental System (OOP Project)

A full-stack Car Rental Management System built in **C++ (OOP)** with a **Python REST API** backend and a **React + Vite** frontend. The project demonstrates all four core OOP pillars — Inheritance, Polymorphism, Encapsulation, and Abstraction — through a real-world rental workflow.

---

## 📁 Project Structure

```
Carrental/
├── include/                    # C++ Header Files
│   ├── Vehicle.h               # Abstract base class for all vehicles
│   ├── Car.h                   # Concrete vehicle class (derives Vehicle)
│   ├── User.h                  # Abstract base class for users
│   ├── Customer.h              # Concrete customer class (derives User)
│   ├── Admin.h                 # Concrete admin class (derives User)
│   ├── Booking.h               # Booking entity class
│   ├── Database.h              # File I/O abstraction layer
│   └── CarRentalSystem.h       # Main system class (Crow HTTP API)
│
├── src/                        # C++ Source Files
│   ├── Vehicle.cpp             # Vehicle base class implementation
│   ├── Car.cpp                 # Car methods (getDetailsString, toFileString, toJson)
│   ├── User.cpp                # User base class implementation
│   ├── Customer.cpp            # Customer toFileString serialization
│   ├── Admin.cpp               # Admin toFileString serialization
│   ├── Booking.cpp             # Booking toFileString & toJson methods
│   ├── Database.cpp            # File read/write logic for all entities
│   ├── CarRentalSystem.cpp     # Business logic + Crow HTTP route handlers
│   ├── cli_main.cpp            # Standalone C++ CLI application entry point
│   └── main.cpp                # Crow web server entry point
│
├── server.py                   # Lightweight Python REST API (no Crow needed)
│
├── Frontend/                   # React + Vite Web Frontend
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite build configuration
│   ├── package.json            # npm dependencies and scripts
│   └── src/
│       ├── main.jsx            # React DOM entry point
│       ├── App.jsx             # Root router (React Router v7)
│       ├── index.css           # Global CSS reset and base styles
│       ├── App.css             # App-level styles
│       ├── index.js            # Utility exports
│       ├── components/
│       │   ├── LoginSignup.jsx # Auth form (login + register toggle)
│       │   ├── CardNav.jsx     # Animated car card + navigation component
│       │   ├── LightRays.jsx   # Decorative animated WebGL light-ray background
│       │   └── mainscreen.jsx  # Main screen wrapper component
│       ├── pages/
│       │   ├── MainPage.jsx    # Landing page (hero + entry point)
│       │   ├── Dashboard.jsx   # Customer dashboard (browse, book, manage)
│       │   ├── BookingPage.jsx # Booking confirmation and history page
│       │   └── AdminPage.jsx   # Admin panel (fleet, users, bookings)
│       └── styles/
│           ├── LoginSignup.css # Styles for auth form
│           ├── CardNav.css     # Styles for car card navigation
│           ├── LightRays.css   # Styles for light ray animation
│           ├── mainscreen.css  # Styles for main screen
│           ├── Dashboard.css   # Styles for customer dashboard
│           ├── BookingPage.css # Styles for booking page
│           └── AdminPage.css   # Styles for admin panel
│
├── data/                       # Persistent flat-file database
│   ├── users.txt               # User accounts (CSV: id, type, name, email, pass)
│   ├── cars.txt                # Car fleet (CSV: id, brand, model, type, rate, stall, reg, avail)
│   └── bookings.txt            # Booking records (CSV: 11 fields)
│
├── CMakeLists.txt              # CMake build config for the Crow C++ server
├── car_rental_cli.exe          # Pre-built standalone CLI executable
└── README.md                   # This file
```

---

## 🧠 OOP Concepts Implemented

### 1. Inheritance

| Base Class | Derived Class | Files |
|---|---|---|
| `Vehicle` (abstract) | `Car` | `include/Vehicle.h` → `include/Car.h` |
| `User` (abstract) | `Customer` | `include/User.h` → `include/Customer.h` |
| `User` (abstract) | `Admin` | `include/User.h` → `include/Admin.h` |

### 2. Polymorphism — Pure Virtual Functions

| Function | Defined In | Overridden In |
|---|---|---|
| `calculateRentalFee(int days)` | `Vehicle.h` | `Car.h` — computes `baseRate × days` |
| `calculateTotalRentalFee(int days, int stallingHours)` | `Vehicle.h` | `Car.h` — adds stalling charges |
| `getDetailsString()` | `Vehicle.h` | `Car.cpp` — formatted car info string |
| `getUserType()` | `User.h` | `Customer.h` → `"customer"`, `Admin.h` → `"admin"` |
| `toFileString()` | `User.h` | `Customer.cpp` & `Admin.cpp` — CSV serialization |

All base classes declare `virtual` destructors.

### 3. Encapsulation

All data members (`vehicleID`, `make`, `model`, `baseRate`, `stallingCharge`, `regNumber`, `password`, `totalCost`, `bookingId`, etc.) are `private` or `protected`. Access is provided only via public getters, setters, and business methods (`setRates()`, `setAvailability()`, `setStatus()`).

### 4. Abstraction

- **`Database`** abstracts all file I/O — CSV parsing, line splitting, and serialization — into clean `loadUsers()`, `saveCars()`, `saveBooking()` etc. methods.
- **`CarRentalSystem`** abstracts full rental transactions, authentication, fleet management, and Crow HTTP route handling behind a single class interface.

---

## 📄 Key File Descriptions

### C++ Headers (`include/`)

| File | Role |
|---|---|
| `Vehicle.h` | Abstract base; declares 3 pure virtual functions and getters/setters for ID, make, model, year, availability |
| `Car.h` | Inherits `Vehicle`; adds `carType`, `baseRate`, `stallingCharge`, `regNumber`; implements all pure virtuals inline; optional `toJson()` for Crow |
| `User.h` | Abstract base; stores `userID`, `username`, `email`, `password`; declares `getUserType()` and `toFileString()` as pure virtual |
| `Customer.h` | Inherits `User`; overrides `getUserType()` → `"customer"` |
| `Admin.h` | Inherits `User`; overrides `getUserType()` → `"admin"` |
| `Booking.h` | Stores booking state: IDs, dates, `numDays`, `stallingHours`, `totalCost`, `status`, payment info; optional `toJson()` for Crow |
| `Database.h` | Abstraction class; manages paths to `data/*.txt`, exposes load/save methods for Users, Cars, and Bookings |
| `CarRentalSystem.h` | Orchestrator; holds `Database`, in-memory vectors, a `std::mutex` for thread safety, and all API method signatures |

### C++ Sources (`src/`)

| File | Role |
|---|---|
| `Vehicle.cpp` | Constructor/destructor definitions for `Vehicle` |
| `Car.cpp` | Implements `getDetailsString()`, `toFileString()`, and optional `toJson()` |
| `User.cpp` | Minimal — `User` destructor body |
| `Customer.cpp` | Implements `Customer::toFileString()` → CSV: `id,customer,name,email,pass` |
| `Admin.cpp` | Implements `Admin::toFileString()` → CSV: `id,admin,name,email,pass` |
| `Booking.cpp` | Implements `toFileString()` (11-field CSV) and optional `toJson()` |
| `Database.cpp` | Full CSV read/write logic; seeds default data (admin + sample cars) if files are empty |
| `CarRentalSystem.cpp` | All business logic: `registerUser`, `loginUser`, `createBooking`, `cancelBooking`, `returnCar`, `addNewCar`, `deleteCar`, `updateCarRates`, `deleteUser`, `getAdminUsers`, `getAllBookings` |
| `main.cpp` | Crow HTTP server entry point — mounts all REST routes onto `CarRentalSystem` and starts the server |
| `cli_main.cpp` | Standalone interactive CLI with menus for login, registration, customer operations, admin operations, and a dedicated **Polymorphism Demo** menu |

### Python Backend (`server.py`)

A dependency-free Python REST API using only stdlib (`http.server`, `socketserver`, `json`, `re`). Reads and writes the same `data/*.txt` flat files as the C++ backend.

| Endpoint | Method | Description |
|---|---|---|
| `/api/cars` | GET | List all cars |
| `/api/bookings/<userId>` | GET | Get bookings for a user (with car info joined) |
| `/api/admin/users` | GET | List all users |
| `/api/admin/bookings` | GET | List all bookings with user + car info |
| `/api/register` | POST | Register a new customer account |
| `/api/login` | POST | Authenticate and return user session data |
| `/api/booking` | POST | Create a booking, mark car unavailable |
| `/api/booking/<id>/cancel` | POST | Cancel booking, restore car availability |
| `/api/booking/<id>/return` | POST | Complete booking, restore car availability |
| `/api/admin/car` | POST | Add a new car to the fleet |
| `/api/admin/car/<carId>` | DELETE | Remove a car from the fleet |
| `/api/admin/user/<userId>` | DELETE | Delete a customer account |
| `/api/admin/car/<carId>/rates` | PUT | Update `baseRate` and `stallingCharge` |

Runs on **`http://localhost:8080`** with full CORS headers.

### React Frontend (`Frontend/src/`)

Built with **React 19**, **React Router v7**, **Framer Motion**, **GSAP**, **Lucide React**, and **OGL**.

#### Pages (`pages/`)

| File | Route | Description |
|---|---|---|
| `MainPage.jsx` | `/` | Landing/hero page with entry call-to-action |
| `Dashboard.jsx` | `/dashboard` | Customer dashboard — browse available cars, make bookings, view active rentals |
| `BookingPage.jsx` | `/booking` | Booking confirmation flow and history with cancel/return actions |
| `AdminPage.jsx` | `/admin` | Admin panel — manage fleet (add/delete/update rates), view all bookings, manage users |

#### Components (`components/`)

| File | Description |
|---|---|
| `LoginSignup.jsx` | Unified auth form; toggles between login and register; stores session in `localStorage` |
| `CardNav.jsx` | Animated car card with navigation controls |
| `LightRays.jsx` | OGL-powered WebGL animated light-ray background effect |
| `mainscreen.jsx` | Wrapper that composes the main screen layout |

#### Styles (`styles/`)

Each page and component has a dedicated CSS file: `LoginSignup.css`, `CardNav.css`, `LightRays.css`, `mainscreen.css`, `Dashboard.css`, `BookingPage.css`, `AdminPage.css`.

### Data Files (`data/`)

| File | Format | Fields |
|---|---|---|
| `users.txt` | CSV | `userId, userType, username, email, password` |
| `cars.txt` | CSV | `carId, brand, model, carType, baseRate, stallingCharge, regNumber, isAvailable` |
| `bookings.txt` | CSV | `bookingId, userId, carId, pickupDate, returnDate, numDays, stallingHours, totalCost, status, paymentId, paymentStatus` |

---

## 🚀 How to Run

### Option A: Standalone C++ CLI

```powershell
# Compile (requires g++ with C++14 or later)
g++ -std=c++14 src/cli_main.cpp src/Vehicle.cpp src/Car.cpp src/User.cpp src/Customer.cpp src/Admin.cpp src/Booking.cpp src/Database.cpp -Iinclude -o car_rental_cli.exe

# Or run the pre-built binary directly
.\car_rental_cli.exe
```

**CLI Features:**
- Interactive login and registration
- Dedicated **Polymorphism Demonstration** menu (showcases virtual dispatch)
- Customer: browse cars, rent, return, cancel bookings
- Admin: add/delete/update cars, view revenue, list all users and bookings

---

### Option B: Full-Stack Web Application (Python + React) ⭐ Recommended

**1. Start the Python backend:**
```powershell
python server.py
```
Runs on `http://localhost:8080`.

**2. Start the React frontend:**
```powershell
cd Frontend
npm install   # first time only
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Option C: C++ Crow Web Server (Advanced)

Requires [vcpkg](https://vcpkg.io) with `crow` and `boost-asio` packages.

```powershell
cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE=./vcpkg/scripts/buildsystems/vcpkg.cmake
cmake --build build --config Release
.\build\Release\car_rental_server.exe
```

Then run the React frontend as in Option B (same port `8080`).

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@rentify.com` | `admin123` |
| **Customer** | `john@example.com` | `pass123` |
| **Customer** | `alice@example.com` | `pass123` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Core Logic | C++17, OOP |
| Web Server (C++) | [Crow](https://crowcpp.org) (header-only HTTP framework) |
| Web Server (Python) | Python 3 stdlib (`http.server`, `socketserver`) |
| Frontend Framework | React 19 + Vite 7 |
| Routing | React Router v7 |
| Animations | Framer Motion, GSAP |
| 3D / WebGL | OGL |
| Icons | Lucide React, React Icons |
| Build Tool (C++) | CMake 3.15+ with vcpkg |
| Data Storage | Plain-text CSV files (`data/*.txt`) |
