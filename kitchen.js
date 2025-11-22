// Scene setup
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

var camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(8, 5, 8);
camera.lookAt(0, 0, 0);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadow;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lights
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

var sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(10, 15, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.left = -15;
sunLight.shadow.camera.right = 15;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -15;
scene.add(sunLight);

// Materials
var floorMat = new THREE.MeshStandardMaterial({ 
    color: 0xDEB887, 
    roughness: 0.8 
});
var wallMat = new THREE.MeshStandardMaterial({ 
    color: 0xFAF0E6, 
    roughness: 0.9 
});
var woodMat = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, 
    roughness: 0.7 
});
var steelMat = new THREE.MeshStandardMaterial({ 
    color: 0xC0C0C0, 
    metalness: 0.8, 
    roughness: 0.2 
});
var counterMat = new THREE.MeshStandardMaterial({ 
    color: 0x654321, 
    roughness: 0.4 
});
var terraceMat = new THREE.MeshStandardMaterial({ 
    color: 0xA0826D, 
    roughness: 0.9 
});

// Helper function to create box with shadow
function createBox(w, h, d, mat, x, y, z, castShadow, receiveShadow) {
    if (castShadow === undefined) castShadow = true;
    if (receiveShadow === undefined) receiveShadow = true;
    
    var geo = new THREE.BoxGeometry(w, h, d);
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    scene.add(mesh);
    return mesh;
}

// KITCHEN FLOOR (4.20m x 2.72m)
var kitchenFloor = createBox(4.2, 0.02, 2.72, floorMat, 0, 0.01, 0);

// TERRACE FLOOR (angled trapezoid shape)
var terraceShape = new THREE.Shape();
terraceShape.moveTo(0, 0);
terraceShape.lineTo(0, 2.72);
terraceShape.lineTo(3.57, 2.72);
terraceShape.lineTo(3.57 - 0.8, 0);
terraceShape.closePath();

var terraceGeo = new THREE.ExtrudeGeometry(terraceShape, {
    depth: 0.02,
    bevelEnabled: false
});
var terraceMesh = new THREE.Mesh(terraceGeo, terraceMat);
terraceMesh.rotation.x = -Math.PI / 2;
terraceMesh.position.set(4.2/2, 0.01, -2.72/2);
terraceMesh.castShadow = false;
terraceMesh.receiveShadow = true;
scene.add(terraceMesh);

// WALLS
// Back wall
createBox(4.2, 2.5, 0.15, wallMat, 0, 1.25, -2.72/2 - 0.075);

// Left wall
createBox(0.15, 2.5, 2.72, wallMat, -4.2/2 - 0.075, 1.25, 0);

// Right wall sections (with door opening)
createBox(0.15, 2.5, 2.72/2 - 0.6, wallMat, 4.2/2 + 0.075, 1.25, -2.72/4 - 0.3);
createBox(0.15, 2.5, 2.72/2 - 0.6, wallMat, 4.2/2 + 0.075, 1.25, 2.72/4 + 0.3);
createBox(0.15, 0.4, 1.2, wallMat, 4.2/2 + 0.075, 2.3, 0);

// Front wall with window
// Left section
createBox(2.47, 2.5, 0.15, wallMat, -4.2/2 + 2.47/2, 1.25, 2.72/2 + 0.075);

// Right section
createBox(4.2 - 2.47 - 1.2, 2.5, 0.15, wallMat, 4.2/2 - (4.2 - 2.47 - 1.2)/2, 1.25, 2.72/2 + 0.075);

// Window bottom
createBox(1.2, 0.7, 0.15, wallMat, -4.2/2 + 2.47 + 1.2/2, 0.35, 2.72/2 + 0.075);

// Window top
createBox(1.2, 0.5, 0.15, wallMat, -4.2/2 + 2.47 + 1.2/2, 2.25, 2.72/2 + 0.075);

// Window frame
var windowFrame = createBox(1.2, 1.4, 0.08, woodMat, -4.2/2 + 2.47 + 1.2/2, 1.4, 2.72/2 + 0.12);

// Window glass
var glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xADD8E6, 
    transparent: true, 
    opacity: 0.4,
    metalness: 0.1
});
var windowGlass = createBox(1.1, 1.3, 0.02, glassMat, -4.2/2 + 2.47 + 1.2/2, 1.4, 2.72/2 + 0.16);

