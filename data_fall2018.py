import json
import math
import sys
import requests
import collections

input = json.loads(sys.stdin.readlines()[0])
id = input["id"]
disc_type = input["discount_type"]
disc_value = input["discount_value"]
disc_product_value = input["product_value"] if "product_value" in input else None
disc_collection = input["collection"] if "collection" in input else None
disc_cart_value = input["cart_value"] if "cart_value" in input else None
total_amount = 0
total_after_discount = 0 

start_page = 1
url = "http://backend-challenge-fall-2018.herokuapp.com/carts.json?id={}&page={}".format(id, start_page)
total = requests.get(url).json()["pagination"]["total"]
per_page = requests.get(url).json()["pagination"]["per_page"]
end_page = math.ceil(total / per_page) + 1

output = collections.OrderedDict()

for pg in range(start_page, end_page):
    url = "http://backend-challenge-fall-2018.herokuapp.com/carts.json?id={}&page={}".format(id, pg)
    products = requests.get(url).json()["products"]
    for p in products:
        price = p["price"]
        collection = p["collection"] if "collection" in p else ""
        total_amount += price
        if disc_type == "product":
            if disc_product_value:
                total_after_discount += max(price - disc_value, 0) if price >= disc_product_value else price
            else:
                total_after_discount += max(price - disc_value, 0) if collection == disc_collection else price

if disc_type == "cart":
    total_after_discount = (total_amount - disc_value) if total_amount >= disc_cart_value else total_amount

output["total_amount"] = total_amount
output["total_after_discount"] = total_after_discount

print(json.dumps(output, indent=2))
