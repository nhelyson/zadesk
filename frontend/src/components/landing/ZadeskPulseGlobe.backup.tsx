"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";

export interface SectorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

export interface SectorArc {
  from: { lat: number; lng: number; name: string };
  to: { lat: number; lng: number; name: string };
  color: string;
}

export interface SectorData {
  title: string;
  desc: string;
  icon: string;
  badge: string;
  metrics: string;
  targetLat: number;
  targetLng: number;
  locations: SectorLocation[];
  arcs: SectorArc[];
}

interface ZadeskPulseGlobeProps {
  activeSectorIndex: number;
  sectorsData: SectorData[];
  onSelectSector?: (index: number) => void;
}

// Accurate Coastline Polylines (Latitude, Longitude in degrees)
// Ensures Africa and continents are 100% geographically recognizable
const COASTLINES: number[][][] = [
  // 1. Africa Outline (High Fidelity perimeter)
  [
    [35.8, -5.8], [35.2, -0.6], [36.8, 3.0], [36.9, 7.8], [37.3, 9.8], [33.9, 10.8], [32.9, 13.2],
    [31.2, 16.5], [32.1, 20.0], [32.8, 21.9], [31.5, 25.1], [31.3, 30.0], [31.3, 32.3],
    [27.8, 34.3], [22.0, 36.9], [15.6, 39.5], [12.6, 43.3], [11.6, 49.0], [10.5, 51.4],
    [5.0, 48.5], [2.0, 45.3], [-0.5, 42.5], [-4.0, 39.7], [-10.5, 40.5], [-15.0, 40.5],
    [-20.0, 35.0], [-26.0, 32.9], [-30.0, 31.0], [-34.0, 25.7], [-34.8, 20.0], [-33.9, 18.4],
    [-28.6, 16.5], [-22.5, 14.5], [-17.0, 11.8], [-12.3, 13.6], [-6.0, 12.3],
    [-4.79, 11.86], // Pointe-Noire
    [-0.5, 9.3], [2.2, 9.8], [4.05, 9.76], // Douala
    [4.6, 7.0], [6.3, 3.4], [5.36, -4.0], // Abidjan
    [4.3, -7.5], [6.3, -10.8], [9.5, -13.7], [12.0, -16.0], [14.71, -17.46], // Dakar
    [16.0, -16.5], [20.8, -17.0], [27.0, -13.4], [30.4, -9.6], [35.8, -5.8]
  ],
  // 2. Madagascar
  [
    [-12.0, 49.3], [-15.0, 50.3], [-20.0, 48.5], [-25.0, 47.0], [-25.6, 45.3],
    [-20.0, 44.0], [-15.8, 44.4], [-13.5, 48.0], [-12.0, 49.3]
  ],
  // 3. Europe & Mediterranean
  [
    [36.0, -5.3], [37.0, -8.9], [41.2, -8.7], [43.4, -9.3], [43.4, -1.8], [46.0, -1.2],
    [48.4, -4.7], [49.7, -1.9], [51.0, 1.8], [53.5, 7.2], [55.5, 8.5], [57.7, 10.6],
    [55.0, 14.0], [59.0, 18.0], [60.0, 25.0], [65.0, 25.0], [70.0, 28.0], [60.0, 30.0],
    [45.0, 35.0], [41.0, 29.0], [38.0, 24.0], [36.5, 22.0], [40.5, 17.5], [44.0, 12.5],
    [43.5, 7.0], [41.5, 2.0], [36.0, -5.3]
  ],
  // 4. Arabian Peninsula & Middle East
  [
    [30.0, 32.5], [28.0, 34.5], [22.0, 39.0], [12.8, 45.0], [15.0, 52.0], [22.5, 59.5],
    [25.2, 55.3], // Dubai
    [26.0, 50.5], [30.0, 48.0], [30.0, 32.5]
  ],
  // 5. Asia, India & China Coast
  [
    [25.0, 62.0], [20.0, 72.8], [15.0, 74.0], [10.0, 76.0], [8.0, 77.5], [13.0, 80.2],
    [17.0, 82.5], [21.5, 87.0], [22.0, 91.5], [16.0, 96.0], [8.0, 98.5], [1.3, 103.8],
    [7.0, 103.5], [13.0, 101.0], [21.0, 108.0],
    [23.12, 113.26], // Guangzhou
    [25.0, 119.0], [30.0, 122.0], [37.5, 122.5], [40.0, 120.0]
  ],
  // 6. South America
  [
    [10.0, -75.0], [8.0, -77.0], [-5.0, -81.0], [-18.0, -70.0], [-33.0, -71.5],
    [-45.0, -75.0], [-53.0, -71.0], [-55.0, -66.0], [-40.0, -62.0], [-23.0, -43.0],
    [-13.0, -38.5], [-7.0, -35.0], [-2.5, -44.0], [5.0, -52.0], [10.0, -62.0], [10.0, -75.0]
  ],
  // 7. North America (East Coast & Gulf)
  [
    [9.0, -79.0], [16.0, -95.0], [23.0, -110.0], [34.0, -120.0], [48.0, -124.0],
    [45.0, -65.0], [30.0, -81.0], [25.0, -80.0], [30.0, -88.0], [26.0, -97.0], [9.0, -79.0]
  ]
];

