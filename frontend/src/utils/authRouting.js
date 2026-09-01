export function isOwnerLoginPath(pathname = "") {
  const normalized = String(pathname).toLowerCase().replace(/\/+$/, "") || "/";
  return normalized === "/fitland/login" || normalized === "/owner/login";
}

export function isAuthLoginPath(pathname = "") {
  const normalized = String(pathname).toLowerCase().replace(/\/+$/, "") || "/";
  return isOwnerLoginPath(normalized) || /^\/personal\/[^/]+\/login$/.test(normalized);
}

export function getLoginEndpoint(ownerContext = false) {
  return ownerContext ? "/auth/owner-login" : "/auth/login";
}
