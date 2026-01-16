/**
 * Router Models
 * GlobalShell.Router = RouterSignals (currentRoute | routeParams | queryParams)
 * Per prd-sup.md section on GlobalShell
 */

export interface RouteInfo {
  path: string;
  url: string;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  fragment: string | null;
  data: Record<string, unknown>;
  title?: string;
}

export interface NavigationState {
  currentRoute: RouteInfo | null;
  previousRoute: RouteInfo | null;
  navigationHistory: RouteInfo[];
  isNavigating: boolean;
}

export interface NavigationEvent {
  type: 'start' | 'end' | 'cancel' | 'error';
  route: RouteInfo;
  timestamp: number;
}
