class CloudCatcherGame {
    constructor() {
        this.score = 0;
        this.missedCount = 0;
        this.maxMissed = 15;
        this.gameActive = false;
        this.clouds = [];
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.cloudSpawnInterval = null;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Add some floating animation to the background
        this.createBackgroundClouds();
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.missedCount = 0;
        this.updateScore();
        
        // Hide instructions and show restart button
        document.querySelector('.instructions').style.display = 'none';
        this.restartBtn.style.display = 'inline-block';
        
        // Start spawning clouds
        this.spawnClouds();
        
        // Create initial burst of characters to fill screen faster
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createCatchableCloud();
            }, i * 500);
        }
        
        // Start game loop
        this.gameLoop = setInterval(() => this.updateGame(), 50);
    }
    
    restartGame() {
        // Stop current game
        this.stopGameSilent();
        
        // Show custom popup with final score
        this.showRestartPopup();
    }
    
    showRestartPopup() {
        // Create popup container
        const popup = document.createElement('div');
        popup.className = 'restart-popup';
        
        // Create popup content
        const content = document.createElement('div');
        content.className = 'restart-popup-content';
        
        // Add congratulations text
        const message = document.createElement('p');
        message.textContent = `Bra jobbat! Du har fångat ${this.score} element! ⭐️`;
        message.className = 'restart-message';
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Spela igen';
        restartButton.className = 'popup-restart-btn';
        restartButton.addEventListener('click', () => {
            this.closeRestartPopup();
            setTimeout(() => {
                this.startGame();
            }, 100);
        });
        
        // Add back to start button
        const backButton = document.createElement('button');
        backButton.textContent = 'Tillbaka till start';
        backButton.className = 'popup-back-btn';
        backButton.addEventListener('click', () => {
            this.closeRestartPopup();
            document.querySelector('.instructions').style.display = 'block';
            this.restartBtn.style.display = 'none';
        });
        
        // Assemble popup
        content.appendChild(message);
        content.appendChild(restartButton);
        content.appendChild(backButton);
        popup.appendChild(content);
        
        // Add to page
        document.body.appendChild(popup);
    }
    
    closeRestartPopup() {
        const popup = document.querySelector('.restart-popup');
        if (popup) {
            popup.remove();
        }
    }
    
    createBackgroundClouds() {
        // Create some static background clouds for decoration
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createStaticCloud();
            }, i * 1000);
        }
    }
    
    createStaticCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud cloud-small';
        cloud.style.position = 'absolute';
        cloud.style.left = Math.random() * (window.innerWidth - 100) + 50 + 'px';
        cloud.style.top = '-100px';
        cloud.style.opacity = '0.3';
        cloud.style.animation = `moveDown ${15 + Math.random() * 10}s linear infinite`;
        
        this.gameArea.appendChild(cloud);
        
        // Remove cloud after animation
        setTimeout(() => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        }, 25000);
    }
    
    spawnClouds() {
        if (!this.gameActive) return;
        
        this.cloudSpawnInterval = setInterval(() => {
            if (this.gameActive) {
                this.createCatchableCloud();
            }
        }, 1000 + Math.random() * 1500); // Spawn every 1-2.5 seconds (more frequent)
    }
    
    createCatchableCloud() {
        const cloud = document.createElement('img');
        
        // Array of all character images
        const characters = [
            'vinda-transparent.png',
            'vattna.png',
            'elda.png',
            'jorda.png'
        ];
        
        // Randomly select one character
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
        cloud.src = randomCharacter;
        
        cloud.className = 'cloud';
        cloud.style.position = 'absolute';
        cloud.style.left = Math.random() * (window.innerWidth - 200) + 50 + 'px';
        cloud.style.top = '-140px';
        cloud.style.cursor = 'pointer';
        
        // Set random size between 55px and 165px (10% bigger)
        const randomSize = 55 + Math.random() * 110; // Random size between 55-165px
        cloud.style.width = randomSize + 'px';
        cloud.style.height = 'auto';
        
        // Store character name for potential future use
        cloud.dataset.character = randomCharacter.replace('.png', '').replace('-transparent', '');
        
        // All characters give 1 point regardless of size or type
        cloud.dataset.points = 1;
        cloud.dataset.speed = 2 + Math.random() * 3; // Random speed between 2-5
        
        // Add click event - ensure single click responsiveness
        cloud.addEventListener('click', (e) => this.catchCloud(e, cloud));
        
        // Prevent any potential double-click interference
        cloud.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        this.gameArea.appendChild(cloud);
        this.clouds.push(cloud);
    }
    
    
    catchCloud(event, cloud) {
        if (!this.gameActive) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        // Add points
        const points = parseInt(cloud.dataset.points);
        this.score += points;
        this.updateScore();
        
        // Show score popup
        this.showScorePopup(event.clientX, event.clientY, points);
        
        // Add caught animation
        cloud.classList.add('caught-animation');
        
        // Remove cloud from array and DOM
        const index = this.clouds.indexOf(cloud);
        if (index > -1) {
            this.clouds.splice(index, 1);
        }
        
        setTimeout(() => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        }, 500);
        
        // Play catch sound effect (visual feedback)
        this.createSparkleEffect(event.clientX, event.clientY);
    }
    
    showScorePopup(x, y, points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    }
    
    createSparkleEffect(x, y) {
        // Create sparkle effect when cloud is caught
        for (let i = 0; i < 6; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'absolute';
            sparkle.style.left = x + (Math.random() - 0.5) * 50 + 'px';
            sparkle.style.top = y + (Math.random() - 0.5) * 50 + 'px';
            sparkle.style.width = '8px';
            sparkle.style.height = '8px';
            sparkle.style.background = '#FFD700';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            sparkle.style.animation = 'sparkle 0.8s ease-out forwards';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 800);
        }
    }
    
    updateGame() {
        if (!this.gameActive) return;
        
        // Move clouds downward and remove off-screen ones
        this.clouds.forEach((cloud, index) => {
            const currentTop = parseInt(cloud.style.top) || 0;
            const speed = parseFloat(cloud.dataset.speed) || 2;
            const newTop = currentTop + speed;
            
            cloud.style.top = newTop + 'px';
            
            // Remove clouds that have moved off screen (bottom)
            if (newTop > window.innerHeight + 120) {
                // Count as missed character
                this.missedCount++;
                
                cloud.parentNode.removeChild(cloud);
                this.clouds.splice(index, 1);
                
                // Check if game should end
                if (this.missedCount >= this.maxMissed) {
                    this.endGameFromMissed();
                }
            }
        });
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // Add celebration effect for milestone scores
        if (this.score > 0 && this.score % 100 === 0) {
            this.celebrateScore();
        }
    }
    
    celebrateScore() {
        // Add rainbow background flash for milestone scores
        document.body.style.animation = 'rainbow 1s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 1000);
    }
    
    endGameFromMissed() {
        // Stop current game
        this.stopGameSilent();
        
        // Show game over popup
        this.showGameOverPopup();
    }
    
    showGameOverPopup() {
        // Create popup container
        const popup = document.createElement('div');
        popup.className = 'restart-popup';
        
        // Create popup content
        const content = document.createElement('div');
        content.className = 'restart-popup-content';
        
        // Add game over message
        const message = document.createElement('p');
        message.textContent = `Spelet är slut! Du fångade ${this.score} element! ⭐️`;
        message.className = 'restart-message';
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Spela igen';
        restartButton.className = 'popup-restart-btn';
        restartButton.addEventListener('click', () => {
            this.closeRestartPopup();
            setTimeout(() => {
                this.startGame();
            }, 100);
        });
        
        // Add back to start button
        const backButton = document.createElement('button');
        backButton.textContent = 'Tillbaka till start';
        backButton.className = 'popup-back-btn';
        backButton.addEventListener('click', () => {
            this.closeRestartPopup();
            document.querySelector('.instructions').style.display = 'block';
            this.restartBtn.style.display = 'none';
        });
        
        // Assemble popup
        content.appendChild(message);
        content.appendChild(restartButton);
        content.appendChild(backButton);
        popup.appendChild(content);
        
        // Add to page
        document.body.appendChild(popup);
    }
    
    stopGame() {
        this.gameActive = false;
        if (this.cloudSpawnInterval) {
            clearInterval(this.cloudSpawnInterval);
        }
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Clear remaining clouds
        this.clouds.forEach(cloud => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        });
        this.clouds = [];
        
        // Show final score
        alert(`Great job! You caught ${this.score} characters! 🌟`);
        
        // Reset game
        document.querySelector('.instructions').style.display = 'block';
        this.restartBtn.style.display = 'none';
    }
    
    stopGameSilent() {
        this.gameActive = false;
        if (this.cloudSpawnInterval) {
            clearInterval(this.cloudSpawnInterval);
        }
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Clear remaining clouds
        this.clouds.forEach(cloud => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        });
        this.clouds = [];
        
        // Don't show alert message - silent restart
        // Keep restart button visible for immediate restart
    }
}

// Add additional CSS animations via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes moveDown {
        from { top: -120px; }
        to { top: 100vh; }
    }
    
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CloudCatcherGame();
});

// Add keyboard controls for accessibility
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        if (startBtn.style.display !== 'none') {
            startBtn.click();
        }
    }
});
