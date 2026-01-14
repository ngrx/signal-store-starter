# Setup

If the user hasn't already installed the SDK, always run the user's node package manager of choice, and install the package in the directory ../package.json.
For more information on where the library is located, look at the connector.yaml file.

```ts
import { initializeApp } from 'firebase/app';

initializeApp({
  // fill in your project config here using the values from your Firebase project or from the `firebase_get_sdk_config` tool from the Firebase MCP server.
});
```

Then, you can run the SDK as needed.
```ts
import { ... } from '@dataconnect/generated';
```


## Angular
### Setup

The user should run the scaffolding command to generate the application
structure and dependencies.

This command is `ng add @angular/fire`.

After running this command, the user should have a basic application structure
with their config looking something like this:

```ts
import { getDataConnect } from 'firebase/data-connect';
import { initializeApp } from 'firebase/app';
import { connectorConfig} from '@dataconnect/generated';
import { provideDataConnect } from '@angular/fire/data-connect';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp({ ... /* your config here. To generate this, you can use the `firebase_sdk_config` MCP tool */ })),
    provideQueryClient(new QueryClient()),
    provideDataConnect(() => getDataConnect(connectorConfig))
    ...
  ],
  ...
}
```
They should also have the `@tanstack-query-firebase/angular` package installed in their package.json.