// RANGE COOKER (left front corner)
var rangeCooker = createBox(0.6, 0.85, 0.6, steelMat, -4.2/2 + 0.4, 0.425, 2.72/2 - 0.4);

// Cooktop
var cooktopMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
createBox(0.58, 0.03, 0.58, cooktopMat, -4.2/2 + 0.4, 0.87, 2.72/2 - 0.4);

// Burners on range cooker
var burnerMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
        var burner = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32),
            burnerMat
        );
        burner.position.set(
            -4.2/2 + 0.4 + (i - 0.5) * 0.25,
            0.89,
            2.72/2 - 0.4 + (j - 0.5) * 0.25
        );
        burner.castShadow = true;
        scene.add(burner);
    }
}

// FRIDGE (next to range cooker)
var fridge = createBox(0.65, 1.8, 0.65, steelMat, -4.2/2 + 1.2, 0.9, 2.72/2 - 0.4);

// Fridge handles
var handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
createBox(0.04, 0.3, 0.04, handleMat, -4.2/2 + 1.2 + 0.28, 1.3, 2.72/2 - 0.4);
createBox(0.04, 0.3, 0.04, handleMat, -4.2/2 + 1.2 + 0.28, 0.6, 2.72/2 - 0.4);

// KITCHEN SINK WITH COUNTER
var sinkBase = createBox(0.8, 0.8, 0.6, counterMat, -4.2/2 + 2.47 + 1.2/2, 0.4, 2.72/2 - 0.35);
var counterTop = createBox(0.8, 0.05, 0.6, counterMat, -4.2/2 + 2.47 + 1.2/2, 0.85, 2.72/2 - 0.35);

// Sink basin
var sinkBasin = createBox(0.5, 0.15, 0.4, steelMat, -4.2/2 + 2.47 + 1.2/2, 0.77, 2.72/2 - 0.35);

// Faucet
var faucetBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.08, 16),
    steelMat
);
faucetBase.position.set(-4.2/2 + 2.47 + 1.2/2, 0.92, 2.72/2 - 0.2);
faucetBase.castShadow = true;
scene.add(faucetBase);

var faucetNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.25, 16),
    steelMat
);
faucetNeck.position.set(-4.2/2 + 2.47 + 1.2/2, 1.08, 2.72/2 - 0.2);
faucetNeck.castShadow = true;
scene.add(faucetNeck);

var faucetHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 16, 16),
    steelMat
);
faucetHead.position.set(-4.2/2 + 2.47 + 1.2/2, 1.21, 2.72/2 - 0.2);
scene.add(faucetHead);

// COFFEE CORNER (top center area)
var coffeeCounter = createBox(1.8, 0.8, 0.5, counterMat, 0.3, 0.4, -2.72/2 + 0.3);
var coffeeTop = createBox(1.8, 0.05, 0.5, counterMat, 0.3, 0.85, -2.72/2 + 0.3);

// Coffee machine
var coffeeMachineMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
var coffeeMachine = createBox(0.35, 0.45, 0.35, coffeeMachineMat, -0.3, 1.125, -2.72/2 + 0.3);

// Coffee machine display
var displayMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00 });
createBox(0.12, 0.08, 0.02, displayMat, -0.3, 1.2, -2.72/2 + 0.3 + 0.18);

// Coffee cups on counter
var cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
for (var i = 0; i < 3; i++) {
    var cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 0.08, 16),
        cupMat
    );
    cup.position.set(0.5 + i * 0.15, 0.92, -2.72/2 + 0.3);
    cup.castShadow = true;
    scene.add(cup);

    // Cup handle
    var handleGeo = new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI);
    var handle = new THREE.Mesh(handleGeo, cupMat);
    handle.rotation.y = Math.PI / 2;
    handle.position.set(0.5 + i * 0.15 + 0.04, 0.92, -2.72/2 + 0.3);
    scene.add(handle);
}

// POTAGER (4-burner stove near door)
var potagerCounter = createBox(0.6, 0.85, 0.6, counterMat, 4.2/2 - 0.4, 0.425, 0);
var potagerTop = createBox(0.6, 0.05, 0.6, steelMat, 4.2/2 - 0.4, 0.88, 0);

