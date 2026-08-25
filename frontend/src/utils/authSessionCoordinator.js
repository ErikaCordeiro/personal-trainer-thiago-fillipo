export function createAuthSessionCoordinator() {
  let generation = 0;
  let refreshPromise = null;

  return {
    beginAuthentication() {
      generation += 1;
      return generation;
    },
    invalidate() {
      generation += 1;
    },
    currentGeneration() {
      return generation;
    },
    runRefresh(factory, applyResult) {
      if (refreshPromise) return refreshPromise;

      const refreshGeneration = generation;
      refreshPromise = Promise.resolve()
        .then(factory)
        .then((result) => {
          if (refreshGeneration === generation) applyResult(result);
          return result;
        })
        .finally(() => {
          refreshPromise = null;
        });

      return refreshPromise;
    },
  };
}
