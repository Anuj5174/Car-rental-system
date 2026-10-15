#include "CarRentalSystem.h"
#include <sstream>
#include <random>
#include <algorithm>
#include <iostream>

CarRentalSystem::CarRentalSystem() {
    loadData();
}

void CarRentalSystem::loadData() {
    users = db.loadUsers();
    cars = db.loadCars();
    bookings = db.loadBookings();
    std::cout << "Data loaded: " << users.size() << " users, " 
              << cars.size() << " cars, " << bookings.size() << " bookings." << std::endl;
}

std::shared_ptr<User> CarRentalSystem::findUserByEmail(const std::string& email) {
    for (const auto& user : users) {
        if (user->getEmail() == email) return user;
    }
    return nullptr;
}

std::shared_ptr<User> CarRentalSystem::findUserByID(const std::string& userID) {
    for (const auto& user : users) {
        if (user->getUserID() == userID) return user;
    }
    return nullptr;
}

Car* CarRentalSystem::findCarByID(const std::string& carID) {
    for (auto& car : cars) {
        if (car.getCarID() == carID) return &car;
    }
    return nullptr;
}

Car* CarRentalSystem::findCarByReg(const std::string& regNumber) {
    for (auto& car : cars) {
        if (car.getRegNumber() == regNumber) return &car; 
    }
    return nullptr;
}

Booking* CarRentalSystem::findBookingByID(const std::string& bookingID) {
    for (auto& booking : bookings) {
        if (booking.getBookingID() == bookingID) return &booking;
    }
    return nullptr;
}

std::string CarRentalSystem::generateUniqueID(const std::string& prefix) {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1000, 9999);
    return prefix + std::to_string(dis(gen));
}

crow::json::wvalue CarRentalSystem::registerUser(const std::string& username, const std::string& email, const std::string& password) {
    std::lock_guard<std::mutex> lock(dataMutex);
    if (findUserByEmail(email)) {
        return {{"success", false}, {"message", "Email already in use!"}};
    }
    std::string newID = generateUniqueID("U");
    Customer newCustomer(newID, username, email, password);
    if (db.saveUser(newCustomer)) {
        users.push_back(std::make_shared<Customer>(newCustomer));
        return {{"success", true}, {"message", "Account created successfully!"}};
    }
    return {{"success", false}, {"message", "Server error saving user!"}};
}

crow::json::wvalue CarRentalSystem::loginUser(const std::string& email, const std::string& password) {
    std::lock_guard<std::mutex> lock(dataMutex);
    auto user = findUserByEmail(email);
    if (user && user->checkPassword(password)) {
        crow::json::wvalue response;
        response["success"] = true;
        response["username"] = user->getUsername();
        response["userType"] = user->getUserType();
        response["userId"] = user->getUserID(); 
        response["email"] = user->getEmail(); 
        return response;
    }
    return {{"success", false}, {"message", "Invalid email or password!"}};
}

crow::json::wvalue CarRentalSystem::getAllCars() {
    std::lock_guard<std::mutex> lock(dataMutex);
    crow::json::wvalue::list carList;
    for (const auto& car : cars) {
        carList.push_back(car.toJson());
    }
    return {{"success", true}, {"cars", std::move(carList)}};
}

crow::json::wvalue CarRentalSystem::createBooking(const crow::json::rvalue& data) {
    std::lock_guard<std::mutex> lock(dataMutex);
    try {
        std::string userID = data["userId"].s();
        std::string carID = data["carId"].s();
        
        Car* car = findCarByID(carID);
        if (!car || !car->getAvailability()) {
            return {{"success", false}, {"message", "Car is not available!"}};
        }

        std::string bookingID = generateUniqueID("B");
        std::string paymentID = generateUniqueID("P");
        
        Booking newBooking(
            bookingID,
            userID,
            carID,
            data["pickupDate"].s(),
            data["returnDate"].s(),
            data["numDays"].i(),
            data["stallingHours"].i(),
            data["totalCost"].d(),
            "active",   
            paymentID,  
            "success"   
        );

        if (db.saveBooking(newBooking)) {
            bookings.push_back(newBooking);
            car->setAvailability(false);
            db.saveAllCars(cars); 
            return {{"success", true}, {"message", "Booking confirmed!"}, {"bookingID", bookingID}};
        }
    } catch (const std::exception& e) {
        return {{"success", false}, {"message", "Invalid booking data."}};
    }
    return {{"success", false}, {"message", "Server error creating booking."}};
}

crow::json::wvalue CarRentalSystem::getUserBookings(const std::string& userID) {
    std::lock_guard<std::mutex> lock(dataMutex);
    crow::json::wvalue::list userBookings;
    for (const auto& booking : bookings) {
        if (booking.getCustomerID() == userID) {
            Car* car = findCarByID(booking.getCarID());
            std::string brand = car ? car->getBrand() : "Unknown"; 
            std::string model = car ? car->getModel() : "Car";     
            std::string type = car ? car->getCarType() : "basic"; 
            
            userBookings.push_back(booking.toJson(brand, model, type));
        }
    }
    std::reverse(userBookings.begin(), userBookings.end());
    return {{"success", true}, {"bookings", std::move(userBookings)}};
}

