/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/login` | `/(auth)/signup` | `/(tabs)` | `/(tabs)/` | `/(tabs)/admin_dashboard` | `/(tabs)/company_dashboard` | `/(tabs)/orders` | `/(tabs)/profile` | `/(tabs)/profile/` | `/(tabs)/profile/edit` | `/(tabs)/saved` | `/(tabs)/search` | `/(tabs)/support` | `/_sitemap` | `/admin_dashboard` | `/company_dashboard` | `/login` | `/orders` | `/profile` | `/profile/` | `/profile/edit` | `/saved` | `/search` | `/signup` | `/support`;
      DynamicRoutes: `/furniture/${Router.SingleRoutePart<T>}` | `/ticket/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/furniture/[id]` | `/ticket/[id]`;
    }
  }
}
