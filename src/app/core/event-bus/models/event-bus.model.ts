export type EventBusScope = 'global' | 'workspace' | 'module';

export interface EventBusEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
  scope: EventBusScope;
  correlationId?: string;
  causationId?: string;
  timestamp: number;
  producer?: string;
}

export interface EventBusState {
  events: EventBusEvent[];
  lastEvent: EventBusEvent | null;
  retentionLimit: number;
}

export const initialEventBusState: EventBusState = {
  events: [],
  lastEvent: null,
  retentionLimit: 200,
};
