import { Component, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore, ContextStoreInstance } from '../../../../core/context/stores/context.store';

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
      <button class="context-btn" (click)="handleCycleContext()" [title]="getNextContextHint()">
        <span class="context-icon">{{ contextIcon() }}</span>
        <span>{{ currentContextName() || 'Personal' }}</span>
        @if (hasMultipleContexts()) {
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

    .context-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
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
  
  // Computed signals wrapping store access
  protected hasOrganizations = computed(() => this.contextStore.hasOrganizations());
  protected currentContextType = computed(() => this.contextStore.currentContextType());
  protected currentContextName = computed(() => this.contextStore.currentContextName());
  protected currentContextId = computed(() => this.contextStore.currentContextId());
  protected availableContexts = computed(() => this.contextStore.available());
  protected contextIcon = computed(() => this.getContextIconForType(this.currentContextType()));
  
  // Check if there are multiple contexts to cycle through
  protected hasMultipleContexts = computed(() => {
    const contexts = this.availableContexts();
    return contexts.organizations.length > 0 || 
           contexts.teams.length > 0 || 
           contexts.partners.length > 0;
  });
  
  // Output events
  contextSwitch = output<any>();
  navigateBack = output<void>();

  handleCycleContext(): void {
    const contexts = this.availableContexts();
    const currentType = this.currentContextType();
    const currentId = this.currentContextId();
    
    // Build list of all available contexts in order: Personal -> Organizations -> Teams -> Partners
    const allContexts: any[] = [];
    
    // Add Personal context (always first)
    allContexts.push({ 
      type: 'user', 
      name: 'Personal',
      userId: currentId || '' // Will be populated when switching
    });
    
    // Add all organizations
    contexts.organizations.forEach(org => {
      allContexts.push(org);
    });
    
    // Add all teams
    contexts.teams.forEach(team => {
      allContexts.push(team);
    });
    
    // Add all partners
    contexts.partners.forEach(partner => {
      allContexts.push(partner);
    });
    
    // If only Personal context exists, do nothing
    if (allContexts.length <= 1) {
      return;
    }
    
    // Find current context index
    let currentIndex = -1;
    
    for (let i = 0; i < allContexts.length; i++) {
      const ctx = allContexts[i];
      
      if (ctx.type === 'user' && currentType === 'user') {
        currentIndex = i;
        break;
      } else if (ctx.type === 'organization' && currentType === 'organization' && ctx.organizationId === currentId) {
        currentIndex = i;
        break;
      } else if (ctx.type === 'team' && currentType === 'team' && ctx.teamId === currentId) {
        currentIndex = i;
        break;
      } else if (ctx.type === 'partner' && currentType === 'partner' && ctx.partnerId === currentId) {
        currentIndex = i;
        break;
      }
    }
    
    // If current context not found, default to Personal
    if (currentIndex === -1) {
      currentIndex = 0;
    }
    
    // Cycle to next context (wrap around to 0 after last)
    const nextIndex = (currentIndex + 1) % allContexts.length;
    const nextContext = allContexts[nextIndex];
    
    console.log('[ContextSwitcher] Cycling from', currentType, 'to', nextContext.type, nextContext);
    
    // Switch to next context
    if (nextContext.type === 'user') {
      this.contextStore.resetContext(); // Switch to Personal
    } else {
      this.contextStore.switchContext(nextContext);
    }
  }

  getNextContextHint(): string {
    const contexts = this.availableContexts();
    const currentType = this.currentContextType();
    const currentId = this.currentContextId();
    
    // Build list of all available contexts
    const allContexts: any[] = [];
    allContexts.push({ type: 'user', name: 'Personal' });
    contexts.organizations.forEach(org => allContexts.push(org));
    contexts.teams.forEach(team => allContexts.push(team));
    contexts.partners.forEach(partner => allContexts.push(partner));
    
    if (allContexts.length <= 1) {
      return 'Personal Context';
    }
    
    // Find current index
    let currentIndex = -1;
    for (let i = 0; i < allContexts.length; i++) {
      const ctx = allContexts[i];
      if (ctx.type === 'user' && currentType === 'user') {
        currentIndex = i;
        break;
      } else if (ctx.type === 'organization' && currentType === 'organization' && ctx.organizationId === currentId) {
        currentIndex = i;
        break;
      } else if (ctx.type === 'team' && currentType === 'team' && ctx.teamId === currentId) {
        currentIndex = i;
        break;
      } else if (ctx.type === 'partner' && currentType === 'partner' && ctx.partnerId === currentId) {
        currentIndex = i;
        break;
      }
    }
    
    if (currentIndex === -1) {
      currentIndex = 0;
    }
    
    const nextIndex = (currentIndex + 1) % allContexts.length;
    const nextContext = allContexts[nextIndex];
    
    return `Click to switch to ${nextContext.name}`;
  }

  handleSwitchContext(context: any): void {
    this.contextStore.switchContext(context);
    this.contextSwitch.emit(context);
  }

  handleNavigateBack(): void {
    const currentType = this.currentContextType();
    if (currentType === 'team' || currentType === 'partner') {
      // Navigate back to parent organization
      this.navigateBack.emit();
    } else if (currentType === 'organization') {
      // Navigate back to Personal
      this.contextStore.resetContext();
    }
  }

  private getContextIconForType(type: string | null): string {
    switch (type) {
      case 'organization':
        return '🏢';
      case 'team':
        return '👥';
      case 'partner':
        return '🤝';
      case 'user':
        return '👤';
      default:
        return '👤';
    }
  }
}
