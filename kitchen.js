var scene, camera, renderer, directionalLight;
var walls = [];
var cabinets = [];
var counter, floor, terraceFloor;
var currentView = 'perspective';
var isRotating = true;
var angle = 0;
var isDragging = false;
var previousMousePosition = { x: 0, y: 0 };
var cameraRotation = { x: 0.3, y: 0 };
var cameraDistance = 8;

// Touch support
var touchStartX = 0;
var touchStartY = 0;
var touchStartDistance = 0;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 15, 50);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(6, 4, 6);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(8, 12, 8);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  scene.add(directionalLight);

  var pointLight = new THREE.PointLight(0xffffff, 0.3);
  pointLight.position.set(0, 2.5, 0);
  scene.add(pointLight);

  createKitchen();
  addControls();
  animate();
}

function createKitchen() {
  // KITCHEN FLOOR (4.20m x 2.72m)
  var floorMat = new THREE.MeshStandardMaterial({
    color: 0xd4b896,
    roughness: 0.8,
    metalness: 0.2
  });
  floor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.72), floorMat);
  floor.position.set(0, -0.05, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // TERRACE FLOOR - Proper angled trapezoid shape
  var terraceShape = new THREE.Shape();
  terraceShape.moveTo(0, 0);
  terraceShape.lineTo(0, 2.72);
  terraceShape.lineTo(3.57, 2.72);
  terraceShape.lineTo(3.57 - 0.8, 0);
  terraceShape.closePath();

  var terraceGeo = new THREE.ExtrudeGeometry(terraceShape, {
    depth: 0.1,
    bevelEnabled: false
  });
  var terraceMat = new THREE.MeshStandardMaterial({
    color: 0xa8a8a8,
    roughness: 0.9,
    metalness: 0.1
  });
  terraceFloor = new THREE.Mesh(terraceGeo, terraceMat);
  terraceFloor.rotation.x = -Math.PI / 2;
  terraceFloor.position.set(4.2/2, -0.05, -2.72/2);
  terraceFloor.receiveShadow = true;
  scene.add(terraceFloor);

  var wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc,
    roughness: 0.9,
    metalness: 0.1
  });

  // KITCHEN WALLS
  // Back wall
  var backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 0.15), wallMat);
  backWall.position.set(0, 1.25, -2.72/2 - 0.075);
  backWall.receiveShadow = true;
  walls.push(backWall);
  scene.add(backWall);

  // Left wall
  var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72), wallMat);
  leftWall.position.set(-4.2/2 - 0.075, 1.25, 0);
  leftWall.receiveShadow = true;
  walls.push(leftWall);
  scene.add(leftWall);

  // Right wall sections (with door opening)
  var rightWallTop = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72/2 - 0.6), wallMat);
  rightWallTop.position.set(4.2/2 + 0.075, 1.25, -2.72/4 - 0.3);
  rightWallTop.receiveShadow = true;
  walls.push(rightWallTop);
  scene.add(rightWallTop);

  var rightWallBottom = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72/2 - 0.6), wallMat);
  rightWallBottom.position.set(4.2/2 + 0.075, 1.25, 2.72/4 + 0.3);
  rightWallBottom.receiveShadow = true;
  walls.push(rightWallBottom);
  scene.add(rightWallBottom);

  var doorTop = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 1.2), wallMat);
  doorTop.position.set(4.2/2 + 0.075, 2.35, 0);
  doorTop.receiveShadow = true;
  walls.push(doorTop);
  scene.add(doorTop);

  // Front wall with window (2.47m + window + remaining)
  var frontLeftWall = new THREE.Mesh(new THREE.BoxGeometry(2.47, 2.5, 0.15), wallMat);
  frontLeftWall.position.set(-4.2/2 + 2.47/2, 1.25, 2.72/2 + 0.075);
  frontLeftWall.receiveShadow = true;
  walls.push(frontLeftWall);
  scene.add(frontLeftWall);

  var frontRightWall = new THREE.Mesh(new THREE.BoxGeometry(4.2 - 2.47 - 1.2, 2.5, 0.15), wallMat);
  frontRightWall.position.set(4.2/2 - (4.2 - 2.47 - 1.2)/2, 1.25, 2.72/2 + 0.075);
  frontRightWall.receiveShadow = true;
  walls.push(frontRightWall);
  scene.add(frontRightWall);

  // Window bottom and top
  var windowBottom = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.15), wallMat);
  windowBottom.position.set(-4.2/2 + 2.47 + 1.2/2, 0.35, 2.72/2 + 0.075);
  windowBottom.receiveShadow = true;
  walls.push(windowBottom);
  scene.add(windowBottom);

  var windowTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.15), wallMat);
  windowTop.position.set(-4.2/2 + 2.47 + 1.2/2, 2.25, 2.72/2 + 0.075);
  windowTop.receiveShadow = true;
  walls.push(windowTop);
  scene.add(windowTop);

  // Window frame and glass
  var frameMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
    metalness: 0.2
  });
  var windowFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.08), frameMat);
  windowFrame.position.set(-4.2/2 + 2.47 + 1.2/2, 1.4, 2.72/2 + 0.12);
  windowFrame.castShadow = true;
  scene.add(windowFrame);

  var glassMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0.9
  });
  var windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.02), glassMat);
  windowGlass.position.set(-4.2/2 + 2.47 + 1.2/2, 1.4, 2.72/2 + 0.16);
  scene.add(windowGlass);

  // TERRACE WALLS (proper angled shape)
  // Back terrace wall
  var terraceBackWall = new THREE.Mesh(new THREE.BoxGeometry(3.57 - 0.8, 2.5, 0.15), wallMat);
  terraceBackWall.position.set(4.2/2 + (3.57 - 0.8)/2, 1.25, -2.72/2 - 0.075);
  terraceBackWall.receiveShadow = true;
  walls.push(terraceBackWall);
  scene.add(terraceBackWall);

  // Right terrace wall
  var terraceRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72), wallMat);
  terraceRightWall.position.set(4.2/2 + 3.57 + 0.075, 1.25, 0);
  terraceRightWall.receiveShadow = true;
  walls.push(terraceRightWall);
  scene.add(terraceRightWall);

  // Angled front terrace wall
  var angleLength = Math.sqrt(Math.pow(0.8, 2) + Math.pow(2.72, 2));
  var angledWall = new THREE.Mesh(new THREE.BoxGeometry(angleLength, 2.5, 0.15), wallMat);
  angledWall.position.set(4.2/2 + 3.57 - 0.4, 1.25, 0);
  angledWall.rotation.y = Math.atan2(2.72, -0.8);
  angledWall.receiveShadow = true;
  walls.push(angledWall);
  scene.add(angledWall);

  // DOOR between kitchen and terrace
  var doorFrameMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
    metalness: 0.2
  });

  var doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.12), doorFrameMat);
  doorFrame.position.set(4.2/2 + 0.08, 1.05, 0);
  doorFrame.castShadow = true;
  scene.add(doorFrame);

  var doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.05), glassMat);
  doorPanel.position.set(4.2/2 + 0.1, 1.05, 0);
  scene.add(doorPanel);

  var handleMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 0.8
  });
  var doorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 16), handleMat);
  doorHandle.rotation.z = Math.PI / 2;
  doorHandle.position.set(4.2/2 + 0.12, 1.05, -0.4);
  doorHandle.castShadow = true;
  scene.add(doorHandle);

  // TERRACE RAILING
  var railMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.4,
    metalness: 0.7
  });

  // Back railing
  for (var i = 0; i <= 8; i++) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), railMat);
    post.position.set(4.2/2 + (3.57 - 0.8) * (i / 8), 0.5, -2.72/2);
    post.castShadow = true;
    scene.add(post);
  }
  var backRail = new THREE.Mesh(new THREE.BoxGeometry(3.57 - 0.8, 0.06, 0.1), railMat);
  backRail.position.set(4.2/2 + (3.57 - 0.8)/2, 1.0, -2.72/2);
  backRail.castShadow = true;
  scene.add(backRail);

  // Right side railing
  for (var i = 0; i <= 6; i++) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), railMat);
    post.position.set(4.2/2 + 3.57, 0.5, -2.72/2 + (2.72 * i / 6));
    post.castShadow = true;
    scene.add(post);
  }
  var rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 2.72), railMat);
  rightRail.position.set(4.2/2 + 3.57, 1.0, 0);
  rightRail.castShadow = true;
  scene.add(rightRail);

  // Angled front railing
  for (var i = 0; i <= 8; i++) {
    var t = i / 8;
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), railMat);
    post.position.set(
      4.2/2 + 3.57 - 0.8 * t,
      0.5,
      -2.72/2 + 2.72 * t
    );
    post.castShadow = true;
    scene.add(post);
  }
  var angleRailLength = Math.sqrt(Math.pow(0.8, 2) + Math.pow(2.72, 2));
  var angledRail = new THREE.Mesh(new THREE.BoxGeometry(angleRailLength, 0.06, 0.1), railMat);
  angledRail.rotation.y = Math.atan2(2.72, -0.8);
  angledRail.position.set(4.2/2 + 3.57 - 0.4, 1.0, 0);
  angledRail.castShadow = true;
  scene.add(angledRail);

  // KITCHEN APPLIANCES
  // Range Cooker (left front)
  var steelMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.8
  });
  var rangeCooker = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.6), steelMat);
  rangeCooker.position.set(-4.2/2 + 0.4, 0.425, 2.72/2 - 0.4);
  rangeCooker.castShadow = true;
  scene.add(rangeCooker);

  var cooktopMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  var cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.03, 0.58), cooktopMat);
  cooktop.position.set(-4.2/2 + 0.4, 0.87, 2.72/2 - 0.4);
  scene.add(cooktop);

  // 4 burners
  var burnerMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
      var burner = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32), burnerMat);
      burner.position.set(
        -4.2/2 + 0.4 + (i - 0.5) * 0.25,
        0.89,
        2.72/2 - 0.4 + (j - 0.5) * 0.25
      );
      scene.add(burner);
    }
  }

  // Fridge
  var fridge = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.8, 0.65), steelMat);
  fridge.position.set(-4.2/2 + 1.2, 0.9, 2.72/2 - 0.4);
  fridge.castShadow = true;
  scene.add(fridge);

  // Kitchen Counter and Sink
  var counterMat = new THREE.MeshStandardMaterial({
    color: 0x2f4f4f,
    roughness: 0.3,
    metalness: 0.6
  });
  counter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.6), counterMat);
  counter.position.set(0, 0.88, -2.72/2 + 0.35);
  counter.castShadow = true;
  scene.add(counter);

  var sinkMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9
  });
  var sink = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.15, 32), sinkMat);
  sink.position.set(-4.2/2 + 2.47 + 1.2/2, 0.83, -2.72/2 + 0.35);
  sink.castShadow = true;
  scene.add(sink);

  // Faucet
  var faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16), sinkMat);
  faucetBase.position.set(-4.2/2 + 2.47 + 1.2/2, 0.95, -2.72/2 + 0.2);
  scene.add(faucetBase);

  var faucetNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 16), sinkMat);
  faucetNeck.position.set(-4.2/2 + 2.47 + 1.2/2, 1.1, -2.72/2 + 0.2);
  scene.add(faucetNeck);

  // Potager (near door)
  var cabinetMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
    metalness: 0.3
  });
  var potagerBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.6), cabinetMat);
  potagerBase.position.set(4.2/2 - 0.4, 0.425, 0);
  potagerBase.castShadow = true;
  cabinets.push(potagerBase);
  scene.add(potagerBase);

  var potagerTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.6), steelMat);
  potagerTop.position.set(4.2/2 - 0.4, 0.88, 0);
  scene.add(potagerTop);

  // Potager burners (4 burners)
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
      var burner = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32), burnerMat);
      burner.position.set(
        4.2/2 - 0.4 + (i - 0.5) * 0.25,
        0.92,
        0 + (j - 0.5) * 0.25
      );
      scene.add(burner);
    }
  }

  // Coffee Corner
  var coffeeCounter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.5), cabinetMat);
  coffeeCounter.position.set(0.5, 0.4, -2.72/2 + 0.3);
  coffeeCounter.castShadow = true;
  cabinets.push(coffeeCounter);
  scene.add(coffeeCounter);

  var coffeeTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.5), counterMat);
  coffeeTop.position.set(0.5, 0.85, -2.72/2 + 0.3);
  scene.add(coffeeTop);

  var coffeeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  var coffeeMachine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), coffeeMat);
  coffeeMachine.position.set(0.2, 1.1, -2.72/2 + 0.3);
  coffeeMachine.castShadow = true;
  scene.add(coffeeMachine);

  // Coffee cups
  var cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (var i = 0; i < 3; i++) {
    var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.08, 16), cupMat);
    cup.position.set(0.8 + i * 0.15, 0.92, -2.72/2 + 0.3);
    cup.castShadow = true;
    scene.add(cup);
  }

  // TERRACE FURNITURE
  var tableMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.6,
    metalness: 0.3
  });

  // Table
  var tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), tableMat);
  tableTop.position.set(5.5, 0.74, 0);
  tableTop.castShadow = true;
  scene.add(tableTop);

  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), tableMat);
      leg.position.set(
        5.5 + (i - 0.5) * 1.0,
        0.35,
        (j - 0.5) * 0.6
      );
      leg.castShadow = true;
      scene.add(leg);
    }
  }

  // Chairs
  var chairMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7,
    metalness: 0.2
  });

  for (var c = 0; c < 2; c++) {
    var chairX = 5.5 + (c === 0 ? -1.0 : 1.0);
    
    var seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), chairMat);
    seat.position.set(chairX, 0.48, 0);
    seat.castShadow = true;
    scene.add(seat);

    var back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.05), chairMat);
    back.position.set(chairX, 0.73, -0.175);
    back.castShadow = true;
    scene.add(back);

    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 2; j++) {
        var leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), chairMat);
        leg.position.set(
          chairX + (i - 0.5) * 0.3,
          0.24,
          (j - 0.5) * 0.3
        );
        leg.castShadow = true;
        scene.add(leg);
      }
    }
  }

  // Ceiling
  var ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9
  });
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 2.72), ceilingMat);
  ceiling.position.set(0, 2.5, 0);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // Grid helper
  var grid = new THREE.GridHelper(20, 40, 0x888888, 0xcccccc);
  grid.position.y = 0;
  scene.add(grid);
}

