const mysql = require("mysql");
const inquirer = require("inquirer");

let connection = mysql.createConnection({
    connectionLimit: 10,
    host: "localhost",
    port: 3306,
    user: "root",
    password: "PassWord",
    database: "bamazon_db"
});

//Onload bamazon database will populate

class Query {
    constructor(queryStr, handleResponse, vals) {
        this.queryStr = queryStr;
        this.handleResponse = handleResponse;
        this.vals = vals;
    }
}

function queryChain(connection, queryArray, index, finishedCallback) {
    if (index >= queryArray.length) {
        //connection.end();
        if (finishedCallback) {
            finishedCallback();
        }

        return;
    }
    let currentQuery = queryArray[index];
    console.log('````````````````````````````````````````````````````')
    console.log("We're at", index)

    connection.query(currentQuery.queryStr, currentQuery.vals, function (err, result, fields) {
        let success = currentQuery.handleResponse(err, result, fields);
        if (!success) {
            return console.log("bad news", err);
        }
        queryChain(connection, queryArray, index + 1, finishedCallback);
    })
}

function diagnostic(err, result, fields) {
    console.log(err, result, fields);
    return true;
}

function makeQueries() {
    let queries = [];
    queries.push(new Query("DROP DATABASE IF EXISTS bamazon_db", diagnostic));
    queries.push(new Query("CREATE DATABASE bamazon_db", diagnostic));
    queries.push(new Query("USE bamazon_db", diagnostic));
    queries.push(new Query(`CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR (100) NOT NULL,
    department_name VARCHAR(100),
    price INT(10) NOT NULL,
    stock_quantity INT (10) NOT NULL)`, diagnostic));

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
    queries.push(new Query("SELECT * FROM products", function (err, result, fields) {
        console.table(result)
        onChainComplete(result);
        return true;
    }))
    return queries;
};

function handleResponse(err, result, fields) {
    console.log(err, result, fields)
    return true;
}


// function createDB(openConnection) {
//     ("DROP DATABASE IF EXISTS bamazon_db");
//     ("CREATE DATABASE bamazon_db");
//     ("USE bamazon_db");

//     let makeTable = `CREATE TABLE products (
//         item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
//         product_name VARCHAR (100) NOT NULL,
//         department_name VARCHAR(100),
//         price INT(10) NOT NULL,
//         stock_quantity INT (10) NOT NULL)`;

//     openConnection.query(makeTable, initialItems)

// }



// function initialItems(err, res) {
//     if (err) {
//         console.log("There's been an error!")
//     }

//     let addItems = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?`;
//     let values = [
//         ["rose", "floral", 12, 72],
//         ["daisy", "floral", 5, 120],
//         ["main coon", "kitties", 40, 4],
//         ["turkish van", "kitties", 60, 6],
//         ["cucumber", "produce", .50, 35],
//         ["radish", "produce", 1.25, 40],
//         ["coffee", "beverages", 12, 50],
//         ["tea", "beverages", 6, 75],
//         ["umbrella academy", "comics", 50, 20],
//         ["y the last man", "comics", 35, 15]
//     ]
//     pool.query(addItems, values, showProducts)
// }

// function showProducts(err, res) {

// }

// createDB(pool);



queryChain(connection, makeQueries(), 0);





function onChainComplete(table) {

    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID of the product you'd like to purchase?",
            name: "product"
        }
    ])
        .then(function (response) {
            let chosenProductID = Number.parseInt(response.product);
            console.log(response, typeof (response));
            inquirer.prompt([
                {
                    type: "input",
                    message: "How much of this product do you want?",
                    name: "product_amount"
                }
            ])
                .then(function (response) {
                    let productAmount = Number.parseInt(response.product_amount);
                    console.log('requested', chosenProductID)
                    for (let i = 0; i < table.length; i++) {
                        // console.log("checking", table[i])
                        if (chosenProductID === table[i].item_id) {
                            // console.log('found', table[i][1])
                            let currentStock = table[i].stock_quantity;
                            if (currentStock < productAmount) {
                                console.log("Insuffiencent Quantity")
                                connection.end();
                                return;

                            } else {
                                console.log('making purchase')
                                let totalCost = table[i].price * productAmount;
                                console.log("Your total comes to:", totalCost);
                                let updatedStockAmount = currentStock - productAmount;
                                //update teh database with the updatedStockAmount in the 
                                //stock quantity place
                                connection.query(
                                    `UPDATE products SET stock_quantity = ${updatedStockAmount} WHERE item_id = ${chosenProductID}`,
                                    function () {
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
                    //connection.query(chosenProductID, productAmount)
                })
        })
    return true;
}

class Product {
    constructor(product_name, department_name, price, stock_quantity) {
        this.product_name = product_name;
        this.department_name = department_name;
        this.price = price;
        this.stock_quantity = stock_quantity;
    }
}