"use client";

import React, { useEffect, useRef, useState } from "react";
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

// Closed Geographic Coastline Polygons (Latitude, Longitude in degrees)
const COASTLINES: { name: string; isAfrica: boolean; points: number[][] }[] = [
  // 1. Africa Main Continental Outline (Closed perimeter)
  {
    name: "Africa",
    isAfrica: true,
    points: [
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
    ]
  },
  // 2. Madagascar
  {
    name: "Madagascar",
    isAfrica: true,
    points: [
      [-12.0, 49.3], [-15.0, 50.3], [-20.0, 48.5], [-25.0, 47.0], [-25.6, 45.3],
      [-20.0, 44.0], [-15.8, 44.4], [-13.5, 48.0], [-12.0, 49.3]
    ]
  },
  // 3. Europe & Mediterranean
  {
    name: "Europe",
    isAfrica: false,
    points: [
      [36.0, -5.3], [37.0, -8.9], [41.2, -8.7], [43.4, -9.3], [43.4, -1.8], [46.0, -1.2],
      [48.4, -4.7], [49.7, -1.9], [51.0, 1.8], [53.5, 7.2], [55.5, 8.5], [57.7, 10.6],
      [55.0, 14.0], [59.0, 18.0], [60.0, 25.0], [65.0, 25.0], [70.0, 28.0], [60.0, 30.0],
      [45.0, 35.0], [41.0, 29.0], [38.0, 24.0], [36.5, 22.0], [40.5, 17.5], [44.0, 12.5],
      [43.5, 7.0], [41.5, 2.0], [36.0, -5.3]
    ]
  },
  // 4. Arabian Peninsula & Middle East
  {
    name: "Arabia",
    isAfrica: false,
    points: [
      [30.0, 32.5], [28.0, 34.5], [22.0, 39.0], [12.8, 45.0], [15.0, 52.0], [22.5, 59.5],
      [25.2, 55.3], // Dubai
      [26.0, 50.5], [30.0, 48.0], [30.0, 32.5]
    ]
  },
  // 5. Asia, India & China Coast
  {
    name: "Asia",
    isAfrica: false,
    points: [
      [25.0, 62.0], [20.0, 72.8], [15.0, 74.0], [10.0, 76.0], [8.0, 77.5], [13.0, 80.2],
      [17.0, 82.5], [21.5, 87.0], [22.0, 91.5], [16.0, 96.0], [8.0, 98.5], [1.3, 103.8],
      [7.0, 103.5], [13.0, 101.0], [21.0, 108.0],
      [23.12, 113.26], // Guangzhou
      [25.0, 119.0], [30.0, 122.0], [37.5, 122.5], [40.0, 120.0],
      [50.0, 105.0], [45.0, 75.0], [35.0, 60.0], [25.0, 62.0]
    ]
  },
  // 6. South America
  {
    name: "SouthAmerica",
    isAfrica: false,
    points: [
      [10.0, -75.0], [8.0, -77.0], [-5.0, -81.0], [-18.0, -70.0], [-33.0, -71.5],
      [-45.0, -75.0], [-53.0, -71.0], [-55.0, -66.0], [-40.0, -62.0], [-23.0, -43.0],
      [-13.0, -38.5], [-7.0, -35.0], [-2.5, -44.0], [5.0, -52.0], [10.0, -62.0], [10.0, -75.0]
    ]
  },
  // 7. North America
  {
    name: "NorthAmerica",
    isAfrica: false,
    points: [
      [9.0, -79.0], [16.0, -95.0], [23.0, -110.0], [34.0, -120.0], [48.0, -124.0],
      [55.0, -90.0], [45.0, -65.0], [30.0, -81.0], [25.0, -80.0], [30.0, -88.0], [26.0, -97.0], [9.0, -79.0]
    ]
  }
];

