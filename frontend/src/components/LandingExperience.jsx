import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

extend({ OrbitControls: ThreeOrbitControls });

const SideGuideCharacter = lazy(() => import("./SideGuideCharacter.jsx"));

class LandingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function HeartMesh({ onActivate }) {
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    // Stylized 3D heart (lightweight, no external assets).
    // Intentionally smooth + clinical; avoids heavy downloads.
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
    // Gentle pulse (idle rotation handled by OrbitControls autoRotate).
    const base = hovered ? 1.06 : 1;
    const pulse = 1 + 0.03 * Math.sin(t * 2.2);
    state.scene.scale.setScalar(base * pulse);
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
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onActivate}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#b91c1c"
        roughness={0.45}
        metalness={0.08}
      />
    </mesh>
  );
}

function HeartCanvas({ onActivate, reducedMotion }) {
  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className="rounded-[28px] border border-gray-200 bg-white shadow-md overflow-hidden">
        <div className="relative aspect-square">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 2.4], fov: 45 }}
            shadows
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 2, 2]} intensity={1.2} castShadow />
            <group>
              <HeartMesh onActivate={onActivate} />
            </group>

            <Controls reducedMotion={reducedMotion} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

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

function StaticFallback({ onActivate }) {
  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className="w-full rounded-[28px] border border-gray-200 bg-white shadow-md p-10 text-center">
        <button
          type="button"
          onClick={onActivate}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-blue-50 border border-blue-100 text-5xl"
          aria-label="Start Heart Analysis"
          title="Start Heart Analysis"
        >
          ❤️
        </button>
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700">3D view unavailable</div>
          <div className="text-sm text-gray-500 mt-1">Click the heart to begin</div>
        </div>
      </div>
    </div>
  );
}

export default function LandingExperience({ onComplete }) {
  const [phase, setPhase] = useState("idle"); // idle | exiting
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  const guideAvatarUrl =
    import.meta.env?.VITE_GUIDE_AVATAR_URL ??
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

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

  const start = () => {
    try {
      localStorage.setItem("cra_seen_landing", "1");
    } catch {
      // ignore
    }

    setPhase("exiting");
    window.setTimeout(() => onComplete?.(), 520);
  };

  return (
    <div
      className={
        "fixed inset-0 z-[100] flex items-center justify-center px-6 " +
        (phase === "exiting"
          ? "opacity-0 scale-[1.02] transition-all duration-500"
          : "opacity-100 scale-100 transition-all duration-500")
      }
      style={{
        background:
          "radial-gradient(1100px 700px at 50% 15%, rgba(255,255,255,1) 0%, rgba(243,244,246,1) 55%, rgba(249,250,251,1) 100%)"
      }}
      role="dialog"
      aria-label="Welcome"
    >
      <div
        className={
          "w-full max-w-6xl mx-auto " +
          (phase === "exiting" ? "translate-y-[-4px]" : "translate-y-0") +
          " transition-transform duration-500"
        }
      >
        <div className="lg:grid lg:grid-cols-[1fr_520px_1fr] lg:items-center lg:gap-10">
          <div className="hidden lg:block" />

          {/* Center Heart */}
          <div className="text-center">
            <LandingErrorBoundary fallback={<StaticFallback onActivate={start} />}>
              {webglOk ? (
                <HeartCanvas onActivate={start} reducedMotion={reducedMotion} />
              ) : (
                <StaticFallback onActivate={start} />
              )}
            </LandingErrorBoundary>

            {/* Bottom copy */}
            <div className="mt-10">
              <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
                Your heart has a story.
              </div>
              <div className="mt-4 text-lg text-gray-600">
                2 minutes. No hospitals. Just insights.
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={start}
                  className="px-10 py-4 rounded-xl font-semibold shadow-sm border border-blue-200 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-700"
                >
                  Start Heart Analysis
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                This experience is informational and not a diagnosis.
              </div>
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
    </div>
  );
}
