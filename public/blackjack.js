let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canHit = true; // hráč může táhnout, dokud yourSum <= 21
let balance = 10000; // Počáteční balance
let betAmount = 100; // Sázka na jednu hru

window.onload = function () {
    buildDeck();
    shuffleDeck();
    startGame();
    updateBalanceDisplay();
    updateBetDisplay();
    document.getElementById("restart").addEventListener("click", restartGame);
};

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); // A-C -> K-C, A-D -> K-D
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function startGame() {
    // Skrytá karta dealera
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    // Dealer táhne karty dokud jeho hodnota není minimálně 17
    while (dealerSum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }

    // Zobraz hodnotu dealera (bez skryté karty)
    document.getElementById("dealer-sum").innerText = reduceAce(dealerSum - getValue(hidden), dealerAceCount);

    // Kontrola, jestli dealer nemá 21
    if (reduceAce(dealerSum, dealerAceCount) === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Lose!";
        document.getElementById("hidden").src = "./cards/" + hidden + ".png"; // Odkryj dealerovu skrytou kartu
        adjustBalance("lose");
        return;
    }

    // Rozdej 2 karty hráči
    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    // Zobraz hodnotu hráče
    let adjustedSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = adjustedSum;

    // Kontrola, jestli hráč nemá 21
    if (adjustedSum === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Win!";
        adjustBalance("win");
    }

    // Nastavení událostí pro tlačítka
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("increase-bet").addEventListener("click", () => adjustBet(100));
    document.getElementById("decrease-bet").addEventListener("click", () => adjustBet(-100));
}

function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    // Aktualizuj hodnotu hráče
    let adjustedSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = adjustedSum;

    if (adjustedSum > 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Lose!";
        adjustBalance("lose");
    } else if (adjustedSum === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Win!";
        adjustBalance("win");
    }
}

function stay() {
    // Aktualizuj finální hodnoty
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    // Zobraz finální hodnotu dealera
    document.getElementById("dealer-sum").innerText = dealerSum;

    let message = "";
    if (yourSum > 21) {
        message = "You Lose!";
        adjustBalance("lose");
    } else if (dealerSum > 21) {
        message = "You Win!";
        adjustBalance("win");
    } else if (yourSum === dealerSum) {
        message = "Tie!";
    } else if (yourSum > dealerSum) {
        message = "You Win!";
        adjustBalance("win");
    } else if (yourSum < dealerSum) {
        message = "You Lose!";
        adjustBalance("lose");
    }

    document.getElementById("results").innerText = message;
}

function getValue(card) {
    let data = card.split("-"); // "A-C" -> ["A", "C"]
    let value = data[0];

    if (isNaN(value)) { // A, J, Q, K
        if (value === "A") {
            return 1; // Eso má vždy hodnotu 1
        }
        return 10; // J, Q, K mají hodnotu 10
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] === "A") {
        return 1; // Počítáme počet es, ale hodnota esa je vždy 1
    }
    return 0;
}

// Funkce reduceAce již není potřeba


function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}

function adjustBalance(result) {
    if (result === "win") {
        balance += betAmount * 2;
    } else if (result === "lose") {
        balance -= betAmount;
    }
    
    if (balance < 0) {
        balance = 10000;  // Opravit hodnotu balance, pokud klesne pod nulu
        alert("You don't have enough balance to continue playing!");
    }

    updateBalanceDisplay();
}


function updateBalanceDisplay() {
    document.getElementById("balance").textContent = `Balance: ${balance}`;
}

function adjustBet(amount) {
    const newBetAmount = betAmount + amount;

    // Zkontroluj, zda výsledná sázka nepřesahuje limity
    if (newBetAmount >= 100 && newBetAmount <= balance) {
        betAmount = newBetAmount; // Aktualizuj sázku o přesně 100 nahoru/dolů
        updateBetDisplay();
    } else if (newBetAmount > balance) {
        alert("You don't have enough balance to increase your bet!");
    } else if (newBetAmount < 100) {
        alert("Bet amount cannot be lower than 100.");
    }
}








function updateBetDisplay() {
    document.getElementById("bet-amount").textContent = `Bet: ${betAmount}`;
}

function restartGame() {
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;

    // Resetování karet a výsledků
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = "";
    document.getElementById("results").innerText = "";
    document.getElementById("dealer-sum").innerText = "";
    document.getElementById("your-sum").innerText = "";

    betAmount = 100;
    updateBetDisplay();

    buildDeck();
    shuffleDeck();
    startGame();
}

