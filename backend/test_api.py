import urllib.request
import json

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Owner Login
    req = urllib.request.Request(
        f"{base_url}/api/auth/login",
        data=json.dumps({"email": "owner@smartwarehouse.com", "password": "password123"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    owner_data = json.loads(res.read().decode('utf-8'))
    owner_token = owner_data["access_token"]
    print("[OK] Owner Login OK | Token Role:", owner_data["role"])

    # 2. Manager Login
    req_m = urllib.request.Request(
        f"{base_url}/api/auth/login",
        data=json.dumps({"email": "manager@smartwarehouse.com", "password": "password123"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res_m = urllib.request.urlopen(req_m)
    manager_data = json.loads(res_m.read().decode('utf-8'))
    manager_token = manager_data["access_token"]
    print("[OK] Manager Login OK | Token Role:", manager_data["role"])

    # 3. Dashboard Priorities for Owner
    req_p = urllib.request.Request(
        f"{base_url}/api/dashboard/priorities",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    res_p = urllib.request.urlopen(req_p)
    priorities = json.loads(res_p.read().decode('utf-8'))
    print("[OK] Priorities Count:", len(priorities))

    # 4. Energy summary for Owner (200 OK)
    req_e_owner = urllib.request.Request(
        f"{base_url}/api/energy/summary",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    res_e_owner = urllib.request.urlopen(req_e_owner)
    print("[OK] Owner Energy Access Status:", res_e_owner.getcode())

    # 5. Energy summary for Manager (403 Forbidden)
    req_e_mgr = urllib.request.Request(
        f"{base_url}/api/energy/summary",
        headers={"Authorization": f"Bearer {manager_token}"}
    )
    try:
        urllib.request.urlopen(req_e_mgr)
        print("[FAIL] ERROR: Manager should be forbidden!")
    except urllib.error.HTTPError as e:
        print("[OK] Manager Energy Access Status (Expected 403 Forbidden):", e.code)

if __name__ == "__main__":
    test_api()
