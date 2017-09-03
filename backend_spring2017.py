import math
import check

def calc_revenue(taxes_included, subtotal_price, total_tax):
    if taxes_included:
        return float(subtotal_price - total_tax)
    else:
        return float(subtotal_price)

def total_revenue(order_ht):
    list_of_order = order_ht["orders"]
    revenue_ht = {}

    for current_order in list_of_order:
        currency = current_order["currency"]
        if currency not in revenue_ht:
            revenue_ht[currency] = calc_revenue(current_order["taxes_included"], 
            current_order["subtotal_price"], current_order["total_tax"])
        else:
            revenue_ht[currency] += calc_revenue(current_order["taxes_included"], 
            current_order["subtotal_price"], current_order["total_tax"])
    return revenue_ht

# total_revenue(order)
