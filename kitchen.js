// Initialize Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5); // Position above and in front
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Utility function to create a box
function createBox(width, height, depth, color, x = 0, y = 0, z = 0) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    return mesh;
}

// Room dimensions (in meters)
const roomWidth = 4.20;
const roomDepth = 2.72;
const wallHeight = 2.5; // Assume standard ceiling height

// Create floor
const floor = createBox(roomWidth, 0.01, roomDepth, 0xddddcc, 0, -0.005, 0);
scene.add(floor);

// Create walls (simplified as boxes)
// Left wall
const leftWall = createBox(0.1, wallHeight, roomDepth, 0xffffff, -roomWidth/2 - 0.05, wallHeight/2, 0);
scene.add(leftWall);

// Right wall (including door area)
const rightWall = createBox(0.1, wallHeight, 3.57, 0xffffff, roomWidth/2 + 0.05, wallHeight/2, 0);
scene.add(rightWall);

// Back wall (top in diagram)
const backWall = createBox(roomWidth, wallHeight, 0.1, 0xffffff, 0, wallHeight/2, roomDepth/2 + 0.05);
scene.add(backWall);

// Front wall (bottom in diagram) — broken for window
const frontWallLeft = createBox(2.47, wallHeight, 0.1, 0xffffff, -roomWidth/2 + 2.47/2, wallHeight/2, -roomDepth/2 - 0.05);
scene.add(frontWallLeft);

const frontWallRight = createBox(3.57, wallHeight, 0.1, 0xffffff, roomWidth/2 - 3.57/2, wallHeight/2, -roomDepth/2 - 0.05);
scene.add(frontWallRight);

// Door (on right wall)
const door = createBox(0.1, 2.0, 0.9, 0x8B4513, roomWidth/2 + 0.05, 1.0, 0.2); // approx position
scene.add(door);

// Window (on front wall)
const windowMesh = createBox(1.20, 1.0, 0.1, 0xADD8E6, 0, 0.5, -roomDepth/2 - 0.05);
scene.add(windowMesh);

// Appliances (all at ground level, y=0)

// Range Cooker (left bottom corner)
const rangeCooker = createBox(0.6, 0.8, 0.6, 0x888888, -1.8, 0.4, -1.36);
scene.add(rangeCooker);

// Fridge (next to cooker)
const fridge = createBox(0.6, 1.7, 0.6, 0x777777, -1.2, 0.85, -1.36);
scene.add(fridge);

// Kitchen Sink (center front)
const sink = createBox(0.5, 0.2, 0.5, 0xaaaaaa, 0, 0.1, -1.36);
scene.add(sink);

// Potager (near door)
const potager = createBox(0.6, 0.6, 0.6, 0x996633, 1.8, 0.3, -0.5);
scene.add(potager);

// Coffee Corner (back wall, centered)
const coffeeCorner = createBox(1.0, 0.5, 0.5, 0x8B4513, 0, 0.25, 1.36 - 0.05);
scene.add(coffeeCorner);

// Add labels (optional, requires TextGeometry or CSS3DRenderer — simplified here with console.log)
console.log("Kitchen 3D Model Loaded!");
console.log("Use mouse to rotate, scroll to zoom.");

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});