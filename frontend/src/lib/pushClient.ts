'use client';

export function isWebPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    window.isSecureContext
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getActivePushRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported()) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing) {
      return existing;
    }
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    return null;
  }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  try {
    const reg = await getActivePushRegistration();
    if (!reg) return null;
    await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeBrowserToPush(
  vapidPublicKey: string
): Promise<{ subscription: PushSubscriptionJSON | null; permission: NotificationPermission }> {
  if (!isWebPushSupported()) {
    return { subscription: null, permission: 'denied' };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return { subscription: null, permission };
  }

  const reg = await getActivePushRegistration();
  if (!reg) {
    return { subscription: null, permission };
  }
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    });
  }

  return { subscription: sub.toJSON(), permission };
}

export async function unsubscribeBrowserFromPush(): Promise<string | null> {
  const sub = await getExistingPushSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  return endpoint;
}

/**
 * Subtle, non-intrusive two-tone chime via Web Audio API when a reply arrives in an open tab.
 */
export function playClientAlertChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.06, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(587.33, now, 0.14); // D5
    playNote(880, now + 0.1, 0.22); // A5
    setTimeout(() => ctx.close().catch(() => {}), 500);
  } catch {
    // Ignore autoplay restrictions before user gesture
  }
}
