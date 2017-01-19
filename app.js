// Import modules
var restify = require('restify');
var request = require('request');

// Set up server
var server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Use bodyParser to get order list from request
server.use(restify.bodyParser());

// Set up endpoint get_revenue to calculate revenue
server.post('/get_revenue', function (req, res) {
    
    // Deduct tax from price, if tax is included in price
    function revenueAfterTax(taxes_included, subtotal_price, total_tax) {
        if (taxes_included) {
            return parseFloat(subtotal_price - total_tax)
        } else {
            return parseFloat(subtotal_price)
        }
    }
    
    // Extract list of orders from request
    var list_of_orders = req.params.orders;
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
    
    // Respond with a revenue hashtable
    res.send(revenue);
    res.status(err ? 500 : 200);
    if (err) {
        console.log(err);
    }
    res.end();
});

// Variable declaration
// total_revenue: store revenue for different currency
// page_num: page number of order.json
// orders_obj: store the list of orders
var total_revenue = {};
var page_num = 1;
var orders_obj;

// Send orders_obj to get_revenue endpoint 
function sendOrders(order) {
    request.post({
        url: 'http://localhost:3978/get_revenue',
        json: order
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            
            // For each currency, add the revenue 
            // in the response body to totalRevenue 
            for (var currency in body) {
                if (currency in total_revenue) {
                    total_revenue[currency] += body[currency]
                } else {
                    total_revenue[currency] = body[currency]
                }
            }
        }
    });
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
                sendOrders(orders_obj);
                extractOrders(page + 1);
            } else {
                console.log("Revenue in all currency:");
                console.log(total_revenue);
            }
        }
    })
}

extractOrders(page_num);
