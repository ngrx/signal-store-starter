import { ContextState } from '../models/context.model';

export const initialContextState: ContextState = {
  current: null,
  available: {
    organizations: [],
    teams: [],
    partners: [],
  },
  history: [],
};
