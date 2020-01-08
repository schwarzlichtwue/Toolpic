export function lng(lng, meta, scaleWidth) {
  return ((lng - meta.viewBox.lng) / meta.viewBox.diffLng) * scaleWidth;
}
export function lat(lat, meta, scaleWidth) {
  return ((lat - meta.viewBox.lat) / meta.viewBox.diffLat) * scaleWidth;
}