// République du Congo (Congo-Brazzaville) High-Precision Boundary Polygon
// Immediately recognizable in Central Africa (Atlantic Ocean, Mayombe, Brazzaville, Pool, Sangha, Likouala)
const CONGO_BORDER: number[][] = [
  [-5.05, 12.02], // Cabinda coastal border
  [-4.79, 11.86], // Pointe-Noire (Port maritime)
  [-4.45, 11.55],
  [-4.10, 11.30],
  [-3.92, 11.14], // Mayumba / Gabon border on Atlantic
  [-3.50, 11.55], // Mayombe
  [-3.05, 11.90], // Niari
  [-2.65, 12.20],
  [-2.25, 12.80],
  [-2.20, 13.40],
  [-1.85, 13.90],
  [-1.50, 14.15],
  [-0.95, 14.30],
  [-0.35, 14.25],
  [0.40, 14.10],
  [1.10, 14.05],
  [1.75, 14.15],
  [2.15, 14.45],
  [2.25, 15.15], // Tripoint Gabon-Cameroon-Congo
  [2.25, 15.70], // Cameroon border north of Ouesso
  [2.35, 16.05], // Tripoint Cameroon-CAR-Congo (Sangha)
  [2.85, 16.25],
  [3.40, 16.50],
  [3.70, 17.50], // Extreme North / Ubangi confluence
  [3.00, 18.15], // Ubangi river border with DRC
  [2.00, 18.60], // Impfondo
  [1.15, 18.15],
  [0.05, 17.70], // Mossaka
  [-0.75, 16.90], // Makotimpoko
  [-1.50, 16.50],
  [-2.10, 16.20], // Mpouya
  [-3.00, 16.00], // Ngabé
  [-3.60, 15.80],
  [-4.26, 15.28], // Brazzaville (Pool Malebo)
  [-4.45, 15.00], // Cataractes
  [-4.65, 14.35], // Boko
  [-4.80, 13.90], // Mindouli
  [-4.65, 13.35], // Loutété
  [-4.90, 12.80], // Kimongo
  [-4.95, 12.30], // Cabinda tripoint
  [-5.05, 12.02], // Back to start
];

// Neighboring Central African Borders for Context & Contrast
const CENTRAL_AFRICA_BORDERS: number[][][] = [
  // Gabon - Cameroon
  [[2.25, 9.8], [2.25, 11.5], [2.25, 15.15]],
  // Cameroon - CAR (Centrafrique)
  [[2.35, 16.05], [3.5, 15.5], [4.5, 14.8], [6.0, 14.4]],
  // CAR - DRC (Oubangui)
  [[3.70, 17.50], [4.0, 19.0], [4.3, 21.0], [4.1, 22.5]],
  // DRC - Angola / Cabinda
  [[-5.05, 12.02], [-5.8, 12.4], [-6.0, 13.5], [-6.0, 15.0], [-6.5, 16.8]],
  // DRC - East / Great Lakes
  [[-1.0, 29.5], [-2.0, 29.0], [-3.5, 29.2], [-5.0, 29.6], [-8.0, 30.5]],
];

// Key Departmental & Economic Centers inside Congo-Brazzaville
const CONGO_CITIES_DOTS: [number, number][] = [
  [-4.26, 15.28], // Brazzaville
  [-4.79, 11.86], // Pointe-Noire
  [-4.20, 12.67], // Dolisie
  [-4.18, 13.28], // Nkayi
  [-3.68, 13.35], // Sibiti
  [-4.15, 13.55], // Madingou
  [-4.36, 14.76], // Kinkala
  [-2.54, 14.75], // Djambala
  [-1.87, 15.86], // Gamboma
  [-1.15, 15.97], // Oyo
  [-0.48, 15.90], // Owando
  [0.00, 15.63],  // Makoua
  [1.61, 16.05],  // Ouesso
  [1.63, 18.06],  // Impfondo
  [-1.22, 16.79], // Mossaka
];

// Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Generate smooth 3D Quadratic/Cubic Bezier curve elevated above the sphere
function createCurveArc(p1: THREE.Vector3, p2: THREE.Vector3, elevationRatio: number = 0.18): THREE.CubicBezierCurve3 {
  const distance = p1.distanceTo(p2);
  const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

  const altitude = Math.max(distance * elevationRatio, 0.35);
  const normal = midPoint.clone().normalize();
  const cp1 = p1.clone().lerp(midPoint, 0.45).add(normal.clone().multiplyScalar(altitude * 0.85));
  const cp2 = p2.clone().lerp(midPoint, 0.55).add(normal.clone().multiplyScalar(altitude * 0.85));

  return new THREE.CubicBezierCurve3(p1, cp1, cp2, p2);
}

interface ProjectedCityLabel {
  name: string;
  x: number;
  y: number;
  visible: boolean;
  color: string;
  isCountryBadge?: boolean;
}

export const ZadeskPulseGlobe: React.FC<ZadeskPulseGlobeProps> = ({
  activeSectorIndex,
  sectorsData,
  onSelectSector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const animatedParticlesRef = useRef<{ mesh: THREE.Mesh; curve: THREE.CubicBezierCurve3; speed: number; progress: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const [projectedLabels, setProjectedLabels] = useState<ProjectedCityLabel[]>([]);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const GLOBE_RADIUS = 3.35;

  // Helper to dynamically position camera so the globe is LARGE and fills ~85% of the viewport without clipping
  const updateCameraDistance = (camera: THREE.PerspectiveCamera, width: number, height: number) => {
    const aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    // Scale dynamically to fill 85% of the limiting viewport dimension (width or height)
    // leaving a clean 7.5% safe margin on each side for arcs and floating tags
    const fovRad = (camera.fov * Math.PI) / 180;
    const tanHalfFov = Math.tan(fovRad / 2);
    const minRatio = Math.min(1, aspect);
    const fillRatio = 0.85;

    const optimalDistance = GLOBE_RADIUS / (fillRatio * tanHalfFov * minRatio);
    camera.position.set(0, 0, optimalDistance);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    updateCameraDistance(camera, width, height);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer (Transparent Light Luxury)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% Transparent
    renderer.domElement.style.display = "block";
    renderer.domElement.style.outline = "none";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Globe Master Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 3.1 Inner Frosted Glass / Quartz Sphere
    // Translucent off-white with delicate specular sheen
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 64, 64);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0xF8FAFC,
      emissive: 0xF1F5F9,
      emissiveIntensity: 0.8,
      specular: 0x10B981,
      shininess: 30,
      transparent: true,
      opacity: 0.94,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 3.2 Lighting inside scene
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(5, 8, 7);
    scene.add(dirLight);

    const subtleEmeraldLight = new THREE.PointLight(0x10B981, 2.5, 20);
    subtleEmeraldLight.position.set(-6, -4, 6);
    scene.add(subtleEmeraldLight);

    // 3.3 Latitude & Longitude Elegant Meridian Rings (Light Slate Grid)
    const gridGroup = new THREE.Group();
    const meridianMat = new THREE.LineBasicMaterial({
      color: 0xCBD5E1, // Slate 300
      transparent: true,
      opacity: 0.35,
    });

    // Equator and key tropics
    [-30, 0, 30].forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = GLOBE_RADIUS * Math.sin(phi);
      const ringY = GLOBE_RADIUS * Math.cos(phi);

      const circlePoints: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        circlePoints.push(new THREE.Vector3(Math.cos(theta) * ringRadius, ringY, Math.sin(theta) * ringRadius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
      gridGroup.add(new THREE.Line(ringGeo, meridianMat));
    });

    globeGroup.add(gridGroup);

    // 3.4 REAL GEOGRAPHIC COASTLINES (Crisp Slate vector outlines)
    const coastlinesGroup = new THREE.Group();
    const coastMat = new THREE.LineBasicMaterial({
      color: 0x334155, // Slate 700 - Highly crisp & elegant
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });

    COASTLINES.forEach((polyline) => {
      const points: THREE.Vector3[] = polyline.map((coord) =>
        latLngToVector3(coord[0], coord[1], GLOBE_RADIUS * 1.002)
      );
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, coastMat);
      coastlinesGroup.add(line);
    });

    globeGroup.add(coastlinesGroup);

    // 3.4.1 Regional African Borders for Geographic Context (Slate 400 thin lines)
    const regionalBordersGroup = new THREE.Group();
    const regionalMat = new THREE.LineBasicMaterial({
      color: 0x94A3B8, // Slate 400
      transparent: true,
      opacity: 0.45,
    });
    CENTRAL_AFRICA_BORDERS.forEach((polyline) => {
      const points = polyline.map((coord) =>
        latLngToVector3(coord[0], coord[1], GLOBE_RADIUS * 1.002)
      );
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      regionalBordersGroup.add(new THREE.Line(geo, regionalMat));
    });
    globeGroup.add(regionalBordersGroup);

    // 3.4.2 RÉPUBLIQUE DU CONGO (Congo-Brazzaville) High-Prominence Vector Silhouette
    const congoGroup = new THREE.Group();
    const congoPoints = CONGO_BORDER.map((coord) =>
      latLngToVector3(coord[0], coord[1], GLOBE_RADIUS * 1.005)
    );
    // Ensure closed loop
    congoPoints.push(congoPoints[0]);
    const congoGeo = new THREE.BufferGeometry().setFromPoints(congoPoints);

    // Core crisp Emerald Boundary (Zadesk signature color)
    const congoMat = new THREE.LineBasicMaterial({
      color: 0x10B981, // Emerald 500
      linewidth: 3,
      transparent: true,
      opacity: 0.98,
    });
    const congoLine = new THREE.Line(congoGeo, congoMat);
    congoGroup.add(congoLine);

    // Elevated Glowing Aura along the border for immediate eye-catching visibility
    const congoGlowMat = new THREE.LineBasicMaterial({
      color: 0x34D399, // Emerald 400
      linewidth: 5,
      transparent: true,
      opacity: 0.6,
    });
    const congoGlowLine = new THREE.Line(congoGeo, congoGlowMat);
    congoGroup.add(congoGlowLine);

    // Luminous Departmental Hubs & Cities Matrix inside Congo-Brazzaville
    const congoDotsPositions: number[] = [];
    const congoDotsColors: number[] = [];
    const cEmerald = new THREE.Color(0x10B981);
    const cGold = new THREE.Color(0xF59E0B);

    CONGO_CITIES_DOTS.forEach(([lat, lng], idx) => {
      const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.006);
      congoDotsPositions.push(pos.x, pos.y, pos.z);
      const c = idx % 2 === 0 ? cEmerald : cGold;
      congoDotsColors.push(c.r, c.g, c.b);
    });

    const congoDotsGeo = new THREE.BufferGeometry();
    congoDotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(congoDotsPositions, 3));
    congoDotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(congoDotsColors, 3));
    const congoDotsMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const congoDots = new THREE.Points(congoDotsGeo, congoDotsMat);
    congoGroup.add(congoDots);

    globeGroup.add(congoGroup);

    // 3.5 Subtle Continent Dot Clusters for African Core & World
    const dotsCount = 1000;
    const dotPositions: number[] = [];
    const dotColors: number[] = [];
    const colorSlate = new THREE.Color(0x64748B);
    const colorEmerald = new THREE.Color(0x10B981);

    for (let i = 0; i < dotsCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotsCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const lat = 90 - (phi * 180) / Math.PI;
      let lng = ((theta * 180) / Math.PI) % 360;
      if (lng > 180) lng -= 360;

      // Filter over land areas
      const isAfrica = lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52;
      const isEurope = lat >= 36 && lat <= 70 && lng >= -10 && lng <= 45;
      const isAsia = lat >= 5 && lat <= 60 && lng >= 45 && lng <= 145;
      const isAmericas = lat >= -55 && lat <= 65 && lng >= -140 && lng <= -34;

      if (isAfrica || isEurope || isAsia || isAmericas) {
        const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.001);
        dotPositions.push(pos.x, pos.y, pos.z);

        const c = isAfrica ? colorEmerald.clone().lerp(colorSlate, 0.3) : colorSlate;
        dotColors.push(c.r, c.g, c.b);
      }
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const landDots = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(landDots);

    // 4. Arcs Group
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    // 5. Pins Group
    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Initial camera focus directly on Congo-Brazzaville (Brazzaville & Pointe-Noire at center)
    globeGroup.rotation.y = -(15.2 * Math.PI) / 180 - Math.PI * 0.5;
    globeGroup.rotation.x = 0.04;

    // Drag Interaction (Inertial, tactile)
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;
      globeGroupRef.current.rotation.x = Math.max(-0.7, Math.min(0.7, globeGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      if (autoRotateTimeoutRef.current) clearTimeout(autoRotateTimeoutRef.current);
      autoRotateTimeoutRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, 4000);
    };

    // Mobile Touch Drag
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.006;
      globeGroupRef.current.rotation.x += deltaY * 0.006;
      globeGroupRef.current.rotation.x = Math.max(-0.7, Math.min(0.7, globeGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth || 500;
      const newH = container.clientHeight || 500;
      rendererRef.current.setSize(newW, newH);
      updateCameraDistance(cameraRef.current, newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // Animation Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation
      if (globeGroupRef.current && autoRotateRef.current && !isDraggingRef.current) {
        globeGroupRef.current.rotation.y += delta * 0.055;
      }

      // Pulse pin ripple rings
      if (pinsGroupRef.current) {
        pinsGroupRef.current.children.forEach((pinGroup, idx) => {
          const ring = pinGroup.children[1];
          if (ring) {
            const scale = 1 + (Math.sin(elapsedTime * 3.5 + idx * 0.8) + 1) * 0.35;
            ring.scale.set(scale, scale, scale);
          }
        });
      }

      // Animate flying data particles along arcs
      animatedParticlesRef.current.forEach((item) => {
        item.progress += delta * item.speed;
        if (item.progress > 1) item.progress = 0;
        const pt = item.curve.getPointAt(item.progress);
        item.mesh.position.copy(pt);
      });

      // Project 3D City coordinates to 2D HTML Label Positions
      if (cameraRef.current && globeGroupRef.current && containerRef.current) {
        const sector = sectorsData[activeSectorIndex];
        if (sector) {
          const halfW = (containerRef.current?.clientWidth || 500) / 2;
          const halfH = (containerRef.current?.clientHeight || 500) / 2;

          const sectorLabels: ProjectedCityLabel[] = sector.locations.map((loc) => {
            const vLocal = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS * 1.05);
            // Transform local vector by globeGroup matrix
            const vWorld = vLocal.clone().applyMatrix4(globeGroupRef.current!.matrixWorld);

            // Vector from sphere center to point (normal)
            const normal = vWorld.clone().normalize();
            // Vector from point to camera
            const viewDir = cameraRef.current!.position.clone().sub(vWorld).normalize();

            // Visible only when facing towards the camera (with safety margin before horizon)
            const isFront = normal.dot(viewDir) > 0.15;

            // Project to 2D normalized device coordinates (-1 to +1)
            const projected = vWorld.clone().project(cameraRef.current!);

            const screenX = projected.x * halfW + halfW;
            const screenY = -projected.y * halfH + halfH;

            return {
              name: loc.name,
              x: screenX,
              y: screenY,
              visible: isFront && projected.z < 1,
              color: loc.color,
            };
          });

          // Permanent 3D badge for Congo-Brazzaville in Central Africa
          const congoCenterLocal = latLngToVector3(-1.4, 15.6, GLOBE_RADIUS * 1.06);
          const congoCenterWorld = congoCenterLocal.clone().applyMatrix4(globeGroupRef.current!.matrixWorld);
          const congoNormal = congoCenterWorld.clone().normalize();
          const viewDirCongo = cameraRef.current!.position.clone().sub(congoCenterWorld).normalize();
          const isCongoFront = congoNormal.dot(viewDirCongo) > 0.12;

          const congoProj = congoCenterWorld.clone().project(cameraRef.current!);

          const congoBadge: ProjectedCityLabel = {
            name: "Congo-Brazzaville",
            x: congoProj.x * halfW + halfW,
            y: -congoProj.y * halfH + halfH,
            visible: isCongoFront && congoProj.z < 1,
            color: "#10B981",
            isCountryBadge: true,
          };

          setProjectedLabels([congoBadge, ...sectorLabels]);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (autoRotateTimeoutRef.current) clearTimeout(autoRotateTimeoutRef.current);

      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);

      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // Update Camera Target, Arcs & Pins on Sector Change
  useEffect(() => {
    if (!globeGroupRef.current || !arcsGroupRef.current || !pinsGroupRef.current) return;

    const sector = sectorsData[activeSectorIndex];
    if (!sector) return;

    // 1. Cinematic GSAP rotation to center target region smoothly
    const targetRadY = -(sector.targetLng * Math.PI) / 180 - Math.PI * 0.5;
    const targetRadX = (sector.targetLat * Math.PI) / 180 * 0.55;

    gsap.to(globeGroupRef.current.rotation, {
      y: targetRadY,
      x: targetRadX,
      duration: 1.1,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Pause auto-rotation momentarily to let user inspect the destination
    autoRotateRef.current = false;
    if (autoRotateTimeoutRef.current) clearTimeout(autoRotateTimeoutRef.current);
    autoRotateTimeoutRef.current = setTimeout(() => {
      autoRotateRef.current = true;
    }, 4500);

    // 2. Clear old arcs & pins
    while (arcsGroupRef.current.children.length > 0) {
      const obj = arcsGroupRef.current.children[0];
      arcsGroupRef.current.remove(obj);
    }
    while (pinsGroupRef.current.children.length > 0) {
      const obj = pinsGroupRef.current.children[0];
      pinsGroupRef.current.remove(obj);
    }
    animatedParticlesRef.current = [];

    // 3. Render Beacons on Key Hubs
    sector.locations.forEach((loc) => {
      const pos = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS * 1.008);

      // Pin core sphere
      const pinGeo = new THREE.SphereGeometry(0.085, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color || "#10B981"),
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);

      // Ripple ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.24, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color || "#10B981"),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      const pinContainer = new THREE.Group();
      pinContainer.add(pinMesh);
      pinContainer.add(ringMesh);
      pinsGroupRef.current?.add(pinContainer);
    });

    // 4. Render Arcs & Animated Travelling Flow Particles
    sector.arcs.forEach((arc, i) => {
      const vFrom = latLngToVector3(arc.from.lat, arc.from.lng, GLOBE_RADIUS * 1.008);
      const vTo = latLngToVector3(arc.to.lat, arc.to.lng, GLOBE_RADIUS * 1.008);

      const curve = createCurveArc(vFrom, vTo, 0.18);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      // Gradient arc material (Emerald to Cyan)
      const curveMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(arc.color || "#10B981"),
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      });

      const line = new THREE.Line(curveGeo, curveMat);
      arcsGroupRef.current?.add(line);

      // Flying pulse bead on arc
      const beadGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const beadMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
      });
      const beadMesh = new THREE.Mesh(beadGeo, beadMat);
      arcsGroupRef.current?.add(beadMesh);

      animatedParticlesRef.current.push({
        mesh: beadMesh,
        curve,
        speed: 0.45 + (i % 3) * 0.15,
        progress: (i * 0.3) % 1,
      });
    });
  }, [activeSectorIndex, sectorsData]);

  const currentSector = sectorsData[activeSectorIndex];

  return (
    <div className="relative w-full h-[340px] sm:h-[480px] lg:h-[620px] flex items-center justify-center select-none overflow-visible">
      {/* Soft Ground Ambient Radial Shadow — Bases the globe naturally on the page */}
      <div className="absolute bottom-4 sm:bottom-6 w-[280px] sm:w-[420px] h-[36px] sm:h-[48px] rounded-full bg-slate-900/[0.07] blur-2xl pointer-events-none transform scale-y-50" />

      {/* 3D WebGL Canvas Mount (100% Transparent, No harsh borders, pan-y allows vertical scroll on mobile) */}
      <div
        ref={containerRef}
        style={{ touchAction: "pan-y" }}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-0"
        title="Faites glisser pour explorer le globe 3D"
      />

      {/* Real City Floating Labels (Synchronized with 3D projection) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
        {projectedLabels.map((lbl, idx) => {
          if (!lbl.visible) return null;
          if (lbl.isCountryBadge) {
            return (
              <div
                key="congo-badge"
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 z-30 pointer-events-none"
                style={{
                  left: `${lbl.x}px`,
                  top: `${lbl.y}px`,
                }}
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white border border-emerald-400 text-xs font-black shadow-lg shadow-emerald-950/25 backdrop-blur-md whitespace-nowrap animate-in fade-in zoom-in-95">
                  <span className="text-sm">🇨🇬</span>
                  <span className="tracking-wide">Congo-Brazzaville</span>
                </div>
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-8 transition-opacity duration-200 animate-in fade-in"
              style={{
                left: `${lbl.x}px`,
                top: `${lbl.y}px`,
              }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-[11px] font-bold text-slate-900 shadow-md shadow-slate-200/50 whitespace-nowrap">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: lbl.color }}
                />
                <span>{lbl.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
