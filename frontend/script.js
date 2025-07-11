// FUNCIONES AUXILIARES -------------------------------------------------------------------------------------

// Función para traducir nombres de jugadores del backend al frontend
function translatePlayerName(backendName) {
    const translations = {
        'Player 1': 'Tú',
        'Player 2': 'CPU 1',
        'Player 3': 'CPU 2',
        'Player 4': 'CPU 3'
    };
    return translations[backendName] || backendName;
}

// Función auxiliar para obtener el valor del color
function getColorValue(color) {
    const colors = {
        'red': '#e53935',
        'blue': '#1e88e5',
        'green': '#43a047',
        'yellow': '#fbc02d'
    };
    return colors[color] || '#666';
}

// Función para obtener descripción de una carta
function getCardDescription(card) {
    const colorNames = {
        'red': 'roja',
        'blue': 'azul',
        'green': 'verde',
        'yellow': 'amarilla',
        'wild': 'comodín'
    };

    const color = colorNames[card.color] || card.color;

    if (card.type === 'number') {
        return `${color} ${card.value}`;
    } else if (card.type === 'wild' || card.type === 'wild4') {
        return `${card.type === 'wild4' ? '+4' : 'WILD'} ${color}`;
    } else {
        const typeNames = {
            'draw2': '+2',
            'reverse': 'REVERSE',
            'skip': 'SKIP'
        };
        return `${color} ${typeNames[card.type] || card.type}`;
    }
}

// CLASES ---------------------------------------------------------------------------------------------------
class Card {
    constructor(id, color, type, value) {
        this.id = id;
        this.color = color;
        this.type = type;
        this.value = value;
    }

