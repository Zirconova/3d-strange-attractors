class Camera {
    constructor(x,y,z,yaw,pitch,f,w,h) {
        this.position = new Vector(x,y,z);
        this.yaw = yaw;
        this.pitch = pitch;
        this.focalLength = f;
        this.width = w;
        this.height = h;
    }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const framerateDisplay = document.getElementById("framerate");
const exposureSlider = document.getElementById("exposureSlider");

const width = 600;
const height = 600;

canvas.width = width;
canvas.height = height;
canvas.style.outline = "1px solid white";
canvas.style.width = width/1.5 + "px";
canvas.style.height = height/1.5 + "px";

clearScreen("black");

var hq = false;

var running = true;
var last = 0;
var dt = 0;

var cam = new Camera(0,0,-5,0,0,0.1,width/1000,height/1000);
var exposure = 3;
var curYaw, curPitch;
var mouseClick = new Vector(0,0,0);
var clicking = false;
var pt = new Vector(1,1,1);
var lastPt = new Vector(1,1,1);
var a = [-1.266804495305259, 2.057240717878118, 0.7456347995345078, -1.2444169439109851, -0.5578445875440847, -1.2468406629894768];
var maxIterations = 5000;

window.requestAnimationFrame(draw);

function draw(timestamp) {
    dt = timestamp - last;
    last = timestamp;

    framerateDisplay.innerHTML = Math.round(1000 / dt) + " FPS";
    
    if (!hq) {
        clearScreen("black");
    }
    drawAttractor();

    if (running) {
        window.requestAnimationFrame(draw);
    }
}

function updatePosition(p) {
    let xn = p.x;
    let yn = p.y;
    let zn = p.z;
    p.x = zn * Math.sin(a[0] + yn) + yn * Math.cos(a[3] + zn);
    p.y = xn * Math.sin(a[1] + zn) + zn * Math.cos(a[4] + xn);
    p.z = yn * Math.sin(a[2] + xn) + xn * Math.cos(a[5] + yn);
}

function drawAttractor() {
    let opacity = (hq) ? 0.05 : exposure/10;

    for (let i = 0; i < maxIterations; i++) {
        updatePosition(pt);
        let distance = pt.dist(lastPt);
        ctx.fillStyle = "hsla(" + (180+25*distance) + ", 100%, " + (50 + exposure*5) + "%," + opacity + ")";
        //console.log("hsla(" + (180+25*distance) + ", 100%, " + (50 + exposure*5) + "%," + opacity + ")");
        ctx.fillRect(project(cam, pt).x, project(cam, pt).y, 1, 1);
        lastPt.x = pt.x;
        lastPt.y = pt.y;
        lastPt.z = pt.z;
    }
}

function generateCoeffs() {
    pt = new Vector(1,1,1);

    for (let i = 0; i < 6; i++) {
        a[i] = Math.random() * 6 - 3;
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

exposureSlider.oninput = function () {
    exposure = this.value;
}

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

        cam.position.rotY(-cam.yaw);
        cam.position.rotX(-cam.pitch);

        cam.position.rotX(curPitch - dy/100);
        cam.position.rotY(curYaw - dx/100);
        cam.yaw = curYaw - dx/100;
        cam.pitch = curPitch - dy/100;
    }
});

canvas.addEventListener("mouseup", e => {
    clicking = false;
});

canvas.addEventListener("wheel", e => {
    clearScreen("black");
    let multiplier = (e.deltaY != 0) ? 1.1 ** (e.deltaY/Math.abs(e.deltaY)) : 1;
    cam.width *= multiplier;
    cam.height *= multiplier;
});