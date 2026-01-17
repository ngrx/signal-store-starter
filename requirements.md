# Requirements

## Context Switcher Dropdown

- WHEN an authenticated user opens the context switcher from Personal context, THE SYSTEM SHALL display the Personal option plus all available organizations, teams, and partners.
- WHEN an authenticated user opens the context switcher from any non-user context, THE SYSTEM SHALL display the Personal option plus all available organizations, teams, and partners.
- WHEN a user selects an organization, team, or partner from the context switcher, THE SYSTEM SHALL switch to the selected context and refresh navigation for that context.
- WHEN a user selects Personal from the context switcher, THE SYSTEM SHALL switch back to the user context.
- WHEN a user uses the context back control from team, partner, or organization context, THE SYSTEM SHALL navigate to the parent context (organization or personal) if available.
- WHEN authentication state changes to authenticated or unauthenticated, THE SYSTEM SHALL refresh available contexts for the Personal dropdown.
