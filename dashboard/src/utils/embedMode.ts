/** Set by MainLayout when Octop is opened with `?embed=1` inside a host app (COE Web). */
const EMBED_KEY = "octop:embed";

/** Whether Octop runs embedded in a host app, which hides its own create and scope controls. */
export function isEmbedded(): boolean {
  try {
    return sessionStorage.getItem(EMBED_KEY) === "1";
  } catch {
    return false;
  }
}
