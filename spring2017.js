// Import modules
var request = require('request');

// Variable declaration
// total_revenue: store revenue for different currency
// page_num: page number of order.json
// orders_obj: store the list of orders
var total_revenue = {};
var page_num = 1;
var orders_obj;

// Deduct tax from price, if tax is included in price
function revenueAfterTax(taxes_included, subtotal_price, total_tax) {
    if (taxes_included) {
        return parseFloat(subtotal_price - total_tax)
    } else {
        return parseFloat(subtotal_price)
    }
}

function get_revenue(order_json) {
    // Extract list of orders from request
    var list_of_orders = order_json.orders;
    var revenue = {};

    // Iterate through all orders in list_of_orders
    for(i = 0; i < list_of_orders.length; i++) {
        
        // Get all different currency for each order
        var currency = list_of_orders[i]["currency"]

        // Add each currency and its corresponding amount to revenue hashtable
        if (currency in revenue) {
            revenue[currency] += 
            revenueAfterTax(list_of_orders[i]["taxes_included"], 
            list_of_orders[i]["subtotal_price"], 
            list_of_orders[i]["total_tax"])
        } else {
            revenue[currency] = 
            revenueAfterTax(list_of_orders[i]["taxes_included"], 
            list_of_orders[i]["subtotal_price"], 
            list_of_orders[i]["total_tax"])
        }
    }

    // For each currency, add the revenue in revenue to totalRevenue 
    for (var currency in revenue) {
        if (currency in total_revenue) {
            total_revenue[currency] += revenue[currency]
        } else {
            total_revenue[currency] = revenue[currency]
        }
    }
}  


// Check to see if order json has any orders at all
function extractOrders(page) {
    var orders_url = "https://shopicruit.myshopify.com/admin/orders.json?&page=" + page + "&access_token=c32313df0d0ef512ca64d5b336a0d7c6";
    request(orders_url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            orders_obj = JSON.parse(body);
            
            // If orders exist, get revenue for this order page and take the next order page
            // Otherwise, output total revenue
            if (orders_obj.orders.length > 0) {
                get_revenue(orders_obj);
                extractOrders(page + 1);
            } else {
                console.log("Revenue in all currency:");
                console.log(total_revenue);
            }
        }
    })
}

extractOrders(page_num);
