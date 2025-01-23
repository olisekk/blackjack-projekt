
let dealerSum = 0;  
let yourSum = 0;   
let dealerAceCount = 0;  
let yourAceCount = 0;   
let hidden;          
let deck;            
let canHit = true;  
let balance = 10000;
let betAmount = 100; 
// Spuštění hry při načtení stránky
window.onload = function () {
    buildDeck();  // Vytvoření balíčku karet
    shuffleDeck();  // Zamíchání balíčku
    startGame();  // Začátek hry
    updateBalanceDisplay();  // Aktualizace zobrazení zůstatku
    updateBetDisplay();  // Aktualizace zobrazení sázky
    // Nastavení posluchačů událostí pro tlačítka
    document.getElementById("restart").addEventListener("click", restartGame);
    document.getElementById("bet-amount-input").addEventListener("input", updateBetAmountFromInput);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
};

// Funkce pro deaktivaci tlačítka "Next Game" na 1 sekundu
function disableNextGameButton() {
    const nextGameButton = document.getElementById("restart");
    nextGameButton.disabled = true;  // Deaktivuje tlačítko

    setTimeout(() => { //arrow anonymni funkce
        nextGameButton.disabled = false; // Opět aktivuje tlačítko po 1 sekundě
    }, 1000);  // Časová prodleva 1 sekunda
}

// Funkce pro vytvoření balíčku karet
function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];  // Možné hodnoty karet
    let types = ["C", "D", "H", "S"];  // Možné typy karet (srdce, káry, atd.)
    deck = [];  // Inicializace prázdného balíčku

    // Generování balíčku kombinováním hodnot a typů karet
    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);  // Například "A-C" pro eso kárové
        }
    }
}

// Funkce pro zamíchání balíčku karet
function shuffleDeck() {
    // Zamíchání balíčku karet pomocí náhodných indexů
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);  // Náhodný index pro zamíchání
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

// Funkce pro začátek hry
function startGame() {
    // Skrytí první karty dealera (hidden) a přidání její hodnoty k dealerSum
    hidden = deck.pop();  // Odebírá poslední kartu z balíčku (skrytá karta)
    dealerSum += getValue(hidden);  // Přidání hodnoty karty k dealerovu součtu
    dealerAceCount += checkAce(hidden);  // Kontrola, zda je skrytá karta eso

    // Dealer táhne karty, dokud jeho součet není alespoň 17
    while (dealerSum < 17) {
        let cardImg = document.createElement("img"); // Vytvoření HTML elementu pro zobrazení karty
        let card = deck.pop(); // Odebírá poslední kartu z balíčku
        cardImg.src = "./cards/" + card + ".png";  // Nastavení cesty k obrázku karty
        dealerSum += getValue(card);  // Přidání hodnoty karty k dealerovu součtu
        dealerAceCount += checkAce(card);  // Kontrola, zda je karta eso
        document.getElementById("dealer-cards").append(cardImg); // Přidání obrázku karty do HTML
    }

    // Zobrazení hodnoty dealera bez skryté karty
    document.getElementById("dealer-sum").innerText = reduceAce(dealerSum - getValue(hidden), dealerAceCount);

    // Kontrola, zda dealer nemá Blackjack
    if (reduceAce(dealerSum, dealerAceCount) === 21) {
        canHit = false;  // Hráč už nemůže táhnout
        document.getElementById("results").innerText = "You Lose!";  // Zobrazí prohru
        document.getElementById("hidden").src = "./cards/" + hidden + ".png";  // Odkrytí karty dealera
        adjustBalance("lose");  // Ztráta zůstatku
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

    // Kontrola, zda hráč nemá Blackjack
    if (adjustedSum === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Win!";  // Hráč vyhrál
        adjustBalance("win");  // Zvýšení zůstatku
    }
}

// Funkce pro "táhnutí" karty pro hráče
function hit() {
    if (!canHit) {
        return;  // Pokud hráč nemůže táhnout, vrátí se
    }

    // Vytáhne další kartu pro hráče
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";  
    yourSum += getValue(card);  
    yourAceCount += checkAce(card);  // Kontrola, zda je karta eso
    document.getElementById("your-cards").append(cardImg);  // Přidá kartu do zobrazení

    // Aktualizuje hodnotu hráče
    let adjustedSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = adjustedSum;

    // Kontrola, zda hráč přetáhl nebo vyhrál
    if (adjustedSum > 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Lose!";  
        adjustBalance("lose");  // Ztráta zůstatku
    } else if (adjustedSum === 21) {
        canHit = false;
        document.getElementById("results").innerText = "You Win!";  
        adjustBalance("win");  // Zvýšení zůstatku
    }
}

// Funkce pro "stát" (nebrat další karty)
function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);  // Přepočítá součet dealera
    yourSum = reduceAce(yourSum, yourAceCount);  // Přepočítá součet hráče

    canHit = false;  // Hráč už nemůže táhnout
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

// Funkce pro získání hodnoty karty
function getValue(card) {
    let data = card.split("-");  // Rozdělení karty na hodnotu a typ
    let value = data[0];

    if (isNaN(value)) {  // Pokud to není číslo, znamená to, že je to eso nebo obrázková karta
        if (value === "A") {
            return 11;  // Eso má standardní hodnotu 11
        }
        return 10;  // J, Q, K mají hodnotu 10
    }
    return parseInt(value);  // Číslice od 2 do 10 se vrací přímo
}

// Funkce pro kontrolu, zda je karta eso
function checkAce(card) {
    if (card[0] === "A") {
        return 1;  // Pokud je eso, vrátí 1
    }
    return 0;  // Pokud není eso, vrátí 0
}

// Funkce pro přepočet hodnoty es na 1, pokud součet přesahuje 21
function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;  // Sníží hodnotu es o 10
        playerAceCount -= 1;  // Sníží počet es
    }
    return playerSum;  // Vrací přepočítaný součet
}

// Funkce pro úpravu zůstatku na základě výsledku hry (výhra/prohra)
function adjustBalance(result) {
    if (result === "win") {
        balance += betAmount * 2;  // Při výhře hráč získá 2x svou sázku
    } else if (result === "lose") {
        balance -= betAmount;  // Při prohře hráč ztratí svou sázku
    }

    // Pokud zůstatek klesne na nulu, restartujeme hru
    if (balance <= 0) {
        balance = 10000;  
        alert("Your balance has reached 0. The game is restarting with a balance of 10000!");
        restartGame();  
    }

    updateBalanceDisplay();  // Aktualizace zobrazení zůstatku
}

// Funkce pro zobrazení aktuálního zůstatku
function updateBalanceDisplay() {
    document.getElementById("balance").textContent = `Balance: ${balance}`; 
}

// Funkce pro změnu sázky na základě uživatelského vstupu
function updateBetAmountFromInput() {
    const betInput = document.getElementById("bet-amount-input").value.trim();

    if (!betInput || isNaN(betInput) || parseInt(betInput) <= 0) {
        document.getElementById("bet-amount-input").value = betAmount;
        return;
    }

    const newBetAmount = parseInt(betInput);

    if (newBetAmount > balance) {
        alert("You don't have enough balance to set this bet!");
        document.getElementById("bet-amount-input").value = betAmount; 
    } else {
        betAmount = newBetAmount; 
        updateBetDisplay();  // Aktualizace zobrazení nové sázky
    }
}


function updateBetDisplay() {
    document.getElementById("bet-amount-input").value = betAmount;  // Aktualizuje input sázky
}


function restartGame() {
    // Resetování všech hodnot na začátek
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;

    // Resetování karet a výsledků na obrazovce
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

    disableNextGameButton();  
}
