import React, { useEffect, useRef, useState } from 'react';
import { CoreMode, CustomizerConfig } from '../types';
import { Sound } from './SoundManager';

interface CoreSimulatorCanvasProps {
  config: CustomizerConfig;
  mode: CoreMode;
  scrollProgress: number; // 0.0 to 1.0
  activeOverlay: string;
  isVisualScanActive?: boolean;
}

export default function CoreSimulatorCanvas({
  config,
  mode,
  scrollProgress,
  activeOverlay,
  isVisualScanActive,
}: CoreSimulatorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Interactive rotation offsets controlled by mouse drag
  const rotationRef = useRef({ pitch: 0.2, yaw: 0.4 });
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollProgressRef = useRef(scrollProgress);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Handle pointer interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMouseRef.current = { x: e.clientX, y: e.clientY };
    Sound.playHover();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Track mouse coordinates for gravity pull
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mousePosRef.current.targetX = x;
    mousePosRef.current.targetY = y;

    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMouseRef.current.x;
    const deltaY = e.clientY - previousMouseRef.current.y;
    
    rotationRef.current.pitch += deltaY * 0.0025;
    rotationRef.current.yaw += deltaX * 0.0025;
    
    previousMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMouseRef.current.x;
    const deltaY = e.touches[0].clientY - previousMouseRef.current.y;
    
    rotationRef.current.pitch += deltaY * 0.0025;
    rotationRef.current.yaw += deltaX * 0.0025;
    
    previousMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic scale and pitch shifts mapped to scroll positions
    // This allows the model to "fly by" and shift angles as you scroll down!
    let scrollPitch = 0;
    let scrollYaw = 0;
    let scrollScale = 1;
    let scrollExplode = 0;

    // Dynamic overlays alter the zoom/scale
    let overlayZoom = 1.0;
    if (activeOverlay !== 'none') {
      overlayZoom = 0.75; // Zoom out to give space for specs overlay
    }

    // Initialize procedural particles representing "The ND Core"
    const count = config.particleCount;
    interface Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
      color: string;
      angle: number;
      radius: number;
      pulsePhase: number;
    }
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 140;
      particles.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 40,
        z: Math.sin(angle) * radius,
        size: 1 + Math.random() * 2.5,
        speed: (0.015 + Math.random() * 0.035) * config.dilationFactor,
        color: config.laserColor,
        angle,
        radius,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Setup geodesic geometry indices for aesthetic mode
    const geoNodes: { x: number; y: number; z: number }[] = [];
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const radiusScale = 110;
    // Standard 12 vertices of Icosahedron
    const rawVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ];
    rawVertices.forEach(([x, y, z]) => {
      const len = Math.sqrt(x*x + y*y + z*z);
      geoNodes.push({
        x: (x / len) * radiusScale,
        y: (y / len) * radiusScale,
        z: (z / len) * radiusScale,
      });
    });

    let autoRot = 0;
    let synapsePulsar = 0;

    // Core Animation loop
    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      const currentScroll = scrollProgressRef.current;
      
      // --- Dynamic 3D Object Ambient Light Changing With Scroll ---
      let hexColor = config.laserColor;

      const rgbMatch = hexColor.match(/\w\w/g);
      const [r, g, b] = rgbMatch ? rgbMatch.map(x => parseInt(x, 16)) : [255, 62, 0];

      const lightOffset = Math.sin(currentScroll * Math.PI * 4) * 150;
      const lightOffsetY = Math.cos(currentScroll * Math.PI * 2) * 100;
      
      const dynamicGlow = ctx.createRadialGradient(
        width / 2 + lightOffset, 
        height / 2 + lightOffsetY, 
        0, 
        width / 2, 
        height / 2, 
        Math.max(width, height) * 0.7
      );
      dynamicGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`);
      dynamicGlow.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.02)`);
      dynamicGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = dynamicGlow;
      ctx.fillRect(0, 0, width, height);

      if (currentScroll < 0.25) {
        // Intro: Core assembly zoom-in
        const t = currentScroll / 0.25;
        scrollScale = 0.5 + t * 0.5;
        scrollPitch = (1 - t) * 0.8;
        scrollYaw = t * 0.3;
        scrollExplode = (1 - t) * 1.5;
      } else if (currentScroll < 0.5) {
        // Core stability & Dilation demo
        const t = (currentScroll - 0.25) / 0.25;
        scrollScale = 1.0;
        scrollPitch = 0 + t * 0.4;
        scrollYaw = 0.3 + t * 0.6;
        scrollExplode = 0;
      } else if (currentScroll < 0.75) {
        // Ring separation & Explosion model
        const t = (currentScroll - 0.5) / 0.25;
        scrollScale = 1.0 - t * 0.2;
        scrollPitch = 0.4 - t * 0.6;
        scrollYaw = 0.9 - t * 0.9;
        scrollExplode = t * 2.2;
      } else {
        // Focused configuration viewport
        const t = (currentScroll - 0.75) / 0.25;
        scrollScale = 0.8 + t * 0.3;
        scrollPitch = -0.2 + t * 0.5;
        scrollYaw = 0 + t * 0.5;
        scrollExplode = (1 - t) * 0.4;
      }

      // Damp mouse coordinates
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.08;

      autoRot += 0.001 * config.rotationSpeed * config.dilationFactor;
      synapsePulsar += 0.04 * config.dilationFactor;

      // Base 3D transformation matrices
      const combinedPitch = rotationRef.current.pitch + scrollPitch + (mousePosRef.current.y * 0.0005);
      const combinedYaw = rotationRef.current.yaw + scrollYaw + autoRot + (mousePosRef.current.x * 0.0005);

      const cosP = Math.cos(combinedPitch);
      const sinP = Math.sin(combinedPitch);
      const cosY = Math.cos(combinedYaw);
      const sinY = Math.sin(combinedYaw);

      // Helper function to project 3D coordinates onto our 2D canvas screen
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y-axis (yaw)
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;

        // Rotate around X-axis (pitch)
        let y2 = y * cosP - z1 * sinP;
        let z2 = y * sinP + z1 * cosP;

        const fov = 400;
        const viewerDist = 450;
        const finalScale = 180 * scrollScale * overlayZoom;
        
        const perspective = fov / (viewerDist + z2);
        
        return {
          x: width / 2 + x1 * finalScale * perspective * 0.0055,
          y: height / 2 + y2 * finalScale * perspective * 0.0055,
          visible: z2 > -viewerDist,
          depth: z2,
        };
      };

      // Draw aesthetic outer rings (Concentric orbits)
      const ringColors = {
        titanium: 'rgba(150, 150, 150, 0.12)',
        obsidian: 'rgba(80, 80, 80, 0.25)',
        stellar: 'rgba(255, 62, 0, 0.25)',
        polymer: 'rgba(0, 221, 255, 0.25)',
      };
      
      const ringAccentColors = {
        titanium: 'rgba(255, 255, 255, 0.5)',
        obsidian: 'rgba(140, 140, 150, 0.7)',
        stellar: 'rgba(255, 62, 0, 0.8)',
        polymer: 'rgba(0, 221, 255, 0.8)',
      };

      const baseRingColor = ringColors[config.material];
      const accentRingColor = ringAccentColors[config.material];

      // Concentric Rings with Scroll Expansion ("explosionFactor")
      const ringRadii = [80, 120, 170];
      ringRadii.forEach((r, idx) => {
        // Explode separation creates a breathtaking mechanism detail
        const expandedRadius = r + (scrollExplode * (idx + 1) * 22);
        const segments = 120;
        
        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI * 2;
          // Rings tilt based on index to form a gyroscopic structure
          const xVal = Math.cos(theta) * expandedRadius;
          const yVal = idx === 1 ? Math.sin(theta) * expandedRadius * 0.25 : 0;
          const zVal = idx === 1 ? Math.sin(theta) * expandedRadius * 0.95 : Math.sin(theta) * expandedRadius;
          
          const pt = project(xVal, yVal, zVal);
          if (j === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = baseRingColor;
        ctx.lineWidth = idx === 1 ? 1.5 : 1;
        ctx.stroke();

        // Draw tactical hour/minute indices on the Chrono Ring (Outer ring)
        if (idx === 2) {
          const indexCount = mode === 'TEMPORAL' ? 24 : 12;
          for (let m = 0; m < indexCount; m++) {
            const th = (m / indexCount) * Math.PI * 2;
            const innerR = expandedRadius - 6;
            const outerR = expandedRadius + 3;
            
            const ptInner = project(Math.cos(th) * innerR, 0, Math.sin(th) * innerR);
            const ptOuter = project(Math.cos(th) * outerR, 0, Math.sin(th) * outerR);
            
            ctx.beginPath();
            ctx.moveTo(ptInner.x, ptInner.y);
            ctx.lineTo(ptOuter.x, ptOuter.y);
            ctx.strokeStyle = m % 6 === 0 ? accentRingColor : baseRingColor;
            ctx.lineWidth = m % 6 === 0 ? 1.8 : 0.8;
            ctx.stroke();

            // Render digital digits in TEMPORAL mode
            if (mode === 'TEMPORAL' && m % 6 === 0) {
              const textR = expandedRadius + 18;
              const ptText = project(Math.cos(th) * textR, 0, Math.sin(th) * textR);
              ctx.font = '8px var(--font-mono)';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${(m * 2).toString().padStart(2, '0')}`, ptText.x, ptText.y);
            }
          }
        }
      });

      // Draw the central power core vertical beam laser
      const laserH = 220;
      const laserPtTop = project(0, -laserH / 2, 0);
      const laserPtBottom = project(0, laserH / 2, 0);

      // Draw Central Singularity Core
      const centerPt = project(0, 0, 0);
      if (centerPt.visible) {
        const baseRadius = 20 + Math.sin(autoRot * 3) * 3;
        
        // Glowing aura
        const coreGrad = ctx.createRadialGradient(centerPt.x, centerPt.y, 2, centerPt.x, centerPt.y, baseRadius * 2);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.15, config.laserColor);
        coreGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.08)`); // semi-transparent
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, baseRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Innermost hot core
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, baseRadius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Dynamic electric discharge rings
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, baseRadius * (1.2 + Math.sin(autoRot * 6) * 0.08), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Gradient glow of vertical core laser
      const laserGrad = ctx.createLinearGradient(laserPtTop.x, laserPtTop.y, laserPtBottom.x, laserPtBottom.y);
      laserGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      laserGrad.addColorStop(0.3, config.laserColor);
      laserGrad.addColorStop(0.7, config.laserColor);
      laserGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(laserPtTop.x, laserPtTop.y);
      ctx.lineTo(laserPtBottom.x, laserPtBottom.y);
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 2 + Math.sin(autoRot * 3) * 0.5;
      ctx.stroke();

      // Outer laser core glow
      ctx.beginPath();
      ctx.moveTo(laserPtTop.x, laserPtTop.y);
      ctx.lineTo(laserPtBottom.x, laserPtBottom.y);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.05)`;
      ctx.lineWidth = 14 + Math.sin(autoRot * 2) * 4;
      ctx.stroke();

      // RENDER DETAILED 3D GEOMETRY ACCORDING TO CURRENT SIMULATOR MODES
      if (mode === 'AESTHETIC') {
        // Faceted 3D Crystal Core (Geodesic Icosahedron)
        const projectedNodes = geoNodes.map((node) => project(node.x, node.y, node.z));

        // Connect facets with glowing laser veins
        ctx.lineWidth = 0.8;
        for (let i = 0; i < projectedNodes.length; i++) {
          for (let j = i + 1; j < projectedNodes.length; j++) {
            // Check original 3D distance to draw clean geodesic edges
            const dx = geoNodes[i].x - geoNodes[j].x;
            const dy = geoNodes[i].y - geoNodes[j].y;
            const dz = geoNodes[i].z - geoNodes[j].z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist < 120) {
              const pt1 = projectedNodes[i];
              const pt2 = projectedNodes[j];
              
              const depthAvg = (pt1.depth + pt2.depth) / 2;
              const alpha = Math.max(0.02, Math.min(0.4, 1 - (depthAvg + 150) / 300));
              
              ctx.beginPath();
              ctx.moveTo(pt1.x, pt1.y);
              ctx.lineTo(pt2.x, pt2.y);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
              ctx.stroke();
            }
          }
        }

        // Draw structural nodes
        projectedNodes.forEach((pt) => {
          if (!pt.visible) return;
          const nodeRad = 3.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeRad, 0, Math.PI * 2);
          ctx.fillStyle = config.laserColor;
          ctx.fill();
          
          // Outer halo
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeRad * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
          ctx.fill();
        });

      } else if (mode === 'NEURAL') {
        // Dynamic synaptic firing networks
        const nodeCount = 18;
        const nodes: { x: number; y: number; z: number; id: number; firing: number }[] = [];
        
        for (let n = 0; n < nodeCount; n++) {
          const theta = (n / nodeCount) * Math.PI * 2 + autoRot * 0.2;
          const radial = 60 + Math.sin(synapsePulsar + n) * 15;
          nodes.push({
            x: Math.cos(theta) * radial,
            y: Math.sin(synapsePulsar * 0.5 + n) * 40,
            z: Math.sin(theta) * radial,
            id: n,
            firing: Math.max(0, Math.sin(synapsePulsar * 0.8 + n * 0.5)),
          });
        }

        // Draw neural pathways connecting nodes
        ctx.lineWidth = 1.2;
        for (let i = 0; i < nodes.length; i++) {
          const nextIdx = (i + 5) % nodes.length;
          const pt1 = project(nodes[i].x, nodes[i].y, nodes[i].z);
          const pt2 = project(nodes[nextIdx].x, nodes[nextIdx].y, nodes[nextIdx].z);

          const midP = project((nodes[i].x + nodes[nextIdx].x)/2, (nodes[i].y + nodes[nextIdx].y)/2, (nodes[i].z + nodes[nextIdx].z)/2);

          // Glowing neural pulse wave moving down the pathway
          const gradient = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
          const firingIntensity = (nodes[i].firing + nodes[nextIdx].firing) / 2;
          
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
          gradient.addColorStop(0.5, firingIntensity > 0.6 ? config.laserColor : 'rgba(255, 255, 255, 0.05)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.quadraticCurveTo(midP.x, midP.y, pt2.x, pt2.y);
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }

        // Draw synaptic bodies
        nodes.forEach((node) => {
          const pt = project(node.x, node.y, node.z);
          if (!pt.visible) return;

          const baseRad = 4 + node.firing * 6;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, baseRad, 0, Math.PI * 2);
          ctx.fillStyle = node.firing > 0.75 ? '#ffffff' : config.laserColor;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, baseRad * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
          ctx.fill();
        });

      } else if (mode === 'ASTRAL') {
        // Draw deep spatial star constellation map in the background of the core
        const constellationCount = 8;
        const starProjected: { x: number; y: number; visible: boolean }[] = [];
        
        for (let s = 0; s < constellationCount; s++) {
          const theta = (s / constellationCount) * Math.PI * 2 - autoRot * 0.1;
          const rVal = 140;
          const starX = Math.cos(theta) * rVal;
          const starY = Math.sin(s * 1.5) * 50;
          const starZ = Math.sin(theta) * rVal;
          const pt = project(starX, starY, starZ);
          starProjected.push(pt);

          if (pt.visible) {
            // Draw a crosshair or vector bracket for each navigation star
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 0.5;
            ctx.arc(pt.x, pt.y, 8, 0, Math.PI*2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(pt.x - 12, pt.y); ctx.lineTo(pt.x + 12, pt.y);
            ctx.moveTo(pt.x, pt.y - 12); ctx.lineTo(pt.x, pt.y + 12);
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI*2);
            ctx.fill();

            // Label coordinate texts (simulates extreme sell tech luxury)
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '6px var(--font-mono)';
            ctx.textAlign = 'left';
            ctx.fillText(`RA: ${(s * 45).toFixed(1)}°`, pt.x + 15, pt.y - 4);
            ctx.fillText(`DEC: ${(s * 11.2 - 30).toFixed(1)}°`, pt.x + 15, pt.y + 4);
          }
        }

        // Draw connections between constellation guides
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.8;
        for (let k = 0; k < starProjected.length; k++) {
          const next = (k + 1) % starProjected.length;
          ctx.moveTo(starProjected[k].x, starProjected[k].y);
          ctx.lineTo(starProjected[next].x, starProjected[next].y);
        }
        ctx.stroke();
      }

      // 4. RENDER CENTRAL PARTICLE SWARM VORTEX (Always present, represents flow/energy)
      particles.forEach((p) => {
        // Orbit motion mathematics
        p.angle += p.speed;
        p.x = Math.cos(p.angle) * p.radius;
        p.z = Math.sin(p.angle) * p.radius;
        // Float particles around central axis
        p.y += Math.sin(p.angle * 2 + p.pulsePhase) * 0.12 * config.dilationFactor;

        // Apply visual zoom and perspective matrix
        const pt = project(p.x, p.y, p.z);
        if (!pt.visible) return;

        // Interactive mouse cursor gravity pull deflection
        let drawX = pt.x;
        let drawY = pt.y;
        const mouseX = mousePosRef.current.x + width / 2;
        const mouseY = mousePosRef.current.y + height / 2;
        const dx = mouseX - pt.x;
        const dy = mouseY - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 1) {
          const pullIntensity = (1 - dist / 200) * 16 * config.dilationFactor;
          drawX += (dx / dist) * pullIntensity;
          drawY += (dy / dist) * pullIntensity;
        }

        // Calculate size based on spatial depth projection
        const ptSize = Math.max(0.4, p.size * (pt.depth + 450) / 450);
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, ptSize, 0, Math.PI * 2);
        
        // Depth-based transparency for gorgeous atmospheric fogging
        const baseAlpha = Math.max(0.1, Math.min(1.0, (pt.depth + 450) / 500));
        
        // Glow particles if in neural mode
        if (mode === 'NEURAL') {
          ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha * 0.95})`;
        } else {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.85})`;
        }
        ctx.fill();

        // Draw orbital halos on closest particles for extra volume depth
        if (pt.depth > 120 && p.radius > 110) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, ptSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.02)`;
          ctx.fill();
        }
      });

      // 5. HUD/TELEMETRY ACCENTS (Luxurious sci-fi calibration ticks inside the frame)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      
      // Fine bracket guides
      const padding = 15;
      ctx.beginPath();
      // Top-Left bracket
      ctx.moveTo(padding + 15, padding); ctx.lineTo(padding, padding); ctx.lineTo(padding, padding + 15);
      // Top-Right bracket
      ctx.moveTo(width - padding - 15, padding); ctx.lineTo(width - padding, padding); ctx.lineTo(width - padding, padding + 15);
      // Bottom-Left bracket
      ctx.moveTo(padding + 15, height - padding); ctx.lineTo(padding, height - padding); ctx.lineTo(padding, height - padding + 15);
      // Bottom-Right bracket
      ctx.moveTo(width - padding - 15, height - padding); ctx.lineTo(width - padding, height - padding); ctx.lineTo(width - padding, height - padding - 15);
      ctx.stroke();

      // Mini text readouts
      ctx.font = '7px var(--font-mono)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.textAlign = 'left';
      ctx.fillText(`SYS.DILATION: ${config.dilationFactor.toFixed(2)}x`, padding + 8, height - padding - 8);
      ctx.fillText(`SYS.FREQ: ${config.frequency.toFixed(2)} GHz`, padding + 8, padding + 16);
      
      ctx.textAlign = 'right';
      ctx.fillText(`CORE.PITCH: ${combinedPitch.toFixed(3)} RAD`, width - padding - 8, padding + 16);
      ctx.fillText(`CORE.STATUS: SYNCED [${config.syncRate}%]`, width - padding - 8, height - padding - 8);

      // 6. VISUAL SCAN WIREFRAME OVERLAY
      if (isVisualScanActive) {
        ctx.strokeStyle = '#10b981'; // emerald-500
        ctx.lineWidth = 0.5;
        
        // Draw horizontal scanning line
        const scanY = (Date.now() % 3000) / 3000 * height;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();

        // Draw grid overlay
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.beginPath();
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Target active elements
        for (let i = 0; i < 8; i++) {
           if (Math.random() > 0.7) {
              const rx = (0.2 + Math.random() * 0.6) * width;
              const ry = (0.2 + Math.random() * 0.6) * height;
              const sz = 10;
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
              ctx.strokeRect(rx - sz/2, ry - sz/2, sz, sz);
              ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
              ctx.font = '6px var(--font-mono)';
              ctx.fillText(Math.random().toString(16).substring(2, 6).toUpperCase(), rx + sz, ry - sz);
           }
        }
        
        // HUD message
        ctx.font = '10px var(--font-mono)';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.fillText('DIAGNOSTIC VISUAL SCAN ACTIVE', width / 2, padding + 20);
        ctx.fillText('INTEGRITY: OPTIMAL', width / 2, padding + 35);
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [config, mode, activeOverlay]);

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden">
      {/* Underlying circular radial gradient to add luxurious depth of space */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      
      <canvas
        id="thend-3d-canvas"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="block w-full h-full"
      />
    </div>
  );
}
