import urllib.request
import json
import sys

supabase_url = "https://sgwywgrabomkbegnsref.supabase.co"
supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnd3l3Z3JhYm9ta2JlZ25zcmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjI0NTcsImV4cCI6MjA5NjAzODQ1N30.R2cgG-Kv_iBkOPZ5wQ5cdPsJuou4TEj9x3uD3UGBoIw"

email = "fasi.knl@gmail.com"
password = "Fasilshaik@1"

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
print("1. Logging in to Supabase...")
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

# 3. GET /quotes
print("\n3. Testing GET /quotes...")
resp_quotes, err = api_call("/quotes", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_quotes)} quotes.")

# 4. POST /quotes
print("\n4. Testing POST /quotes (Create Quote)...")
new_quote_payload = {
    "origin": "Mumbai, IN",
    "destination": "London, UK",
    "mode": "sea",
    "cargo_type": "Electronics",
    "weight": 850.0,
    "volume": 2.5
}
resp_new_quote, err = api_call("/quotes", method="POST", payload=new_quote_payload, token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Created Quote Ref: {resp_new_quote.get('quote_ref')}, Price: ${resp_new_quote.get('amount')}")

# 5. GET /shipments
print("\n5. Testing GET /shipments...")
resp_shipments, err = api_call("/shipments", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_shipments)} shipments.")
    if resp_shipments:
        target_shipment_id = resp_shipments[0].get("id")
        tracking_id = resp_shipments[0].get("tracking_id")

# 6. GET /finance/invoices
print("\n6. Testing GET /finance/invoices...")
resp_invoices, err = api_call("/finance/invoices", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_invoices)} invoices.")

# 7. GET /finance/payments
print("\n7. Testing GET /finance/payments...")
resp_payments, err = api_call("/finance/payments", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_payments)} payments.")

# 8. GET /insurance/policies
print("\n8. Testing GET /insurance/policies...")
resp_ins, err = api_call("/insurance/policies", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_ins)} policies.")

# 9. POST /insurance/policies
if resp_shipments:
    print("\n9. Testing POST /insurance/policies...")
    ins_payload = {
        "shipment_id": target_shipment_id,
        "coverage_amount": 25000.0,
        "selected_plan": "Standard Protection"
    }
    resp_new_ins, err = api_call("/insurance/policies", method="POST", payload=ins_payload, token=access_token)
    if err:
        print("   => Failed:", err)
    else:
        print(f"   => Success! Created Policy Ref: {resp_new_ins.get('policy_ref')}, Premium: ${resp_new_ins.get('premium')}")

# 10. GET /support/tickets
print("\n10. Testing GET /support/tickets...")
resp_tickets, err = api_call("/support/tickets", token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Found {len(resp_tickets)} support tickets.")

# 11. POST /support/tickets
print("\n11. Testing POST /support/tickets...")
ticket_payload = {
    "subject": "Inquiry regarding shipment rates",
    "category": "Shipment Issue",
    "priority": "Medium",
    "message": "Testing customer portal ticketing API endpoint."
}
resp_new_ticket, err = api_call("/support/tickets", method="POST", payload=ticket_payload, token=access_token)
if err:
    print("   => Failed:", err)
else:
    print(f"   => Success! Created Ticket Ref: {resp_new_ticket.get('ticket_ref')}, Status: {resp_new_ticket.get('status')}")
