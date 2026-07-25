/**
 * Valida que un path de redirección post-login sea una ruta interna segura.
 * Mitiga open redirect: react-router expone `location.state.from.pathname`
 * (controlable por quien arma el link/estado de navegación) y no hay un fix
 * de la librería disponible para el aviso de open redirect (ver docs/SEGURIDAD.md).
 *
 * Rechaza protocolo-relativos ("//evil.com") y variantes con backslash
 * ("/\evil.com") que algunos navegadores normalizan como "//evil.com".
 */
export const isSafeInternalPath = (p) =>
  typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\');

export const getSafeRedirectPath = (path, fallback = '/dashboard') =>
  isSafeInternalPath(path) ? path : fallback;
