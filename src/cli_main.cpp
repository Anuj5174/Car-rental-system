#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <cstdlib>
#include <ctime>

#include "Vehicle.h"
#include "Car.h"
#include "User.h"
#include "Customer.h"
#include "Admin.h"
#include "Booking.h"
#include "Database.h"

// Helper to generate IDs
std::string genID(const std::string& prefix) {
    int r = 1000 + (std::rand() % 9000);
    return prefix + std::to_string(r);
}

void printHeader(const std::string& title) {
    std::cout << "\n======================================================\n";
    std::cout << "           " << title << "\n";
    std::cout << "======================================================\n";
}

void pause() {
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore(1000, '\n');
    std::cin.get();
}

int main() {
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
    Database db;

    std::vector<std::shared_ptr<User>> users = db.loadUsers();
    std::vector<Car> cars = db.loadCars();
    std::vector<Booking> bookings = db.loadBookings();

    std::shared_ptr<User> currentUser = nullptr;

    while (true) {
        if (!currentUser) {
            printHeader("CAR RENTAL SYSTEM (OOPS PROTOTYPE)");
            std::cout << "1. Login\n";
            std::cout << "2. Register New Customer\n";
            std::cout << "3. Demonstrate OOP Concepts (Polymorphism Demo)\n";
            std::cout << "4. Exit\n";
            std::cout << "Choose an option (1-4): ";
            
            int choice = 0;
            if (!(std::cin >> choice)) {
                std::cin.clear();
                std::cin.ignore(1000, '\n');
                continue;
            }

            if (choice == 1) {
                std::string email, password;
                std::cout << "\nEnter Email: ";
                std::cin >> email;
                std::cout << "Enter Password: ";
                std::cin >> password;

                bool found = false;
                for (const auto& u : users) {
                    if (u->getEmail() == email && u->checkPassword(password)) {
                        currentUser = u;
                        found = true;
                        std::cout << "\n[SUCCESS] Welcome, " << u->getUsername() 
                                  << " (" << u->getUserType() << ")!\n";
                        pause();
                        break;
                    }
                }
                if (!found) {
                    std::cout << "\n[ERROR] Invalid email or password! (Try admin@rentify.com / admin123)\n";
                    pause();
                }
            } else if (choice == 2) {
                std::string name, email, pass;
                std::cout << "\nEnter Full Name: ";
                std::cin >> name;
                std::cout << "Enter Email: ";
                std::cin >> email;
                std::cout << "Enter Password: ";
                std::cin >> pass;

                bool exists = false;
                for (const auto& u : users) {
                    if (u->getEmail() == email) { exists = true; break; }
                }

                if (exists) {
                    std::cout << "\n[ERROR] Email already registered!\n";
                } else {
                    std::string newId = genID("U");
                    Customer cust(newId, name, email, pass);
                    if (db.saveUser(cust)) {
                        users.push_back(std::make_shared<Customer>(cust));
                        std::cout << "\n[SUCCESS] Customer account created! User ID: " << newId << "\n";
                    }
                }
                pause();
            } else if (choice == 3) {
                printHeader("OOP CONCEPTS DEMONSTRATION");
                std::cout << "1. Encapsulation: State is protected; accessed via getters/setters.\n";
                std::cout << "2. Inheritance: Car inherits from abstract class Vehicle.\n";
                std::cout << "3. Polymorphism: Calling virtual methods on Vehicle pointers.\n\n";

                // Polymorphism test with base class pointers
                std::vector<std::shared_ptr<Vehicle>> vehicleFleet;
                for (const auto& c : cars) {
                    vehicleFleet.push_back(std::make_shared<Car>(c));
                }

                std::cout << std::left << std::setw(8) << "ID"
                          << std::setw(12) << "Make"
                          << std::setw(12) << "Model"
                          << std::setw(10) << "Status"
                          << std::setw(16) << "Fee for 3 Days"
                          << "Details String (Polymorphic)" << "\n";
                std::cout << std::string(80, '-') << "\n";

                for (const auto& v : vehicleFleet) {
                    std::cout << std::left << std::setw(8) << v->getVehicleID()
                              << std::setw(12) << v->getMake()
                              << std::setw(12) << v->getModel()
                              << std::setw(10) << (v->getAvailability() ? "Available" : "Rented")
                              << "$" << std::setw(15) << v->calculateRentalFee(3)
                              << v->getDetailsString() << "\n";
                }
                pause();
            } else if (choice == 4) {
                std::cout << "\nThank you for using Car Rental System!\n";
                break;
            }
        } else if (currentUser->getUserType() == "admin") {
            // ADMIN MENU
            printHeader("ADMIN DASHBOARD - " + currentUser->getUsername());
            std::cout << "1. View All Cars (Fleet Status)\n";
            std::cout << "2. Add New Car\n";
            std::cout << "3. Update Car Rates\n";
            std::cout << "4. Delete Car\n";
            std::cout << "5. View All Bookings & Revenue\n";
            std::cout << "6. View All Users\n";
            std::cout << "7. Logout\n";
            std::cout << "Choose an option (1-7): ";

            int ch = 0;
            if (!(std::cin >> ch)) { std::cin.clear(); std::cin.ignore(1000, '\n'); continue; }

            if (ch == 1) {
                printHeader("FLEET INVENTORY");
                for (const auto& c : cars) {
                    std::cout << c.getCarID() << ": " << c.getDetailsString()
                              << " | Available: " << (c.getAvailability() ? "YES" : "NO") << "\n";
                }
                pause();
            } else if (ch == 2) {
                std::string brand, model, type, reg;
                double rate = 0, stall = 0;
                std::cout << "Enter Brand: "; std::cin >> brand;
                std::cout << "Enter Model: "; std::cin >> model;
                std::cout << "Enter Type (economy/luxury/suv): "; std::cin >> type;
                std::cout << "Enter Base Rate ($/day): "; std::cin >> rate;
                std::cout << "Enter Stalling Charge ($/hr): "; std::cin >> stall;
                std::cout << "Enter Reg Number: "; std::cin >> reg;

                std::string newId = genID("C");
                Car newCar(newId, brand, model, type, rate, stall, reg, true);
                cars.push_back(newCar);
                db.saveAllCars(cars);
                std::cout << "\n[SUCCESS] Car added! ID: " << newId << "\n";
                pause();
            } else if (ch == 3) {
                std::string carId;
                std::cout << "Enter Car ID to update: "; std::cin >> carId;
                bool found = false;
                for (auto& c : cars) {
                    if (c.getCarID() == carId) {
                        double r, s;
                        std::cout << "Current: Base $" << c.getBaseRate() << "/day, Stall $" << c.getStallingCharge() << "/hr\n";
                        std::cout << "Enter new Base Rate: "; std::cin >> r;
                        std::cout << "Enter new Stalling Charge: "; std::cin >> s;
                        c.setRates(r, s);
                        db.saveAllCars(cars);
                        std::cout << "\n[SUCCESS] Rates updated!\n";
                        found = true;
                        break;
                    }
                }
                if (!found) std::cout << "\n[ERROR] Car ID not found!\n";
                pause();
            } else if (ch == 4) {
                std::string carId;
                std::cout << "Enter Car ID to delete: "; std::cin >> carId;
                auto it = std::remove_if(cars.begin(), cars.end(), [&](const Car& c) { return c.getCarID() == carId; });
                if (it != cars.end()) {
                    cars.erase(it, cars.end());
                    db.saveAllCars(cars);
                    std::cout << "\n[SUCCESS] Car deleted.\n";
                } else {
                    std::cout << "\n[ERROR] Car not found.\n";
                }
                pause();
            } else if (ch == 5) {
                printHeader("SYSTEM BOOKINGS & REVENUE");
                double totalRev = 0;
                for (const auto& b : bookings) {
                    std::cout << "Booking " << b.getBookingID() << " | User: " << b.getCustomerID()
                              << " | Car: " << b.getCarID() << " | " << b.getPickupDate() << " -> " << b.getReturnDate()
                              << " | Total: $" << b.getTotalCost() << " | Status: " << b.getStatus() << "\n";
                    totalRev += b.getTotalCost();
                }
                std::cout << "\nTotal Gross Bookings Revenue: $" << totalRev << "\n";
                pause();
            } else if (ch == 6) {
                printHeader("REGISTERED USERS");
                for (const auto& u : users) {
                    std::cout << u->getUserID() << " | " << u->getUsername() << " | " 
                              << u->getEmail() << " | Role: " << u->getUserType() << "\n";
                }
                pause();
            } else if (ch == 7) {
                currentUser = nullptr;
                std::cout << "\nLogged out successfully.\n";
            }
        } else {
            // CUSTOMER MENU
            printHeader("CUSTOMER DASHBOARD - " + currentUser->getUsername());
            std::cout << "1. Browse Available Cars\n";
            std::cout << "2. Rent / Book a Car\n";
            std::cout << "3. View My Bookings\n";
            std::cout << "4. Return Rented Car\n";
            std::cout << "5. Cancel Active Booking\n";
            std::cout << "6. Logout\n";
            std::cout << "Choose an option (1-6): ";

            int ch = 0;
            if (!(std::cin >> ch)) { std::cin.clear(); std::cin.ignore(1000, '\n'); continue; }

            if (ch == 1) {
                printHeader("AVAILABLE CARS FOR RENT");
                for (const auto& c : cars) {
                    if (c.getAvailability()) {
                        std::cout << "[" << c.getCarID() << "] " << c.getBrand() << " " << c.getModel()
                                  << " (" << c.getCarType() << ") - Base: $" << c.getBaseRate()
                                  << "/day, Stalling: $" << c.getStallingCharge() << "/hr\n";
                    }
                }
                pause();
            } else if (ch == 2) {
                printHeader("BOOK A CAR");
                std::string carId, pickup, ret;
                int days = 1, stallHrs = 0;

                std::cout << "Enter Car ID to rent: "; std::cin >> carId;
                Car* carPtr = nullptr;
                for (auto& c : cars) {
                    if (c.getCarID() == carId && c.getAvailability()) {
                        carPtr = &c;
                        break;
                    }
                }

                if (!carPtr) {
                    std::cout << "\n[ERROR] Car is not available or does not exist!\n";
                } else {
                    std::cout << "Enter Pickup Date (YYYY-MM-DD): "; std::cin >> pickup;
                    std::cout << "Enter Return Date (YYYY-MM-DD): "; std::cin >> ret;
                    std::cout << "Enter Duration in Days: "; std::cin >> days;
                    std::cout << "Estimated Stalling Hours: "; std::cin >> stallHrs;

                    // Polymorphic fee calculation
                    double cost = carPtr->calculateTotalRentalFee(days, stallHrs);
                    std::cout << "\nRental Summary:\n";
                    std::cout << "Car: " << carPtr->getBrand() << " " << carPtr->getModel() << "\n";
                    std::cout << "Duration: " << days << " days | Stalling: " << stallHrs << " hrs\n";
                    std::cout << "Total Cost: $" << cost << "\n";

                    std::cout << "Confirm Booking & Payment? (y/n): ";
                    char confirm;
                    std::cin >> confirm;
                    if (confirm == 'y' || confirm == 'Y') {
                        std::string bId = genID("B");
                        std::string pId = genID("P");
                        Booking newB(bId, currentUser->getUserID(), carId, pickup, ret, 
                                     days, stallHrs, cost, "active", pId, "success");
                        bookings.push_back(newB);
                        carPtr->setAvailability(false);
                        db.saveBooking(newB);
                        db.saveAllCars(cars);
                        std::cout << "\n[SUCCESS] Booking confirmed! Booking ID: " << bId << "\n";
                    } else {
                        std::cout << "\nBooking cancelled.\n";
                    }
                }
                pause();
            } else if (ch == 3) {
                printHeader("MY BOOKINGS");
                bool found = false;
                for (const auto& b : bookings) {
                    if (b.getCustomerID() == currentUser->getUserID()) {
                        found = true;
                        std::cout << "Booking ID: " << b.getBookingID() << " | Car ID: " << b.getCarID()
                                  << " | " << b.getPickupDate() << " -> " << b.getReturnDate()
                                  << " | Cost: $" << b.getTotalCost()
                                  << " | Status: " << b.getStatus() << "\n";
                    }
                }
                if (!found) std::cout << "No bookings found.\n";
                pause();
            } else if (ch == 4) {
                printHeader("RETURN RENTED CAR");
                std::string bId;
                std::cout << "Enter Booking ID to return: "; std::cin >> bId;
                bool done = false;
                for (auto& b : bookings) {
                    if (b.getBookingID() == bId && b.getCustomerID() == currentUser->getUserID()) {
                        if (b.getStatus() == "active") {
                            b.setStatus("completed");
                            for (auto& c : cars) {
                                if (c.getCarID() == b.getCarID()) {
                                    c.setAvailability(true);
                                    break;
                                }
                            }
                            db.saveAllBookings(bookings);
                            db.saveAllCars(cars);
                            std::cout << "\n[SUCCESS] Car returned! Thank you for choosing Rentify.\n";
                            done = true;
                        } else {
                            std::cout << "\n[INFO] Booking is already " << b.getStatus() << ".\n";
                            done = true;
                        }
                        break;
                    }
                }
                if (!done) std::cout << "\n[ERROR] Booking ID not found!\n";
                pause();
            } else if (ch == 5) {
                printHeader("CANCEL BOOKING");
                std::string bId;
                std::cout << "Enter Booking ID to cancel: "; std::cin >> bId;
                bool done = false;
                for (auto& b : bookings) {
                    if (b.getBookingID() == bId && b.getCustomerID() == currentUser->getUserID()) {
                        if (b.getStatus() == "active") {
                            b.setStatus("cancelled");
                            for (auto& c : cars) {
                                if (c.getCarID() == b.getCarID()) {
                                    c.setAvailability(true);
                                    break;
                                }
                            }
                            db.saveAllBookings(bookings);
                            db.saveAllCars(cars);
                            std::cout << "\n[SUCCESS] Booking cancelled. Vehicle is available again.\n";
                            done = true;
                        } else {
                            std::cout << "\n[INFO] Booking is already " << b.getStatus() << ".\n";
                            done = true;
                        }
                        break;
                    }
                }
                if (!done) std::cout << "\n[ERROR] Booking ID not found!\n";
                pause();
            } else if (ch == 6) {
                currentUser = nullptr;
                std::cout << "\nLogged out successfully.\n";
            }
        }
    }

    return 0;
}
