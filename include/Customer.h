#pragma once
#include "User.h"
#include <vector>

// Concrete class inheriting from User
class Customer : public User {
public:
    Customer(std::string id, std::string name, std::string mail, std::string pass)
        : User(id, name, mail, pass) {}

    // --- Polymorphism (Overriding) ---
    std::string getUserType() const override {
        return "customer";
    }
    std::string toFileString() const override;
};