/**
 * Сервис звуковых и браузерных уведомлений (Web Audio API + Notification API)
 * Не требует внешних mp3-файлов, работает автономно через встроенный синтезатор звука.
 */

class SoundNotificationService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Восстанавливаем настройку звука
    const saved = localStorage.getItem('priceradar_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('priceradar_sound_enabled', String(enabled));
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Воспроизводит приятный двухтональный гармоничный колокольчик падения цены (E5 -> G#5)
   */
  public playPriceDropChime(): void {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Первый тон (нота E5 ~ 659 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Второй тон (нота B5 ~ 987 Hz - триумфальный интервал)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);

      // Третий тон гармоники (E6 ~ 1318 Hz)
      const osc3 = this.audioCtx.createOscillator();
      const gain3 = this.audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1318.51, now + 0.22);
      gain3.gain.setValueAtTime(0, now + 0.22);
      gain3.gain.linearRampToValueAtTime(0.12, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc3.connect(gain3);
      gain3.connect(this.audioCtx.destination);
      osc3.start(now + 0.22);
      osc3.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
    }
  }

  /**
   * Запрос разрешения на браузерные Web Notifications
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Failed to request notification permission:', e);
      return 'denied';
    }
  }

  public getNotificationPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Отправка системного браузерного push-уведомления (Desktop / Mobile Notification)
   */
  public sendDesktopNotification(title: string, options?: {
    body?: string;
    icon?: string;
    tag?: string;
    url?: string;
  }): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options?.body,
          icon: options?.icon || '/icon.svg',
          badge: '/icon.svg',
          tag: options?.tag || 'priceradar-alert',
          silent: !this.soundEnabled
        });

        if (options?.url) {
          notif.onclick = () => {
            window.focus();
            window.open(options.url, '_blank');
          };
        }
        return true;
      } catch (e) {
        console.warn('Notification display failed:', e);
        return false;
      }
    }
    return false;
  }
}

export const soundService = new SoundNotificationService();
