#include "crow_all.h"
#include "CarRentalSystem.h"

int main()
{
    crow::App<crow::CORSHandler> app;

    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors
        .global()
        .allow_credentials()
        .allowed_origins({"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"}) 
        .allowed_methods("POST,GET,OPTIONS,DELETE,PUT"_method)
        .allowed_headers("Content-Type, Accept, Authorization");

    CarRentalSystem system;

    CROW_ROUTE(app, "/api/register").methods(crow::HTTPMethod::POST)
    ([&system](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("username") || !body.has("email") || !body.has("password")) {
            return crow::response(400, {{"success", false}, {"message", "Missing required fields."}});
        }
        auto res_json = system.registerUser(body["username"].s(), body["email"].s(), body["password"].s());
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/login").methods(crow::HTTPMethod::POST)
    ([&system](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("email") || !body.has("password")) {
            return crow::response(400, {{"success", false}, {"message", "Missing email or password."}});
        }
        auto res_json = system.loginUser(body["email"].s(), body["password"].s());
        if (res_json["success"]) return crow::response(200, res_json.dump());
        return crow::response(401, res_json.dump());
    });

    CROW_ROUTE(app, "/api/cars").methods(crow::HTTPMethod::GET)
    ([&system]() {
        auto res_json = system.getAllCars();
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/booking").methods(crow::HTTPMethod::POST)
    ([&system](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, {{"success", false}, {"message", "Invalid request."}});
        auto res_json = system.createBooking(body);
        return crow::response(200, res_json.dump());
    });
    
    CROW_ROUTE(app, "/api/bookings/<string>").methods(crow::HTTPMethod::GET)
    ([&system](const std::string& userId) {
        auto res_json = system.getUserBookings(userId);
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/booking/<string>/cancel").methods(crow::HTTPMethod::POST)
    ([&system](const crow::request& req, const std::string& bookingId) {
        std::string userId = "";
        auto body = crow::json::load(req.body);
        if (body && body.has("userId")) {
            userId = body["userId"].s();
        }
        auto res_json = system.cancelBooking(bookingId, userId);
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/booking/<string>/return").methods(crow::HTTPMethod::POST)
    ([&system](const std::string& bookingId) {
        auto res_json = system.returnCar(bookingId);
        return crow::response(200, res_json.dump());
    });

    // --- Admin Routes ---
    CROW_ROUTE(app, "/api/admin/users").methods(crow::HTTPMethod::GET)
    ([&system]() {
        auto res_json = system.getAdminUsers();
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/admin/bookings").methods(crow::HTTPMethod::GET)
    ([&system]() {
        auto res_json = system.getAllBookings();
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/admin/car").methods(crow::HTTPMethod::POST)
    ([&system](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, {{"success", false}, {"message", "Invalid request."}});
        auto res_json = system.addNewCar(body);
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/admin/car/<string>").methods(crow::HTTPMethod::DELETE)
    ([&system](const std::string& carId) {
        auto res_json = system.deleteCar(carId);
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/admin/car/<string>/rates").methods(crow::HTTPMethod::PUT)
    ([&system](const crow::request& req, const std::string& carId) {
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, {{"success", false}, {"message", "Invalid request."}});
        auto res_json = system.updateCarRates(carId, body);
        return crow::response(200, res_json.dump());
    });

    CROW_ROUTE(app, "/api/admin/user/<string>").methods(crow::HTTPMethod::DELETE)
    ([&system](const std::string& userId) {
        auto res_json = system.deleteUser(userId);
        return crow::response(200, res_json.dump());
    });

    std::cout << "Starting C++ backend on http://localhost:8080" << std::endl;
    app.port(8080)
       .multithreaded()
       .run();

    return 0;
}