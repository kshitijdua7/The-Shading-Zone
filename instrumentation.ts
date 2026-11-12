/** Runs once when each server instance starts, before it handles requests. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initStore } = await import('./lib/store');
    await initStore();
  }
}
