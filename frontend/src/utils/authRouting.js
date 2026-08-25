export function isOwnerLoginPath(pathname = "") {
  const normalized = String(pathname).toLowerCase().replace(/\/+$/, "") || "/";
  return normalized === "/fitland/login" || normalized === "/owner/login";
}

export function getLoginEndpoint(ownerContext = false) {
  return ownerContext ? "/auth/owner-login" : "/auth/login";
}
