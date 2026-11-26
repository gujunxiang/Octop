import { isEmbedded } from "../utils/embedMode";
import { useCurrentUser } from "./useCurrentUser";

/**
 * Embedded Octop (inside COE Web) gives non-admin users a chat-only composer:
 * the expert's preset connectors, knowledge bases, model, and mode still apply,
 * but their chips, pickers, and shortcuts are hidden and cannot be changed.
 */
export function useEmbeddedComposerLock(): boolean {
  const user = useCurrentUser();
  return isEmbedded() && user?.role !== "admin";
}