// République du Congo (Congo-Brazzaville) High-Precision Boundary Polygon
const CONGO_BORDER: number[][] = [
  [-5.05, 12.02], [-4.79, 11.86], [-4.45, 11.55], [-4.10, 11.30], [-3.92, 11.14],
  [-3.50, 11.55], [-3.05, 11.90], [-2.65, 12.20], [-2.25, 12.80], [-2.20, 13.40],
  [-1.85, 13.90], [-1.50, 14.15], [-0.95, 14.30], [-0.35, 14.25], [0.40, 14.10],
  [1.10, 14.05], [1.75, 14.15], [2.15, 14.45], [2.25, 15.15], [2.25, 15.70],
  [2.35, 16.05], [2.85, 16.25], [3.40, 16.50], [3.70, 17.50], [3.00, 18.15],
  [2.00, 18.60], [1.15, 18.15], [0.05, 17.70], [-0.75, 16.90], [-1.50, 16.50],
  [-2.10, 16.20], [-3.00, 16.00], [-3.60, 15.80], [-4.26, 15.28], [-4.45, 15.00],
  [-4.65, 14.35], [-4.80, 13.90], [-4.65, 13.35], [-4.90, 12.80], [-4.95, 12.30],
  [-5.05, 12.02]
];

// Key Economic Corridor Countries with distinct national palettes
interface CorridorCountryConfig {
  id: string;
  name: string;
  polygon: number[][];
  step: number;
  palette: number[];
  borderHex: number;
  borderGlowHex?: number;
}

const CORRIDOR_COUNTRIES: CorridorCountryConfig[] = [
  // 1. 🇨🇬 Congo-Brazzaville (Cœur du produit) : Vert émeraude + accents or/jaune chaleureux
  {
    id: "congo",
    name: "Congo-Brazzaville",
    polygon: CONGO_BORDER,
    step: 0.55,
    palette: [0x10B981, 0x22C55E, 0x34D399, 0xF59E0B, 0xFBBF24],
    borderHex: 0x10B981,
    borderGlowHex: 0x34D399,
  },
  // 2. 🇨🇲 Cameroun (Douala, Yaoundé) : Vert forêt profond avec pointe de rouge terre/brique
  {
    id: "cameroon",
    name: "Cameroun",
    polygon: [
      [1.65, 9.8], [2.25, 9.8], [2.25, 15.15], [2.35, 16.05], [3.5, 15.5], [4.5, 14.8],
      [6.0, 14.4], [8.0, 15.0], [10.0, 14.5], [12.0, 14.8], [12.8, 14.5], [11.0, 14.0],
      [9.3, 13.5], [8.0, 12.0], [6.5, 10.0], [4.5, 8.5], [4.05, 9.76], [2.2, 9.8], [1.65, 9.8]
    ],
    step: 0.65,
    palette: [0x15803D, 0x166534, 0x15803D, 0xDC2626, 0xB91C1C],
    borderHex: 0x15803D,
    borderGlowHex: 0x22C55E,
  },
  // 3. 🇨🇩 RD Congo (Kinshasa) : Bleu ciel azur & jaune doré
  {
    id: "drc",
    name: "RD Congo",
    polygon: [
      [-5.0, 12.2], [-5.8, 12.4], [-6.0, 13.5], [-6.0, 15.0], [-6.5, 16.8], [-8.0, 18.0],
      [-10.5, 22.0], [-13.0, 22.0], [-13.5, 29.5], [-11.0, 28.5], [-8.0, 30.5], [-5.0, 29.6],
      [-3.5, 29.2], [-2.0, 29.0], [-1.0, 29.5], [1.5, 30.5], [3.5, 30.0], [4.5, 28.0],
      [5.0, 25.0], [4.1, 22.5], [4.3, 21.0], [4.0, 19.0], [3.7, 17.5], [2.0, 18.6],
      [0.05, 17.7], [-2.1, 16.2], [-3.0, 16.0], [-4.44, 15.26], [-5.0, 12.2]
    ],
    step: 1.1,
    palette: [0x0284C7, 0x38BDF8, 0x0284C7, 0xFBBF24, 0xEAB308],
    borderHex: 0x0284C7,
    borderGlowHex: 0x38BDF8,
  },
  // 4. 🇨🇮 Côte d'Ivoire (Abidjan) : Teintes chaudes orange/ocre & vert émeraude
  {
    id: "ivory_coast",
    name: "Côte d'Ivoire",
    polygon: [
      [4.3, -7.5], [5.36, -4.0], [5.2, -3.2], [7.0, -3.0], [9.5, -2.7], [10.3, -3.2],
      [10.7, -4.5], [10.2, -6.5], [9.5, -7.5], [8.0, -8.3], [6.5, -8.5], [4.5, -7.6], [4.3, -7.5]
    ],
    step: 0.65,
    palette: [0xEA580C, 0xF97316, 0x10B981, 0x16A34A],
    borderHex: 0xEA580C,
    borderGlowHex: 0xF97316,
  },
  // 5. 🇸🇳 Sénégal (Dakar) : Vert savane & touches dorées
  {
    id: "senegal",
    name: "Sénégal",
    polygon: [
      [12.3, -16.7], [13.5, -16.8], [14.71, -17.46], [16.0, -16.5], [16.5, -15.0], [16.0, -12.0],
      [14.5, -11.3], [12.5, -11.5], [12.3, -13.0], [12.3, -16.7]
    ],
    step: 0.6,
    palette: [0x16A34A, 0x22C55E, 0x16A34A, 0xF59E0B, 0xFCD34D],
    borderHex: 0x16A34A,
    borderGlowHex: 0x22C55E,
  },
  // 6. 🇫🇷 France (Paris) : Bleu nuit / saphir républicain & blanc
  {
    id: "france",
    name: "France",
    polygon: [
      [42.5, 3.1], [43.4, -1.8], [46.0, -1.2], [48.4, -4.7], [49.7, -1.9], [51.0, 1.8],
      [50.0, 4.5], [49.0, 6.2], [48.0, 7.5], [45.8, 6.8], [43.5, 7.0], [43.0, 6.0], [42.5, 3.1]
    ],
    step: 0.7,
    palette: [0x1D4ED8, 0x2563EB, 0x1D4ED8, 0xF8FAFC],
    borderHex: 0x2563EB,
    borderGlowHex: 0x60A5FA,
  },
  // 7. 🇦🇪 Émirats (Dubaï) : Teinte sable doré / or métallisé désertique
  {
    id: "uae",
    name: "Émirats",
    polygon: [
      [22.0, 51.0], [25.5, 51.5], [26.2, 56.5], [24.0, 56.5], [22.0, 55.0], [22.0, 51.0]
    ],
    step: 0.55,
    palette: [0xD97706, 0xF59E0B, 0xD97706, 0xFDE68A],
    borderHex: 0xD97706,
    borderGlowHex: 0xFBBF24,
  },
  // 8. 🇨🇳 Chine (Guangzhou) : Nuance pourpre / carmin élégante
  {
    id: "china",
    name: "Chine",
    polygon: [
      [20.0, 106.0], [20.0, 122.0], [42.0, 125.0], [42.0, 100.0], [20.0, 106.0]
    ],
    step: 1.3,
    palette: [0xDC2626, 0x991B1B, 0xDC2626, 0xF59E0B],
    borderHex: 0xDC2626,
    borderGlowHex: 0xEF4444,
  },
];

