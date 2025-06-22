import { getDistance } from "geolib";

export const isPointNearPolyline = (point, polylinePath, thresholdInMeters = 1000) => {
  return polylinePath.some(routePoint => {
    const distance = getDistance(
      { latitude: point.lat, longitude: point.lng },
      { latitude: routePoint.lat, longitude: routePoint.lng }
    );
    return distance <= thresholdInMeters;
  });
};
