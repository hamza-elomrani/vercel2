var scene, camera, renderer, directionalLight;
var walls = [];
var cabinets = [];
var counter, floor;
var currentView = 'perspective';
var isRotating = true;
var angle = 0;
var isDragging = false;
var previousMousePosition = { x: 0, y: 0 };
var cameraRotation = { x: 0, y: 0 };
var cameraDistance = 5;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 10, 50);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(4, 3, 4);
  camera.lookAt(0, 1, -0.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  var pointLight = new THREE.PointLight(0xffffff, 0.4);
  pointLight.position.set(0, 2, 0);
  scene.add(pointLight);

  createKitchen();
  addMouseControls();
  animate();
}

function createKitchen() {
  // Kitchen floor (4.20m x 2.72m)
  var floorMat = new THREE.MeshStandardMaterial();
  floorMat.color = new THREE.Color(0xd4b896);
  floorMat.roughness = 0.8;
  floorMat.metalness = 0.2;
  floor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.72), floorMat);
  floor.position.set(0, -0.05, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Terrace floor
  var terraceMat = new THREE.MeshStandardMaterial();
  terraceMat.color = new THREE.Color(0xa0a0a0);
  terraceMat.roughness = 0.9;
  terraceMat.metalness = 0.1;
  var terraceFloor = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 2.72), terraceMat);
  terraceFloor.position.set(3.85, -0.06, 0);
  terraceFloor.receiveShadow = true;
  scene.add(terraceFloor);

  var gridHelper = new THREE.GridHelper(8, 40, 0x888888, 0xcccccc);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  var wallMat = new THREE.MeshStandardMaterial();
  wallMat.color = new THREE.Color(0xf5f5dc);
  wallMat.roughness = 0.9;
  wallMat.metalness = 0.1;

  // Back wall (full width)
  var backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 0.15), wallMat);
  backWall.position.set(0, 1.25, -1.36);
  backWall.receiveShadow = true;
  walls.push(backWall);
  scene.add(backWall);

  // Left wall (full depth)
  var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72), wallMat);
  leftWall.position.set(-2.1, 1.25, 0);
  leftWall.receiveShadow = true;
  walls.push(leftWall);
  scene.add(leftWall);

  // Right wall - Between kitchen and terrace (partial wall on right side)
  var rightPartialWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 1.5), wallMat);
  rightPartialWall.position.set(2.1, 1.25, -0.61);
  rightPartialWall.receiveShadow = true;
  walls.push(rightPartialWall);
  scene.add(rightPartialWall);

  // Front left wall (2.47m section)
  var frontLeftWall = new THREE.Mesh(new THREE.BoxGeometry(2.47, 2.5, 0.15), wallMat);
  frontLeftWall.position.set(-0.865, 1.25, 1.36);
  frontLeftWall.receiveShadow = true;
  walls.push(frontLeftWall);
  scene.add(frontLeftWall);

  // Door opening is 1.20m in the middle (no wall here)

  // Small wall piece next to door (right side before terrace)
  var doorSideWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.15), wallMat);
  doorSideWall.position.set(1.685, 1.25, 1.36);
  doorSideWall.receiveShadow = true;
  walls.push(doorSideWall);
  scene.add(doorSideWall);

  // Terrace outer walls
  var terraceBackWall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 0.15), wallMat);
  terraceBackWall.position.set(3.85, 1.25, -1.36);
  terraceBackWall.receiveShadow = true;
  scene.add(terraceBackWall);

  var terraceRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72), wallMat);
  terraceRightWall.position.set(5.6, 1.25, 0);
  terraceRightWall.receiveShadow = true;
  scene.add(terraceRightWall);

  // Door frame (1.20m opening positioned correctly between walls)
  var doorFrameMat = new THREE.MeshStandardMaterial();
  doorFrameMat.color = new THREE.Color(0x8b4513);
  doorFrameMat.roughness = 0.6;
  doorFrameMat.metalness = 0.2;

  // Left door frame post
  var doorFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.12), doorFrameMat);
  doorFrameLeft.position.set(0.28, 1.1, 1.36);
  doorFrameLeft.castShadow = true;
  scene.add(doorFrameLeft);

  // Right door frame post
  var doorFrameRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.12), doorFrameMat);
  doorFrameRight.position.set(1.48, 1.1, 1.36);
  doorFrameRight.castShadow = true;
  scene.add(doorFrameRight);

  // Top door frame
  var doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.12), doorFrameMat);
  doorFrameTop.position.set(0.88, 2.2, 1.36);
  doorFrameTop.castShadow = true;
  scene.add(doorFrameTop);

  // Glass door panel
  var glassMat = new THREE.MeshStandardMaterial();
  glassMat.color = new THREE.Color(0x88ccff);
  glassMat.transparent = true;
  glassMat.opacity = 0.25;
  glassMat.roughness = 0.05;
  glassMat.metalness = 0.9;

  var glassPane = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.05), glassMat);
  glassPane.position.set(0.88, 1.1, 1.36);
  glassPane.receiveShadow = true;
  scene.add(glassPane);

  // Door handle
  var handleMat = new THREE.MeshStandardMaterial();
  handleMat.color = new THREE.Color(0xc0c0c0);
  handleMat.roughness = 0.3;
  handleMat.metalness = 0.8;

  var doorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 16), handleMat);
  doorHandle.rotation.y = Math.PI / 2;
  doorHandle.position.set(1.3, 1.1, 1.38);
  doorHandle.castShadow = true;
  scene.add(doorHandle);

  // Terrace railing
  var railingMat = new THREE.MeshStandardMaterial();
  railingMat.color = new THREE.Color(0x666666);
  railingMat.roughness = 0.4;
  railingMat.metalness = 0.7;

  // Front railing
  var frontRailing = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.06, 0.06), railingMat);
  frontRailing.position.set(3.85, 1.0, 1.36);
  frontRailing.castShadow = true;
  scene.add(frontRailing);

  // Right side railing
  var rightRailing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.6), railingMat);
  rightRailing.position.set(5.55, 1.0, 0);
  rightRailing.castShadow = true;
  scene.add(rightRailing);

  // Railing posts
  for (var p = 0; p < 7; p++) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), railingMat);
    post.position.set(2.4 + p * 0.5, 0.5, 1.36);
    post.castShadow = true;
    scene.add(post);
  }

  // Corner post
  var cornerPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), railingMat);
  cornerPost.position.set(5.55, 0.5, 1.36);
  cornerPost.castShadow = true;
  scene.add(cornerPost);

  // Terrace furniture - Table
  var tableMat = new THREE.MeshStandardMaterial();
  tableMat.color = new THREE.Color(0x8b7355);
  tableMat.roughness = 0.6;
  tableMat.metalness = 0.3;

  var tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.8), tableMat);
  tableTop.position.set(4.0, 0.7, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);

  // Table legs
  for (var leg = 0; leg < 4; leg++) {
    var tableLeg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), tableMat);
    var xOff = leg % 2 === 0 ? -0.45 : 0.45;
    var zOff = leg < 2 ? -0.35 : 0.35;
    tableLeg.position.set(4.0 + xOff, 0.35, 0 + zOff);
    tableLeg.castShadow = true;
    scene.add(tableLeg);
  }

  // Chairs
  var chairMat = new THREE.MeshStandardMaterial();
  chairMat.color = new THREE.Color(0x555555);
  chairMat.roughness = 0.7;
  chairMat.metalness = 0.2;

  // Chair 1
  var chair1Seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), chairMat);
  chair1Seat.position.set(4.0, 0.4, -0.7);
  chair1Seat.castShadow = true;
  scene.add(chair1Seat);

  var chair1Back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), chairMat);
  chair1Back.position.set(4.0, 0.6, -0.9);
  chair1Back.castShadow = true;
  scene.add(chair1Back);

  // Chair 2
  var chair2Seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), chairMat);
  chair2Seat.position.set(3.2, 0.4, 0);
  chair2Seat.castShadow = true;
  scene.add(chair2Seat);

  var chair2Back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.4), chairMat);
  chair2Back.position.set(3.0, 0.6, 0);
  chair2Back.castShadow = true;
  scene.add(chair2Back);

  // Kitchen cabinets
  var cabinetMat = new THREE.MeshStandardMaterial();
  cabinetMat.color = new THREE.Color(0x8b4513);
  cabinetMat.roughness = 0.6;
  cabinetMat.metalness = 0.3;

  // Base cabinet (left side with drawers)
  var baseCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.6), cabinetMat);
  baseCabinet.position.set(-1.7, 0.425, -1.06);
  baseCabinet.castShadow = true;
  baseCabinet.receiveShadow = true;
  cabinets.push(baseCabinet);
  scene.add(baseCabinet);

  var drawerMat = new THREE.MeshStandardMaterial();
  drawerMat.color = new THREE.Color(0x654321);
  drawerMat.roughness = 0.5;
  drawerMat.metalness = 0.4;

  // Drawers
  for (var i = 0; i < 3; i++) {
    var drawer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.08), drawerMat);
    drawer.position.set(-1.7, 0.2 + i * 0.25, -0.70);
    drawer.castShadow = true;
    cabinets.push(drawer);
    scene.add(drawer);

    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 16), handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(-1.7, 0.2 + i * 0.25, -0.64);
    handle.castShadow = true;
    scene.add(handle);
  }

  // Counter
  var counterMat = new THREE.MeshStandardMaterial();
  counterMat.color = new THREE.Color(0x2f4f4f);
  counterMat.roughness = 0.3;
  counterMat.metalness = 0.6;
  counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.6), counterMat);
  counter.position.set(0.2, 0.88, -1.06);
  counter.castShadow = true;
  counter.receiveShadow = true;
  scene.add(counter);

  // Sink
  var sinkMat = new THREE.MeshStandardMaterial();
  sinkMat.color = new THREE.Color(0xcccccc);
  sinkMat.roughness = 0.2;
  sinkMat.metalness = 0.9;

  var sink = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.35), sinkMat);
  sink.position.set(0.2, 0.83, -1.06);
  sink.castShadow = true;
  scene.add(sink);

  // Faucet
  var faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16), sinkMat);
  faucetBase.position.set(0.2, 0.95, -1.06);
  scene.add(faucetBase);

  var faucetNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 16), sinkMat);
  faucetNeck.position.set(0.2, 1.1, -1.06);
  scene.add(faucetNeck);

  // Upper cabinets
  var upperCabs = [];
  upperCabs.push({ x: -1.2, w: 0.8 });
  upperCabs.push({ x: -0.24, w: 0.72 });
  upperCabs.push({ x: 0.67, w: 0.78 });

  var doorMat = new THREE.MeshStandardMaterial();
  doorMat.color = new THREE.Color(0x9b6b3b);
  doorMat.roughness = 0.5;
  doorMat.metalness = 0.3;

  for (var j = 0; j < upperCabs.length; j++) {
    var cab = upperCabs[j];
    
    var cabinet = new THREE.Mesh(new THREE.BoxGeometry(cab.w, 0.7, 0.4), cabinetMat);
    cabinet.position.set(cab.x, 1.8, -1.16);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    cabinets.push(cabinet);
    scene.add(cabinet);

    var door = new THREE.Mesh(new THREE.BoxGeometry(cab.w - 0.04, 0.68, 0.04), doorMat);
    door.position.set(cab.x, 1.8, -0.94);
    door.castShadow = true;
    cabinets.push(door);
    scene.add(door);

    var doorHandleUp = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 16), handleMat);
    doorHandleUp.rotation.z = Math.PI / 2;
    doorHandleUp.position.set(cab.x + cab.w / 3, 1.8, -0.91);
    doorHandleUp.castShadow = true;
    scene.add(doorHandleUp);
  }

  // Coffee corner
  var coffeeGroup = new THREE.Group();
  
  var baseMat = new THREE.MeshStandardMaterial();
  baseMat.color = new THREE.Color(0x333333);
  var coffeeBase = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.15), baseMat);
  coffeeBase.position.y = 1.0;
  coffeeBase.castShadow = true;
  coffeeGroup.add(coffeeBase);

  var cupMat = new THREE.MeshStandardMaterial();
  cupMat.color = new THREE.Color(0xffffff);
  var coffeeCup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 16), cupMat);
  coffeeCup.position.y = 1.16;
  coffeeCup.castShadow = true;
  coffeeGroup.add(coffeeCup);

  coffeeGroup.position.set(1.2, 0, -0.9);
  scene.add(coffeeGroup);

  // Ceiling
  var ceilingMat = new THREE.MeshStandardMaterial();
  ceilingMat.color = new THREE.Color(0xffffff);
  ceilingMat.roughness = 0.9;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 2.72), ceilingMat);
  ceiling.position.set(0, 2.5, 0);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  var terraceCeiling = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.05, 2.72), ceilingMat);
  terraceCeiling.position.set(3.85, 2.5, 0);
  scene.add(terraceCeiling);
}.15, 0.3), sinkMat);
  sink.position.set(0.2, 0.83, -1.06);
  scene.add(sink);

  var upperCabs = [];
  upperCabs.push({ x: -1.2, w: 0.8 });
  upperCabs.push({ x: -0.24, w: 0.72 });
  upperCabs.push({ x: 0.67, w: 0.78 });

  var doorMat = new THREE.MeshStandardMaterial();
  doorMat.color = new THREE.Color(0x9b6b3b);
  doorMat.roughness = 0.5;
  doorMat.metalness = 0.3;

  for (var j = 0; j < upperCabs.length; j++) {
    var cab = upperCabs[j];
    
    var cabinet = new THREE.Mesh(new THREE.BoxGeometry(cab.w, 0.7, 0.4), cabinetMat);
    cabinet.position.set(cab.x, 1.8, -1.16);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    cabinets.push(cabinet);
    scene.add(cabinet);

    var door = new THREE.Mesh(new THREE.BoxGeometry(cab.w - 0.04, 0.68, 0.04), doorMat);
    door.position.set(cab.x, 1.8, -0.94);
    door.castShadow = true;
    cabinets.push(door);
    scene.add(door);

    var doorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 16), handleMat);
    doorHandle.rotation.z = Math.PI / 2;
    doorHandle.position.set(cab.x + cab.w / 3, 1.8, -0.91);
    doorHandle.castShadow = true;
    scene.add(doorHandle);
  }

  var coffeeGroup = new THREE.Group();
  
  var baseMat = new THREE.MeshStandardMaterial();
  baseMat.color = new THREE.Color(0x333333);
  var coffeeBase = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.15), baseMat);
  coffeeBase.position.y = 1.0;
  coffeeBase.castShadow = true;
  coffeeGroup.add(coffeeBase);

  var cupMat = new THREE.MeshStandardMaterial();
  cupMat.color = new THREE.Color(0xffffff);
  var coffeeCup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 16), cupMat);
  coffeeCup.position.y = 1.16;
  coffeeCup.castShadow = true;
  coffeeGroup.add(coffeeCup);

  coffeeGroup.position.set(1.2, 0, -0.9);
  scene.add(coffeeGroup);
}

