export const DA_OWNER_MODE_STORAGE_KEY = "marginalia-da-owner-mode";

const FALLBACK_OWNER_PIN = "marginalia-owner";

function getOwnerPin(): string {
  return process.env.NEXT_PUBLIC_DA_OWNER_PIN ?? FALLBACK_OWNER_PIN;
}

export function isOwnerModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DA_OWNER_MODE_STORAGE_KEY) === "true";
}

export function enableOwnerMode(pin: string): boolean {
  if (typeof window === "undefined") return false;
  const isValid = pin === getOwnerPin();
  if (isValid) {
    window.localStorage.setItem(DA_OWNER_MODE_STORAGE_KEY, "true");
  }
  return isValid;
}

export function disableOwnerMode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DA_OWNER_MODE_STORAGE_KEY);
}
