const mysql = require("mysql");
const inquirer = require("inquirer");

let pool = mysql.createPool({
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

function queryChain(pool, queryArray, index) {
    if (index >= queryArray.length) {
        return console.log("End of the array");
    }
    let currentQuery = queryArray[index];
    console.log('````````````````````````````````````````````````````')
    console.log("We're at", index)

    pool.query(currentQuery.queryStr, currentQuery.vals, function (err, result, fields) {
        let success = currentQuery.handleResponse(err, result, fields);
        if (!success) {
            return console.log("bad news", err);
        }
        queryChain(pool, queryArray, index + 1);
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



queryChain(pool, makeQueries(), 0);