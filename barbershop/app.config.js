/**
 * Extends app.json. `ARTIFACT_BUILD=1 npx expo export --platform web` produces a single-bundle
 * web build (no lazily loaded route chunks), which scripts/build-artifact.mjs packs into one
 * self-contained HTML page for sharing.
 */
module.exports = ({ config }) => {
  if (process.env.ARTIFACT_BUILD !== '1') return config;
  return {
    ...config,
    plugins: config.plugins.map((p) => (p === 'expo-router' ? ['expo-router', { asyncRoutes: false }] : p)),
  };
};
