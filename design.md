# Design

## Overview

The context switcher dropdown lives in the header and reads current and available contexts from `ContextStore`. It provides a dropdown list of contexts (Personal, Organizations, Teams, Partners) and emits events for navigation updates. Context switching continues to be handled by `ContextStore` to preserve domain/application boundaries.

## Architecture

- **Interface layer**: `ContextSwitcherComponent` renders the dropdown and handles user interaction.
- **Application/domain state**: `ContextStore` provides the current context and available contexts; it performs context transitions.
- **Navigation**: `HeaderComponent` listens to context switch/back outputs to navigate to the workspace list.

## Data Flow

1. `ContextStore.available()` exposes organizations/teams/partners.
2. `ContextSwitcherComponent` computes dropdown sections from the store signals.
3. User selects a context:
   - Personal → `ContextStore.resetContext()`
   - Organization/Team/Partner → `ContextStore.switchContext(context)`
4. Component emits `contextSwitch` output so header can update the route.
5. `ContextStore` refreshes available contexts whenever auth state changes to ensure existing data appears after login/logout.

## UI/UX Notes

- Dropdown is toggled by the context button and closes on outside click.
- The current context is highlighted.
- Buttons and menu use native elements for keyboard accessibility.

## Error Handling

- If there is no authenticated user, Personal is still shown but no context switch occurs.
- Context switching relies on existing `ContextStore` safeguards (e.g., missing parent org falls back to Personal).
