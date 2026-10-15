#pragma once
#include <string>

// Abstract Base Class for User
class User {
protected:
    std::string userID;
    std::string username;
    std::string email;
    std::string password; // In a real app, this would be a password hash

public:
    User(std::string id, std::string name, std::string mail, std::string pass)
        : userID(id), username(name), email(mail), password(pass) {}

    virtual ~User() {}

    // --- Encapsulation (Getters) ---
    std::string getUserID() const { return userID; }
    std::string getUsername() const { return username; }
    std::string getEmail() const { return email; }

    bool checkPassword(const std::string& pass) const {
        return password == pass;
    }

    // --- Polymorphism (Pure Virtual Function) ---
    virtual std::string getUserType() const = 0;
    virtual std::string toFileString() const = 0; // Helper for saving to file
};