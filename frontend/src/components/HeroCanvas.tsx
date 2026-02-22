import { useRef, Suspense, Component, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/* ─── GLTF farmer loader ─────────────────────────────────────────────── */
useGLTF.preload('/indian_farmer.glb');

// Priority order — first match wins; falls back to whatever is available
const PREFERRED_ANIMS = ['Idle', 'idle', 'Stand', 'Walk', 'walk', 'Survey', 'Nervous', 'Looking'];
const SKIP_ANIMS      = ['death', 'Death', 'die', 'Die', 'Fall', 'fall'];

function pickAnim(names: string[]): string | null {
  for (const pref of PREFERRED_ANIMS) {
    const hit = names.find(n => n.toLowerCase().includes(pref.toLowerCase()));
    if (hit) return hit;
  }
  // Return first that isn't a death/fall animation
  const safe = names.find(n => !SKIP_ANIMS.some(s => n.toLowerCase().includes(s.toLowerCase())));
  return safe ?? (names.length ? names[0] : null);
}

function FarmerGLTF() {
  const { scene, animations } = useGLTF('/indian_farmer.glb');
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    console.log('[Farmer] available animations:', names);
    const chosen = pickAnim(names);
    console.log('[Farmer] playing:', chosen);
    if (!chosen || !actions[chosen]) return;
    // Stop everything else first
    Object.values(actions).forEach(a => a?.stop());
    actions[chosen]!.reset().setEffectiveTimeScale(0.6).fadeIn(0.3).play();
  }, [names, actions]);

  // Slow anxious body sway — tense farmer looking around
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.7, 0]} scale={[1.5, 1.5, 1.5]}>
      <primitive object={scene} />
    </group>
  );
}