// Key Economic Hubs inside Congo-Brazzaville
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

// Ray-casting point-in-polygon helper
function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = polygon[i][0];
    const xi = polygon[i][1];
    const yj = polygon[j][0];
    const xj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Generate smooth 3D Bezier curve elevated above the sphere
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
  const activeSectorIndexRef = useRef(activeSectorIndex);
  activeSectorIndexRef.current = activeSectorIndex;

  const GLOBE_RADIUS = 3.35;

  // Helper to dynamically position camera so the globe is prominent without clipping
  const updateCameraDistance = (camera: THREE.PerspectiveCamera, width: number, height: number) => {
    const aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const fovRad = (camera.fov * Math.PI) / 180;
    const tanHalfFov = Math.tan(fovRad / 2);
    const minRatio = Math.min(1, aspect);
    const fillRatio = 0.86;

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

    // 2. High-Performance WebGL Renderer (Transparent Background)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% Transparent container
    renderer.domElement.style.display = "block";
    renderer.domElement.style.outline = "none";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Globe Master Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 3.1 Tactile Sculptural Base Sphere — Warm Alabaster / Mineral Silk White
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.988, 64, 64);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0xF8FAFC,       // Warm Alabaster / Silk Off-White (Slate 50)
      emissive: 0xF1F5F9,    // Soft inner ambient mineral luminescence
      emissiveIntensity: 0.35,
      specular: 0x10B981,    // Subtle signature emerald specular sheen on glancing angles
      shininess: 38,
      transparent: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 3.2 Atmospheric Rim Sheen (Subtle mineral silk horizon)
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.015, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          vec3 atmosphere = mix(vec3(0.88, 0.92, 0.96), vec3(0.06, 0.72, 0.5), intensity * 0.7);
          gl_FragColor = vec4(atmosphere, intensity * 0.35);
        }
      `,
      blending: THREE.NormalBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 3.3 Studio Sculptural Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    const warmFill = new THREE.DirectionalLight(0xF1F5F9, 0.75);
    warmFill.position.set(-6, -4, 5);
    scene.add(warmFill);

    // 3.4 Subtle Parallels & Meridians (Architectural Drafting Filigree)
    const gridGroup = new THREE.Group();
    const meridianMat = new THREE.LineBasicMaterial({
      color: 0xCBD5E1, // Slate 300 - Architectural Drafting Silver
      transparent: true,
      opacity: 0.45,
    });

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

    // 3.5 Global Coastline Outlines (Delicate Slate 400 stone contours)
    const coastlinesGroup = new THREE.Group();
    const worldCoastMat = new THREE.LineBasicMaterial({
      color: 0x94A3B8, // Slate 400
      linewidth: 1.5,
      transparent: true,
      opacity: 0.55,
    });

    COASTLINES.forEach((c) => {
      const points: THREE.Vector3[] = c.points.map((coord) =>
        latLngToVector3(coord[0], coord[1], GLOBE_RADIUS * 1.002)
      );
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      coastlinesGroup.add(new THREE.Line(geo, worldCoastMat));
    });
    globeGroup.add(coastlinesGroup);

    // 3.6 KEY CORRIDOR COUNTRIES (Geopolitical / Identitary Colors & High-Density Points)
    const countriesGroup = new THREE.Group();
    const countryDotsPositions: number[] = [];
    const countryDotsColors: number[] = [];

    // Precalculate country bounding boxes for fast point-in-polygon checks
    const countryBoxes = CORRIDOR_COUNTRIES.map((cc) => {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      for (let i = 0; i < cc.polygon.length; i++) {
        const pt = cc.polygon[i];
        if (pt[0] < minLat) minLat = pt[0];
        if (pt[0] > maxLat) maxLat = pt[0];
        if (pt[1] < minLng) minLng = pt[1];
        if (pt[1] > maxLng) maxLng = pt[1];
      }
      return { ...cc, minLat, maxLat, minLng, maxLng };
    });

    countryBoxes.forEach((c) => {
      // 1. Draw distinct vector boundary
      const boundaryPoints = c.polygon.map((coord) =>
        latLngToVector3(coord[0], coord[1], GLOBE_RADIUS * 1.006)
      );
      boundaryPoints.push(boundaryPoints[0]); // Close loop
      const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);

      const borderMat = new THREE.LineBasicMaterial({
        color: c.borderHex,
        linewidth: 2.5,
        transparent: true,
        opacity: 0.95,
      });
      countriesGroup.add(new THREE.Line(boundaryGeo, borderMat));

      if (c.borderGlowHex) {
        const borderGlowMat = new THREE.LineBasicMaterial({
          color: c.borderGlowHex,
          linewidth: 4,
          transparent: true,
          opacity: 0.45,
        });
        countriesGroup.add(new THREE.Line(boundaryGeo, borderGlowMat));
      }

      // 2. Generate dense internal matrix of dots with country's specific palette
      const latSpan = c.maxLat - c.minLat;
      const lngSpan = c.maxLng - c.minLng;
      const step = c.step;

      let dotIndex = 0;
      for (let lat = c.minLat; lat <= c.maxLat; lat += step) {
        for (let lng = c.minLng; lng <= c.maxLng; lng += step) {
          if (isPointInPolygon(lat, lng, c.polygon)) {
            const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.004);
            countryDotsPositions.push(pos.x, pos.y, pos.z);

            const hex = c.palette[dotIndex % c.palette.length];
            const col = new THREE.Color(hex);
            countryDotsColors.push(col.r, col.g, col.b);
            dotIndex++;
          }
        }
      }
    });

    // Special Departmental & Economic Centers inside Congo-Brazzaville
    const congoGold = new THREE.Color(0xF59E0B);
    const congoEmerald = new THREE.Color(0x10B981);
    CONGO_CITIES_DOTS.forEach(([lat, lng], idx) => {
      const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.007);
      countryDotsPositions.push(pos.x, pos.y, pos.z);
      const c = idx % 2 === 0 ? congoEmerald : congoGold;
      countryDotsColors.push(c.r, c.g, c.b);
    });

    const countryDotsGeo = new THREE.BufferGeometry();
    countryDotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(countryDotsPositions, 3));
    countryDotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(countryDotsColors, 3));
    const countryDotsMat = new THREE.PointsMaterial({
      size: 0.082,
      vertexColors: true,
      transparent: true,
      opacity: 1,
    });
    countriesGroup.add(new THREE.Points(countryDotsGeo, countryDotsMat));
    globeGroup.add(countriesGroup);

    // 3.7 NEUTRAL CONTINENTAL CONTEXT DOTS (~9,000 points)
    // Points across the rest of Africa, Europe, Asia, Americas in refined muted stone/slate
    // so the corridor nations stand out with undeniable brilliance
    const continentBoxes = COASTLINES.map((c) => {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      for (let i = 0; i < c.points.length; i++) {
        const pt = c.points[i];
        if (pt[0] < minLat) minLat = pt[0];
        if (pt[0] > maxLat) maxLat = pt[0];
        if (pt[1] < minLng) minLng = pt[1];
        if (pt[1] > maxLng) maxLng = pt[1];
      }
      return { ...c, minLat, maxLat, minLng, maxLng };
    });

    const dotsCount = 9500;
    const bgDotPositions: number[] = [];
    const bgDotColors: number[] = [];
    const stoneBase = new THREE.Color(0x94A3B8);   // Slate 400 - Mineral stone relief
    const stoneLight = new THREE.Color(0xCBD5E1);  // Slate 300 - Light limestone
    const stoneDeep = new THREE.Color(0x64748B);   // Slate 500 - Deep relief shadow

    for (let i = 0; i < dotsCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotsCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const lat = 90 - (phi * 180) / Math.PI;
      let lng = ((theta * 180) / Math.PI) % 360;
      if (lng > 180) lng -= 360;

      // 1. Check if inside any corridor country (already handled above)
      let inCorridor = false;
      for (let c = 0; c < countryBoxes.length; c++) {
        const cb = countryBoxes[c];
        if (lat >= cb.minLat && lat <= cb.maxLat && lng >= cb.minLng && lng <= cb.maxLng) {
          if (isPointInPolygon(lat, lng, cb.polygon)) {
            inCorridor = true;
            break;
          }
        }
      }
      if (inCorridor) continue;

      // 2. Check if inside general landmass
      let onLand = false;
      for (let b = 0; b < continentBoxes.length; b++) {
        const box = continentBoxes[b];
        if (lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng) {
          if (isPointInPolygon(lat, lng, box.points)) {
            onLand = true;
            break;
          }
        }
      }

      if (onLand) {
        const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.002);
        bgDotPositions.push(pos.x, pos.y, pos.z);
        const col = i % 3 === 0 ? stoneBase : (i % 3 === 1 ? stoneLight : stoneDeep);
        bgDotColors.push(col.r, col.g, col.b);
      }
    }

    const bgDotGeo = new THREE.BufferGeometry();
    bgDotGeo.setAttribute("position", new THREE.Float32BufferAttribute(bgDotPositions, 3));
    bgDotGeo.setAttribute("color", new THREE.Float32BufferAttribute(bgDotColors, 3));
    const bgDotMat = new THREE.PointsMaterial({
      size: 0.056,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
    });
    globeGroup.add(new THREE.Points(bgDotGeo, bgDotMat));

    // 4. Arcs & Pins Groups
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Initial camera focus directly on Congo-Brazzaville
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
      }, 5500);
    };

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

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Subtle organic breathing oscillation around active sector target
      // Keeps Africa and key corridor countries front-and-center without drifting away
      if (globeGroupRef.current && autoRotateRef.current && !isDraggingRef.current) {
        const currentIdx = activeSectorIndexRef.current;
        const currentSector = sectorsData[currentIdx];
        const baseTargetY = -( (currentSector?.targetLng ?? 15.0) * Math.PI) / 180 - Math.PI * 0.5;
        const subtleSway = Math.sin(elapsedTime * 0.5) * 0.08; // ±4.5° breathing sway
        globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          globeGroupRef.current.rotation.y,
          baseTargetY + subtleSway,
          0.02
        );
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
        const sector = sectorsData[activeSectorIndexRef.current];
        if (sector) {
          const halfW = (containerRef.current?.clientWidth || 500) / 2;
          const halfH = (containerRef.current?.clientHeight || 500) / 2;

          const sectorLabels: ProjectedCityLabel[] = sector.locations.map((loc) => {
            const vLocal = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS * 1.05);
            const vWorld = vLocal.clone().applyMatrix4(globeGroupRef.current!.matrixWorld);

            const normal = vWorld.clone().normalize();
            const viewDir = cameraRef.current!.position.clone().sub(vWorld).normalize();
            const isFront = normal.dot(viewDir) > 0.15;

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

          setProjectedLabels(sectorLabels);
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

  // Update Camera Target, Arcs & Pins on Sector Change (GSAP Scrollytelling Rotation)
  useEffect(() => {
    if (!globeGroupRef.current || !arcsGroupRef.current || !pinsGroupRef.current) return;

    const sector = sectorsData[activeSectorIndex];
    if (!sector) return;

    // Cinematic GSAP rotation to center target region smoothly
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
    }, 6000);

    // Clear old arcs & pins
    while (arcsGroupRef.current.children.length > 0) {
      const obj = arcsGroupRef.current.children[0];
      arcsGroupRef.current.remove(obj);
    }
    while (pinsGroupRef.current.children.length > 0) {
      const obj = pinsGroupRef.current.children[0];
      pinsGroupRef.current.remove(obj);
    }
    animatedParticlesRef.current = [];

    // Render Beacons on Key Hubs
    sector.locations.forEach((loc) => {
      const pos = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS * 1.008);

      // Pin core sphere
      const pinGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color || "#10B981"),
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);

      // Delicate radar pulse ring (thin hairline)
      const ringGeo = new THREE.RingGeometry(0.065, 0.082, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color || "#10B981"),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      const pinContainer = new THREE.Group();
      pinContainer.add(pinMesh);
      pinContainer.add(ringMesh);
      pinsGroupRef.current?.add(pinContainer);
    });

    // Render Arcs & Animated Travelling Flow Particles
    sector.arcs.forEach((arc, i) => {
      const vFrom = latLngToVector3(arc.from.lat, arc.from.lng, GLOBE_RADIUS * 1.008);
      const vTo = latLngToVector3(arc.to.lat, arc.to.lng, GLOBE_RADIUS * 1.008);

      const curve = createCurveArc(vFrom, vTo, 0.18);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(arc.color || "#10B981"),
        transparent: true,
        opacity: 0.85,
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

  return (
    <div className="relative w-full h-[340px] sm:h-[480px] lg:h-[620px] flex items-center justify-center select-none overflow-visible">
      {/* Soft Ground Ambient Radial Shadow — Anchors the globe naturally on the page */}
      <div className="absolute bottom-4 sm:bottom-6 w-[280px] sm:w-[420px] h-[36px] sm:h-[48px] rounded-full bg-slate-900/[0.08] blur-2xl pointer-events-none transform scale-y-50" />

      {/* 3D WebGL Canvas Mount */}
      <div
        ref={containerRef}
        style={{ touchAction: "pan-y" }}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-0"
        title="Faites glisser pour explorer le globe 3D"
      />

      {/* Clean Minimalist City Floating Labels (Synchronized with 3D projection) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
        {projectedLabels.map((lbl, idx) => {
          if (!lbl.visible) return null;
          return (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-8 transition-opacity duration-200 animate-in fade-in"
              style={{
                left: `${lbl.x}px`,
                top: `${lbl.y}px`,
              }}
            >
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md border border-slate-200/90 text-[10px] font-bold text-slate-900 shadow-sm whitespace-nowrap">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
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
