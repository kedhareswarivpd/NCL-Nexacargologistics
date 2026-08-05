import urllib.request
import json
import sys
import time
import uuid

supabase_url = "https://sgwywgrabomkbegnsref.supabase.co"
supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnd3l3Z3JhYm9ta2JlZ25zcmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjI0NTcsImV4cCI6MjA5NjAzODQ1N30.R2cgG-Kv_iBkOPZ5wQ5cdPsJuou4TEj9x3uD3UGBoIw"

email = "logistics@nexacargo.com"
password = "Logistics1234"
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
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}, None
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, "read"):
            try:
                err_msg += " - " + e.read().decode("utf-8")
            except:
                pass
        return None, err_msg

# 1. Login
print("Logging in to Supabase...")
login_url = f"{supabase_url}/auth/v1/token?grant_type=password"
login_data = json.dumps({"email": email, "password": password}).encode("utf-8")
login_headers = {"Content-Type": "application/json", "apikey": supabase_anon_key}
try:
    req = urllib.request.Request(login_url, data=login_data, headers=login_headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        res_data = json.loads(resp.read().decode("utf-8"))
        access_token = res_data.get("access_token")
        print("   => Logged in successfully!")
except Exception as e:
    print("   => Login failed:", e)
    sys.exit(1)

# 2. POST, PATCH, DELETE Containers
print("\n--- Testing Containers Write APIs ---")
container_no = f"CT-{int(time.time())}"
print(f"POST /logistics/containers (Creating {container_no})...")
c_create, err = api_call("/logistics/containers", "POST", {
    "container_no": container_no,
    "type": "FCL 20FT",
    "status": "Available",
    "capacity": "20000 kg"
}, token=access_token)
if err:
    print("   => Failed POST:", err)
else:
    c_id = c_create.get("id")
    print(f"   => Success! Created Container ID: {c_id}")

    print(f"PATCH /logistics/containers/{c_id} (Updating status to Maintenance)...")
    c_update, err = api_call(f"/logistics/containers/{c_id}", "PATCH", {
        "status": "Maintenance"
    }, token=access_token)
    if err:
        print("   => Failed PATCH:", err)
    else:
        print(f"   => Success! Updated Status: {c_update.get('status')}")

    print(f"DELETE /logistics/containers/{c_id}...")
    _, err = api_call(f"/logistics/containers/{c_id}", "DELETE", token=access_token)
    if err:
        print("   => Failed DELETE:", err)
    else:
        print("   => Success! Container deleted.")

# 3. POST, PATCH, DELETE Routes
print("\n--- Testing Routes Write APIs ---")
route_code = f"RT-{int(time.time())}"
print(f"POST /logistics/routes (Creating {route_code})...")
r_create, err = api_call("/logistics/routes", "POST", {
    "route_code": route_code,
    "origin": "Miami Port, US",
    "destination": "Hamburg Port, DE",
    "distance": "8000 km",
    "duration": "12 days",
    "status": "Scheduled"
}, token=access_token)
if err:
    print("   => Failed POST:", err)
else:
    r_id = r_create.get("id")
    print(f"   => Success! Created Route ID: {r_id}")

    print(f"PATCH /logistics/routes/{r_id} (Updating status to Active)...")
    r_update, err = api_call(f"/logistics/routes/{r_id}", "PATCH", {
        "status": "Active"
    }, token=access_token)
    if err:
        print("   => Failed PATCH:", err)
    else:
        print(f"   => Success! Updated Status: {r_update.get('status')}")

    print(f"DELETE /logistics/routes/{r_id}...")
    _, err = api_call(f"/logistics/routes/{r_id}", "DELETE", token=access_token)
    if err:
        print("   => Failed DELETE:", err)
    else:
        print("   => Success! Route deleted.")

# 4. POST, PATCH, DELETE Vehicles
print("\n--- Testing Vehicles Write APIs ---")
plate_no = f"PL-{str(uuid.uuid4())[:8].upper()}"
print(f"POST /logistics/vehicles (Creating {plate_no})...")
v_create, err = api_call("/logistics/vehicles", "POST", {
    "vehicle_no": plate_no,
    "type": "Container Truck",
    "status": "Active",
    "capacity": "32000 kg"
}, token=access_token)
if err:
    print("   => Failed POST:", err)
else:
    v_id = v_create.get("id")
    print(f"   => Success! Created Vehicle ID: {v_id}")

    print(f"PATCH /logistics/vehicles/{v_id} (Updating status to Maintenance)...")
    v_update, err = api_call(f"/logistics/vehicles/{v_id}", "PATCH", {
        "status": "Maintenance"
    }, token=access_token)
    if err:
        print("   => Failed PATCH:", err)
    else:
        print(f"   => Success! Updated Status: {v_update.get('status')}")

    print(f"DELETE /logistics/vehicles/{v_id}...")
    _, err = api_call(f"/logistics/vehicles/{v_id}", "DELETE", token=access_token)
    if err:
        print("   => Failed DELETE:", err)
    else:
        print("   => Success! Vehicle deleted.")

# 5. POST, PATCH, DELETE Deliveries
print("\n--- Testing Deliveries Write APIs ---")
print("POST /logistics/deliveries (Creating test delivery segment)...")
d_create, err = api_call("/logistics/deliveries", "POST", {
    "location": "Suez Canal Transit",
    "progress": 25,
    "eta": "10 days",
    "status": "Pending"
}, token=access_token)
if err:
    print("   => Failed POST:", err)
else:
    d_id = d_create.get("id")
    print(f"   => Success! Created Delivery ID: {d_id}")

    print(f"PATCH /logistics/deliveries/{d_id} (Updating status to In Transit)...")
    d_update, err = api_call(f"/logistics/deliveries/{d_id}", "PATCH", {
        "status": "In Transit",
        "progress": 50
    }, token=access_token)
    if err:
        print("   => Failed PATCH:", err)
    else:
        print(f"   => Success! Updated Status: {d_update.get('status')}, Progress: {d_update.get('progress')}%")

    print(f"DELETE /logistics/deliveries/{d_id}...")
    _, err = api_call(f"/logistics/deliveries/{d_id}", "DELETE", token=access_token)
    if err:
        print("   => Failed DELETE:", err)
    else:
        print("   => Success! Delivery segment deleted.")

# 6. POST Dispatch Assign & Reassign Driver
print("\n--- Testing Dispatch Write APIs (Assign / Reassign Driver) ---")
active_shipments, err = api_call("/dispatch/active-shipments", token=access_token)
if err or not active_shipments:
    print("   => No active shipments found, skipping dispatch write test.")
else:
    shipment = active_shipments[0]
    shipment_id = shipment.get("id")
    print(f"Found active shipment: {shipment.get('tracking_id')} (ID: {shipment_id})")

    # Let's check available drivers or use default test drivers
    available_drivers, err = api_call("/dispatch/available-drivers", token=access_token)
    if err or not available_drivers:
        # Fallback test driver IDs
        driver_1_id = "bc1401f5-2cb5-44ba-b1d9-7cc962ed2159"
        driver_2_id = "0f7341e7-5304-43e5-90eb-e935b89fb550"
        print(f"Using fallback test drivers (Driver 1: {driver_1_id}, Driver 2: {driver_2_id})")
    else:
        driver_1_id = available_drivers[0].get("id")
        driver_2_id = available_drivers[1].get("id") if len(available_drivers) > 1 else "0f7341e7-5304-43e5-90eb-e935b89fb550"
        print(f"Using database available drivers (Driver 1: {driver_1_id}, Driver 2: {driver_2_id})")

    print(f"POST /dispatch/assign-driver (Assigning Driver 1 to Shipment)...")
    assign_res, err = api_call("/dispatch/assign-driver", "POST", {
        "shipment_id": shipment_id,
        "driver_id": driver_1_id,
        "eta": "14 days"
    }, token=access_token)
    if err:
        print("   => Failed assign-driver:", err)
    else:
        delivery_id = assign_res.get("id")
        print(f"   => Success! Assigned. Delivery ID generated: {delivery_id}")

        print(f"POST /dispatch/reassign-driver (Reassigning to Driver 2)...")
        reassign_res, err = api_call("/dispatch/reassign-driver", "POST", {
            "delivery_id": delivery_id,
            "driver_id": driver_2_id
        }, token=access_token)
        if err:
            print("   => Failed reassign-driver:", err)
        else:
            print(f"   => Success! Reassigned. New Driver ID on Delivery: {reassign_res.get('driver_id')}")

        # Cleanup created delivery stop
        api_call(f"/logistics/deliveries/{delivery_id}", "DELETE", token=access_token)
        print("   => Dispatch test delivery stop cleaned up.")
