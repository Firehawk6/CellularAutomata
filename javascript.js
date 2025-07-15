// --- CONFIGURABLE SETTINGS ---
const CELL_SIZE = 8;
const COLORS = {
    classic: {
        bg: "#222",
        cell: "#fff",
        grid: "#333"
    },
    neon: {
        bg: "#000",
        cell: "#39ff14",
        grid: "#1a1a1a"
    },
    fire: {
        bg: "#1a0a0a",
        cell: "#ff4400",
        grid: "#2a1a1a"
    },
    ocean: {
        bg: "#0a1a2a",
        cell: "#00aaff",
        grid: "#1a2a3a"
    }
};
let theme = "classic";

// --- STATE ---
let grid = new Map();
let nextGrid = new Map();
let running = false;
let speed = 30;
let animationFrame;
let cellSize = CELL_SIZE;
let offsetX = 0, offsetY = 0;
let zoom = 1;
let generation = 0;
let cellCount = 0;

// --- CANVAS SETUP ---
const canvas = document.getElementById("ca-canvas");
const ctx = canvas.getContext("2d");

// --- UI ELEMENTS ---
const playBtn = document.getElementById("play-btn");
const stepBtn = document.getElementById("step-btn");
const resetBtn = document.getElementById("reset-btn");
const clearBtn = document.getElementById("clear-btn");
const speedSlider = document.getElementById("speed-slider");
const themeSelect = document.getElementById("theme-select");
const patternSelect = document.getElementById("pattern-select");
const generationSpan = document.getElementById("generation");
const cellCountSpan = document.getElementById("cell-count");

// --- HELPERS ---
function key(x, y) { return `${x},${y}`; }
function parseKey(k) { const [x, y] = k.split(",").map(Number); return { x, y }; }

// --- CONWAY'S GAME OF LIFE LOGIC ---
function countNeighbors(x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const k = key(x + dx, y + dy);
            if (grid.has(k)) count++;
        }
    }
    return count;
}

function step() {
    nextGrid.clear();
    const cellsToCheck = new Set();
    
    // Collect all cells and their neighbors
    for (const [k, v] of grid.entries()) {
        if (v === 1) {
            const { x, y } = parseKey(k);
            cellsToCheck.add(k);
            // Add neighbors
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    cellsToCheck.add(key(x + dx, y + dy));
                }
            }
        }
    }
    
    // Apply Conway's rules
    for (const k of cellsToCheck) {
        const { x, y } = parseKey(k);
        const neighbors = countNeighbors(x, y);
        const alive = grid.has(k);
        
        if (alive && (neighbors === 2 || neighbors === 3)) {
            nextGrid.set(k, 1);
        } else if (!alive && neighbors === 3) {
            nextGrid.set(k, 1);
        }
    }
    
    // Swap grids
    [grid, nextGrid] = [nextGrid, grid];
    generation++;
    updateInfo();
}

// --- PATTERN DEFINITIONS ---
const PATTERNS = {
    glider: [
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1]
    ],
    blinker: [
        [1, 1, 1]
    ],
    toad: [
        [0, 1, 1, 1],
        [1, 1, 1, 0]
    ],
    beacon: [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 1, 1]
    ],
    pulsar: [
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
    ],
    gosper: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
};

function placePattern(pattern, centerX = 0, centerY = 0) {
    if (pattern === "random") {
        // Random pattern
        for (let i = 0; i < 1000; i++) {
            const x = Math.floor(Math.random() * 100) - 50;
            const y = Math.floor(Math.random() * 100) - 50;
            if (Math.random() < 0.3) {
                grid.set(key(x, y), 1);
            }
        }
    } else if (PATTERNS[pattern]) {
        // Place predefined pattern
        const p = PATTERNS[pattern];
        const startX = centerX - Math.floor(p[0].length / 2);
        const startY = centerY - Math.floor(p.length / 2);
        
        for (let y = 0; y < p.length; y++) {
            for (let x = 0; x < p[y].length; x++) {
                if (p[y][x] === 1) {
                    grid.set(key(startX + x, startY + y), 1);
                }
            }
        }
    }
}

