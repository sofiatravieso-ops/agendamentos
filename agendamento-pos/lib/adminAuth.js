export function checkAdminAuth(request) {
  const auth = request.headers.get("x-admin-password");
  return auth && auth === process.env.ADMIN_PASSWORD;
}
