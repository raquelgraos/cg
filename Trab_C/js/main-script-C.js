import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var renderer;

var cameras = [];
var scene, camera;

const materials = new Map();

var geometry, mesh;
var flowerField;
var moon, ufo;

var globalLight = new THREE.DirectionalLight(0xffffff, 0.6);
var spotlight;
var pointLights = [];

var movementVector = new THREE.Vector3(0, 0, 0)
const clock = new THREE.Clock();
var delta;

let leftKey = false, upKey = false, rightKey = false, downKey = false;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color('#4a4a4a');

    createFlowerField(0, -20, 10);
    
    createMoon(25, 40, 0);
    //populateCorkOaks();
    //createHouse();
    createUFO(-15, 20, -4);
}

function createFlowerField(x, y, z) {
    
    geometry = new THREE.PlaneGeometry(200, 150, 100, 100);
    mesh = new THREE.Mesh(geometry, materials.get("flowerField"));

    flowerField = new THREE.Object3D();
    flowerField.add(mesh);

    flowerField.rotation.x = 3*Math.PI / 2;
    flowerField.position.set(x, y, z);
    scene.add(flowerField);

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCameras() {
    
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    
    camera.position.set(80, 55, 80); 
    camera.lookAt(scene.position);

    cameras.push(camera);   
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function createLights() {

    globalLight.position.set(moon.position.x, moon.position.y, moon.position.z);
    globalLight.target.position.set(Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4));
    scene.add(globalLight);
    scene.add(globalLight.target);
}

function updatePointlights() {
    pointLights.forEach((light) => {
                light.visible = !light.visible;
            })
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterials() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./heightmap.png');

    materials.set("flowerField", new THREE.MeshPhongMaterial({ bumpMap: texture, bumpScale: 5, displacementMap: texture, displacementScale: 20 }));
    
    materials.set("moon", new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 })); //white
    
    materials.set("stripped trunk", new THREE.MeshBasicMaterial({ color: 0xa14a0d })); // orange brown
    materials.set("trunk", new THREE.MeshBasicMaterial({ color: 0x3d1c05 })); // dark brown
    materials.set("leaves", new THREE.MeshBasicMaterial({ color: 0x1b3d05 })); // dark green
    
    materials.set("ufo", new THREE.MeshLambertMaterial({ color: 0x666464 })); // dark gray
    materials.set("cockpit", new THREE.MeshLambertMaterial({ color: 0x808080 }));  // gray
    materials.set("cylinder", new THREE.MeshLambertMaterial({ color: 0xf5a958 })); // light orange
    materials.set("light", new THREE.MeshLambertMaterial({ color: 0x78f556 })); // neon green
    
    materials.set("walls", new THREE.MeshBasicMaterial({ color: 0xffffff })); //white
    materials.set("door", new THREE.MeshBasicMaterial({ color: 0x358edb })); // vivid blue
    materials.set("roof", new THREE.MeshBasicMaterial({ color: 0xde5721 })); // vivid orange
}

function createMoon(x, y, z) {

    geometry = new THREE.SphereGeometry(3, 64, 32);
    mesh = new THREE.Mesh(geometry, materials.get("moon"));

    moon = new THREE.Object3D();
    moon.add(mesh);

    scene.add(moon);
    moon.position.set(x, y, z);
}

function addLights() {
    const nLights = 8;

    let angle;
    for (let i = 0; i < nLights; i++) {
        
        geometry = new THREE.SphereGeometry(0.20, 25, 50);
        mesh = new THREE.Mesh(geometry, materials.get("light"));
        mesh.position.set(2.5, -0.2, 0);
        mesh.rotation.x = Math.PI;

        var pointlight = new THREE.PointLight(0x78f556, 0.5);
        pointLights.push(pointlight);

        var light = new THREE.Object3D();
        light.add(mesh);
        light.add(pointlight);

        angle = i * (2 * Math.PI) / nLights;
        light.rotation.y = angle;

        ufo.add(light);
    }
}

