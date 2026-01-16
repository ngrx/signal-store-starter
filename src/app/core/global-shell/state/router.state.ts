/**
 * Router State
 * Per prd-sup.md section on GlobalShell.Router
 */

import { RouteInfo, NavigationState } from '../models/router.model';

export const initialRouterState: NavigationState = {
  currentRoute: null,
  previousRoute: null,
  navigationHistory: [],
  isNavigating: false,
};
