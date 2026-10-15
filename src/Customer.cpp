#include "Customer.h"

std::string Customer::toFileString() const {
    return userID + "," + getUserType() + "," + username + "," + email + "," + password;
}