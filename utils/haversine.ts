/**
 * Haversine formula — calculates straight-line distance between two GPS coordinates.
 * Returns distance in kilometres.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Sort any array of items by distance from a user GPS point.
 * getCoords must return [lat, lng] for each item.
 */
export function sortByDistance<T>(
  items: T[],
  userLat: number,
  userLng: number,
  getCoords: (item: T) => [number, number] | null
): (T & { distanceKm: number })[] {
  return items
    .map((item) => {
      const coords = getCoords(item);
      const distanceKm = coords
        ? haversineKm(userLat, userLng, coords[0], coords[1])
        : Infinity;
      return { ...item, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Format a distance value into a human-readable string.
 */
export function formatDistance(km: number): string {
  if (km === Infinity || isNaN(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

/**
 * Approximate GPS coordinates for Tamil Nadu district headquarters.
 * Used to estimate distances when individual blood bank coordinates aren't stored.
 */
export const TN_DISTRICT_COORDS: Record<string, [number, number]> = {
  'Chennai': [13.0827, 80.2707],
  'Coimbatore': [11.0168, 76.9558],
  'Madurai': [9.9252, 78.1198],
  'Tiruchirappalli': [10.7905, 78.7047],
  'Salem': [11.6643, 78.1460],
  'Tirunelveli': [8.7139, 77.7567],
  'Erode': [11.3410, 77.7172],
  'Vellore': [12.9165, 79.1325],
  'Thoothukudi': [8.7642, 78.1348],
  'Dindigul': [10.3673, 77.9803],
  'Thanjavur': [10.7870, 79.1378],
  'Ranipet': [12.9366, 79.3340],
  'Villupuram': [11.9396, 79.4930],
  'Cuddalore': [11.7447, 79.7689],
  'Kancheepuram': [12.8342, 79.7036],
  'Tiruppur': [11.1085, 77.3411],
  'Namakkal': [11.2188, 78.1674],
  'Krishnagiri': [12.5189, 78.2138],
  'Dharmapuri': [12.1271, 78.1582],
  'Perambalur': [11.2333, 78.8667],
  'Ariyalur': [11.1400, 79.0800],
  'Nagapattinam': [10.7667, 79.8444],
  'Tiruvarur': [10.7667, 79.6333],
  'Ramanathapuram': [9.3762, 78.8306],
  'Virudhunagar': [9.5873, 77.9622],
  'Sivaganga': [9.8477, 78.4821],
  'Theni': [10.0060, 77.4767],
  'Pudukkottai': [10.3797, 78.8186],
  'Karur': [10.9601, 78.0766],
  'Nilgiris': [11.4102, 76.6950],
  'Kallakurichi': [11.7370, 78.9578],
  'Chengalpattu': [12.6924, 79.9780],
  'Tenkasi': [8.9597, 77.3150],
  'Tirupattur': [12.4952, 78.5726],
  'Mayiladuthurai': [11.1024, 79.6512],
};
