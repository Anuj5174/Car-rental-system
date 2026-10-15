import http.server
import socketserver
import json
import os
import random
import re

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "data", "users.txt")
CARS_FILE = os.path.join(BASE_DIR, "data", "cars.txt")
BOOKINGS_FILE = os.path.join(BASE_DIR, "data", "bookings.txt")

def ensure_files():
    os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
    for f in [USERS_FILE, CARS_FILE, BOOKINGS_FILE]:
        if not os.path.exists(f):
            open(f, "a", encoding="utf-8").close()

def load_users():
    ensure_files()
    users = []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.split(",")]
            if len(parts) >= 5:
                users.append({
                    "userId": parts[0],
                    "userType": parts[1],
                    "username": parts[2],
                    "email": parts[3],
                    "password": parts[4]
                })
    return users

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        for u in users:
            f.write(f"{u['userId']},{u['userType']},{u['username']},{u['email']},{u['password']}\n")

def load_cars():
    ensure_files()
    cars = []
    with open(CARS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.split(",")]
            if len(parts) >= 8:
                cars.append({
                    "carId": parts[0],
                    "brand": parts[1],
                    "model": parts[2],
                    "carType": parts[3],
                    "baseRate": float(parts[4]),
                    "stallingCharge": float(parts[5]),
                    "regNumber": parts[6],
                    "isAvailable": parts[7] == "1"
                })
    return cars

def save_cars(cars):
    with open(CARS_FILE, "w", encoding="utf-8") as f:
        for c in cars:
            avail = "1" if c.get("isAvailable", True) else "0"
            f.write(f"{c['carId']},{c['brand']},{c['model']},{c['carType']},{c['baseRate']},{c['stallingCharge']},{c['regNumber']},{avail}\n")

def load_bookings():
    ensure_files()
    bookings = []
    with open(BOOKINGS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.split(",")]
            if len(parts) >= 11:
                bookings.append({
                    "bookingId": parts[0],
                    "userId": parts[1],
                    "carId": parts[2],
                    "pickupDate": parts[3],
                    "returnDate": parts[4],
                    "numDays": int(parts[5]),
                    "stallingHours": int(parts[6]),
                    "totalCost": float(parts[7]),
                    "status": parts[8],
                    "paymentId": parts[9],
                    "paymentStatus": parts[10]
                })
    return bookings

def save_bookings(bookings):
    with open(BOOKINGS_FILE, "w", encoding="utf-8") as f:
        for b in bookings:
            f.write(f"{b['bookingId']},{b['userId']},{b['carId']},{b['pickupDate']},{b['returnDate']},{b['numDays']},{b['stallingHours']},{b['totalCost']},{b['status']},{b['paymentId']},{b['paymentStatus']}\n")

class RequestHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def read_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw = self.rfile.read(content_length)
            try:
                return json.loads(raw.decode("utf-8"))
            except Exception:
                return {}
        return {}

    def do_GET(self):
        path = self.path.split("?")[0]

        # GET /api/cars
        if path == "/api/cars":
            cars = load_cars()
            return self.send_json(200, {"success": True, "cars": cars})

        # GET /api/bookings/<userId>
        m = re.match(r"^/api/bookings/([^/]+)$", path)
        if m:
            user_id = m.group(1)
            bookings = load_bookings()
            cars = {c["carId"]: c for c in load_cars()}
            res = []
            for b in bookings:
                if b["userId"] == user_id:
                    car = cars.get(b["carId"], {})
                    item = dict(b)
                    item["carBrand"] = car.get("brand", "Unknown")
                    item["carModel"] = car.get("model", "Car")
                    item["carType"] = car.get("carType", "basic")
                    res.append(item)
            res.reverse()
            return self.send_json(200, {"success": True, "bookings": res})

        # GET /api/admin/users
        if path == "/api/admin/users":
            users = load_users()
            user_list = [{
                "userId": u["userId"],
                "username": u["username"],
                "email": u["email"],
                "userType": u["userType"]
            } for u in users]
            return self.send_json(200, {"success": True, "users": user_list})

        # GET /api/admin/bookings
        if path == "/api/admin/bookings":
            bookings = load_bookings()
            cars = {c["carId"]: c for c in load_cars()}
            users = {u["userId"]: u for u in load_users()}
            res = []
            for b in bookings:
                car = cars.get(b["carId"], {})
                u = users.get(b["userId"], {})
                item = dict(b)
                item["carBrand"] = car.get("brand", "Unknown")
                item["carModel"] = car.get("model", "Car")
                item["carType"] = car.get("carType", "basic")
                item["username"] = u.get("username", "Unknown")
                res.append(item)
            res.reverse()
            return self.send_json(200, {"success": True, "bookings": res})

        self.send_json(404, {"success": False, "message": "Not found"})

    def do_POST(self):
        path = self.path.split("?")[0]
        data = self.read_body()

        # POST /api/register
        if path == "/api/register":
            username = data.get("username", "").strip()
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            if not username or not email or not password:
                return self.send_json(400, {"success": False, "message": "Missing required fields."})

            users = load_users()
            for u in users:
                if u["email"].lower() == email.lower():
                    return self.send_json(200, {"success": False, "message": "Email already in use!"})

            new_id = f"U{random.randint(1000, 9999)}"
            new_user = {
                "userId": new_id,
                "userType": "customer",
                "username": username,
                "email": email,
                "password": password
            }
            users.append(new_user)
            save_users(users)
            return self.send_json(200, {"success": True, "message": "Account created successfully!"})

        # POST /api/login
        if path == "/api/login":
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            users = load_users()
            for u in users:
                if u["email"].lower() == email.lower() and u["password"] == password:
                    return self.send_json(200, {
                        "success": True,
                        "userId": u["userId"],
                        "username": u["username"],
                        "email": u["email"],
                        "userType": u["userType"]
                    })
            return self.send_json(401, {"success": False, "message": "Invalid email or password!"})

        # POST /api/booking
        if path == "/api/booking":
            user_id = data.get("userId")
            car_id = data.get("carId")
            cars = load_cars()
            target_car = next((c for c in cars if c["carId"] == car_id), None)
            if not target_car or not target_car.get("isAvailable", True):
                return self.send_json(200, {"success": False, "message": "Car is not available!"})

            booking_id = f"B{random.randint(1000, 9999)}"
            payment_id = f"P{random.randint(1000, 9999)}"
            new_booking = {
                "bookingId": booking_id,
                "userId": user_id,
                "carId": car_id,
                "pickupDate": data.get("pickupDate", ""),
                "returnDate": data.get("returnDate", ""),
                "numDays": int(data.get("numDays", 1)),
                "stallingHours": int(data.get("stallingHours", 0)),
                "totalCost": float(data.get("totalCost", 0.0)),
                "status": "active",
                "paymentId": payment_id,
                "paymentStatus": "success"
            }
            bookings = load_bookings()
            bookings.append(new_booking)
            save_bookings(bookings)

            target_car["isAvailable"] = False
            save_cars(cars)

            return self.send_json(200, {"success": True, "message": "Booking confirmed!", "bookingID": booking_id})

        # POST /api/booking/<bookingId>/cancel
        m = re.match(r"^/api/booking/([^/]+)/cancel$", path)
        if m:
            booking_id = m.group(1)
            bookings = load_bookings()
            b = next((x for x in bookings if x["bookingId"] == booking_id), None)
            if not b:
                return self.send_json(404, {"success": False, "message": "Booking not found"})

            b["status"] = "cancelled"
            save_bookings(bookings)

            cars = load_cars()
            for c in cars:
                if c["carId"] == b["carId"]:
                    c["isAvailable"] = True
                    break
            save_cars(cars)
            return self.send_json(200, {"success": True, "message": "Booking cancelled successfully!"})

        # POST /api/booking/<bookingId>/return
        m = re.match(r"^/api/booking/([^/]+)/return$", path)
        if m:
            booking_id = m.group(1)
            bookings = load_bookings()
            b = next((x for x in bookings if x["bookingId"] == booking_id), None)
            if not b:
                return self.send_json(404, {"success": False, "message": "Booking not found"})

            b["status"] = "completed"
            save_bookings(bookings)

            cars = load_cars()
            for c in cars:
                if c["carId"] == b["carId"]:
                    c["isAvailable"] = True
                    break
            save_cars(cars)
            return self.send_json(200, {"success": True, "message": "Car returned successfully! Rental completed."})

        # POST /api/admin/car
        if path == "/api/admin/car":
            cars = load_cars()
            car_id = f"C{random.randint(100, 999)}"
            new_car = {
                "carId": car_id,
                "brand": data.get("brand", ""),
                "model": data.get("model", ""),
                "carType": data.get("carType", "economy"),
                "baseRate": float(data.get("baseRate", 0.0)),
                "stallingCharge": float(data.get("stallingCharge", 0.0)),
                "regNumber": data.get("regNumber", ""),
                "isAvailable": True
            }
            cars.append(new_car)
            save_cars(cars)
            return self.send_json(200, {"success": True, "car": new_car})

        self.send_json(404, {"success": False, "message": "Not found"})

    def do_DELETE(self):
        path = self.path.split("?")[0]

        # DELETE /api/admin/car/<carId>
        m = re.match(r"^/api/admin/car/([^/]+)$", path)
        if m:
            car_id = m.group(1)
            cars = load_cars()
            initial_len = len(cars)
            cars = [c for c in cars if c["carId"] != car_id]
            if len(cars) < initial_len:
                save_cars(cars)
                return self.send_json(200, {"success": True, "message": "Car deleted."})
            return self.send_json(404, {"success": False, "message": "Car not found."})

        # DELETE /api/admin/user/<userId>
        m = re.match(r"^/api/admin/user/([^/]+)$", path)
        if m:
            user_id = m.group(1)
            users = load_users()
            target = next((u for u in users if u["userId"] == user_id), None)
            if target and target.get("userType") != "admin":
                users = [u for u in users if u["userId"] != user_id]
                save_users(users)
                return self.send_json(200, {"success": True, "message": "User deleted."})
            return self.send_json(400, {"success": False, "message": "Cannot delete admin or user not found."})

        self.send_json(404, {"success": False, "message": "Not found"})

    def do_PUT(self):
        path = self.path.split("?")[0]
        data = self.read_body()

        # PUT /api/admin/car/<carId>/rates
        m = re.match(r"^/api/admin/car/([^/]+)/rates$", path)
        if m:
            car_id = m.group(1)
            cars = load_cars()
            for c in cars:
                if c["carId"] == car_id:
                    if "baseRate" in data:
                        c["baseRate"] = float(data["baseRate"])
                    if "stallingCharge" in data:
                        c["stallingCharge"] = float(data["stallingCharge"])
                    save_cars(cars)
                    return self.send_json(200, {"success": True, "car": c})
            return self.send_json(404, {"success": False, "message": "Car not found."})

        self.send_json(404, {"success": False, "message": "Not found"})

if __name__ == "__main__":
    ensure_files()
    print(f"Starting Car Rental System Backend on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
