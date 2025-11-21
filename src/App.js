import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Kitchen3DModel = () => {
  const containerRef = useRef(null);
  const [view, setView] = useState('perspective');
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Materials
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cabinetMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x2f4f4f });
    const drawerMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

    // Floor (4.20m x 2.72m)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.1, 2.72),
      floorMaterial
    );
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.5, 0.1),
      wallMaterial
    );
    backWall.position.set(0, 1.25, -1.36);
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.5, 2.72),
      wallMaterial
    );
    leftWall.position.set(-2.1, 1.25, 0);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.5, 2.72),
      wallMaterial
    );
    rightWall.position.set(2.1, 1.25, 0);
    scene.add(rightWall);

    // Base cabinets (left side with drawers)
    const baseCabinet1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.85, 0.6),
      cabinetMaterial
    );
    baseCabinet1.position.set(-1.7, 0.425, -1.06);
    baseCabinet1.castShadow = true;
    scene.add(baseCabinet1);

    // Drawers on left cabinet
    for (let i = 0; i < 3; i++) {
      const drawer = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.2, 0.05),
        drawerMaterial
      );
      drawer.position.set(-1.7, 0.2 + i * 0.25, -0.73);
      scene.add(drawer);
      
      // Drawer handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      handle.rotation.z = Math.PI / 2;
      handle.position.set(-1.7, 0.2 + i * 0.25, -0.69);
      scene.add(handle);
    }

    // Counter/desk (2.8m wide as per sketch)
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.05, 0.6),
      counterMaterial
    );
    counter.position.set(0.2, 0.875, -1.06);
    counter.castShadow = true;
    scene.add(counter);

    // Upper cabinets
    const upperCabinet1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.7, 0.4),
      cabinetMaterial
    );
    upperCabinet1.position.set(-1.2, 1.8, -1.16);
    upperCabinet1.castShadow = true;
    scene.add(upperCabinet1);

    const upperCabinet2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.7, 0.4),
      cabinetMaterial
    );
    upperCabinet2.position.set(-0.24, 1.8, -1.16);
    upperCabinet2.castShadow = true;
    scene.add(upperCabinet2);

    const upperCabinet3 = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.7, 0.4),
      cabinetMaterial
    );
    upperCabinet3.position.set(0.67, 1.8, -1.16);
    upperCabinet3.castShadow = true;
    scene.add(upperCabinet3);

    // Coffee corner sign
    const coffeeCornerGeometry = new THREE.PlaneGeometry(0.5, 0.2);
    const coffeeCornerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      side: THREE.DoubleSide 
    });
    const coffeeCorner = new THREE.Mesh(coffeeCornerGeometry, coffeeCornerMaterial);
    coffeeCorner.position.set(1.2, 0.5, -1.0);
    scene.add(coffeeCorner);

    // Add cabinet doors
    const addCabinetDoor = (x, y, z, width, height) => {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.02, height - 0.02, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x9b6b3b })
      );
      door.position.set(x, y, z);
      scene.add(door);
      
      // Door handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      handle.rotation.z = Math.PI / 2;
      handle.position.set(x + width/3, y, z + 0.03);
      scene.add(handle);
    };

    addCabinetDoor(-1.2, 1.8, -0.94, 0.78, 0.68);
    addCabinetDoor(-0.24, 1.8, -0.94, 0.7, 0.68);
    addCabinetDoor(0.67, 1.8, -0.94, 0.76, 0.68);

    // Camera positions for different views
    const setCameraView = (viewType) => {
      switch(viewType) {
        case 'perspective':
          camera.position.set(3, 2.5, 3);
          camera.lookAt(0, 1, -0.5);
          break;
        case 'front':
          camera.position.set(0, 1.2, 2);
          camera.lookAt(0, 1.2, -1);
          break;
        case 'top':
          camera.position.set(0, 5, 0);
          camera.lookAt(0, 0, 0);
          break;
        case 'side':
          camera.position.set(4, 1.2, 0);
          camera.lookAt(0, 1.2, 0);
          break;
      }
    };

    setCameraView(view);

    // Animation
    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (view === 'perspective') {
        angle += 0.003;
        camera.position.x = Math.cos(angle) * 4;
        camera.position.z = Math.sin(angle) * 4;
        camera.position.y = 2.5;
        camera.lookAt(0, 1, -0.5);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [view]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow-md p-4 flex gap-2 justify-center">
        <button
          onClick={() => setView('perspective')}
          className={`px-4 py-2 rounded ${view === 'perspective' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          3D View
        </button>
        <button
          onClick={() => setView('front')}
          className={`px-4 py-2 rounded ${view === 'front' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Front View
        </button>
        <button
          onClick={() => setView('top')}
          className={`px-4 py-2 rounded ${view === 'top' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Top View
        </button>
        <button
          onClick={() => setView('side')}
          className={`px-4 py-2 rounded ${view === 'side' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Side View
        </button>
      </div>
      <div ref={containerRef} className="flex-1" />
      <div className="bg-white p-3 text-center text-sm text-gray-600">
        Kitchen dimensions: 4.20m × 2.72m | Counter width: 2.8m
      </div>
    </div>
  );
};

export default Kitchen3DModel;