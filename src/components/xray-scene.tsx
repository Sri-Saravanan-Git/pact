"use client";
"use no memo";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated every frame by design */
import { useMemo, useRef } from "react";
import { useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

const C = {
  belt: "#0b2a63",
  ink: "#071d49",
  slab: "#ffffff",
  blue: "#0b63f6",
  stop: "#d92d3a",
  check: "#3aa0ff",
  frame: "#e9eef7",
};

export type Parcel = { seller: string; price: string; bad?: boolean };

function flapFont() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--nf-mono").trim();
  return v || "monospace";
}

function labelTexture(p: Parcel) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = C.slab;
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = C.blue;
  g.fillRect(0, 0, 512, 56);
  g.fillStyle = "#fff";
  g.font = `600 28px ${flapFont()}`;
  g.fillText("LISTING", 24, 38);
  g.fillStyle = C.ink;
  g.font = `700 46px ${flapFont()}`;
  g.fillText(p.seller.toUpperCase().slice(0, 15), 24, 130);
  g.font = `400 40px ${flapFont()}`;
  g.fillText(p.price, 24, 200);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function stripes(a: string, b: string, n = 8) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = a;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = b;
  const w = 256 / n;
  for (let i = -n; i < n * 2; i += 2) {
    g.beginPath();
    g.moveTo(i * w, 0);
    g.lineTo(i * w + w, 0);
    g.lineTo(i * w + w + 256, 256);
    g.lineTo(i * w + 256, 256);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SCAN_X = 0;
const GAP = 2.6;

function ParcelMesh({ p, i, progress }: { p: Parcel; i: number; progress: MotionValue<number> }) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);
  const tex = useMemo(() => labelTexture(p), [p]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    // belt travel: parcel i starts left and moves right; the whole queue crosses the scanner over the scroll
    const travel = progress.get() * (GAP * 4 + 7) - 7;
    let x = travel - i * GAP;
    let z = 0;
    let y = 0.45;
    let rotZ = 0;
    if (p.bad && x > SCAN_X + 0.6) {
      // diverted: slides off the belt toward the quarantine bin
      const k = Math.min((x - SCAN_X - 0.6) / 2.2, 1);
      z = k * 2.6;
      x = SCAN_X + 0.6 + k * 1.2;
      y = 0.45 - k * 0.55;
      rotZ = -k * 0.25;
    }
    g.position.set(x, y, z);
    g.rotation.set(0, 0, rotZ);
    const inScan = Math.abs(x - SCAN_X) < 0.9;
    const m = body.current!;
    const flagged = p.bad && x > SCAN_X - 0.2;
    m.color.set(flagged ? C.stop : C.slab);
    m.emissive.set(inScan ? (p.bad ? C.stop : C.check) : "#000");
    m.emissiveIntensity = inScan ? 0.55 : 0;
    m.transparent = inScan;
    m.opacity = inScan ? 0.55 : 1;
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[1.8, 0.9, 1.1]} radius={0.08} smoothness={3}>
        <meshStandardMaterial ref={body} color={C.slab} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.556]}>
        <planeGeometry args={[1.6, 0.8]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.1, 0.12]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
    </group>
  );
}

function Belt({ progress }: { progress: MotionValue<number> }) {
  const tex = useMemo(() => {
    const t = stripes("#0b2a63", "#0f3473", 10);
    t.repeat.set(8, 1);
    return t;
  }, []);
  useFrame(() => {
    tex.offset.x = -progress.get() * 6;
  });
  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[22, 0.1, 1.6]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[22, 0.5, 1.7]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
    </group>
  );
}

function Scanner() {
  const hazard = useMemo(() => {
    const t = stripes(C.blue, "#ffffff", 6);
    t.repeat.set(2, 1);
    return t;
  }, []);
  return (
    <group position={[SCAN_X, 0, 0]}>
      {/* open tunnel: solid back wall, two slim front posts, so the camera sees inside */}
      <mesh position={[0, 1.1, -1.05]}>
        <boxGeometry args={[1.6, 2.4, 0.3]} />
        <meshStandardMaterial color={C.frame} roughness={0.35} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 1.1, 1.05]}>
          <boxGeometry args={[0.16, 2.4, 0.3]} />
          <meshStandardMaterial color={C.frame} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.6, 0.4, 2.4]} />
        <meshStandardMaterial color={C.frame} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.4, 1.21]}>
        <boxGeometry args={[1.6, 0.4, 0.02]} />
        <meshStandardMaterial map={hazard} />
      </mesh>
      {/* scan curtain */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.04, 2.1, 1.8]} />
        <meshBasicMaterial color={C.check} transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function Bin() {
  const hazard = useMemo(() => {
    const t = stripes(C.stop, "#ffffff", 8);
    t.repeat.set(3, 1);
    return t;
  }, []);
  return (
    <group position={[SCAN_X + 1.9, -0.6, 2.4]}>
      <mesh>
        <boxGeometry args={[2.6, 0.7, 1.6]} />
        <meshStandardMaterial map={hazard} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Render on demand: a frame only when the scroll position changes, nothing while idle or off screen. */
function RenderOnScroll({ progress }: { progress: MotionValue<number> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => progress.on("change", () => invalidate()), [progress, invalidate]);
  return null;
}

export default function XrayScene({ parcels, progress }: { parcels: Parcel[]; progress: MotionValue<number> }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={typeof window !== "undefined" && window.innerWidth < 768 ? 1 : [1, 1.5]}
      camera={{ position: [1.2, 4.6, 10.5], fov: 32 }}
      onCreated={({ camera }) => camera.lookAt(0.6, 0.3, 0.9)}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 9, 6]} intensity={2.1} />
      <RenderOnScroll progress={progress} />
      <Belt progress={progress} />
      <Scanner />
      <Bin />
      {parcels.map((p, i) => (
        <ParcelMesh key={p.seller} p={p} i={i} progress={progress} />
      ))}
    </Canvas>
  );
}
