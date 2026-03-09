export const PHASE_COORDS = {
    'Phase 1': { lat: 18.5912, lng: 73.7388 },
    'Phase 2': { lat: 18.5962, lng: 73.7148 },
    'Phase 3': { lat: 18.5723, lng: 73.6998 },
};

export interface LocationCoords {
    lat: number;
    lng: number;
}

export type PhaseKey = keyof typeof PHASE_COORDS;

export const getDistanceKm = (from: PhaseKey, to: PhaseKey): number => {
    const a = PHASE_COORDS[from];
    const b = PHASE_COORDS[to];
    if (!a || !b) return 0;

    const R = 6371; // Earth radius in km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

export const getDistanceFromCoords = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const findNearestPhase = (lat: number, lng: number): { phase: PhaseKey; distance: number } => {
    let nearestPhase: PhaseKey = 'Phase 1';
    let minDistance = Infinity;

    (Object.keys(PHASE_COORDS) as PhaseKey[]).forEach(phase => {
        const dist = getDistanceFromCoords(lat, lng, PHASE_COORDS[phase].lat, PHASE_COORDS[phase].lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestPhase = phase;
        }
    });

    return { phase: nearestPhase, distance: minDistance };
};

export const MAX_DISTANCE_KM = 8; // Max distance from any Hinjewadi phase to be considered "inside"

export const isWithinHinjewadiRange = (lat: number, lng: number): boolean => {
    const { distance } = findNearestPhase(lat, lng);
    return distance <= MAX_DISTANCE_KM;
};

export const formatDistance = (dist: number): string => {
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
};

export const sortByPhaseDistance = <T extends { area?: string; areas?: string[] }>(
    items: T[],
    selectedPhase: PhaseKey,
    userLocation?: LocationCoords
): (T & { distance: string; distanceVal: number })[] => {
    return items
        .map(item => {
            const area = item.area || (item.areas && item.areas.length > 0 ? item.areas[0] : 'Phase 1');
            const targetCoords = PHASE_COORDS[area as PhaseKey] || PHASE_COORDS['Phase 1'];

            let dist: number;
            if (userLocation) {
                // Use exact user coordinates for distance
                dist = getDistanceFromCoords(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
            } else {
                // Fallback to phase-to-phase distance
                dist = getDistanceKm(selectedPhase, area as PhaseKey);
            }

            return {
                ...item,
                distance: formatDistance(dist),
                distanceVal: dist
            };
        })
        .sort((a, b) => a.distanceVal - b.distanceVal);
};
