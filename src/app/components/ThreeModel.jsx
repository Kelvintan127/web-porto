// src/ThreeModel.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeModel = () => {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000); // Aspect ratio will be updated dynamically
      camera.position.set(10, 8, 0);
  
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      const parent = canvasRef.current.parentElement;
  
      // Set renderer size to match the parent element
      renderer.setSize(parent.offsetWidth, parent.offsetHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
  
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 5).normalize();
      scene.add(directionalLight);
  
      const loader = new GLTFLoader();
      loader.load('/models/scene.gltf', (gltf) => {
        const model = gltf.scene;
        scene.add(model);
  
        const adjustModelScale = () => {
          const isMobile = window.innerWidth <= 768;
          const scale = isMobile ? 0.5 : 1;
          model.scale.set(scale, scale, scale);
        };
  
        adjustModelScale();
        window.addEventListener('resize', adjustModelScale);
      });
  
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI / 2;
  
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
  
      const handleResize = () => {
        const width = parent.offsetWidth;
        const height = parent.offsetHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  
    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%'}} />;
  };
  
  export default ThreeModel;
  