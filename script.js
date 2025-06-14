// Spielvariablen
let gameState = {
    points: 0,
    pointsPerClick: 1,
    pointsPerSecond: 0,
    multiplier: 1,
    prestigePoints: 0,
    totalClicks: 0,
    totalPoints: 0,
    playTime: 0,
    prestigeCount: 0,
    upgrades: [
        { id: 1, name: "Auto-Clicker", description: "Generiert 1 Punkt/Sekunde", cost: 10, baseCost: 10, owned: 0, effect: { pps: 1 }, unlockAt: 0 },
        { id: 2, name: "Klick-Verstärker", description: "+1 Punkt pro Klick", cost: 50, baseCost: 50, owned: 0, effect: { ppc: 1 }, unlockAt: 0 },
        { id: 3, name: "Verbesserter Auto-Clicker", description: "Generiert 5 Punkte/Sekunde", cost: 250, baseCost: 250, owned: 0, effect: { pps: 5 }, unlockAt: 100 },
        { id: 4, name: "Super-Klick", description: "+5 Punkte pro Klick", cost: 500, baseCost: 500, owned: 0, effect: { ppc: 5 }, unlockAt: 500 },
        { id: 5, name: "Multiplikator", description: "Verdoppelt alle Einnahmen", cost: 1000, baseCost: 1000, owned: 0, effect: { mult: 2 }, unlockAt: 1000 },
        { id: 6, name: "Mega-Clicker", description: "Generiert 25 Punkte/Sekunde", cost: 5000, baseCost: 5000, owned: 0, effect: { pps: 25 }, unlockAt: 5000 }
    ],
    achievements: [
        { 
            id: 1, 
            name: "Erster Klick", 
            description: "Mach deinen ersten Klick", 
            reward: "+10 Punkte", 
            conditionType: "totalClicks", 
            requiredValue: 1,
            unlocked: false 
        },
        { 
            id: 2, 
            name: "Klick-Meister", 
            description: "100 Klicks", 
            reward: "+1 Punkt pro Klick", 
            conditionType: "totalClicks", 
            requiredValue: 100,
            unlocked: false 
        },
        { 
            id: 3, 
            name: "Erste Schritte", 
            description: "Erreiche 100 Punkte", 
            reward: "+5% Multiplikator", 
            conditionType: "totalPoints", 
            requiredValue: 100,
            unlocked: false 
        },
        { 
            id: 4, 
            name: "Millionär", 
            description: "Erreiche 10.000 Punkte", 
            reward: "+1 Prestige-Punkt", 
            conditionType: "totalPoints", 
            requiredValue: 10000,
            unlocked: false 
        },
        { 
            id: 5, 
            name: "Upgrade-Sammler", 
            description: "Kaufe 5 Upgrades", 
            reward: "+10% Multiplikator", 
            conditionType: "totalUpgrades", 
            requiredValue: 5,
            unlocked: false 
        }
    ]
};

// Bedingungen für Achievements
const achievementConditions = {
    totalClicks: (gs, requiredValue) => gs.totalClicks >= requiredValue,
    totalPoints: (gs, requiredValue) => gs.totalPoints >= requiredValue,
    totalUpgrades: (gs, requiredValue) => gs.upgrades.reduce((sum, u) => sum + u.owned, 0) >= requiredValue
};

// DOM-Elemente
const pointsDisplay = document.getElementById('points');
const pointsPerClickDisplay = document.getElementById('points-per-click');
const pointsPerSecondDisplay = document.getElementById('points-per-second');
const multiplierDisplay = document.getElementById('multiplier');
const clickButton = document.getElementById('click-button');
const clickEffect = document.getElementById('click-effect');
const prestigePointsDisplay = document.getElementById('prestige-points');
const prestigeButton = document.getElementById('prestige-button');
const totalClicksDisplay = document.getElementById('total-clicks');
const totalPointsDisplay = document.getElementById('total-points');
const playTimeDisplay = document.getElementById('play-time');
const prestigeCountDisplay = document.getElementById('prestige-count');