/* ─── Error boundary — falls back to geometric farmer ────────────────── */
interface EBProps { children: ReactNode; fallback: ReactNode }
interface EBState { err: boolean }
class FarmerBoundary extends Component<EBProps, EBState> {
  state: EBState = { err: false };
  static getDerivedStateFromError(): EBState { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

/* ─── Geometric Indian farmer (fallback while model loads / missing) ─── */
function FarmerFallback() {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const lArmRef = useRef<THREE.Mesh>(null);
  const rArmRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 1.0) * 0.06;
      bodyRef.current.rotation.y = Math.sin(t * 0.4) * 0.12;
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.8) * 0.15;
      headRef.current.rotation.y = Math.sin(t * 0.9) * 0.25;
    }
    if (lArmRef.current) lArmRef.current.rotation.z =  1.1 + Math.sin(t * 1.3) * 0.25;
    if (rArmRef.current) rArmRef.current.rotation.z = -1.1 - Math.sin(t * 1.3 + 1) * 0.25;
  });

  const skin = '#8d5524'; const kurta = '#fafaf9';
  const dhoti = '#fefce8'; const pagdi = '#f97316'; const gamcha = '#dc2626';

  return (
    <group ref={bodyRef} position={[0, -0.6, 0]}>
      <mesh position={[-0.16, -1.0, 0]}><cylinderGeometry args={[0.15,0.12,1.0,14]}/><meshStandardMaterial color={dhoti} roughness={0.85}/></mesh>
      <mesh position={[0.16, -1.0, 0]}><cylinderGeometry args={[0.15,0.12,1.0,14]}/><meshStandardMaterial color={dhoti} roughness={0.85}/></mesh>
      <mesh position={[0,-0.55,0]}><cylinderGeometry args={[0.3,0.28,0.22,16]}/><meshStandardMaterial color={dhoti} roughness={0.85}/></mesh>
      <mesh position={[-0.16,-1.52,0.1]}><boxGeometry args={[0.19,0.1,0.36]}/><meshStandardMaterial color={skin} roughness={0.9}/></mesh>
      <mesh position={[0.16,-1.52,0.1]}><boxGeometry args={[0.19,0.1,0.36]}/><meshStandardMaterial color={skin} roughness={0.9}/></mesh>
      <mesh position={[0,-0.1,0]}><cylinderGeometry args={[0.29,0.25,1.15,16]}/><meshStandardMaterial color={kurta} roughness={0.75}/></mesh>
      <mesh position={[0,0.05,0.27]}><boxGeometry args={[0.06,0.55,0.02]}/><meshStandardMaterial color="#e2e8f0" roughness={0.7}/></mesh>
      <mesh position={[0.12,0.2,0.2]} rotation={[-0.5,0.3,0.2]}><boxGeometry args={[0.42,0.12,0.04]}/><meshStandardMaterial color={gamcha} roughness={0.9}/></mesh>
      <mesh position={[0.24,-0.05,0.14]} rotation={[-0.9,0.2,0.1]}><boxGeometry args={[0.12,0.55,0.04]}/><meshStandardMaterial color={gamcha} roughness={0.9}/></mesh>
      <mesh ref={lArmRef} position={[-0.46,0.22,0]} rotation={[0,0,1.1]}><cylinderGeometry args={[0.09,0.075,0.72,10]}/><meshStandardMaterial color={skin} roughness={0.6}/></mesh>
      <mesh position={[-0.82,0.57,0]}><sphereGeometry args={[0.11,10,10]}/><meshStandardMaterial color={skin} roughness={0.5}/></mesh>
      <mesh ref={rArmRef} position={[0.46,0.22,0]} rotation={[0,0,-1.1]}><cylinderGeometry args={[0.09,0.075,0.72,10]}/><meshStandardMaterial color={skin} roughness={0.6}/></mesh>
      <mesh position={[0.82,0.57,0]}><sphereGeometry args={[0.11,10,10]}/><meshStandardMaterial color={skin} roughness={0.5}/></mesh>
      <mesh position={[0,0.62,0]}><cylinderGeometry args={[0.12,0.13,0.22,12]}/><meshStandardMaterial color={skin} roughness={0.5}/></mesh>
      <group ref={headRef} position={[0,0.95,0]}>
        <mesh><sphereGeometry args={[0.32,24,24]}/><meshStandardMaterial color={skin} roughness={0.5}/></mesh>
        <mesh position={[-0.1,0.04,0.285]}><sphereGeometry args={[0.066,8,8]}/><meshStandardMaterial color="#fff8f1"/></mesh>
        <mesh position={[0.1,0.04,0.285]}><sphereGeometry args={[0.066,8,8]}/><meshStandardMaterial color="#fff8f1"/></mesh>
        <mesh position={[-0.1,0.04,0.295]}><sphereGeometry args={[0.04,8,8]}/><meshStandardMaterial color="#1c0a00"/></mesh>
        <mesh position={[0.1,0.04,0.295]}><sphereGeometry args={[0.04,8,8]}/><meshStandardMaterial color="#1c0a00"/></mesh>
        <mesh position={[-0.11,0.155,0.28]} rotation={[0,0,-0.45]}><boxGeometry args={[0.115,0.032,0.022]}/><meshStandardMaterial color="#1c0a00"/></mesh>
        <mesh position={[0.11,0.155,0.28]} rotation={[0,0,0.45]}><boxGeometry args={[0.115,0.032,0.022]}/><meshStandardMaterial color="#1c0a00"/></mesh>
        <mesh position={[-0.075,-0.042,0.3]} rotation={[0,0,0.32]}><capsuleGeometry args={[0.032,0.115,4,8]}/><meshStandardMaterial color="#1c0a00" roughness={0.7}/></mesh>
        <mesh position={[0.075,-0.042,0.3]} rotation={[0,0,-0.32]}><capsuleGeometry args={[0.032,0.115,4,8]}/><meshStandardMaterial color="#1c0a00" roughness={0.7}/></mesh>
        <mesh position={[0,-0.028,0.3]}><sphereGeometry args={[0.034,8,8]}/><meshStandardMaterial color="#1c0a00" roughness={0.7}/></mesh>
        <mesh position={[0,-0.12,0.295]} rotation={[0,0,0.15]}><torusGeometry args={[0.065,0.018,6,12,Math.PI]}/><meshStandardMaterial color="#7c2d12"/></mesh>
        <mesh position={[0,0.25,0]}><torusGeometry args={[0.31,0.115,10,28]}/><meshStandardMaterial color={pagdi} roughness={0.82}/></mesh>
        <mesh position={[0,0.38,0]} rotation={[0,0.9,0]}><torusGeometry args={[0.265,0.1,10,28]}/><meshStandardMaterial color={pagdi} roughness={0.82}/></mesh>
        <mesh position={[0,0.50,0]} rotation={[0,1.8,0]}><torusGeometry args={[0.21,0.085,10,28]}/><meshStandardMaterial color={pagdi} roughness={0.82}/></mesh>
        <mesh position={[0,0.60,0]}><cylinderGeometry args={[0.18,0.185,0.08,20]}/><meshStandardMaterial color={pagdi} roughness={0.8}/></mesh>
        <mesh position={[0.3,0.3,0.08]} rotation={[0.2,-0.4,0.5]}><capsuleGeometry args={[0.055,0.2,4,10]}/><meshStandardMaterial color="#c2410c" roughness={0.8}/></mesh>
      </group>
    </group>
  );
}

