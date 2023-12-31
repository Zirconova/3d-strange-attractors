const width = 1000;
const height = 1000;

// HTML Elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const toggleRunningButton = document.getElementById("toggle-running");
const framerateDisplay = document.getElementById("framerate");
const exposureSlider = document.getElementById("exposureSlider");
const paramSliders = [];

canvas.width = width;
canvas.height = height;

// Renderer variables
var cam = new Camera(0,0,-5,0,0,0.1,width/1000,height/1000);
var curYaw, curPitch;
var mouseClick = new Vector(0,0,0);
var clicking = false;
var zoomPoints = [];
var zooming = false;
var exposure = 3;
var maxIterations = 10000;
var hq = false;
var pt = new Vector(1,1,1);
var lastPt = new Vector(1,1,1);
var a = [0.4072888526836418,
    0.33046466736299474,
    -1.5633615491959243,
    2.253803963260541,
    -2.8029950865834614,
    -2.6933263092549478
];

// Initialize parameter sliders and set input functions
for (let i = 1; i <= 6; i++) {
    paramSliders[i-1] = document.getElementById("slider"+i);
    paramSliders[i-1].value = a[i-1];
    paramSliders[i-1].oninput = function() {
        pt = new Vector(1,1,1);
        lastPt = new Vector(1,1,1);
        index = Array.prototype.indexOf.call(this.parentNode.children, this);
        a[index] = Number(this.value);
    };
}

// Main loop variables
var running = true;
var last = 0;
var dt = 0;

// Ensure canvas is correct size and begin running program
var minWidth = window.matchMedia("(min-width: 600px)");
resizeCanvas(minWidth);
clearScreen("black");
window.requestAnimationFrame(draw);

// Main loop function which is called every frame
function draw(timestamp) {
    dt = timestamp - last;
    last = timestamp;

    framerateDisplay.innerHTML = Math.round(1000 / dt) + " FPS";
    
    if (!hq)
        clearScreen("black");
    
    drawAttractor();

    if (running)
        window.requestAnimationFrame(draw);
}

function toggleRunning() {
    if (running) {
        running = false;
        toggleRunningButton.innerHTML = "Resume";
        canvas.style.touchAction = "auto";
        toggleRunningButton.style.backgroundColor = "rgb(57, 219, 57)";
    } else {
        running = true;
        toggleRunningButton.innerHTML = "Pause";
        canvas.style.touchAction = "none";
        toggleRunningButton.style.backgroundColor = "rgb(255, 87, 87)";
        window.requestAnimationFrame(draw);
    }
}

function toggleHQ() {
    hq = !hq;
    if (running)
        clearScreen('black');
}

function updatePosition(p) {
    // 3D Clifford Attractor formula
    let xn = p.x;
    let yn = p.y;
    let zn = p.z;
    p.x = zn * Math.sin(a[0] + yn) + yn * Math.cos(a[3] + zn);
    p.y = xn * Math.sin(a[1] + zn) + zn * Math.cos(a[4] + xn);
    p.z = yn * Math.sin(a[2] + xn) + xn * Math.cos(a[5] + yn);
}

function drawAttractor() {
    let opacity = (hq) ? 0.05 : 1;

    for (let i = 0; i < maxIterations; i++) {
        updatePosition(pt);
        let distance = pt.dist(lastPt);
        let screenPt = project(cam, pt);
        ctx.fillStyle = "hsla(" + (180+25*distance) + ", 100%, " + (50 + exposure*5) + "%," + opacity + ")";
        ctx.fillRect(screenPt.x, screenPt.y, 1, 1);
        lastPt.x = pt.x;
        lastPt.y = pt.y;
        lastPt.z = pt.z;
    }
}

function generateCoeffs() {
    pt = new Vector(1,1,1);
    lastPt = new Vector(1,1,1);

    for (let i = 0; i < 6; i++) {
        a[i] = Math.random() * 6 - 3;
        paramSliders[i].value = "" + a[i];
    }

    console.log(a);
}

function clearScreen(colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(0,0,width,height);
}

