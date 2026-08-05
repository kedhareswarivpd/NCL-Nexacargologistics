import urllib.request
import json
import sys
import time

supabase_url = "https://sgwywgrabomkbegnsref.supabase.co"
supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnd3l3Z3JhYm9ta2JlZ25zcmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjI0NTcsImV4cCI6MjA5NjAzODQ1N30.R2cgG-Kv_iBkOPZ5wQ5cdPsJuou4TEj9x3uD3UGBoIw"

email = "logistics@nexacargo.com"
password = "Logistics1234"

# Remote backend URL
backend_base_url = "https://ncl-nexacargologistics-2.onrender.com/api/v1"

def api_call(endpoint, method="GET", payload=None, token=None):
    url = f"{backend_base_url}{endpoint}"
    headers = {
        "Content-Type": "application/json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(payload).encode("utf-8") if payload else None
    
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8")), None
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, "read"):
            try:
                err_msg += " - " + e.read().decode("utf-8")
            except:
                pass
        return None, err_msg

# 1. Supabase Login
print("1. Logging in to Supabase as logistics staff...")
login_url = f"{supabase_url}/auth/v1/token?grant_type=password"
login_data = json.dumps({"email": email, "password": password}).encode("utf-8")
login_headers = {"Content-Type": "application/json", "apikey": supabase_anon_key}
try:
    req = urllib.request.Request(login_url, data=login_data, headers=login_headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        res_data = json.loads(resp.read().decode("utf-8"))
        access_token = res_data.get("access_token")
        user_id = res_data.get("user", {}).get("id")
        print(f"   => Success! User ID: {user_id}")
except Exception as e:
    print("   => Failed to log in to Supabase:", e)
    sys.exit(1)

# 2. GET /auth/me
print("\n2. Testing GET /auth/me...")
resp, err = api_call("/auth/me", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Email: {resp.get('email')}, Role: {resp.get('role')}")

# 3. GET /logistics/containers
print("\n3. Testing GET /logistics/containers...")
resp_containers, err = api_call("/logistics/containers", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_containers)} containers.")

# 4. POST /logistics/containers (Create Container)
print("\n4. Testing POST /logistics/containers...")
container_no = f"CT-TEST-{int(time.time())}"
container_payload = {
    "container_no": container_no,
    "type": "40FT Dry",
    "status": "Available",
    "capacity": "26000 kg"
}
resp_new_container, err = api_call("/logistics/containers", method="POST", payload=container_payload, token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Created Container ID: {resp_new_container.get('id')}, No: {resp_new_container.get('container_no')}")
    # Cleanup delete container
    container_id = resp_new_container.get("id")
    api_call(f"/logistics/containers/{container_id}", method="DELETE", token=access_token)

# 5. GET /logistics/routes
print("\n5. Testing GET /logistics/routes...")
resp_routes, err = api_call("/logistics/routes", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_routes)} routes.")

# 6. POST /logistics/routes (Create Route)
print("\n6. Testing POST /logistics/routes...")
route_payload = {
    "route_code": f"RT-{int(time.time())}",
    "origin": "Mumbai, IN",
    "destination": "London, UK",
    "distance": "7500 km",
    "duration": "14 days",
    "status": "Active"
}
resp_new_route, err = api_call("/logistics/routes", method="POST", payload=route_payload, token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Created Route ID: {resp_new_route.get('id')}, Code: {resp_new_route.get('route_code')}")
    # Cleanup delete route
    route_id = resp_new_route.get("id")
    api_call(f"/logistics/routes/{route_id}", method="DELETE", token=access_token)

# 7. GET /logistics/vehicles
print("\n7. Testing GET /logistics/vehicles...")
resp_vehicles, err = api_call("/logistics/vehicles", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_vehicles)} vehicles.")

# 8. GET /logistics/deliveries
print("\n8. Testing GET /logistics/deliveries...")
resp_deliveries, err = api_call("/logistics/deliveries", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_deliveries)} deliveries.")

# 9. GET /dispatch/available-drivers
print("\n9. Testing GET /dispatch/available-drivers...")
resp_drivers, err = api_call("/dispatch/available-drivers", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_drivers)} available drivers.")

# 10. GET /dispatch/active-shipments
print("\n10. Testing GET /dispatch/active-shipments...")
resp_act_shipments, err = api_call("/dispatch/active-shipments", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_act_shipments)} active shipments.")
