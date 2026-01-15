import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { EventBusEvent, EventBusState, initialEventBusState } from '../models/event-bus.model';

/**
 * EventBusStore
 * Cross-module, cross-context event pipeline using @ngrx/signals.
 * This is a lightweight backbone: emit → signal history → consumers react via computed/effects.
 */
export const EventBusStore = signalStore(
  { providedIn: 'root' },
  withState<EventBusState>(initialEventBusState),
  withComputed(({ events, lastEvent }) => ({
    eventCount: computed(() => events().length),
    latest: computed(() => lastEvent()),
  })),
  withMethods((store) => ({
    emit<TPayload = unknown>(event: EventBusEvent<TPayload>): void {
      const normalized: EventBusEvent = {
        ...event,
        timestamp: event.timestamp ?? Date.now(),
      };

      const limit = store.retentionLimit();
      patchState(store, (state) => ({
        events: [...state.events, normalized].slice(limit > 0 ? -limit : undefined),
        lastEvent: normalized,
      }));
    },
    setRetentionLimit(limit: number): void {
      patchState(store, { retentionLimit: Math.max(0, Math.trunc(limit)) });
    },
    clear(): void {
      patchState(store, { events: [], lastEvent: null });
    },
  }))
);
