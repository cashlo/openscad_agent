import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
// @ts-ignore
import { createOpenSCAD } from 'openscad-wasm';

interface OpenSCADViewerProps {
    code: string;
    onError?: (error: string) => void;
}

export interface OpenSCADViewerRef {
    captureScreenshot: () => string | null;
    downloadSTL: () => void;
}

export const OpenSCADViewer = React.forwardRef<OpenSCADViewerRef, OpenSCADViewerProps>(({ code, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const stderrLog = useRef<string[]>([]);
    const compilingRef = useRef(false);

    // Ref to hold the latest onError callback to avoid re-triggering effect
    const onErrorRef = useRef(onError);
    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const stlDataRef = useRef<Uint8Array | null>(null);

    // Expose screenshot and download methods
    React.useImperativeHandle(ref, () => ({
        captureScreenshot: () => {
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
                return rendererRef.current.domElement.toDataURL('image/png');
            }
            return null;
        },
        downloadSTL: () => {
            if (!stlDataRef.current) {
                console.warn('No STL data available to download');
                return;
            }

            // Create blob and download (cast buffer to ArrayBuffer for type safety)
            const blob = new Blob([stlDataRef.current.buffer as ArrayBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `model_${Date.now()}.stl`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }));

    // Initialize Three.js
    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        camera.position.set(50, 50, 50);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (meshRef.current) {
                meshRef.current.rotation.z += 0.005;
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            if (width === 0 || height === 0) return;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        };

        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(containerRef.current);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            renderer.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    // Compile and Render
    // Compile and Render
    useEffect(() => {
        if (!code || !sceneRef.current) return;

        const compile = async () => {
            if (compilingRef.current) return;
            compilingRef.current = true;

            setLoading(true);
            setError(null);
            stderrLog.current = []; // Clear previous errors

            try {
                // Initialize a FRESH instance every time to avoid memory corruption/state issues
                const wrapper = await createOpenSCAD({
                    noInitialRun: true,
                    print: (text: string) => console.log("[OpenSCAD stdout]:", text),
                    printErr: (text: string) => {
                        console.log("[OpenSCAD stderr]:", text);
                        stderrLog.current.push(text);
                    }
                });
                const instance = wrapper.getInstance();

                // Write module_connector library to virtual FS
                const moduleConnectorCode = `module module_connector(){
    for(i=[0:1])
    mirror([0,i,0])
    translate([0,-27/2,0])
    3d_mouth_with_hole();
}


module 3d_mouth_with_hole(){
    difference(){
        3d_mouth();
        #translate([0,0,3])
        rotate([90,0,0])
        cylinder(10, 3.2/2, 3.2/2, $fn=20);
    }
}


module 3d_mouth(){
    translate([-8,0,0]){
        translate([0,0,4])
        linear_extrude(2) mouth();
        linear_extrude(6) mouth(t=1.5, so=1, si=1.5, gap=7, og=0.5);
        linear_extrude(2) mouth();
    }
}


module mouth(t=2.5, so=1, si=1.5, gap=6, og=0){

teeth = so+t+si;

polygon([[0,0], [og,0], [og+so, 3.5], [og+so+t, 3.5], [og+so+t+si, 0], 
         [og+teeth+gap, 0], [og+teeth+gap+si, 3.5], [og+teeth+gap+si+t, 3.5], [og+teeth*2+gap, 0], [og+teeth*2+gap+og, 0],
         [og+teeth*2+gap+og, -3.5], [0, -3.5], 
         ]);
         
 }`;
                instance.FS.writeFile('/module_connector.scad', moduleConnectorCode);

                // Write input file to virtual FS
                instance.FS.writeFile('/input.scad', code);

                // Run OpenSCAD CLI
                const args = ['/input.scad', '-o', 'output.stl'];
                instance.callMain(args);

                // Read output file
                const output = instance.FS.readFile('/output.stl'); // Uint8Array by default

                // Helper to render mesh from STL output
                const renderMesh = (stlData: string | ArrayBuffer) => {
                    const loader = new STLLoader();
                    const geometry = loader.parse(stlData);

                    geometry.computeBoundingBox();
                    geometry.computeBoundingSphere();
                    geometry.center();

                    if (meshRef.current) {
                        sceneRef.current?.remove(meshRef.current);
                        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
                    }

                    const material = new THREE.MeshPhongMaterial({ color: 0x99ccff, specular: 0x111111, shininess: 200, side: THREE.DoubleSide });
                    const mesh = new THREE.Mesh(geometry, material);

                    mesh.rotation.x = -Math.PI / 2;
                    sceneRef.current?.add(mesh);
                    meshRef.current = mesh;
                };

                // Check if output is valid
                if (output && output.length > 0) {
                    // Store STL data for download (only if it's Uint8Array)
                    if (output instanceof Uint8Array) {
                        stlDataRef.current = output;
                    }

                    // STLLoader.parse expects ArrayBuffer or string
                    const buffer = (output instanceof Uint8Array) ? (output.buffer as ArrayBuffer) : output;
                    renderMesh(buffer);
                } else {
                    throw new Error("No STL output generated");
                }

                // Allow the instance to be GC'd by falling out of scope

            } catch (err) {
                console.error("Compilation error", err);
                const errorMessage = stderrLog.current.join('\n') || (err instanceof Error ? err.message : String(err));
                setError(`Compilation failed: ${errorMessage}`);

                if (onErrorRef.current) {
                    onErrorRef.current(errorMessage);
                }
            } finally {
                setLoading(false);
                compilingRef.current = false;
            }
        };

        // Debounce
        const timer = setTimeout(compile, 800);
        return () => clearTimeout(timer);

    }, [code]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            {loading && <div style={{ position: 'absolute', top: 10, right: 10, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '4px', zIndex: 10 }}>Rendering...</div>}
            {error && <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#ff6b6b', background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '4px', maxWidth: '80%', zIndex: 10 }}>{error}</div>}
        </div>
    );
});
