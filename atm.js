const tips = [
    "pee is stored in the balls",
    "Eipstein didn't kill himself",
    "suicide is the one decision no one regrets",
    "women belong in the kitchen",
    "men are degenerates",
    "This Man CURED His CANCER With This DIET, Doctors HATE Him!",
    "I am so alone",
    "death shall collect our debt as our feet slip from redemption and the gates of hell roar in laughter"
]

const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

let database = {};
let currentUser = "";

rl.on("close", () => {
    console.log("Saving...");
    fs.writeFileSync("simpleAtmDatabase.json", JSON.stringify(database), (error) => { if (error) console.error(error) });
    console.log("Thank you for using our services!");
    process.exit(0);
})

if (fs.existsSync("simpleAtmDatabase.json")) {
    fs.readFile("simpleAtmDatabase.json", "utf-8", (error, data) => {
        if (error) console.error(error)

        database = JSON.parse(data);
        welcomePage();
    });

} else {
    console.log("Creating new instance of simpleAtmDatabase.json")
    fs.appendFileSync("simpleAtmDatabase.json", JSON.stringify(database), (error) => { if (error) console.error(error) });
    welcomePage();
};

async function welcomePage () {
    const input = await prompt(`
Welcome to Harel's Simple A(utomatic)T(attoo)M(achine)!

Input "1" to login to an existing account
Input "2" to create a new ATM account!
Input "3" for credits
Input "4" to exit program
`);

    if (input == "1") {
        loginPage();
    } else if (input == "2") {
        signupPage();
    } else if (input == "3") {
        creditsPage();
    } else if (input == "4") {
        rl.close();
    } else if (input == 5) {
        console.log(database);
        welcomePage();
    } else if (input == 6) {
        database = {};
        welcomePage();
    } else {
        console.error("Invalid input");
        welcomePage();
    }
}

async function loginPage () {
    console.log("Welcome back!");
    attemptLoginAccountNumber();
}

async function attemptLoginAccountNumber () {
    const accountNumber = await prompt("\nWhat is your account number? ");

    if (!("account" + accountNumber in database)) {
        const input = await prompt(`
We're sorry, it seems as though account ` + accountNumber + ` does not exist within our database

Input "1" to try again
Input anything else to cancel
`);

        if (input == 1) {
            attemptLoginAccountNumber();
            return
        } else {
            welcomePage();
            return
        }
    }

    currentUser = "account" + accountNumber;
    attemptLoginPin();
}

async function attemptLoginPin () {
    const pin = await prompt('\nInput PIN (Input "0" to cancel) ');

    if (pin == 0) {
        welcomePage();
        return
    }

    if (pin == database[currentUser].pin) {
        systemAccess();
        return;
    }

    console.log("PIN is incorrect");
    attemptLoginPin();
}

async function signupPage () {
    const newPin = await prompt("\nInput PIN (must be 4 a digit number) (Input 0 to cancel) ");

    if (newPin == 0) {
        welcomePage();
        return
    }

    if (newPin == parseInt(newPin) && newPin.length == 4) {
        const accountNumber = Math.round(Math.random()*10**5);
        database["account" + accountNumber] = {
            pin: newPin,
            balance: 0
        }
        console.log("Success. Your account number is " + accountNumber + ". Logging in");

        currentUser = "account" + accountNumber;
        systemAccess();
    } else {
        const input = await prompt(`
Your PIN is invalid (must be a four digit number)

Input "1" to try again
Input anything else to cancel
`);

        if (input == 1) {
            signupPage();
            return
        }
        
        welcomePage();
    }
}

async function creditsPage () {
    const input = await prompt(`
THE SIMPLE ATM TEAM

Andrew   | Quality Assurance
Bennet   | Lead Programmer
Harel    | Logician
Shania   | Illustrator

Enter anything to go back `);
    
    if (input == "Budiyoga") {
        console.log("I was never here");
        welcomePage();
    } else { welcomePage(); }
}

async function systemAccess () { // I literally do not have a better name for this function
    const input = await prompt(`
Welcome ` + currentUser + `, what would you like to do today?
Hot tip of the day: ` + tips[Math.floor(Math.random()*tips.length)] + `

Input "1" to check balance
Input "2" to withdraw
Input "3" to deposit
Input "4" to change PIN
Input "0" to log out
`);
        
    if (input == 1) {
        balancePage();
    } else if (input == 2) {
        withdrawPage();
    } else if (input == 3) {
        depositPage();
    } else if (input == 4) {
        changePinPage();
    } else if (input == 0) {
        currentUser = "";
        welcomePage();
    } else {
        console.log("Invalid input, only integers from 1 to 4 are accepted. Please try again");
        systemAccess();
    }
}

async function balancePage () {
    const input = await prompt(`
Your current balance: ` + database[currentUser].balance + `
What would you like to do about it?

Input "1" to deposit
Input "2" to withdraw
Input anything else to cancel
`);
            
    if (input == "1") {
        depositPage();
        return
    } else if (input == "2") {
        withdrawPage();
        return
    } else { systemAccess(); }
}

async function withdrawPage () {
    console.log("\nYour current balance is " + database[currentUser].balance + " robux");
    const amount = await prompt("How much would you like to withdraw? ");
    const amountFloat = parseFloat(amount);

    if (amountFloat < 0 || amountFloat != amount) {
        const input = await prompt(`
Invalid input, only positive numbers are accepted

Input "1" to try again
Input anything else to cancel
`)
    
        if (input == 1) {
            withdrawPage();
            return
        }
    
        systemAccess();
        return
    }

    if (amountFloat > database[currentUser].balance) {
        const input = await prompt(`
You do not have sufficient robux to withdraw as per your request

Input "1" to try again
Input anything else to cancel
`);
    
        if (input == 1) {
            withdrawPage();
            return
        }
    
        systemAccess();
        return
    }

    database[currentUser].balance -= parseFloat(amount);
    console.log("Success");
    systemAccess();
}

async function depositPage () {
    const amount = await prompt("\nHow much would you like to deposit? ");
    const amountFloat = parseFloat(amount);

    if (amountFloat < 0 || amountFloat == NaN) {
        console.log("Invalid amount, must be a positive number");
        depositPage();
        return;
    }

    database[currentUser].balance += amountFloat;
    console.log("Successfully deposited " + amountFloat + " robux into " + currentUser + "'s balance");
    systemAccess();
}

async function changePinPage () {
    const newPin = await prompt("\nInput new PIN (must be a 4 digit number) ");

    if (newPin == parseInt(newPin) && newPin.length == 4) {
        database[currentUser].pin = parseInt(newPin);
        console.log("PIN successfully changed to " + parseInt(newPin));
        systemAccess();
    } else {
        console.log("Invalid PIN (must be a 4 digit number)");
        changePinPage();
    }
}