crow::json::wvalue CarRentalSystem::cancelBooking(const std::string& bookingID, const std::string& userID) {
    std::lock_guard<std::mutex> lock(dataMutex);
    Booking* booking = findBookingByID(bookingID);
    if (!booking) {
        return {{"success", false}, {"message", "Booking not found."}};
    }

    if (!userID.empty() && booking->getCustomerID() != userID) {
        return {{"success", false}, {"message", "Unauthorized to cancel this booking."}};
    }

    if (booking->getStatus() != "active") {
        return {{"success", false}, {"message", "Booking is already " + booking->getStatus() + "."}};
    }

    booking->setStatus("cancelled");
    Car* car = findCarByID(booking->getCarID());
    if (car) {
        car->setAvailability(true);
        db.saveAllCars(cars);
    }
    db.saveAllBookings(bookings);
    return {{"success", true}, {"message", "Booking cancelled successfully. Car is now available."}};
}

crow::json::wvalue CarRentalSystem::returnCar(const std::string& bookingID) {
    std::lock_guard<std::mutex> lock(dataMutex);
    Booking* booking = findBookingByID(bookingID);
    if (!booking) {
        return {{"success", false}, {"message", "Booking not found."}};
    }

    if (booking->getStatus() != "active") {
        return {{"success", false}, {"message", "Booking is not active."}};
    }

    booking->setStatus("completed");
    Car* car = findCarByID(booking->getCarID());
    if (car) {
        car->setAvailability(true);
        db.saveAllCars(cars);
    }
    db.saveAllBookings(bookings);
    return {{"success", true}, {"message", "Car returned successfully! Booking completed."}};
}

crow::json::wvalue CarRentalSystem::getAllBookings() {
    std::lock_guard<std::mutex> lock(dataMutex);
    crow::json::wvalue::list allBookings;
    for (const auto& booking : bookings) {
        Car* car = findCarByID(booking.getCarID());
        std::string brand = car ? car->getBrand() : "Unknown";
        std::string model = car ? car->getModel() : "Car";
        std::string type = car ? car->getCarType() : "basic";
        allBookings.push_back(booking.toJson(brand, model, type));
    }
    std::reverse(allBookings.begin(), allBookings.end());
    return {{"success", true}, {"bookings", std::move(allBookings)}};
}

crow::json::wvalue CarRentalSystem::getAdminUsers() {
    std::lock_guard<std::mutex> lock(dataMutex);
    crow::json::wvalue::list userList;
    for (const auto& user : users) {
        userList.push_back({
            {"userId", user->getUserID()},
            {"username", user->getUsername()},
            {"email", user->getEmail()},
            {"userType", user->getUserType()}
        });
    }
    return {{"success", true}, {"users", std::move(userList)}};
}

crow::json::wvalue CarRentalSystem::addNewCar(const crow::json::rvalue& data) {
    std::lock_guard<std::mutex> lock(dataMutex);
    try {
        std::string regNum = data["regNumber"].s();
        
        std::string carID = generateUniqueID("C");
        Car newCar(
            carID,
            data["brand"].s(),
            data["model"].s(),
            data["carType"].s(),
            data["baseRate"].d(),
            data["stallingCharge"].d(),
            regNum,
            true 
        );

        cars.push_back(newCar);
        if (db.saveAllCars(cars)) {
            return {{"success", true}, {"car", newCar.toJson()}};
        }
    } catch (const std::exception& e) {
        return {{"success", false}, {"message", "Invalid car data."}};
    }
    return {{"success", false}, {"message", "Error saving car."}};
}

crow::json::wvalue CarRentalSystem::deleteCar(const std::string& carID) {
    std::lock_guard<std::mutex> lock(dataMutex);
    auto it = std::remove_if(cars.begin(), cars.end(), 
        [&](const Car& car){ return car.getCarID() == carID; });
    
    if (it != cars.end()) {
        cars.erase(it, cars.end());
        db.saveAllCars(cars);
        return {{"success", true}, {"message", "Car deleted."}};
    }
    return {{"success", false}, {"message", "Car not found."}};
}

crow::json::wvalue CarRentalSystem::updateCarRates(const std::string& carID, const crow::json::rvalue& data) {
    std::lock_guard<std::mutex> lock(dataMutex);
    Car* car = findCarByID(carID);
    if (car) {
        try {
            car->setRates(data["baseRate"].d(), data["stallingCharge"].d());
            db.saveAllCars(cars);
            return {{"success", true}, {"car", car->toJson()}};
        } catch (const std::exception& e) {
            return {{"success", false}, {"message", "Invalid rate data."}};
        }
    }
    return {{"success", false}, {"message", "Car not found."}};
}

crow::json::wvalue CarRentalSystem::deleteUser(const std::string& userID) {
    std::lock_guard<std::mutex> lock(dataMutex);
    auto it = std::remove_if(users.begin(), users.end(), 
        [&](const std::shared_ptr<User>& user){ 
            return user->getUserID() == userID && user->getUserType() != "admin";
        });
    
    if (it != users.end()) {
        users.erase(it, users.end());
        db.saveAllUsers(users); 
        return {{"success", true}, {"message", "User deleted."}};
    }
    return {{"success", false}, {"message", "User not found or is an admin."}};
}