// Potager burners
for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
        var burner = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32),
            burnerMat
        );
        burner.position.set(
            4.2/2 - 0.4 + (i - 0.5) * 0.25,
            0.92,
            0 + (j - 0.5) * 0.25
        );
        burner.castShadow = true;
        scene.add(burner);
    }
}

// DOOR TO TERRACE
var doorFrame = createBox(0.9, 2.1, 0.15, woodMat, 4.2/2 + 0.075, 1.05, 0);
var doorPanelMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
var doorPanel = createBox(0.8, 2.0, 0.05, doorPanelMat, 4.2/2 + 0.12, 1.05, 0);

// Door handle
var doorHandleMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9 });
var doorHandle = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    doorHandleMat
);
doorHandle.position.set(4.2/2 + 0.15, 1.05, -0.3);
doorHandle.castShadow = true;
scene.add(doorHandle);

// TERRACE FENCE/RAILING
var railHeight = 1.0;
var postMat = new THREE.MeshStandardMaterial({ color: 0x654321 });

// Back fence (along back edge of terrace)
for (var i = 0; i <= 8; i++) {
    var post = createBox(0.06, railHeight, 0.06, postMat, 
        4.2/2 + (3.57 - 0.8) * (i / 8), railHeight / 2, -2.72/2);
}
// Top rail back
createBox(3.57 - 0.8, 0.06, 0.1, postMat, 4.2/2 + (3.57 - 0.8)/2, railHeight, -2.72/2);

// Front angled fence
var angleLength = Math.sqrt(Math.pow(0.8, 2) + Math.pow(2.72, 2));
for (var i = 0; i <= 8; i++) {
    var t = i / 8;
    var post = createBox(0.06, railHeight, 0.06, postMat,
        4.2/2 + 3.57 - 0.8 * t,
        railHeight / 2,
        -2.72/2 + 2.72 * t
    );
}

// Angled top rail
var railAngle = new THREE.Mesh(
    new THREE.BoxGeometry(angleLength, 0.06, 0.1),
    postMat
);
railAngle.rotation.y = Math.atan2(2.72, -0.8);
railAngle.position.set(4.2/2 + 3.57 - 0.4, railHeight, 2.72/2 - 1.36);
railAngle.castShadow = true;
scene.add(railAngle);

// Right side fence (short side)
for (var i = 0; i <= 5; i++) {
    var post = createBox(0.06, railHeight, 0.06, postMat,
        4.2/2 + 3.57,
        railHeight / 2,
        -2.72/2 + (2.72 * i / 5)
    );
}
// Top rail right
createBox(0.1, 0.06, 2.72, postMat, 4.2/2 + 3.57, railHeight, 0);

// TERRACE FURNITURE
// Table
var tableTop = createBox(1.2, 0.04, 0.8, woodMat, 5.5, 0.74, 0);

// Table legs
for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
        createBox(0.06, 0.7, 0.06, woodMat,
            5.5 + (i - 0.5) * 1.0,
            0.35,
            (j - 0.5) * 0.6
        );
    }
}

// Chairs
for (var c = 0; c < 2; c++) {
    var chairX = 5.5 + (c === 0 ? -0.9 : 0.9);
    
    // Seat
    createBox(0.4, 0.05, 0.4, woodMat, chairX, 0.48, 0.1);
    
    // Backrest
    createBox(0.4, 0.5, 0.05, woodMat, chairX, 0.73, -0.075);
    
    // Legs
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 2; j++) {
            createBox(0.05, 0.48, 0.05, woodMat,
                chairX + (i - 0.5) * 0.3,
                0.24,
                0.1 + (j - 0.5) * 0.3
            );
        }
    }
}

// Grid helper (for reference)
var gridHelper = new THREE.GridHelper(15, 30, 0x888888, 0xcccccc);
gridHelper.position.y = 0;
scene.add(gridHelper);

// Animation
var mouseX = 0;
var mouseY = 0;

document.addEventListener('mousemove', function(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);

    // Smooth camera movement
    var targetX = 8 + mouseX * 4;
    var targetY = 5 + mouseY * 2;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(2, 0.5, 0);

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});