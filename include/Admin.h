#pragma once
#include "User.h"

// Concrete class inheriting from User
class Admin : public User {
public:
    Admin(std::string id, std::string name, std::string mail, std::string pass)
        : User(id, name, mail, pass) {}

    // --- Polymorphism (Overriding) ---
    std::string getUserType() const override {
        return "admin";
    }
    std::string toFileString() const override;
};