/* ─── Smart farmer — GLTF if available, geometric otherwise ─────────── */
function Farmer() {
  return (
    <FarmerBoundary fallback={<FarmerFallback />}>
      <Suspense fallback={<FarmerFallback />}>
        <FarmerGLTF />
      </Suspense>
    </FarmerBoundary>
  );
}

/* ─── Scheme Document Card ─────────────────────────────────────────── */
function SchemeCard({ position, rotation, label, subLabel, color, floatSpeed, floatOffset }: {
  position: [number,number,number]; rotation: [number,number,number];
  label: string; subLabel: string; color: string; floatSpeed: number; floatOffset: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * floatSpeed + floatOffset;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t) * 0.18;
      ref.current.rotation.y = rotation[1] + Math.sin(t * 0.5) * 0.2;
      ref.current.rotation.z = rotation[2] + Math.sin(t * 0.7) * 0.06;
    }
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <RoundedBox args={[1.5, 1.0, 0.06]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#fffbeb" roughness={0.3} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, 0.37, 0.035]}><boxGeometry args={[1.5, 0.26, 0.01]}/><meshStandardMaterial color={color} roughness={0.4}/></mesh>
      <mesh position={[0, 0.36, 0.045]}><circleGeometry args={[0.08, 16]}/><meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6}/></mesh>
      <Text position={[0,0.08,0.05]} fontSize={0.155} color="#1c1917" anchorX="center" anchorY="middle" maxWidth={1.3}>{label}</Text>
      <Text position={[0,-0.15,0.05]} fontSize={0.095} color="#78716c" anchorX="center" anchorY="middle" maxWidth={1.3}>{subLabel}</Text>
      {[-0.3,-0.38].map((y,i)=>(
        <mesh key={i} position={[0,y,0.04]}><boxGeometry args={[1.1,0.018,0.01]}/><meshStandardMaterial color="#d6d3d1"/></mesh>
      ))}
    </group>
  );
}

/* ─── Floating Question Mark ─────────────────────────────────────── */
function QuestionMark({ position, floatSpeed, floatOffset, scale=1 }: {
  position:[number,number,number]; floatSpeed:number; floatOffset:number; scale?:number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * floatSpeed + floatOffset;
    if (ref.current) { ref.current.position.y = position[1] + Math.sin(t) * 0.22; ref.current.rotation.y += 0.012; }
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <Text fontSize={0.55} color="#f59e0b" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#92400e">?</Text>
    </group>
  );
}

/* ─── Scene ─────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[5,8,5]} intensity={2.4} color="#fde68a" castShadow />
      <directionalLight position={[-4,3,-2]} intensity={0.8} color="#bbf7d0" />
      <pointLight position={[0,4,3]} intensity={1.2} color="#fbbf24" />
      <Farmer />
      <Float speed={0} floatIntensity={0}>
        <SchemeCard position={[-2.6,0.8,-0.5]} rotation={[0.05,0.35,-0.08]} label="PM-KISAN" subLabel="Rs.6,000/year direct benefit" color="#16a34a" floatSpeed={0.6} floatOffset={0}/>
        <SchemeCard position={[2.5,0.6,-0.3]} rotation={[0.0,-0.4,0.1]} label="PMFBY" subLabel="Crop Insurance Scheme" color="#2563eb" floatSpeed={0.7} floatOffset={1.5}/>
        <SchemeCard position={[-2.2,-0.9,0.4]} rotation={[0.1,0.5,0.12]} label="KCC Scheme" subLabel="Kisan Credit Card Loan" color="#dc2626" floatSpeed={0.55} floatOffset={3.0}/>
        <SchemeCard position={[2.2,-0.8,0.5]} rotation={[-0.05,-0.5,-0.1]} label="Soil Health Card" subLabel="Free soil testing & report" color="#7c3aed" floatSpeed={0.65} floatOffset={2.0}/>
        <SchemeCard position={[0.2,2.1,-1.2]} rotation={[0.2,0.1,0.06]} label="MIDH" subLabel="Horticulture Development" color="#d97706" floatSpeed={0.5} floatOffset={4.0}/>
      </Float>
      <QuestionMark position={[-0.7,2.2,0.3]} floatSpeed={1.1} floatOffset={0} scale={1.0}/>
      <QuestionMark position={[0.7,2.5,0.2]} floatSpeed={0.9} floatOffset={1.2} scale={0.75}/>
      <QuestionMark position={[0.1,2.8,0.5]} floatSpeed={1.3} floatOffset={2.4} scale={0.55}/>
    </>
  );
}

/* ─── Canvas export ──────────────────────────────────────────────── */
export default function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0.2, 7.5], fov: 42 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
