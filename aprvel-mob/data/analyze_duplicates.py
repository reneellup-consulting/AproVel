import json
import os
from collections import Counter

def check_duplicates(file_path):
    print(f"Analyzing {file_path}...")
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        return
    
    if 'orders' not in data:
        print("Error: 'orders' key not found in JSON data")
        return

    orders = data['orders']
    print(f"Total orders found: {len(orders)}")

    # Check for duplicate Order IDs
    order_ids = [str(o.get('id')) for o in orders if 'id' in o]
    order_id_counts = Counter(order_ids)
    duplicate_order_ids = {k: v for k, v in order_id_counts.items() if v > 1}
    
    if duplicate_order_ids:
        print(f"\n[!] Found {len(duplicate_order_ids)} duplicate Order IDs:")
        for oid, count in duplicate_order_ids.items():
            print(f"  - Order ID: {oid} (Count: {count})")
    else:
        print("\n[OK] No duplicate Order IDs found.")
        
    # Optional: Check for duplicate Order Line IDs across all orders
    all_line_ids = []
    for order in orders:
        if 'order_lines' in order:
            for line in order['order_lines']:
                if 'id' in line:
                    all_line_ids.append(str(line['id']))
    
    line_id_counts = Counter(all_line_ids)
    duplicate_line_ids = {k: v for k, v in line_id_counts.items() if v > 1}
    
    if duplicate_line_ids:
        print(f"\n[!] Found {len(duplicate_line_ids)} duplicate Order Line IDs (across all orders):")
        # Showing top 10 if there are many
        count = 0
        for lid, c in duplicate_line_ids.items():
            print(f"  - Line ID: {lid} (Count: {c})")
            count += 1
            if count >= 10:
                print(f"  ... and {len(duplicate_line_ids) - 10} more.")
                break
    else:
        print("\n[OK] No duplicate Order Line IDs found.")

if __name__ == "__main__":
    # Script is in the same dir as orders.json
    target_file = "orders.json"
    check_duplicates(target_file)