// Initialisierung
function initGame() {
    loadGame();
    renderUpgrades();
    renderAchievements();
    updateDisplay();
    
    // Spielschleife
    setInterval(gameLoop, 1000);
    
    // Klick-Event
    clickButton.addEventListener('click', handleClick);
    
    // Prestige-Event
    prestigeButton.addEventListener('click', prestige);
}

// Spielschleife
function gameLoop() {
    // Punkte pro Sekunde hinzufügen
    const pps = gameState.pointsPerSecond * gameState.multiplier;
    gameState.points += pps;
    gameState.totalPoints += pps;
    
    // Spielzeit aktualisieren
    gameState.playTime++;
    
    // Achievements prüfen
    checkAchievements();
    
    // Prestige-Button aktivieren/deaktivieren
    prestigeButton.disabled = gameState.points < 10000;
    
    updateDisplay();
    saveGame();
}

// Klick-Handler
function handleClick() {
    // Punkte hinzufügen
    const ppc = gameState.pointsPerClick * gameState.multiplier;
    gameState.points += ppc;
    gameState.totalClicks++;
    gameState.totalPoints += ppc;
    
    // Klick-Effekt
    createClickEffect();
    
    // Achievements prüfen
    checkAchievements();
    
    updateDisplay();
    saveGame();
}

// Klick-Effekt erstellen
function createClickEffect() {
    const effect = document.createElement('div');
    effect.className = 'click-effect-circle';
    effect.style.width = '50px';
    effect.style.height = '50px';
    effect.style.left = (Math.random() * 80 + 10) + '%';
    effect.style.top = (Math.random() * 80 + 10) + '%';
    clickEffect.appendChild(effect);
    
    // Effekt nach der Animation entfernen
    setTimeout(() => {
        effect.remove();
    }, 500);
}

// Upgrade kaufen
function buyUpgrade(id) {
    const upgrade = gameState.upgrades.find(u => u.id === id);
    
    if (upgrade && gameState.points >= upgrade.cost) {
        gameState.points -= upgrade.cost;
        upgrade.owned++;
        
        // Effekte anwenden
        if (upgrade.effect.pps) {
            gameState.pointsPerSecond += upgrade.effect.pps;
        }
        if (upgrade.effect.ppc) {
            gameState.pointsPerClick += upgrade.effect.ppc;
        }
        if (upgrade.effect.mult) {
            gameState.multiplier *= upgrade.effect.mult;
        }
        
        // Kosten erhöhen
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.owned));
        
        renderUpgrades();
        updateDisplay();
        saveGame();
    }
}

// Prestige-Funktion
function prestige() {
    if (gameState.points >= 10000) {
        // Prestige-Punkte berechnen
        const pointsEarned = Math.floor(gameState.points / 10000);
        gameState.prestigePoints += pointsEarned;
        gameState.prestigeCount++;
        
        // Spiel zurücksetzen
        gameState.points = 0;
        gameState.pointsPerClick = 1 + Math.floor(gameState.prestigePoints / 10);
        gameState.pointsPerSecond = 0;
        gameState.multiplier = 1 + (gameState.prestigePoints * 0.1);
        gameState.totalClicks = 0;
        gameState.playTime = 0;
        
        // Upgrades zurücksetzen
        gameState.upgrades.forEach(upgrade => {
            upgrade.owned = 0;
            upgrade.cost = upgrade.baseCost;
        });
        
        renderUpgrades();
        updateDisplay();
        saveGame();
    }
}

