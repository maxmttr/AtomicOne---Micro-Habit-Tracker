/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Universal Expo Haptics Implementation with Configurable User Settings
// Supports enabling/disabling haptics and adjusting intensity (Light, Medium, Heavy)

export enum ImpactFeedbackStyle {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
}

export enum NotificationFeedbackType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

const STORAGE_KEY_ENABLED = 'atomic_haptics_enabled';
const STORAGE_KEY_INTENSITY = 'atomic_haptics_intensity';

class HapticsController {
  private enabled: boolean = true;
  private intensity: ImpactFeedbackStyle = ImpactFeedbackStyle.Medium;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (storedEnabled !== null) {
        this.enabled = storedEnabled === 'true';
      }
      const storedIntensity = localStorage.getItem(STORAGE_KEY_INTENSITY);
      if (storedIntensity && Object.values(ImpactFeedbackStyle).includes(storedIntensity as ImpactFeedbackStyle)) {
        this.intensity = storedIntensity as ImpactFeedbackStyle;
      }
    }
  }

  public ImpactFeedbackStyle = ImpactFeedbackStyle;
  public NotificationFeedbackType = NotificationFeedbackType;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
    }
  }

  public getIntensity(): ImpactFeedbackStyle {
    return this.intensity;
  }

  public setIntensity(intensity: ImpactFeedbackStyle): void {
    this.intensity = intensity;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_INTENSITY, intensity);
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Triggers impact vibration respecting user settings
   */
  public async impactAsync(style?: ImpactFeedbackStyle): Promise<void> {
    if (!this.enabled) return;

    const chosenStyle = style || this.intensity;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (chosenStyle === ImpactFeedbackStyle.Heavy) {
          navigator.vibrate([35]);
        } else if (chosenStyle === ImpactFeedbackStyle.Light) {
          navigator.vibrate([12]);
        } else {
          // Medium
          navigator.vibrate([22]);
        }
      } catch {
        // Fallback gracefully on devices without vibration permission
      }
    }
  }

  /**
   * Triggers notification vibration (e.g. success pattern)
   */
  public async notificationAsync(type: NotificationFeedbackType = NotificationFeedbackType.Success): Promise<void> {
    if (!this.enabled) return;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === NotificationFeedbackType.Success) {
          // Two-phase pulse: accent + confirmation
          if (this.intensity === ImpactFeedbackStyle.Heavy) {
            navigator.vibrate([20, 30, 35]);
          } else if (this.intensity === ImpactFeedbackStyle.Light) {
            navigator.vibrate([10, 25, 15]);
          } else {
            navigator.vibrate([15, 30, 22]);
          }
        } else if (type === NotificationFeedbackType.Warning) {
          navigator.vibrate([25, 35, 25]);
        } else {
          navigator.vibrate([35, 25, 35]);
        }
      } catch {
        // Fallback gracefully
      }
    }
  }

  public async selectionAsync(): Promise<void> {
    if (!this.enabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Fallback gracefully
      }
    }
  }

  /**
   * Test current haptic configuration
   */
  public async testHaptic(): Promise<void> {
    await this.notificationAsync(NotificationFeedbackType.Success);
    await this.impactAsync();
  }
}

export const Haptics = new HapticsController();
