let dealerSum = 0;  
let yourSum = 0;  

let dealerAceCount = 0;  
let yourAceCount = 0;  

let hidden; 
let deck;  

let canHit = true;  
let balance = 10000; 
let betAmount = 100;  

window.onload = function () {
    buildDeck();  
    shuffleDeck();  
    startGame();  
    updateBalanceDisplay(); 
    updateBetDisplay(); 
    document.getElementById("restart").addEventListener("click", restartGame);  
    document.getElementById("bet-amount-input").addEventListener("input", updateBetAmountFromInput); 
    document.getElementById("hit").addEventListener("click", hit);  
    document.getElementById("stay").addEventListener("click", stay);  
};

// Funkce pro deaktivaci tlačítka "Next Game" na 1 sekundu
function disableNextGameButton() {
    const nextGameButton = document.getElementById("restart");
    nextGameButton.disabled = true;  // Deaktivuje tlačítko

    setTimeout(() => {
        nextGameButton.disabled = false; 
    }, 1000);  // Časová prodleva 1 sekunda
}

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];  // Možné hodnoty karet
    let types = ["C", "D", "H", "S"];  // Možné typy karet (srdce, káry, atd.)
    deck = [];  // Inicializace prázdného balíčku

    // Generování balíčku kombinováním hodnot a typů karet
    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);  // Například "A-C" pro eso srdcové
        }
    }
}

function shuffleDeck() {
    // Zamíchání balíčku karet
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);  // Náhodný index pro zamíchání
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

    // Dealer táhne karty, dokud jeho součet není alespoň 17
    while (dealerSum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();  
        cardImg.src = "./cards/" + card + ".png";  
        dealerSum += getValue(card);  
        dealerAceCount += checkAce(card);  
        document.getElementById("dealer-cards").append(cardImg); 
    }

    // Zobrazení hodnoty dealera bez skryté karty
    document.getElementById("dealer-sum").innerText = reduceAce(dealerSum - getValue(hidden), dealerAceCount);

    // Kontrola, jestli dealer nemá 21 (Blackjack)
    if (reduceAce(dealerSum, dealerAceCount) === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Lose!";  
        document.getElementById("hidden").src = "./cards/" + hidden + ".png";  // Odkrytí karty dealera
        adjustBalance("lose");  
        return;  
    }

    // Rozdání dvou karet hráči
    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop(); 
        cardImg.src = "./cards/" + card + ".png";  
        yourSum += getValue(card);  
        yourAceCount += checkAce(card);  
        document.getElementById("your-cards").append(cardImg); 
    }

    // Zobrazení hodnoty hráče
    let adjustedSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = adjustedSum;

    // Kontrola, jestli hráč nemá 21 (Blackjack)
    if (adjustedSum === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Win!";  // Hráč vyhrál
        adjustBalance("win");  // Zvýšení zůstatku
    }
}

function hit() {
    if (!canHit) {
        return;  
    }

    // Vytáhne další kartu pro hráče
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";  
    yourSum += getValue(card);  
    yourAceCount += checkAce(card);  // Kontrola esa
    document.getElementById("your-cards").append(cardImg);  // Přidá kartu do zobrazení

    // Aktualizuje hodnotu hráče
    let adjustedSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = adjustedSum;

    // Kontrola, zda hráč přetáhl nebo vyhrál
    if (adjustedSum > 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Lose!";  
        adjustBalance("lose");  // Snížení zůstatku
    } else if (adjustedSum === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Win!";  
        adjustBalance("win");  // Zvýšení zůstatku
    }
}

function stay() {

    dealerSum = reduceAce(dealerSum, dealerAceCount);  // Přepočítá součet dealera
    yourSum = reduceAce(yourSum, yourAceCount);  // Přepočítá součet hráče

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";  // Odkrytí karty dealera

    // Zobrazí finální hodnotu dealera
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

    document.getElementById("results").innerText = message;  // Zobrazení výsledku
}

function getValue(card) {
    let data = card.split("-");  // Rozdělení karty na hodnotu a typ
    let value = data[0];

    if (isNaN(value)) {  // Pokud to není číslo, znamená to, že je to eso nebo obrázková karta
        if (value === "A") {
            return 1;  // Eso má vždy hodnotu 1
        }
        return 10;  // J, Q, K mají hodnotu 10
    }
    return parseInt(value); 
}

function checkAce(card) {
    if (card[0] === "A") {
        return 1; 
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    // Pokud součet přesahuje 21 a máme eso, snížíme hodnotu eso na 1 místo 11
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}

function adjustBalance(result) {
    // Upraví zůstatek 
    if (result === "win") {
        balance += betAmount * 2; 
    } else if (result === "lose") {
        balance -= betAmount;  
    }

    // Pokud zůstatek klesne na nulu, restartujeme hru
    if (balance <= 0) {
        balance = 10000;  
        alert("Your balance has reached 0. The game is restarting with a balance of 10000!");
        restartGame();  
    }

    updateBalanceDisplay(); 
}

function updateBalanceDisplay() {
    document.getElementById("balance").textContent = `Balance: ${balance}`; 
}

function updateBetAmountFromInput() {
    // Změna sázky na základě uživatelského vstupu
    const betInput = document.getElementById("bet-amount-input").value.trim();
    
    // Pokud je vstup neplatný, resetuje sázku zpět na původní hodnotu
    if (!betInput || isNaN(betInput) || parseInt(betInput) <= 0) {
        document.getElementById("bet-amount-input").value = betAmount;
        return;
    }

    const newBetAmount = parseInt(betInput);

    // Zkontroluje, zda sázka nepřesahuje zůstatek
    if (newBetAmount > balance) {
        alert("You don't have enough balance to set this bet!");
        document.getElementById("bet-amount-input").value = betAmount;  // Reset zpět na původní hodnotu
    } else {
        betAmount = newBetAmount;  // Nová hodnota sázky
        updateBetDisplay();  
    }
}

function updateBetDisplay() {
    document.getElementById("bet-amount-input").value = betAmount;  // Aktualizuje zobrazení aktuální sázky
}

function restartGame() {
    // Restartuje hru a nastaví počáteční hodnoty
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

    betAmount = 100;  // Reset sázky na 100
    updateBetDisplay();  // Zobrazení nové sázky

    buildDeck();  // Vytvoření nového balíčku
    shuffleDeck();  
    startGame();  // Nová hra

    
    disableNextGameButton();  
}
