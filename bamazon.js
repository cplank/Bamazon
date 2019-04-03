//dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");

//storing the mysql connection in a variable
let connection = mysql.createConnection({
    connectionLimit: 10,
    host: "localhost",
    port: 3306,
    user: "root",
    password: "PassWord",
    // database: "bamazon_db"
});


//making a query class so I can easily store multiple query requests in an array instead of chaining them
class Query {
    //the class has a constructor of a string, the handle response function, and values
    constructor(queryStr, handleResponse, vals) {
        this.queryStr = queryStr;
        this.handleResponse = handleResponse;
        this.vals = vals;
    }
}

//the queryChain function takes the connection, queryArray, index, a callback function
function queryChain(connection, queryArray, index, finishedCallback) {
    //creating the exit condition. If index is ever greater than or equal to the length of the
    //queryArray, run the finishedCallback function
    if (index >= queryArray.length) {
        if (finishedCallback) {
            finishedCallback();
        }
        return;
    }
    //saving the index we're at in queryArray into a variable
    let currentQuery = queryArray[index];
    //opening the connection at each index (currentQuery) feeding querystr, values, and the handle response
    //function. Handle response has to take err, result, fields per the mysql npm documentation
    connection.query(currentQuery.queryStr, currentQuery.vals, function (err, result, fields) {
        //saving currentQuery's successful handleResponse in a variable called success
        //if the query isn't successful, console log a message and the error.
        let success = currentQuery.handleResponse(err, result, fields);
        if (!success) {
            return console.log("Hmmm. We weren't able to complete your query", err);
        }
        //Otherwise, call queryChain again at the next index
        queryChain(connection, queryArray, index + 1, finishedCallback);
    })
}


//This is a standard function that handles the error, results, and fields. 
function diagnostic(err, result, fields) {
    // console.log(err, result, fields);
    return true;
}

//this function makes each of our queries, stores them in an array, and calls the final function when complete
function makeQueries() {
    let queries = [];
    //pushing each new query into the queries array
    queries.push(new Query("DROP DATABASE IF EXISTS bamazon_db", diagnostic));
    queries.push(new Query("CREATE DATABASE bamazon_db", diagnostic));
    queries.push(new Query("USE bamazon_db", diagnostic));
    queries.push(new Query(`CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR (100) NOT NULL,
    department_name VARCHAR(100),
    price INT(10) NOT NULL,
    stock_quantity INT (10) NOT NULL)`, diagnostic));

    //inserting the dummy data
    queries.push(new Query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?", handleResponse, [[
        ["rose", "floral", 12, 72],
        ["daisy", "floral", 5, 120],
        ["main coon", "kitties", 40, 4],
        ["turkish van", "kitties", 60, 6],
        ["cucumber", "produce", .50, 35],
        ["radish", "produce", 1.25, 40],
        ["coffee", "beverages", 12, 50],
        ["tea", "beverages", 6, 75],
        ["umbrella academy", "comics", 50, 20],
        ["y the last man", "comics", 35, 15]
    ]]))

    //once the table is complete, we need to be able to show it to the user
    queries.push(new Query("SELECT * FROM products", function (err, result, fields) {
        console.table(result)
        //call the final function
        onChainComplete(result);
        //return true or our diagnostic function gets cranky
        return true;
    }))
    return queries;
};

//I think originally I was going to do something different with handleResponse vs diagnostic, but I didn't.
//So this is here even though it does the same thing and I use both interchangeably. Oops.
function handleResponse(err, result, fields) {
    // console.log(err, result, fields)
    return true;
}

//At long last calling queryChain
queryChain(connection, makeQueries(), 0);

//final function which will take in our table for later use
function onChainComplete(table) {

    //start to inquirier for the user.
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the ID of the item you'd like to purchase.",
            name: "product"
        }
        //the first prompt's promise takes in the response from the previous prompt and stores it in
        //chosenProductID. Ran into some parsing issues here so had to make sure it was a number in order
        //to compare it to the numbers below.
    ]).then(function (response) {
        let chosenProductID = Number.parseInt(response.product);
        console.log("Great! Looks like you chose item ID:", chosenProductID);
        //second prompt asking the user how much product they want
        inquirer.prompt([
            {
                type: "input",
                message: "How much of this product do you want?",
                name: "product_amount"
            }
            //second promise takes in the previous response and stores it in productAmount.
        ]).then(function (response) {
            let productAmount = Number.parseInt(response.product_amount);
            //looping through the table
            for (let i = 0; i < table.length; i++) {
                //checking if the id the user provided matches any items in the table
                if (chosenProductID === table[i].item_id) {
                    //saving that item's current stock for comparison below
                    let currentStock = table[i].stock_quantity;
                    //if currentStock is less than the amount the user requested, let them know
                    if (currentStock < productAmount) {
                        console.log("Sorry! Looks like we don't have enough of that product for you.")
                        //end the connection
                        connection.end();
                        return;

                    } else {
                        //Otherwise, proceed with the purchase
                        console.log("Great! We can make that happen")
                        //totalCost stores the price of the item multiplied by how much the user
                        //requested
                        let totalCost = table[i].price * productAmount;
                        //logging their total
                        console.log("Your total comes to:", totalCost);
                        //storing the updated stock amount to push to the database
                        let updatedStockAmount = currentStock - productAmount;
                        //opening a connection
                        connection.query(
                            //for some reason I couldn't get the ? placeholders to work, so I did templated strings 
                            `UPDATE products SET stock_quantity = ${updatedStockAmount} WHERE item_id = ${chosenProductID}`,
                            function () {
                                //did a chain connection here since it was only two things we needed. This query
                                //shows the user the updated table and the ends the connection
                                connection.query(
                                    "SELECT * FROM products", function (err, results, fields) {
                                        console.table(results);
                                        connection.end();
                                    }
                                )
                            }
                        );
                    }
                }

            }

        })
    })
    //don't forget to return true or diagnostic function gets cranky!
    return true;
}