function addControls() {
  var canvas = renderer.domElement;
  
  // Mouse controls
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);
  canvas.addEventListener('wheel', onMouseWheel, { passive: false });
  
  // Touch controls
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);
}

function onMouseDown(e) {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
  isRotating = false;
}

function onMouseMove(e) {
  if (!isDragging) return;

  var deltaX = e.clientX - previousMousePosition.x;
  var deltaY = e.clientY - previousMousePosition.y;

  cameraRotation.y += deltaX * 0.005;
  cameraRotation.x += deltaY * 0.005;
  cameraRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.x));

  updateCameraPosition();
  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseUp() {
  isDragging = false;
}

function onMouseWheel(e) {
  e.preventDefault();
  cameraDistance += e.deltaY * 0.01;
  cameraDistance = Math.max(4, Math.min(15, cameraDistance));
  updateCameraPosition();
}

function onTouchStart(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    isRotating = false;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    var dx = e.touches[0].clientX - e.touches[1].clientX;
    var dy = e.touches[0].clientY - e.touches[1].clientY;
    touchStartDistance = Math.sqrt(dx * dx + dy * dy);
  }
}

function onTouchMove(e) {
  e.preventDefault();
  
  if (e.touches.length === 1 && isDragging) {
    var deltaX = e.touches[0].clientX - touchStartX;
    var deltaY = e.touches[0].clientY - touchStartY;
    
    cameraRotation.y += deltaX * 0.005;
    cameraRotation.x += deltaY * 0.005;
    cameraRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.x));
    
    updateCameraPosition();
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    var dx = e.touches[0].clientX - e.touches[1].clientX;
    var dy = e.touches[0].clientY - e.touches[1].clientY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    var delta = distance - touchStartDistance;
    cameraDistance -= delta * 0.02;
    cameraDistance = Math.max(4, Math.min(15, cameraDistance));
    
    updateCameraPosition();
    touchStartDistance = distance;
  }
}

