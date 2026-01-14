import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Bootstrap the Angular application
 * 
 * The APP_INITIALIZER in appConfig will run before the app renders,
 * ensuring Firebase Auth and NgRx Signals stores are properly initialized.
 */
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('[Bootstrap] Application started successfully');
  })
  .catch((err) => {
    console.error('[Bootstrap] Application failed to start:', err);
    // Display error message to user
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        color: #dc2626;
        background-color: #fef2f2;
        padding: 20px;
      ">
        <h1 style="font-size: 24px; margin-bottom: 12px;">Application Failed to Start</h1>
        <p style="margin-bottom: 8px;">Please try refreshing the page.</p>
        <p style="font-size: 14px; color: #991b1b; max-width: 600px; text-align: center;">
          If this problem persists, please contact support.
        </p>
        <details style="margin-top: 20px; max-width: 800px;">
          <summary style="cursor: pointer; color: #991b1b;">Technical Details</summary>
          <pre style="
            margin-top: 12px;
            padding: 12px;
            background-color: #fff;
            border: 1px solid #fecaca;
            border-radius: 4px;
            overflow: auto;
            font-size: 12px;
          ">${err.message || err}</pre>
        </details>
      </div>
    `;
  });

