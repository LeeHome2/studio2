'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { type ModelData } from './keychain-generator';
import { Button } from './ui/button';
import { Download, Music } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function KeychainViewer({ modelData }: { modelData: ModelData | null }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const defaultModelData = useMemo(() => ({
    prompt: 'A default abstract knot keychain in purple tones.',
    color: '#D43CFF',
    shape: 'knot',
  }), []);

  const currentModelData = modelData || defaultModelData;

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
    controls.minDistance = 1.5;
    controls.maxDistance = 10;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
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
    const existingModel = scene.getObjectByName('keychainModel');
    if (existingModel) {
      scene.remove(existingModel);
      (existingModel as any).geometry?.dispose();
      ((existingModel as any).material as THREE.Material)?.dispose();
    }

    // Create new geometry based on shape
    let geometry: THREE.BufferGeometry;
    switch (currentModelData.shape) {
      case 'heart':
        const shape = new THREE.Shape();
        shape.moveTo(0.25, 0.25);
        shape.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
        shape.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
        shape.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
        shape.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
        shape.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
        shape.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
        const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.8, 0.3, 16, 100);
        break;
      default: // knot
        geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16);
    }
    geometry.center();

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentModelData.color),
      metalness: 0.5,
      roughness: 0.4,
    });
    
    // Create mesh
    const model = new THREE.Mesh(geometry, material);
    model.name = 'keychainModel';
    scene.add(model);

  }, [currentModelData]);

  const handleDownload = () => {
    if (!sceneRef.current) return;
    const exporter = new STLExporter();
    const model = sceneRef.current.getObjectByName('keychainModel');
    if (model) {
      const result = exporter.parse(model, { binary: true });
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = `keychainify-${currentModelData.shape}.stl`;
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
            {currentModelData.prompt}
          </p>
           <p className="sm:hidden text-sm text-muted-foreground truncate flex-1">
            <Music className="inline -mt-1 mr-2 h-4 w-4" />
            {currentModelData.shape.charAt(0).toUpperCase() + currentModelData.shape.slice(1)} Model
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" onClick={handleDownload}>
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
