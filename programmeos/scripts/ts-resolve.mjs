// Minimal resolver so Node's native TypeScript support can load extensionless imports.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (specifier.startsWith('.')) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        try {
          return await next(specifier + ext, context);
        } catch {}
      }
    }
    throw err;
  }
}
