# Bamazon
A console based store simulator.

### Running Bamazon ###

This app has the following dependencies:

* [MySql](https://www.npmjs.com/package/mysql)
* [Inqurier](https://www.npmjs.com/package/inquirer) 

### Built With ###
* Node.js
* JavaScript
* SQL

## Using Bamazon ##

Navigate into the `Bamazon` directory and run `node bamazon.js`. Then follow the prompts in the terminal.

You'll need MySQL installed and steup on your local machine.

Clone the repo locall from `https://github.com/cplank/Bamazon.git` and run `npm install` to install the MySQL and Inquirer dependencies. 

This app dynamically creates the Bamazon_db, so you don't need to run a separate `.sql` file. 

### When you first run Bamazon ###

The user will see a table filled with items and will be prompted to enter the id of the item they wish to purchase.

![Step one screen shot](/images/step1.PNG)

The user will then be prompted to enter how much of the item they'd like to purchase. If there is enough of that item in stock, the purchase will go through and an updated table is displayed. 

![Step two screen shot](/images/step2.PNG)

If there isn't enough of that product in stock, the user is notified. 

![Step three screen shot](/images/step3.PNG)

To see this in action, [check out this video](https://drive.google.com/open?id=1Gg4bQAU17ZkS_1jU1OiMvD5szLIN0sNw)

## Roadmap ##

Would love to add a supervisor and manager level for more interaction between users and the database.