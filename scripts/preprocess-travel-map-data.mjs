import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const WIDTH = 1200;
const HEIGHT = 640;
const PADDING = 20;
const DATELINE_THRESHOLD = 180;
const EPSILON = 1e-6;

const GEOJSON_DIR = resolve(process.cwd(), 'public/geojson');
const ADMIN0_SOURCE = resolve(GEOJSON_DIR, 'World Bank Official Boundaries - Admin 0.json');
const ADMIN1_SOURCE = resolve(GEOJSON_DIR, 'World Bank Official Boundaries - Admin 1.json');
const ADMIN0_TARGET = resolve(GEOJSON_DIR, 'travel-map-admin0.render.json');
const ADMIN1_TARGET = resolve(GEOJSON_DIR, 'travel-map-admin1.render.json');

const mercatorX = (lonDeg) => (lonDeg * Math.PI) / 180;

const mercatorY = (latDeg) => {
  const clampedLat = Math.max(-85, Math.min(85, latDeg));
  const rad = (clampedLat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
};

const pointsEqual = (a, b) => a?.[0] === b?.[0] && a?.[1] === b?.[1];

const closeRing = (ring) => {
  if (ring.length === 0) return ring;
  return pointsEqual(ring[0], ring[ring.length - 1]) ? ring : [...ring, [...ring[0]]];
};

const splitRingOnDateline = (ring, threshold = DATELINE_THRESHOLD) => {
  if (!Array.isArray(ring) || ring.length < 2) return [ring];

  const workingRing = closeRing(ring);
  const splitRings = [];
  let currentRing = [[...workingRing[0]]];

  for (let index = 0; index < workingRing.length - 1; index += 1) {
    const [lon1, lat1] = workingRing[index];
    const [lon2, lat2] = workingRing[index + 1];
    const deltaLon = lon2 - lon1;

    if (Math.abs(deltaLon) > threshold) {
      const wrappedDeltaLon = deltaLon > 0 ? deltaLon - 360 : deltaLon + 360;
      const boundaryLon = deltaLon > 0 ? -180 : 180;
      const tRaw = wrappedDeltaLon === 0 ? 0 : (boundaryLon - lon1) / wrappedDeltaLon;
      const t = Math.min(1, Math.max(0, tRaw));
      const interpolatedLat = lat1 + (lat2 - lat1) * t;

      const snappedBoundaryLon = boundaryLon > 0 ? 180 : -180;
      const oppositeBoundaryLon = snappedBoundaryLon === 180 ? -180 : 180;
      const edgeEndPoint = [snappedBoundaryLon, interpolatedLat];
      const edgeStartPoint = [oppositeBoundaryLon, interpolatedLat];

      const lastPoint = currentRing[currentRing.length - 1];
      if (!pointsEqual(lastPoint, edgeEndPoint)) {
        currentRing.push(edgeEndPoint);
      }
      splitRings.push(closeRing(currentRing));
      currentRing = [edgeStartPoint];
      if (Math.abs(lon2 - edgeStartPoint[0]) > EPSILON || Math.abs(lat2 - edgeStartPoint[1]) > EPSILON) {
        currentRing.push([lon2, lat2]);
      }
    } else {
      currentRing.push([lon2, lat2]);
    }
  }

  splitRings.push(closeRing(currentRing));
  return splitRings.filter((candidateRing) => candidateRing.length >= 4);
};

const walkCoordinates = (coordinates, cb) => {
  if (typeof coordinates?.[0] === 'number' && typeof coordinates?.[1] === 'number') {
    cb(coordinates[0], coordinates[1]);
    return;
  }

  for (const child of coordinates ?? []) {
    walkCoordinates(child, cb);
  }
};

const calculateFitScale = (admin0Features) => {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  for (const feature of admin0Features) {
    walkCoordinates(feature.geometry?.coordinates, (lon, lat) => {
      const mx = mercatorX(lon);
      const my = mercatorY(lat);
      bounds.minX = Math.min(bounds.minX, mx);
      bounds.maxX = Math.max(bounds.maxX, mx);
      bounds.minY = Math.min(bounds.minY, my);
      bounds.maxY = Math.max(bounds.maxY, my);
    });
  }

  bounds.minX = mercatorX(-180);
  bounds.maxX = mercatorX(180);
  if (!Number.isFinite(bounds.minY) || !Number.isFinite(bounds.maxY)) {
    bounds.minY = mercatorY(-85);
    bounds.maxY = mercatorY(85);
  }

  const scaleX = (WIDTH - PADDING * 2) / (bounds.maxX - bounds.minX);
  const scaleY = (HEIGHT - PADDING * 2) / (bounds.maxY - bounds.minY);

  return {
    fitScale: Math.min(scaleX, scaleY),
    bounds
  };
};

const buildProject = ({ fitScale, bounds }) => (lon, lat) => {
  const xMerc = mercatorX(lon);
  const x = PADDING + (xMerc - bounds.minX) * fitScale;
  const yMerc = mercatorY(lat);
  const y = HEIGHT - PADDING - (yMerc - bounds.minY) * fitScale;
  return [x, y];
};

const polygonToPath = (polygonCoordinates, project) =>
  polygonCoordinates
    .flatMap((ring) => splitRingOnDateline(ring))
    .map((ring) => {
      const path = ring
        .map(([lon, lat], index) => {
          const [x, y] = project(lon, lat);
          return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
      return `${path} Z`;
    })
    .join(' ');

const geometryToPath = (geometry, project) => {
  if (geometry?.type === 'Polygon') {
    return polygonToPath(geometry.coordinates, project);
  }

  if (geometry?.type === 'MultiPolygon') {
    return geometry.coordinates.map((polygonCoordinates) => polygonToPath(polygonCoordinates, project)).join(' ');
  }

  return '';
};

const normalizeFeature = (feature, keys, project) => {
  const properties = Object.fromEntries(keys.map((key) => [key, feature.properties?.[key] ?? null]));
  const path = geometryToPath(feature.geometry, project);
  if (!path) return null;

  return {
    p: properties,
    d: path
  };
};

const preprocess = async () => {
  const [admin0Raw, admin1Raw] = await Promise.all([
    readFile(ADMIN0_SOURCE, 'utf8'),
    readFile(ADMIN1_SOURCE, 'utf8')
  ]);

  const admin0 = JSON.parse(admin0Raw);
  const admin1 = JSON.parse(admin1Raw);

  const { fitScale, bounds } = calculateFitScale(admin0.features ?? []);
  const project = buildProject({ fitScale, bounds });

  const admin0Features = (admin0.features ?? [])
    .map((feature) => normalizeFeature(feature, ['ISO_A2', 'NAM_0'], project))
    .filter(Boolean);

  const admin1Features = (admin1.features ?? [])
    .map((feature) => normalizeFeature(feature, ['ISO_A2', 'NAM_0', 'NAM_1', 'ADM1CD_c'], project))
    .filter(Boolean);

  const commonMeta = {
    width: WIDTH,
    height: HEIGHT,
    generatedAt: new Date().toISOString()
  };

  await Promise.all([
    writeFile(
      ADMIN0_TARGET,
      `${JSON.stringify({ meta: commonMeta, features: admin0Features })}\n`,
      'utf8'
    ),
    writeFile(
      ADMIN1_TARGET,
      `${JSON.stringify({ meta: commonMeta, features: admin1Features })}\n`,
      'utf8'
    )
  ]);

  console.log(`Generated ${ADMIN0_TARGET}`);
  console.log(`Generated ${ADMIN1_TARGET}`);
};

await preprocess();
