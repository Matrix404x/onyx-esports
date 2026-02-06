import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function GridScan({
    sensitivity = 0.55,
    lineThickness = 1,
    linesColor = "#392e4e",
    gridScale = 0.1,
    scanColor = "#FF9FFC",
    scanOpacity = 0.4,
    enablePost = true,
    bloomIntensity = 0.6,
    chromaticAberration = 0.002,
    noiseIntensity = 0.01
}) {
    return (
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <color attach="background" args={['#0f172a']} /> {/* Slate-950 match */}

            {/* Simple Grid Placeholder */}
            <Grid
                position={[0, -0.5, 0]}
                args={[100, 100]}
                cellSize={gridScale * 10}
                cellThickness={lineThickness}
                cellColor={linesColor}
                sectionSize={gridScale * 50}
                sectionThickness={lineThickness * 1.5}
                sectionColor={linesColor}
                fadeDistance={30}
                fadeStrength={1}
            />

            {/* Note: The actual "Scan" effect requires custom shader code which was not provided. 
                Using OrbitControls to inspect the grid. */}
            <OrbitControls autoRotate autoRotateSpeed={sensitivity} enableZoom={false} />

            {enablePost && (
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={bloomIntensity} />
                    <Noise opacity={noiseIntensity} />
                    <ChromaticAberration offset={[chromaticAberration, chromaticAberration]} />
                </EffectComposer>
            )}
        </Canvas>
    );
}