function onTouchEnd() {
  isDragging = false;
}

function updateCameraPosition() {
  if (currentView === 'perspective') {
    var x = Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x) * cameraDistance;
    var y = Math.sin(cameraRotation.x) * cameraDistance + 2;
    var z = Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x) * cameraDistance;
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 1, 0);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (isRotating && currentView === 'perspective' && !isDragging) {
    angle += 0.002;
    cameraRotation.y = angle;
    updateCameraPosition();
  }

  renderer.render(scene, camera);
}

function setView(view) {
  currentView = view;
  var buttons = document.querySelectorAll('#controls button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  document.getElementById('btn-' + view).classList.add('active');

  isRotating = false;

  if (view === 'perspective') {
    cameraRotation = { x: 0.3, y: angle };
    cameraDistance = 8;
    updateCameraPosition();
  } else if (view === 'front') {
    camera.position.set(0, 1.5, 6);
    camera.lookAt(0, 1, 0);
  } else if (view === 'top') {
    camera.position.set(2, 10, 0);
    camera.lookAt(2, 0, 0);
  } else if (view === 'side') {
    camera.position.set(8, 1.5, 0);
    camera.lookAt(0, 1, 0);
  }
}

function changeWallColor(color) {
  for (var i = 0; i < walls.length; i++) {
    walls[i].material.color.set(color);
  }
}

function changeCabinetColor(color) {
  for (var i = 0; i < cabinets.length; i++) {
    cabinets[i].material.color.set(color);
  }
}

function changeCounterColor(color) {
  counter.material.color.set(color);
}

function changeFloorColor(color) {
  floor.material.color.set(color);
  terraceFloor.material.color.set(color);
}

function changeLighting(value) {
  directionalLight.intensity = parseFloat(value);
  document.getElementById('lightValue').textContent = value;
}

function toggleRotation() {
  isRotating = !isRotating;
  var btn = document.getElementById('rotateBtn');
  if (isRotating) {
    btn.textContent = 'Pause Rotation';
  } else {
    btn.textContent = 'Resume Rotation';
  }
}

function resetCamera() {
  cameraRotation = { x: 0.3, y: 0 };
  cameraDistance = 8;
  angle = 0;
  isRotating = true;
  setView('perspective');
  document.getElementById('rotateBtn').textContent = 'Pause Rotation';
}

function toggleControls() {
  var controls = document.getElementById('controls');
  var btn = document.getElementById('toggleBtn');
  
  if (controls.style.display === 'none' || controls.style.display === '') {
    controls.style.display = 'block';
    btn.textContent = '✕';
  } else {
    controls.style.display = 'none';
    btn.textContent = '☰';
  }
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', init);