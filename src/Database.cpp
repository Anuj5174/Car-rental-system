#include "Database.h"
#include <fstream>
#include <sstream>
#include <iostream>

void ensureFileExists(const std::string& filename) {
    std::ifstream f(filename.c_str());
    if (!f.good()) {
        std::ofstream newFile(filename.c_str());
        if (newFile.is_open()) {
            std::cout << "Created empty file: " << filename << std::endl;
        }
    }
}

Database::Database() {
    ensureFileExists(usersFile);
    ensureFileExists(carsFile);
    ensureFileExists(bookingsFile);

    // Seed Cars if empty
    std::ifstream carIn(carsFile.c_str());
    if (carIn.peek() == std::ifstream::traits_type::eof()) {
        carIn.close();
        std::ofstream carOut(carsFile.c_str());
        carOut << "C101,Tesla,Model 3,luxury,150.0,20.0,TSL-001,1\n";
        carOut << "C102,Honda,Civic,economy,90.0,10.0,HND-123,1\n";
        carOut << "C103,Ford,Raptor,suv,180.0,25.0,FRD-456,1\n";
        carOut << "C104,Toyota,Camry,economy,95.0,10.0,TYT-789,1\n";
        carOut << "C105,BMW,M4,luxury,220.0,30.0,BMW-999,1\n";
        carOut << "C106,Hyundai,Creta,suv,110.0,15.0,HYU-555,1\n";
    }

    // Seed Users if empty (default admin and demo customer)
    std::ifstream userIn(usersFile.c_str());
    if (userIn.peek() == std::ifstream::traits_type::eof()) {
        userIn.close();
        std::ofstream userOut(usersFile.c_str());
        userOut << "U001,admin,Admin,admin@rentify.com,admin123\n";
        userOut << "U101,customer,JohnDoe,john@example.com,pass123\n";
    }
}

std::vector<std::string> Database::split(const std::string& s, char delimiter) {
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(s);
    while (std::getline(tokenStream, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

std::vector<std::shared_ptr<User>> Database::loadUsers() {
    std::vector<std::shared_ptr<User>> users;
    std::ifstream file(usersFile.c_str());
    std::string line;
    while (std::getline(file, line)) {
        std::vector<std::string> parts = split(line, ',');
        if (parts.size() < 5) continue;
        std::string id = parts[0];
        std::string type = parts[1];
        std::string name = parts[2];
        std::string mail = parts[3];
        std::string pass = parts[4];
        if (type == "customer") {
            users.push_back(std::make_shared<Customer>(id, name, mail, pass));
        } else if (type == "admin") {
            users.push_back(std::make_shared<Admin>(id, name, mail, pass));
        }
    }
    return users;
}

bool Database::saveUser(const User& user) {
    std::ofstream file(usersFile.c_str(), std::ios::app);
    if (!file.is_open()) return false;
    file << user.toFileString() << "\n";
    return true;
}

bool Database::saveAllUsers(const std::vector<std::shared_ptr<User>>& users) {
    std::ofstream file(usersFile.c_str(), std::ios::trunc);
    if (!file.is_open()) return false;
    for (const auto& user : users) {
        file << user->toFileString() << "\n";
    }
    return true;
}

std::vector<Car> Database::loadCars() {
    std::vector<Car> cars;
    std::ifstream file(carsFile.c_str());
    std::string line;

    while (std::getline(file, line)) {
        std::vector<std::string> parts = split(line, ',');
        if (parts.size() < 8) continue;
        cars.emplace_back(
            parts[0],                 
            parts[1],                 
            parts[2],                 
            parts[3],                 
            std::stod(parts[4]),      
            std::stod(parts[5]),      
            parts[6],                 
            (parts[7] == "1")         
        );
    }
    return cars;
}

bool Database::saveCars(const std::vector<Car>& cars) {
    std::ofstream file(carsFile.c_str(), std::ios::trunc); 
    if (!file.is_open()) return false;
    for (const auto& car : cars) {
        file << car.toFileString() << "\n";
    }
    return true;
}

bool Database::saveAllCars(const std::vector<Car>& cars) {
    return saveCars(cars);
}

std::vector<Booking> Database::loadBookings() {
    std::vector<Booking> bookings;
    std::ifstream file(bookingsFile.c_str());
    std::string line;

    while (std::getline(file, line)) {
        std::vector<std::string> parts = split(line, ',');
        if (parts.size() < 11) continue;
        bookings.emplace_back(
            parts[0],               
            parts[1],                 
            parts[2],                 
            parts[3],                 
            parts[4],                 
            std::stoi(parts[5]),     
            std::stoi(parts[6]),      
            std::stod(parts[7]),      
            parts[8],                 
            parts[9],                 
            parts[10]                 
        );
    }
    return bookings;
}

bool Database::saveBooking(const Booking& booking) {
    std::ofstream file(bookingsFile.c_str(), std::ios::app);
    if (!file.is_open()) return false;
    file << booking.toFileString() << "\n";
    return true;
}

bool Database::saveAllBookings(const std::vector<Booking>& bookings) {
    std::ofstream file(bookingsFile.c_str(), std::ios::trunc);
    if (!file.is_open()) return false;
    for (const auto& booking : bookings) {
        file << booking.toFileString() << "\n";
    }
    return true;
}