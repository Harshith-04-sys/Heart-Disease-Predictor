import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

extend({ OrbitControls: ThreeOrbitControls });

const SideGuideCharacter = lazy(() => import("../components/SideGuideCharacter.jsx"));

function Controls({ reducedMotion }) {
  const controlsRef = useRef(null);
  const { camera, gl } = useThree();

  useFrame(() => {
    controlsRef.current?.update?.();
  });

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      autoRotate={!reducedMotion}
      autoRotateSpeed={0.6}
    />
  );
}

function HeartMesh({ onActivate }) {
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    const x = 0;
    const y = 0;

    const shape = new THREE.Shape();
    shape.moveTo(x + 0, y + 0.35);
    shape.bezierCurveTo(x + 0, y + 0.35, x - 0.55, y + 0.1, x - 0.55, y - 0.25);
    shape.bezierCurveTo(x - 0.55, y - 0.6, x - 0.2, y - 0.75, x + 0, y - 0.55);
    shape.bezierCurveTo(x + 0.2, y - 0.75, x + 0.55, y - 0.6, x + 0.55, y - 0.25);
    shape.bezierCurveTo(x + 0.55, y + 0.1, x + 0, y + 0.35, x + 0, y + 0.35);

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.12,
      bevelSegments: 6,
      curveSegments: 32,
      steps: 1
    });

    extrude.center();
    extrude.computeVertexNormals();
    return extrude;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1 + 0.03 * Math.sin(t * 2.2);
    state.scene.scale.setScalar(pulse);
  });

  useEffect(() => {
    const prev = document.body.style.cursor;
    document.body.style.cursor = hovered ? "pointer" : prev;
    return () => {
      document.body.style.cursor = prev;
    };
  }, [hovered]);

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onActivate}
    >
      <meshStandardMaterial color="#b91c1c" roughness={0.45} metalness={0.08} />
    </mesh>
  );
}

function StaticFallback() {
  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <div className="rounded-[28px] border border-gray-200 bg-white shadow-md p-10">
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-5xl">
            ❤️
          </div>
        </div>
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700">3D view unavailable</div>
          <div className="text-sm text-gray-500 mt-1">Your browser or device may not support WebGL.</div>
        </div>
      </div>
    </div>
  );
}

export default function HeartExperiencePage() {
  const navigate = useNavigate();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  const guideAvatarUrl =
    import.meta.env?.VITE_GUIDE_AVATAR_URL ??
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

  const goHome = () => navigate("/");

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const handle = () => setReducedMotion(Boolean(media.matches));
    handle();
    media.addEventListener?.("change", handle);
    return () => media.removeEventListener?.("change", handle);
  }, []);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebglOk(Boolean(gl && window.WebGLRenderingContext));
    } catch {
      setWebglOk(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col app-shell">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2 text-gray-900 font-medium text-base hover:text-blue-600 transition-colors"
          >
            <span className="text-3xl leading-none">❤️</span>
            <span className="text-base">Heart Disease Predictor</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-base font-medium transition-colors"
          >
            Back
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-[1fr_720px_1fr] lg:items-center lg:gap-10">
            <div className="hidden lg:block" />

            {/* Center Heart */}
            <div className="text-center">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">Your heart has a story.</h1>
                <p className="mt-4 text-lg text-gray-600">2 minutes. No hospitals. Just insights.</p>
              </div>

              <div className="mt-10">
                {webglOk ? (
                  <div className="w-full max-w-[720px] mx-auto">
                    <div className="rounded-[28px] border border-gray-200 bg-white shadow-md overflow-hidden">
                      <div className="relative aspect-square">
                        <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 2.4], fov: 45 }} shadows>
                          <ambientLight intensity={0.7} />
                          <directionalLight position={[2, 2, 2]} intensity={1.2} castShadow />
                          <group>
                            <HeartMesh onActivate={goHome} />
                          </group>
                          <Controls reducedMotion={reducedMotion} />
                        </Canvas>
                      </div>
                    </div>
                  </div>
                ) : (
                  <StaticFallback />
                )}
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={goHome}
                  className="px-10 py-4 rounded-xl font-semibold shadow-sm border border-blue-200 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-700"
                >
                  Start Heart Analysis
                </button>
              </div>
            </div>

            {/* Side guide + microcopy */}
            <div className="mt-10 lg:mt-0">
              <div className="relative max-w-[380px] mx-auto lg:mx-0">
                <div className="absolute -top-2 left-4 space-y-2">
                  <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-4 py-2 text-sm font-light text-gray-700 shadow-sm">
                    Try rotating your heart
                  </div>
                  <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-4 py-2 text-sm font-light text-gray-700 shadow-sm">
                    Tap heart to begin
                  </div>
                </div>

                <Suspense
                  fallback={
                    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
                      <div className="h-72 bg-gray-50 rounded-2xl" />
                    </div>
                  }
                >
                  <SideGuideCharacter className="w-full" imageUrl={guideAvatarUrl} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 pb-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <a
            href="https://github.com/hemanthsankar0007/Heart-Disease-Predictor-Updated"
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:text-gray-800"
          >
            Developed by Hemanth Sankar
          </a>
        </div>
      </footer>
    </div>
  );
}
