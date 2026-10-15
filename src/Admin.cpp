#include "Admin.h"

std::string Admin::toFileString() const {
    return userID + "," + getUserType() + "," + username + "," + email + "," + password;
}