function addMouseControls() {
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  renderer.domElement.addEventListener('wheel', onMouseWheel);
}

function onMouseDown(e) {
  isDragging = true;
  var posX = e.clientX;
  var posY = e.clientY;
  previousMousePosition = { x: posX, y: posY };
}

function onMouseMove(e) {
  if (!isDragging) return;

  var deltaX = e.clientX - previousMousePosition.x;
  var deltaY = e.clientY - previousMousePosition.y;

  if (e.buttons === 1) {
    cameraRotation.y += deltaX * 0.005;
    cameraRotation.x += deltaY * 0.005;
    cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
    updateCameraPosition();
  }

  var posX = e.clientX;
  var posY = e.clientY;
  previousMousePosition = { x: posX, y: posY };
}

function onMouseUp() {
  isDragging = false;
}

function onMouseWheel(e) {
  e.preventDefault();
  cameraDistance += e.deltaY * 0.01;
  cameraDistance = Math.max(2, Math.min(15, cameraDistance));
  updateCameraPosition();
}

function updateCameraPosition() {
  if (currentView === 'perspective') {
    var x = Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x) * cameraDistance;
    var y = Math.sin(cameraRotation.x) * cameraDistance + 2;
    var z = Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x) * cameraDistance;
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 1, -0.5);
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

  if (view === 'perspective') {
    var rotX = 0.3;
    var rotY = angle;
    cameraRotation = { x: rotX, y: rotY };
    cameraDistance = 5;
    updateCameraPosition();
  } else if (view === 'front') {
    camera.position.set(0, 1.2, 3);
    camera.lookAt(0, 1.2, -1);
  } else if (view === 'top') {
    camera.position.set(0, 6, 0);
    camera.lookAt(0, 0, 0);
  } else if (view === 'side') {
    camera.position.set(5, 1.5, 0);
    camera.lookAt(0, 1.2, 0);
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
  var rotX = 0.3;
  var rotY = 0;
  cameraRotation = { x: rotX, y: rotY };
  cameraDistance = 5;
  angle = 0;
  setView('perspective');
}

function toggleControls() {
  var controls = document.getElementById('controls');
  if (controls.style.display === 'none') {
    controls.style.display = 'block';
  } else {
    controls.style.display = 'none';
  }
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', init);