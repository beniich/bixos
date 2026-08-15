// Génère un ID unique stable par navigateur/appareil
export function getDeviceId(): string {
  let id = localStorage.getItem('bizos_device_id');
  
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${crypto.randomUUID()}`;
    localStorage.setItem('bizos_device_id', id);
  }
  
  return id;
}

export function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
  };
}