function project(cam, pt) {
    let pair = new Vector(0,0,0); // Vector which will store the coordinates of the pixel to return
    // Create coordinates of the point relative to the camera's position
    let x = pt.x-cam.position.x;
    let y = pt.y-cam.position.y;
    let z = pt.z-cam.position.z;
    let newPt = new Vector(x,y,z);
    // Adjust point to normalized case based on yaw, pitch, and roll
    newPt.rotY(-cam.yaw);
    newPt.rotX(-cam.pitch);
    // Project point onto 2D screen
    pair.x = width*cam.focalLength*newPt.x/newPt.z/cam.width + width/2;
    pair.y = -height*cam.focalLength*newPt.y/newPt.z/cam.height + width/2;
    return pair;
}

// Input listeners

exposureSlider.oninput = function () {
    exposure = this.value;
}

// Mouse controls

canvas.addEventListener("mousedown", e => {
    mouseClick.x = e.offsetX;
    mouseClick.y = e.offsetY;
    curYaw = cam.yaw;
    curPitch = cam.pitch;

    clicking = true;
});

canvas.addEventListener("mousemove", e => {
    if (clicking && running) {
        clearScreen("black");
        let dx = e.offsetX - mouseClick.x;
        let dy = e.offsetY - mouseClick.y;
        let rate = 0.01;

        cam.position.rotY(-cam.yaw);
        cam.position.rotX(-cam.pitch);

        cam.position.rotX(curPitch - dy*rate);
        cam.position.rotY(curYaw - dx*rate);
        cam.yaw = curYaw - dx*rate;
        cam.pitch = curPitch - dy*rate;
    }
});

canvas.addEventListener("mouseup", e => {
    clicking = false;
});

canvas.addEventListener("wheel", e => {
    if (running) {
        clearScreen("black");
        let multiplier = (e.deltaY != 0) ? 1.1 ** (e.deltaY/Math.abs(e.deltaY)) : 1;
        cam.width *= multiplier;
        cam.height *= multiplier;
    }
});

// Touch controls

canvas.addEventListener("touchstart", e => {
    if (e.touches.length == 1) {
        mouseClick.x = e.touches[0].screenX;
        mouseClick.y = e.touches[0].screenY;
        curYaw = cam.yaw;
        curPitch = cam.pitch;

        clicking = true;

    } else if (e.touches.length == 2) {
        clicking = false;
        zooming = true;
        zoomPoints[0] = new Vector(e.touches[0].screenX, e.touches[0].screenY, 0);
        zoomPoints[1] = new Vector(e.touches[1].screenX, e.touches[1].screenY, 0);
    }
});

canvas.addEventListener("touchmove", e => {
    if (clicking && running && e.touches.length == 1) {
        clearScreen("black");
        let dx = e.touches[0].screenX - mouseClick.x;
        let dy = e.touches[0].screenY - mouseClick.y;
        let rate = 0.01;

        cam.position.rotY(-cam.yaw);
        cam.position.rotX(-cam.pitch);

        cam.position.rotX(curPitch - dy*rate);
        cam.position.rotY(curYaw - dx*rate);
        cam.yaw = curYaw - dx*rate;
        cam.pitch = curPitch - dy*rate;

    } else if (zooming && running && e.touches.length == 2) {
        clearScreen("black");
        let rate = 0.01;
        newP1 = new Vector(e.touches[0].screenX, e.touches[0].screenY, 0);
        newP2 = new Vector(e.touches[1].screenX, e.touches[1].screenY, 0);
        startDist = zoomPoints[0].dist(zoomPoints[1]);
        delta = newP1.dist(newP2) - startDist;
        let multiplier = 1 - delta * rate;
        cam.width *= multiplier;
        cam.height *= multiplier;

        zoomPoints[0] = newP1;
        zoomPoints[1] = newP2;
    }
});

canvas.addEventListener("touchend", e => {
    clicking = false;
    zooming = false;
})

// Responsive canvas size

function resizeCanvas(condition) {
    console.log("changed");
    if (condition.matches) {
        canvas.style.height = "100vh";
        canvas.style.width = "100vh";
    } else {
        canvas.style.width = "100vw";
        canvas.style.height = "100vw";
    }
}

window.addEventListener("resize", e => {
    resizeCanvas(minWidth);
});