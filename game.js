// Postavljanje platna za igru
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Varijable za praćenje vremena igre
let startTime = Date.now(); // Početno vrijeme
let elapsedTime = 0;       // Proteklo vrijeme
let gameRunning = true;    // Status igre
let bestTime = localStorage.getItem('bestTime') || 0; // Najbolje vrijeme spremljeno u lokalnoj pohrani

// Funkcija za formatiranje vremena u MM:SS.mmm format
function formatTime(time) {
    let milliseconds = time % 1000;
    let seconds = Math.floor(time / 1000) % 60;
    let minutes = Math.floor(time / (1000 * 60));
    return minutes.toString().padStart(2, '0') + ":" +
        seconds.toString().padStart(2, '0') + "." +
        milliseconds.toString().padStart(3, '0');
}

// Funkcija za ažuriranje isteklog vremena igre
function updateElapsedTime() {
    if (gameRunning) {
        elapsedTime = Date.now() - startTime;
    }
    return formatTime(elapsedTime);
}

// Funkcija za ažuriranje najboljeg vremena igre
function updateBestTime() {
    if (elapsedTime > bestTime) {
        bestTime = elapsedTime;
        localStorage.setItem('bestTime', bestTime);
    }
}

// Funkcija za crtanje vremena na platnu
function drawTime() {
    const bestTimeStr = 'Najbolje Vrijeme: ' + formatTime(bestTime);
    const elapsedTimeStr = 'Trenutno Vrijeme: ' + updateElapsedTime();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    const bestTimeWidth = ctx.measureText(bestTimeStr).width;
    const elapsedTimeWidth = ctx.measureText(elapsedTimeStr).width;
    const maxWidth = Math.max(bestTimeWidth, elapsedTimeWidth);
    ctx.fillText(bestTimeStr, canvas.width - maxWidth - 10, 30);
    ctx.fillText(elapsedTimeStr, canvas.width - maxWidth - 10, 60);
}

// Postavljanje veličine platna na cijelu širinu i visinu preglednika (-10 jer se okvir nije vidio prvobitno)
canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

// Postavljanje svojstva za zvjezdanu pozadinu
const numStars = 100; // Broj zvijezda
const stars = [];     // Polje zvijezda
const starSpeed = 0.2; // Brzina zvijezda

// Generiranje početnog skupa zvijezda
for (let i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: starSpeed
    });
}

// Funkcija za ažuriranje pozicije zvijezda
function updateStars() {
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

// Funkcija za crtanje zvijezda na platnu
function drawStars() {
    ctx.fillStyle = 'white';
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Postavljanje svojstava igrača
const player = {
    width: 30,
    height: 40,
    x: canvas.width / 2 - 25, // Pozicioniranje igrača na sredinu
    y: canvas.height / 2 - 25,
    speed: 4, // Brzina igrača
    color: 'red', // Boja igrača
    rotation: -0.95 // Rotacija igrača
};

// Funkcija za crtanje igrača na platnu
function drawPlayer() {
    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation);

    ctx.fillStyle = player.color;

    ctx.beginPath();
    ctx.moveTo(0, -15); // Prednji dio svemirskog broda
    ctx.lineTo(-10, 10); // Stražnji lijevi dio
    ctx.quadraticCurveTo(0, 0, 10, 10); // Stražnji desni dio
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Praćenje stanja tipki za kontrolu igrača
const keys = {};
document.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});
document.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});
function updatePlayer() {
    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;

    // Ograničavanje igrača unutar granica platna
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// Postavljanje svojstava asteroida
const asteroids = [];
const asteroidSpeed = 1.5; // Brzina asteroida
const asteroidGenerationInterval = 100; // Interval generiranja asteroida

// Funkcija za stvaranje novog asteroida
function createAsteroid() {
    const size = Math.random() * (30 - 10) + 10; // Određivanje veličine asteroida
    let x, y;
    const side = Math.floor(Math.random() * 4); // Odabir strane s koje će asteroid ući
    switch (side) {
        case 0: // Od vrha
            x = Math.random() * canvas.width;
            y = -size;
            break;
        case 1: // S desne strane
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            break;
        case 2: // S dna
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            break;
        case 3: // S lijeve strane
            x = -size;
            y = Math.random() * canvas.height;
            break;
    }

    const angle = Math.random() * Math.PI * 2;
    const greyShade = Math.random() * 155 + 100; // Boja asteroida
    const asteroid = {
        x: x,
        y: y,
        radius: size / 2,
        color: `rgb(${greyShade}, ${greyShade}, ${greyShade})`,
        speed: Math.random() * (asteroidSpeed - 0.5) + 0.5,
        velX: Math.cos(angle) * (Math.random() * 2 + 1),
        velY: Math.sin(angle) * (Math.random() * 2 + 1)
    };
    asteroids.push(asteroid);
}

// Funkcija za ažuriranje položaja asteroida
function updateAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x += asteroid.velX * asteroid.speed;
        asteroid.y += asteroid.velY * asteroid.speed;

        // Uklanjanje asteroida koji izlaze izvan granice platna
        if (asteroid.x < -asteroid.width || asteroid.x > canvas.width + asteroid.width ||
            asteroid.y < -asteroid.height || asteroid.y > canvas.height + asteroid.height) {
            asteroids.splice(i, 1);
        }
    }
}

// Funkcija za crtanje asteroida na platnu
function drawAsteroids() {
    for (let asteroid of asteroids) {
        ctx.save();

        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = asteroid.color;
        ctx.fill();

        ctx.restore();
    }
}

// Funkcija za provjeru sudara između igrača i asteroida

function isCollision(object1, object2) {
    const dx = object1.x + object1.width / 2 - (object2.x + object2.radius);
    const dy = object1.y + object1.height / 2 - (object2.y + object2.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (object1.width / 2 + object2.radius);
}

// Glavna petlja animacije igre
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateStars();
    drawStars();

    updateAsteroids();
    drawAsteroids();

    // Provjera sudara igrača i asteroida
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        if (isCollision(player, asteroid)) {

            gameRunning = false;
            updateBestTime();
            clearInterval(asteroidInterval);

            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Kraj Igre', canvas.width / 2 - 100, canvas.height / 2);
            ctx.fillText('Vrijeme: ' + updateElapsedTime(), canvas.width / 2 - 100, canvas.height / 2 + 60);
            ctx.fillText('Za pokretanje nove igre osviježite stranicu!', canvas.width / 2 - 100, canvas.height / 2 + 120);
            return;
        }
    }

    updatePlayer();
    drawPlayer();

    drawTime();

    if (gameRunning) {
        requestAnimationFrame(animate);
    }
}

// Postavljanje intervala za generiranje asteroida i pokretanje igre
const asteroidInterval = setInterval(createAsteroid, asteroidGenerationInterval);
animate();