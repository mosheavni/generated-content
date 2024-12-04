const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const sizeButtons = document.querySelectorAll(".brush-sizes button");
const colorButtons = document.querySelectorAll(".colors button");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");

// Function to set canvas size
function resizeCanvas() {
    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Get the container's dimensions
    const rect = canvas.parentElement.getBoundingClientRect();
    
    // Set the canvas size relative to the container and device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the canvas context to ensure correct drawing
    ctx.scale(dpr, dpr);
    
    // Set the display size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
}

// Initial canvas setup
resizeCanvas();

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Custom cursor (only show on non-touch devices)
const cursor = document.createElement("div");
cursor.style.position = "fixed";
cursor.style.pointerEvents = "none";
cursor.style.borderRadius = "50%";
cursor.style.transform = "translate(-50%, -50%)";
if (!('ontouchstart' in window)) {
    document.body.appendChild(cursor);
}

// Drawing state
let isDrawing = false;
let currentSize = 5;
let currentColor = "#000000";
let lastX = 0;
let lastY = 0;

// History for undo
let drawingHistory = [];
let currentPath = [];

// Get correct coordinates for both mouse and touch events
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Event listeners for both mouse and touch
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);
canvas.addEventListener("touchend", stopDrawing);

// Only add cursor events for non-touch devices
if (!('ontouchstart' in window)) {
    canvas.addEventListener("mousemove", updateCursor);
    canvas.addEventListener("mouseenter", () => (cursor.style.display = "block"));
    canvas.addEventListener("mouseleave", () => (cursor.style.display = "none"));
}

function handleTouch(e) {
    e.preventDefault(); // Prevent scrolling while drawing
    const touch = getCoordinates(e);
    if (e.type === "touchstart") {
        startDrawing({ offsetX: touch.x, offsetY: touch.y });
    } else if (e.type === "touchmove") {
        draw({ offsetX: touch.x, offsetY: touch.y });
    }
}

function updateCursor(e) {
    cursor.style.left = e.pageX + "px";
    cursor.style.top = e.pageY + "px";
    cursor.style.width = currentSize + "px";
    cursor.style.height = currentSize + "px";
    cursor.style.backgroundColor = currentColor;
    cursor.style.opacity = "0.5";
}

sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentSize = parseInt(button.dataset.size);
        sizeButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        updateCursor({ pageX: lastX, pageY: lastY });
    });
});

colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentColor = button.dataset.color;
        colorButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        updateCursor({ pageX: lastX, pageY: lastY });
    });
});

clearButton.addEventListener("click", clearCanvas);
undoButton.addEventListener("click", undo);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    currentPath = [];
    currentPath.push({
        x: lastX,
        y: lastY,
        size: currentSize,
        color: currentColor,
    });
}

function draw(e) {
    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    currentPath.push({
        x: e.offsetX,
        y: e.offsetY,
        size: currentSize,
        color: currentColor,
    });

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        drawingHistory.push([...currentPath]);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory = [];
}

function undo() {
    if (drawingHistory.length === 0) return;

    drawingHistory.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawingHistory.forEach((path) => {
        path.forEach((point, index) => {
            if (index === 0) {
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
                ctx.strokeStyle = point.color;
                ctx.lineWidth = point.size;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.stroke();
            }
        });
    });
}
