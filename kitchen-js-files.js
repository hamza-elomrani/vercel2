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
  var floorMat = new THREE.MeshStandardMaterial();
  floorMat.color = new THREE.Color(0xd4b896);
  floorMat.roughness = 0.8;
  floorMat.metalness = 0.2;
  floor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.72), floorMat);
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  scene.add(floor);

  var gridHelper = new THREE.GridHelper(5, 20, 0x888888, 0xcccccc);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  var wallMat = new THREE.MeshStandardMaterial();
  wallMat.color = new THREE.Color(0xf5f5dc);
  wallMat.roughness = 0.9;
  wallMat.metalness = 0.1;

  var backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 0.15), wallMat);
  backWall.position.set(0, 1.25, -1.36);
  backWall.receiveShadow = true;
  walls.push(backWall);
  scene.add(backWall);

  var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72), wallMat);
  leftWall.position.set(-2.1, 1.25, 0);
  leftWall.receiveShadow = true;
  walls.push(leftWall);
  scene.add(leftWall);

  var rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 2.72), wallMat);
  rightWall.position.set(2.1, 1.25, 0);
  rightWall.receiveShadow = true;
  walls.push(rightWall);
  scene.add(rightWall);

  var cabinetMat = new THREE.MeshStandardMaterial();
  cabinetMat.color = new THREE.Color(0x8b4513);
  cabinetMat.roughness = 0.6;
  cabinetMat.metalness = 0.3;

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
  
  var handleMat = new THREE.MeshStandardMaterial();
  handleMat.color = new THREE.Color(0xc0c0c0);
  handleMat.roughness = 0.3;
  handleMat.metalness = 0.8;

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

  var counterMat = new THREE.MeshStandardMaterial();
  counterMat.color = new THREE.Color(0x2f4f4f);
  counterMat.roughness = 0.3;
  counterMat.metalness = 0.6;
  counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.6), counterMat);
  counter.position.set(0.2, 0.88, -1.06);
  counter.castShadow = true;
  counter.receiveShadow = true;
  scene.add(counter);

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