function createUFO(x, y, z) {

    ufo = new THREE.Object3D();
    
    // body
    geometry = new THREE.SphereGeometry(3, 25, 50);
    mesh = new THREE.Mesh(geometry, materials.get("ufo"));
    mesh.scale.set(1, 0.2, 1);
    
    ufo.add(mesh);

    // cockpit
    geometry = new THREE.SphereGeometry(1, 25, 50, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
    mesh = new THREE.Mesh(geometry, materials.get("cockpit"));
    mesh.position.set(0, 0.5, 0);

    ufo.add(mesh);

    // cylinder
    geometry = new THREE.CylinderGeometry(1, 1, 0.2, 50);
    mesh = new THREE.Mesh(geometry, materials.get("cylinder"));
    mesh.position.set(0, -0.5, 0);

    spotlight = new THREE.SpotLight(0xf5c958, 0.7);
    spotlight.target.position.set(0, -20, 0); // FIX: não funciona idk

    mesh.add(spotlight);
    mesh.add(spotlight.target);

    ufo.add(mesh);

    addLights();

    ufo.position.set(x, y, z);
    scene.add(ufo);
}

/*function populateCorkOaks() {
    
    const nTrees = 3;

    for (let i = 0; i < nTrees; i++) {
        createCorkOak();
    }
}*/

function createCorkOak(x, y, z) {

    var corkOak = new THREE.Object3D();

    var trunk = new THREE.Object3D();

    // stripped trunk
    var strippedHeight = THREE.MathUtils.randFloat(4, 6.5);
    geometry = new THREE.CylinderGeometry(0.9, 0.9, strippedHeight);
    mesh = new THREE.Mesh(geometry, materials.get("stripped trunk"));

    trunk.add(mesh);

    // trunk
    var trunkHeight = strippedHeight / 2;
    geometry = new THREE.CylinderGeometry(1, 1, trunkHeight);
    mesh = new THREE.Mesh(geometry, materials.get("trunk"));
    mesh.position.set(0, strippedHeight / 2, 0)

    trunk.add(mesh);

    trunk.rotation.z = THREE.MathUtils.degToRad(15);

    corkOak.add(trunk);

    // branch
    //addBranch(x, y, z, corkOak);
    //addBranch(x, y, z, corkOak);
    //addBranch(x, y, z, corkOak);

    // leaves
    //addLeaves(x, y, z, corkOak);

    corkOak.position.set(x, y, z);
    scene.add(corkOak);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {

    delta = clock.getDelta();

    handleUFOMovement();
    var tentativePos = updateUFOPositions(delta);

    ufo.position.x = tentativePos.x;
    ufo.position.z = tentativePos.z;
}

function handleUFOMovement() {

    ufo.rotation.y += 0.008; // ufo spins in constant speed

    movementVector.set(0, 0, 0);
    
    if (leftKey) {
        movementVector.z += 10;
    } if (upKey) {
        movementVector.x -= 10;
    } if (rightKey) {
        movementVector.z -= 10;
    } if (downKey) {
        movementVector.x += 10;
    }
}

function updateUFOPositions(delta) {

    var newPositionX = ufo.position.x + movementVector.x * delta;
    var newPositionZ = ufo.position.z + movementVector.z * delta;

    return new THREE.Vector3(newPositionX, 0, newPositionZ);
}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {

    renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

    createMaterials();
    createScene();
    createLights();
    createCameras();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {

    update();

    render();
    
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {

    switch(e.keyCode) {
        case 37: // left arrow
            leftKey = true;
            break;
        case 38: // up arrow
            upKey = true;
            break;
        case 39: // right arrow
            rightKey = true;
            break;
        case 40: // down arrow
            downKey = true;
            break;
        case 55: // 7
            camera = cameras[0];
            break;
        case 68: // d
            globalLight.visible = !globalLight.visible;
            break;
        case 69: // e
            break;
        case 80: // p
            updatePointlights();
            break;
        case 81: // q
           break;
        case 82: // r
           break;
        case 83: // s
            spotlight.visible = !spotlight.visible;
            break;
        case 87: // w
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    switch (e.keyCode) {
        case 37: // left arrow
            leftKey = false;
            break;
        case 38: // up arrow
            upKey = false;
            break;
        case 39: // right arrow
            rightKey = false;
            break;
        case 40: // down arrow
            downKey = false;
            break;
    }
}

init();
animate();