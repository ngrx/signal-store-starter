import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore, ContextStoreInstance } from '../../../../core/context/stores/context.store';
import type { AppContext } from '../../../../core/context/models/context.model';

@Component({
  selector: 'app-context-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="context-switcher">
      <!-- Back Button (if not in Personal) -->
      @if (currentContextType() !== 'user') {
        <button class="context-back-btn" (click)="handleNavigateBack()" 
          [title]="currentContextType() === 'organization' ? 'Back to Personal' : 'Back to Organization'">
          <span>◀</span>
        </button>
      }
      
      <!-- Context Switcher Button - Cycles through contexts on click -->
      <button 
        class="context-btn" 
        (click)="handleCycleContext()" 
        [title]="nextContextHint()"
        [disabled]="!canCycle()">
        <span class="context-icon">{{ contextIcon() }}</span>
        <span>{{ currentDisplayName() }}</span>
        @if (canCycle()) {
          <span class="cycle-icon">⟳</span>
        }
      </button>
    </div>
  `,
  styles: [`
    .context-switcher {
      position: relative;
      margin-right: 1rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .context-back-btn {
      padding: 8px 10px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .context-back-btn:hover {
      border-color: #667eea;
      background: #f8f9ff;
      color: #667eea;
    }

    .context-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      font-weight: 500;
    }

    .context-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .context-btn:disabled {
      opacity: 0.7;
      cursor: default;
    }

    .context-icon {
      font-size: 16px;
    }

    .cycle-icon {
      font-size: 14px;
      animation: rotate 2s linear infinite;
      animation-play-state: paused;
    }

    .context-btn:hover .cycle-icon {
      animation-play-state: running;
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `],
})
export class ContextSwitcherComponent {
  private contextStore = inject<ContextStoreInstance>(ContextStore);
  
  // Core computed signals
  protected currentContext = computed(() => this.contextStore.current());
  protected availableContexts = computed(() => this.contextStore.available());
  protected currentContextType = computed(() => this.contextStore.currentContextType());
  protected currentContextName = computed(() => this.contextStore.currentContextName());
  
  // Display name for current context
  protected currentDisplayName = computed(() => {
    return this.currentContextName() || 'Personal';
  });
  
  // Context icon
  protected contextIcon = computed(() => {
    const type = this.currentContextType();
    switch (type) {
      case 'organization': return '🏢';
      case 'team': return '👥';
      case 'partner': return '🤝';
      case 'user':
      default: return '👤';
    }
  });
  
  // Build ordered list of all contexts
  protected allContexts = computed(() => {
    const available = this.availableContexts();
    const contexts: AppContext[] = [];
    
    // Always add Personal first (user context)
    const current = this.currentContext();
    const userId = current?.type === 'user' ? current.userId : '';
    const userEmail = current?.type === 'user' ? current.email : '';
    const userDisplayName = current?.type === 'user' ? current.displayName : null;
    
    contexts.push({
      type: 'user',
      userId: userId,
      email: userEmail,
      displayName: userDisplayName
    });
    
    // Add all organizations
    available.organizations.forEach(org => contexts.push(org));
    
    // Add all teams
    available.teams.forEach(team => contexts.push(team));
    
    // Add all partners
    available.partners.forEach(partner => contexts.push(partner));
    
    return contexts;
  });
  
  // Can we cycle to another context?
  protected canCycle = computed(() => {
    return this.allContexts().length > 1;
  });
  
  // What's the next context in the cycle?
  protected nextContext = computed(() => {
    const all = this.allContexts();
    if (all.length <= 1) return null;
    
    const currentType = this.currentContextType();
    const current = this.currentContext();
    
    // Find current index
    let currentIndex = all.findIndex(ctx => {
      if (ctx.type === 'user' && currentType === 'user') return true;
      if (ctx.type === 'organization' && currentType === 'organization' && current?.type === 'organization') {
        return ctx.organizationId === current.organizationId;
      }
      if (ctx.type === 'team' && currentType === 'team' && current?.type === 'team') {
        return ctx.teamId === current.teamId;
      }
      if (ctx.type === 'partner' && currentType === 'partner' && current?.type === 'partner') {
        return ctx.partnerId === current.partnerId;
      }
      return false;
    });
    
    // If not found, start from Personal
    if (currentIndex === -1) currentIndex = 0;
    
    // Get next context (wrap around)
    const nextIndex = (currentIndex + 1) % all.length;
    return all[nextIndex];
  });
  
  // Hint text for tooltip
  protected nextContextHint = computed(() => {
    const next = this.nextContext();
    if (!next) return 'No other contexts available';
    
    const nextName = next.type === 'user' ? 'Personal' : 
                     next.type === 'organization' ? (next as any).name :
                     next.type === 'team' ? (next as any).name :
                     next.type === 'partner' ? (next as any).name : '';
    
    return `Click to switch to ${nextName}`;
  });

  handleCycleContext(): void {
    const next = this.nextContext();
    if (!next) {
      console.log('[ContextSwitcher] No next context available');
      return;
    }
    
    console.log('[ContextSwitcher] Cycling to', next.type, next);
    
    if (next.type === 'user') {
      this.contextStore.resetContext();
    } else {
      this.contextStore.switchContext(next);
    }
  }

  handleNavigateBack(): void {
    const currentType = this.currentContextType();
    console.log('[ContextSwitcher] Navigate back from', currentType);
    
    if (currentType === 'team' || currentType === 'partner') {
      // Navigate back to parent organization - need to find it
      const current = this.currentContext();
      const orgId = current?.type === 'team' ? current.organizationId :
                    current?.type === 'partner' ? current.organizationId : null;
      
      if (orgId) {
        const available = this.availableContexts();
        const org = available.organizations.find(o => o.organizationId === orgId);
        if (org) {
          this.contextStore.switchContext(org);
        } else {
          this.contextStore.resetContext();
        }
      } else {
        this.contextStore.resetContext();
      }
    } else if (currentType === 'organization') {
      // Navigate back to Personal
      this.contextStore.resetContext();
    }
  }
}
