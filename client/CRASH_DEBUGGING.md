## Install Sentry
npm install --save @sentry/react-native

## Configure Sentry in your app
# Add to app/_layout.tsx or app.tsx

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN', // Get from sentry.io (free account)
  enableInExpoDevelopment: true,
  debug: true,
});

## Then rebuild your APK
eas build --platform android --profile preview
