'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { type ModelData } from './keychain-generator';
import { Button } from './ui/button';
import { Download, Music } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function KeychainViewer({ modelData }: { modelData: ModelData | null }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const defaultPrompt = 'A default abstract knot keychain.';

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;


    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear previous model
    if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current = null;
    }

    const loader = new GLTFLoader();

    const url = modelData?.modelUrl;

    if (url) {
        loader.load(url, (gltf) => {
            const model = gltf.scene;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Scale the model
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.0 / maxDim; // Scale to fit in a 2x2x2 box
            model.scale.set(scale, scale, scale);

            scene.add(model);
            modelRef.current = model;
        }, undefined, (error) => {
            console.error('An error happened while loading the model:', error);
        });
    } else {
        // Load default knot
        const geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16);
        geometry.center();
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#D43CFF'),
            metalness: 0.5,
            roughness: 0.4,
        });
        const model = new THREE.Mesh(geometry, material);
        scene.add(model);
        modelRef.current = model;
    }

  }, [modelData]);

  const handleDownload = () => {
    if (!modelRef.current) return;
    const exporter = new STLExporter();
    if (modelRef.current) {
      const result = exporter.parse(modelRef.current, { binary: true });
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = `keychainify-model.stl`;
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative h-full w-full">
        <div ref={mountRef} className="h-full w-full" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-lg bg-background/50 p-2 pl-4 backdrop-blur-sm border">
          <p className="hidden sm:inline text-sm text-muted-foreground truncate flex-1">
            <Music className="inline -mt-1 mr-2 h-4 w-4" />
            {modelData?.prompt || defaultPrompt}
          </p>
           <p className="sm:hidden text-sm text-muted-foreground truncate flex-1">
            <Music className="inline -mt-1 mr-2 h-4 w-4" />
            Keychain Model
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" onClick={handleDownload} disabled={!modelData}>
                <Download className="h-5 w-5" />
                <span className="sr-only">Download Model</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download .STL file</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
