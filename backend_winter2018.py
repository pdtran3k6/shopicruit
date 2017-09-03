import json
import math
import requests

url = "https://backend-challenge-winter-2017.herokuapp.com/customers.json"
start_page = 1
total = requests.get(url).json()["pagination"]["total"]
per_page = requests.get(url).json()["pagination"]["per_page"]
end_page = math.ceil(total / per_page) + 1

type_name = str or requests.get(url).json()["validations"][0]["name"]["type"]
min_length_name = 0 or requests.get(url).json()["validations"][0]["name"]["length"]["min"]
is_required_name = False or requests.get(url).json()["validations"][0]["name"]["required"]

is_required_email = False or requests.get(url).json()["validations"][1]["email"]["required"]

type_age = int or requests.get(url).json()["validations"][2]["age"]["type"]
is_required_age = bool or requests.get(url).json()["validations"][2]["age"]["required"]

type_newsletter = bool or requests.get(url).json()["validations"][3]["newsletter"]["type"]
is_required_newsletter = False or requests.get(url).json()["validations"][3]["newsletter"]["required"]

output = {
    "invalid_customers": []
}

for i in range(start_page, end_page):
    url = "https://backend-challenge-winter-2017.herokuapp.com/customers.json?page={}".format(i)
    customers = requests.get(url).json()["customers"]

    for customer in customers:
        invalid_customer = {
            "invalid_fields": []
        }

        if is_required_name and customer["name"] is None:
            invalid_customer["id"] = customer["id"]
            invalid_customer["invalid_fields"].append("name")
        elif is_required_name:
            name = customer["name"]
            if len(name) <= min_length_name or type(name) is not type_name:
                invalid_customer["id"] = customer["id"]
                invalid_customer["invalid_fields"].append("name")
        else:
            pass

        if is_required_email and customer["email"] is None:
            invalid_customer["id"] = customer["id"]
            invalid_customer["invalid_fields"].append("email")

        if is_required_age and customer["age"] is None:
            invalid_customer["id"] = customer["id"]
            invalid_customer["invalid_fields"].append("age")
        elif is_required_age:
            age = customer["age"]
            if type(age) is not type_age:
                invalid_customer["id"] = customer["id"]
                invalid_customer["invalid_fields"].append("age")
        else:
            pass

        if is_required_newsletter and customer["newsletter"] is None:
            invalid_customer["id"] = customer["id"]
            invalid_customer["invalid_fields"].append("newsletter")
        elif is_required_newsletter:
            newsletter = customer["newsletter"]
            if type(newsletter) is not type_newsletter:
                invalid_customer["id"] = customer["id"]
                invalid_customer["invalid_fields"].append("newsletter")
        else:
            pass

        if not invalid_customer["invalid_fields"]:
            continue

        output["invalid_customers"].append(invalid_customer)

print(json.dumps(output, indent=4, sort_keys=True))
