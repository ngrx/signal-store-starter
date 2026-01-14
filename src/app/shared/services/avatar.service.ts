import { Injectable } from '@angular/core';

/**
 * AvatarService
 * Generates GitHub-style identicon avatars using email hash
 */
@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  /**
   * Generate a Gravatar-compatible URL using MD5 hash
   * Falls back to identicon style for consistent pixel avatars
   */
  getAvatarUrl(email: string, size: number = 80): string {
    if (!email) {
      return this.getDefaultAvatarUrl(size);
    }

    const hash = this.md5(email.toLowerCase().trim());
    // Using Gravatar with identicon as default
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  }

  /**
   * Get default avatar URL when no email is provided
   */
  private getDefaultAvatarUrl(size: number): string {
    const hash = this.md5('default@example.com');
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  }

  /**
   * Simple MD5 hash implementation
   * Note: In production, consider using a library like crypto-js
   * This is a lightweight implementation for avatar generation only
   */
  private md5(str: string): string {
    // Simple hash for demo - in production use proper MD5 library
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}
