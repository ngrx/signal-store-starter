# v1
import { Injectable } from '@angular/core';

/**
 * AvatarService
 * Generates GitHub-style identicon avatars using email hash
 * Synchronous, lightweight, modern
 */
@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  private readonly defaultEmail = 'default@example.com';

  /**
   * Generate Gravatar-compatible URL synchronously
   */
  getAvatarUrl(email?: string, size: number = 80, style: 'identicon' | 'monsterid' | 'retro' = 'identicon'): string {
    const target = (email?.trim().toLowerCase() || this.defaultEmail);
    const hash = this.md5(target);
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${style}`;
  }

  /**
   * Simple synchronous MD5 hash
   * Lightweight for avatar generation, no external dependency
   */
  private md5(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    // Convert to hex and pad to 32 chars
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}