    getDisplayText() {
        if (this.type === "draw2") {
            return "+2";
        }
        if (this.type === "reverse") {
            return `
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style="vertical-align:middle;" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" fill="white" fill-opacity="0.01"/>
                <path d="M34 6.67564C39.978 10.1337 44 16.5972 44 24M34 6.67564V14M34 6.67564H41.3244M41.3244 34C37.8663 39.978 31.4028 44 24 44M41.3244 34H34M41.3244 34V41.3244M14 41.3244C8.02199 37.8663 4 31.4028 4 24M14 41.3244V34M14 41.3244H6.67564M6.67564 14C10.1337 8.02199 16.5972 4 24 4M6.67564 14H14M6.67564 14V6.67564" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M41.3244 34C37.8663 39.978 31.4028 44 24 44M41.3244 34H34M41.3244 34V41.3244" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 41.3244C8.02199 37.8663 4 31.4028 4 24M14 41.3244V34M14 41.3244H6.67564" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.67566 14C10.1338 8.02199 16.5972 4 24 4M6.67566 14H14M6.67566 14V6.67564" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M34 6.67578C39.978 10.1339 44 16.5973 44 24.0001M34 6.67578V14.0001M34 6.67578H41.3244" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
        if (this.type === "jump" || this.type === "skip") {
            return `
                <svg width="32" height="32" viewBox="0 0 1920 1920" fill="none" style="vertical-align:middle;" xmlns="http://www.w3.org/2000/svg">
                <path d="M213.333 960c0-167.36 56-321.707 149.44-446.4L1406.4 1557.227c-124.693 93.44-279.04 149.44-446.4 149.44-411.627 0-746.667-335.04-746.667-746.667m1493.334 0c0 167.36-56 321.707-149.44 446.4L513.6 362.773c124.693-93.44 279.04-149.44 446.4-149.44 411.627 0 746.667 335.04 746.667 746.667M960 0C429.76 0 0 429.76 0 960s429.76 960 960 960 960-429.76 960-960S1490.24 0 960 0" fill="#fff" fill-rule="evenodd"/>
                </svg>
            `;
        }
        if (this.type === "wild" || this.type === "wild4") {
            return `
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <svg width="32" height="32" viewBox="0 0 32 32">
                        <defs>
                            <linearGradient id="uno-wild" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#e53935"/>
                                <stop offset="25%" stop-color="#43a047"/>
                                <stop offset="50%" stop-color="#1e88e5"/>
                                <stop offset="75%" stop-color="#fbc02d"/>
                            </linearGradient>
                        </defs>
                        <circle cx="16" cy="16" r="14" fill="url(#uno-wild)" stroke="#fff" stroke-width="2"/>
                    </svg>
                    <span style="font-weight:bold;color:#fff;font-size:18px;">
                        ${this.type === "wild4" ? "+4" : "WILD"}
                    </span>
                </div>
            `;
        }
        return this.type === "number" ? this.value : this.type.toUpperCase();
    }

    getCssClasses() {
        let classes = `card ${this.color} ${this.type}`;
        if ((this.type === "wild" || this.type === "wild4") && this.chosenColor) {
            classes += ` wild-chosen-${this.chosenColor}`;
        }
        return classes;
    }
}

// VARIABLES ------------------------------------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:3001';

let currentGameId = null;
let gameState = null;
let waitingForColor = false;
let currentWildCard = null;
let isDrawingCard = false; // Para prevenir múltiples llamadas simultáneas
let isPlayingCard = false; // Para prevenir múltiples jugadas simultáneas
let lastDiscardPileId = null; // Para detectar cambios en el discard pile
let lastTurn = null; // Para saber quién jugó la carta anterior
let ws = null; // Conexión WebSocket

// FUNCIONES DE API -----------------------------------------------------------------------------------------

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

async function startNewGame() {
    try {
        const response = await apiCall('/start', 'POST');
        currentGameId = response.gameId;
        gameState = response;

        // Conectar WebSocket
        connectWebSocket();

        updateUI();
        return response;
    } catch (error) {
        throw error;
    }
}

function connectWebSocket() {
    if (ws) {
        ws.close();
    }

    ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
        if (currentGameId) {
            ws.send(JSON.stringify({
                type: 'subscribe',
                gameId: currentGameId
            }));
        }
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (error) {
            // Error parsing WebSocket message
        }
    };

    ws.onclose = () => {
        // WebSocket desconectado
    };

    ws.onerror = (error) => {
        // WebSocket error
    };
}

function handleWebSocketMessage(data) {
    if (data.gameState) {
        gameState = data.gameState;
        updateUI();
    }

    switch (data.type) {
        case 'subscribed':
            break;

        case 'client_play':
            break;

        case 'bot_play':
            break;

        case 'client_draw_from_deck':
            break;

        case 'bot_draw_from_deck':
            break;

        case 'draw_penalty':
            break;

        case 'uno_penalty':
            showNotification(`❌ ${translatePlayerName(data.player)} no dijo UNO a tiempo`, 'error');
            break;

        case 'uno_warning':
            showNotification('⚠️ ¡Tienes una carta! Di UNO antes de que pasen 4 segundos', 'warning');
            break;

        case 'client_uno':
            showNotification('🎉 ¡UNO!', 'info');
            break;

        case 'bot_uno':
            showNotification(`🤖 ${translatePlayerName(data.player)} dijo UNO`, 'info');
            break;

        case 'round_score':
            if (data.gameState && data.gameState.finished) {
                showNotification(`🏆 ¡${translatePlayerName(data.winner)} ha ganado el juego!`, 'info');
            } else {
                showNotification(`📊 ${translatePlayerName(data.winner)} ganó la ronda`, 'info');
            }
            break;

        default:
            break;
    }
}

async function playCard(card, chosenColor = null) {
    if (isPlayingCard) {
        return;
    }

    try {
        isPlayingCard = true;
        const requestData = {
            gameId: currentGameId,
            card: card,
            chosenColor: chosenColor
        };
        const response = await apiCall('/play', 'POST', requestData);

        gameState = response;
        updateUI();



        return response;
    } catch (error) {
        throw error;
    } finally {
        isPlayingCard = false;
    }
}

async function drawCard() {
    if (isDrawingCard) {
        return;
    }

    try {
        isDrawingCard = true;
        const response = await apiCall('/draw', 'POST', {
            gameId: currentGameId
        });

        gameState = response.gameState;
        updateUI();



        // Si la carta robada es jugable, mostrar opción para jugarla
        if (response.canPlayDrawnCard && response.card) {
            showPlayDrawnCardOption(response.card);
        }

        return response;
    } catch (error) {
        throw error;
    } finally {
        isDrawingCard = false;
    }
}

function showPlayDrawnCardOption(card) {
    const cardDescription = getCardDescription(card);
    const playButton = document.createElement('button');
    playButton.textContent = `Jugar ${cardDescription}`;
    playButton.className = 'play-drawn-card-btn';
    playButton.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 16px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;

    playButton.addEventListener('click', () => {
        playDrawnCard(card);
        document.body.removeChild(playButton);
    });

    setTimeout(() => {
        if (document.body.contains(playButton)) {
            document.body.removeChild(playButton);
        }
    }, 5000);

    document.body.appendChild(playButton);
}

async function playDrawnCard(card) {
    try {
        const cardData = {
            id: card.id,
            color: card.color,
            type: card.type,
            value: card.value
        };

        if (card.type === 'wild' || card.type === 'wild4') {
            waitingForColor = true;
            currentWildCard = card;
            showColorSelector();
        } else {
            await playCard(cardData);
        }
    } catch (error) {
        console.error('Error playing drawn card:', error);
    }
}

async function sayUno() {
    try {
        const response = await apiCall('/uno', 'POST', {
            gameId: currentGameId
        });
        gameState = response.gameState;
        updateUI();
        return response;
    } catch (error) {
        throw error;
    }
}

async function startNewRound() {
    try {
        const response = await apiCall('/new-round', 'POST', {
            gameId: currentGameId
        });
        gameState = response;
        updateUI();
        return response;
    } catch (error) {
        console.error('Failed to start new round:', error);
        throw error;
    }
}



// FUNCIONES DE UI ------------------------------------------------------------------------------------------

function updateUI() {
    if (!gameState) {
        return;
    }

    if (gameState.discardPile && lastDiscardPileId !== gameState.discardPile.id) {
        lastDiscardPileId = gameState.discardPile.id;
    }
    lastTurn = gameState.turn;
    renderPlayerHand();
    renderOpponentHands();
    renderCenterArea();
    updateTurnIndicator();
    updateUnoButton();

    if (gameState.finished) {
        showVictoryModal();
    }
}

function renderPlayerHand() {
    const playerArea = document.getElementById('player-area');
    const playerName = document.getElementById('player-name');

    if (gameState.clientCards) {
        playerName.textContent = 'Tú';

        // Buscar o crear el contenedor de la mano
        let handContainer = playerArea.querySelector('.hand');
        if (!handContainer) {
            handContainer = document.createElement('div');
            handContainer.className = 'hand';
            playerArea.appendChild(handContainer);
        }

        // Limpiar cartas existentes
        handContainer.innerHTML = '';

        // Renderizar cartas del jugador
        gameState.clientCards.forEach((cardData, index) => {
            const card = new Card(cardData.id, cardData.color, cardData.type, cardData.value);
            const cardElement = createCardElement(card, index, true);
            handContainer.appendChild(cardElement);
        });
    }
}

function renderOpponentHands() {
    const opponentAreas = [
        document.getElementById('opponent-area-1'),
        document.getElementById('opponent-area-2'),
        document.getElementById('opponent-area-3')
    ];

    opponentAreas.forEach(area => {
        area.innerHTML = '';
    });

    if (gameState.otherPlayers) {
        gameState.otherPlayers.forEach((player, index) => {
            if (index < opponentAreas.length) {
                const area = opponentAreas[index];
                area.innerHTML = `
                    <div class="opponent-info">
                        <span class="opponent-name">${translatePlayerName(player.name)}</span>
                    </div>
                    <div class="hand">
                        ${Array(player.count).fill('<div class="card back"></div>').join('')}
                    </div>
                `;
            }
        });
    }
}

function renderCenterArea() {
    const deckElement = document.getElementById('deck');
    const discardPileElement = document.getElementById('discard-pile');

    if (gameState.discardPile) {
        discardPileElement.innerHTML = '';
        const card = new Card(
            gameState.discardPile.id,
            gameState.discardPile.color,
            gameState.discardPile.type,
            gameState.discardPile.value
        );

        if ((card.type === 'wild' || card.type === 'wild4') && gameState.currentColor) {
            card.chosenColor = gameState.currentColor;
        }

        const cardElement = createCardElement(card, 0, false);
        discardPileElement.appendChild(cardElement);

        if (gameState.currentColor && gameState.currentColor !== card.color) {
            const colorIndicator = document.createElement('div');
            colorIndicator.className = `color-indicator ${gameState.currentColor}`;
            colorIndicator.textContent = `Color: ${gameState.currentColor.toUpperCase()}`;
            colorIndicator.style.cssText = `
                position: absolute;
                bottom: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: ${getColorValue(gameState.currentColor)};
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
            `;
            discardPileElement.appendChild(colorIndicator);
        }
    }
}

function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turn-indicator');

    if (gameState.turn === 0) {
        turnIndicator.textContent = 'Tu turno';
        turnIndicator.className = 'turn-indicator player-turn';
    } else {
        const playerNames = ['Tú', 'CPU 1', 'CPU 2', 'CPU 3'];
        turnIndicator.textContent = `Turno de ${playerNames[gameState.turn]}`;
        turnIndicator.className = 'turn-indicator cpu-turn';
    }
}

function updateUnoButton() {
    const unoButton = document.getElementById('uno-button');

    const canSayUno = gameState.turn === 0 &&
        gameState.clientCards &&
        gameState.clientCards.length === 1 &&
        !gameState.finished;

    if (canSayUno) {
        unoButton.disabled = false;
        unoButton.style.opacity = '1';
        unoButton.style.cursor = 'pointer';
    } else {
        unoButton.disabled = true;
        unoButton.style.opacity = '0.5';
        unoButton.style.cursor = 'not-allowed';
    }
}



function createCardElement(card, index, isPlayerCard) {
    const cardElement = document.createElement('div');
    cardElement.className = card.getCssClasses();
    cardElement.innerHTML = card.getDisplayText();

    if (isPlayerCard && gameState.turn === 0 && !gameState.finished) {
        const isValid = isCardValidForPlay(card);
        if (isValid) {
            cardElement.classList.add('playable');
            cardElement.addEventListener('click', () => handleCardClick(card, index));
        } else {
            cardElement.style.cursor = 'not-allowed';
            cardElement.style.opacity = '0.5';
        }
    }

    return cardElement;
}

// Función para verificar si una carta es válida para jugar
function isCardValidForPlay(card) {
    if (!gameState || !gameState.discardPile) return false;

    const discardPile = gameState.discardPile;
    const currentColor = gameState.currentColor;

    const targetColor = (discardPile.color === 'wild') ? currentColor : discardPile.color;

    const colorMatch = card.color === targetColor;

    const valueMatch = (card.type === 'number' && discardPile.type === 'number' && card.value === discardPile.value) ||
        (card.type !== 'number' && card.type === discardPile.type);

    const isWild = card.color === 'wild';

    return colorMatch || valueMatch || isWild;
}

function handleCardClick(card, index) {
    if (gameState.turn !== 0 || gameState.finished) return;

    if (card.type === 'wild' || card.type === 'wild4') {
        waitingForColor = true;
        currentWildCard = card;
        showColorSelector();
    } else {
        const cardData = {
            id: card.id,
            color: card.color,
            type: card.type,
            value: card.value
        };
        playCard(cardData)
            .then(() => {
                // Log ya se maneja en la función playCard
            })
            .catch(error => {
                console.error('Error playing card:', error);
            });
    }
}

function playCardFromHand(chosenColor = null) {
    if (waitingForColor && currentWildCard) {
        const cardData = {
            id: currentWildCard.id,
            color: currentWildCard.color,
            type: currentWildCard.type,
            value: currentWildCard.value
        };
        playCard(cardData, chosenColor)
            .then(() => {
                waitingForColor = false;
                currentWildCard = null;
                hideColorSelector();
            })
            .catch(error => {
                console.error('Error playing wild card:', error);
            });
    } else if (!waitingForColor) {
        const cardToPlay = gameState.clientCards.find(c => c.id === currentWildCard?.id);
        if (cardToPlay) {
            playCard(cardToPlay, chosenColor)
                .then(() => {
                    currentWildCard = null;
                })
                .catch(error => {
                    console.error('Error playing card:', error);
                });
        }
    }
}

function showColorSelector() {
    const colorSelector = document.getElementById('color-selector');
    colorSelector.innerHTML = `
        <div class="color-options">
            <h3>Elige un color:</h3>
            <div class="color-buttons">
                <button class="color-btn red" onclick="selectColor('red')">Rojo</button>
                <button class="color-btn blue" onclick="selectColor('blue')">Azul</button>
                <button class="color-btn green" onclick="selectColor('green')">Verde</button>
                <button class="color-btn yellow" onclick="selectColor('yellow')">Amarillo</button>
            </div>
        </div>
    `;
    colorSelector.classList.remove('hidden');
}

function hideColorSelector() {
    const colorSelector = document.getElementById('color-selector');
    colorSelector.classList.add('hidden');
}

function selectColor(color) {
    playCardFromHand(color);
}

function showVictoryModal() {
    const victoryModal = document.getElementById('victory-modal');
    const victoryMessage = document.getElementById('victory-message');

    if (gameState.scores) {
        const maxScore = Math.max(...gameState.scores);
        const winnerIndex = gameState.scores.indexOf(maxScore);
        const playerNames = ['Tú', 'CPU 1', 'CPU 2', 'CPU 3'];
        const winnerMessage = `¡${playerNames[winnerIndex]} ha ganado!`;
        victoryMessage.textContent = winnerMessage;
    } else {
        victoryMessage.textContent = '¡Juego terminado!';
    }

    victoryModal.classList.remove('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#4caf50'};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: notification-slide-in 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'notification-slide-out 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}



// EVENT LISTENERS ------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Botones de la pantalla de bienvenida
    document.getElementById('singleplayer-btn').addEventListener('click', () => {
        startNewGame()
            .then(() => {
                document.getElementById('welcome-screen').classList.add('hidden');
                document.getElementById('game-board').classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error starting game:', error);
                alert('Error al iniciar el juego. Verifica que el servidor esté ejecutándose.');
            });
    });

    // Botón UNO
    document.getElementById('uno-button').addEventListener('click', () => {
        sayUno()
            .then(() => {
            })
            .catch(error => {
                console.error('Error saying UNO:', error);
            });
    });

    // Botón de robar carta
    document.getElementById('draw-button').addEventListener('click', () => {
        if (gameState && gameState.turn === 0 && !gameState.finished) {
            drawCard()
                .then(() => {
                    // Log ya se maneja en la función drawCard
                })
                .catch(error => {
                    console.error('Error drawing card:', error);
                });
        }
    });

    // Botón "Reiniciar Juego"
    document.getElementById('restart-game-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderá el progreso actual.')) {
            startNewGame()
                .then(() => {
                    console.log('Game restarted');
                    // Ocultar cualquier modal o notificación activa al reiniciar el juego
                    document.getElementById('victory-modal').classList.add('hidden');
                    hideColorSelector();
                    // También podrías querer limpiar notificaciones activas si las hay
                    const notifications = document.querySelectorAll('.notification');
                    notifications.forEach(n => n.remove());
                })
                .catch(error => {
                    console.error('Error restarting game:', error);
                    alert('Error al reiniciar el juego. Por favor, inténtalo de nuevo.');
                });
        }
    });

    // Botón "Jugar de nuevo"
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('victory-modal').classList.add('hidden');
        startNewRound()
            .then(() => {
                console.log('New round started');
            })
            .catch(error => {
                console.error('Error starting new round:', error);
            });
    });

    // Tecla para robar carta
    document.addEventListener('keydown', (event) => {
        if (event.key === 'd' || event.key === 'D') {
            if (gameState && gameState.turn === 0 && !gameState.finished) {
                drawCard()
                    .then(() => {
                        // Log ya se maneja en la función drawCard
                    })
                    .catch(error => {
                        console.error('Error drawing card:', error);
                    });
            }
        }
    });
});

// Función global para selección de color
window.selectColor = selectColor;