// Achievements prüfen
function checkAchievements() {
    let changed = false;
    
    gameState.achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            const conditionMet = achievementConditions[achievement.conditionType](
                gameState, 
                achievement.requiredValue
            );
            
            if (conditionMet) {
                achievement.unlocked = true;
                changed = true;
                
                // Belohnungen anwenden
                if (achievement.reward.includes("Punkt pro Klick")) {
                    gameState.pointsPerClick += 1;
                }
                if (achievement.reward.includes("Multiplikator")) {
                    gameState.multiplier *= 1.05;
                }
                if (achievement.reward.includes("Prestige-Punkt")) {
                    gameState.prestigePoints += 1;
                }
                if (achievement.reward.includes("Punkte")) {
                    const points = parseInt(achievement.reward.match(/\d+/)[0]);
                    gameState.points += points;
                }
            }
        }
    });
    
    if (changed) {
        renderAchievements();
        updateDisplay();
        saveGame();
    }
}

// Upgrades rendern
function renderUpgrades() {
    const upgradesGrid = document.querySelector('.upgrades-grid');
    upgradesGrid.innerHTML = '';
    
    gameState.upgrades.forEach(upgrade => {
        const canAfford = gameState.points >= upgrade.cost;
        const isUnlocked = gameState.totalPoints >= upgrade.unlockAt;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade ${isUnlocked ? 'unlocked' : 'locked'}`;
        upgradeElement.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <p>Besitz: ${upgrade.owned}</p>
            <p>Kosten: ${upgrade.cost} Punkte</p>
            <button onclick="buyUpgrade(${upgrade.id})" ${!isUnlocked || !canAfford ? 'disabled' : ''}>
                Kaufen
            </button>
        `;
        
        upgradesGrid.appendChild(upgradeElement);
    });
}

// Achievements rendern
function renderAchievements() {
    const achievementsGrid = document.querySelector('.achievements-grid');
    achievementsGrid.innerHTML = '';
    
    gameState.achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            <p class="reward">Belohnung: ${achievement.reward}</p>
            <p>Status: ${achievement.unlocked ? 'Freigeschaltet' : 'Gesperrt'}</p>
        `;
        
        achievementsGrid.appendChild(achievementElement);
    });
}

// Anzeige aktualisieren
function updateDisplay() {
    pointsDisplay.textContent = Math.floor(gameState.points);
    pointsPerClickDisplay.textContent = gameState.pointsPerClick * gameState.multiplier;
    pointsPerSecondDisplay.textContent = gameState.pointsPerSecond * gameState.multiplier;
    multiplierDisplay.textContent = gameState.multiplier.toFixed(2);
    prestigePointsDisplay.textContent = gameState.prestigePoints;
    totalClicksDisplay.textContent = gameState.totalClicks;
    totalPointsDisplay.textContent = Math.floor(gameState.totalPoints);
    playTimeDisplay.textContent = gameState.playTime;
    prestigeCountDisplay.textContent = gameState.prestigeCount;
    
    // Prestige-Button-Text aktualisieren
    if (gameState.points >= 10000) {
        const pointsEarned = Math.floor(gameState.points / 10000);
        prestigeButton.textContent = `Prestige (+${pointsEarned} Punkte)`;
    } else {
        prestigeButton.textContent = `Prestige (Erfordert 10.000 Punkte)`;
    }
}

// Tab-Funktion
function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabContents.forEach(tab => {
        tab.style.display = 'none';
    });
    
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Spiel speichern
function saveGame() {
    localStorage.setItem('clickerGameSave', JSON.stringify(gameState));
}

// Spiel laden
function loadGame() {
    const save = localStorage.getItem('clickerGameSave');
    if (save) {
        const loadedState = JSON.parse(save);
        
        // Zustand wiederherstellen, aber Achievements mit den richtigen Bedingungen behalten
        gameState = {
            ...loadedState,
            achievements: gameState.achievements.map(original => {
                const loaded = loadedState.achievements.find(a => a.id === original.id);
                return loaded ? { ...original, unlocked: loaded.unlocked } : original;
            })
        };
    }
}

// Spiel starten
window.onload = initGame;

// Globale Funktionen für HTML
window.buyUpgrade = buyUpgrade;
window.openTab = openTab;