function reset() {
    grid.clear();
    nextGrid.clear();
    generation = 0;
    const pattern = patternSelect.value;
    placePattern(pattern);
    offsetX = canvas.width / 2;
    offsetY = canvas.height / 2;
    zoom = 1;
    cellSize = CELL_SIZE;
    updateInfo();
    draw();
}

function clear() {
    grid.clear();
    nextGrid.clear();
    generation = 0;
    updateInfo();
    draw();
}

function updateInfo() {
    cellCount = grid.size;
    generationSpan.textContent = generation;
    cellCountSpan.textContent = cellCount;
}

// --- RENDERING ---
function draw() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORS[theme].bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pan & zoom
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);

    // Draw grid lines (optional, for better visibility)
    if (cellSize > 4) {
        ctx.strokeStyle = COLORS[theme].grid;
        ctx.lineWidth = 0.5;
        const startX = Math.floor(-offsetX / zoom / cellSize) - 1;
        const endX = Math.floor((canvas.width - offsetX) / zoom / cellSize) + 1;
        const startY = Math.floor(-offsetY / zoom / cellSize) - 1;
        const endY = Math.floor((canvas.height - offsetY) / zoom / cellSize) + 1;
        
        for (let x = startX; x <= endX; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, startY * cellSize);
            ctx.lineTo(x * cellSize, endY * cellSize);
            ctx.stroke();
        }
        for (let y = startY; y <= endY; y++) {
            ctx.beginPath();
            ctx.moveTo(startX * cellSize, y * cellSize);
            ctx.lineTo(endX * cellSize, y * cellSize);
            ctx.stroke();
        }
    }

    // Draw cells
    ctx.fillStyle = COLORS[theme].cell;
    for (const [k, v] of grid.entries()) {
        if (v === 1) {
            const { x, y } = parseKey(k);
            ctx.fillRect(
                x * cellSize,
                y * cellSize,
                cellSize, cellSize
            );
        }
    }

    ctx.restore();
}

// --- ANIMATION LOOP ---
function animate() {
    for (let i = 0; i < Math.max(1, Math.floor(speed / 60)); i++) {
        step();
    }
    draw();
    if (running) {
        animationFrame = requestAnimationFrame(animate);
    }
}

// --- UI HANDLERS ---
playBtn.onclick = () => {
    running = !running;
    playBtn.textContent = running ? "Pause" : "Play";
    if (running) animate();
    else cancelAnimationFrame(animationFrame);
};

stepBtn.onclick = () => {
    if (!running) {
        step();
        draw();
    }
};

resetBtn.onclick = () => {
    running = false;
    playBtn.textContent = "Play";
    reset();
};

clearBtn.onclick = () => {
    running = false;
    playBtn.textContent = "Play";
    clear();
};

speedSlider.oninput = () => {
    speed = Number(speedSlider.value);
};

themeSelect.onchange = () => {
    theme = themeSelect.value;
    draw();
};

patternSelect.onchange = () => {
    reset();
};

// --- MOUSE INTERACTION ---
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / zoom;
    const y = (e.clientY - rect.top - offsetY) / zoom;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    const k = key(gridX, gridY);
    
    if (grid.has(k)) {
        grid.delete(k);
    } else {
        grid.set(k, 1);
    }
    updateInfo();
    draw();
});

// --- ZOOM & PAN ---
let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener("mousedown", e => {
    if (e.button === 0) { // Left click only
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = "grabbing";
    }
});

window.addEventListener("mousemove", e => {
    if (dragging) {
        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    }
});

window.addEventListener("mouseup", () => {
    dragging = false;
    canvas.style.cursor = "grab";
});

canvas.addEventListener("wheel", e => {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 1.1 : 0.9;
    const mx = (e.offsetX - offsetX) / zoom;
    const my = (e.offsetY - offsetY) / zoom;
    zoom *= scale;
    offsetX = e.offsetX - mx * zoom;
    offsetY = e.offsetY - my * zoom;
    draw();
}, { passive: false });

// --- RESPONSIVE CANVAS ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

window.addEventListener("resize", resizeCanvas);

// --- INIT ---
resizeCanvas();
reset();
