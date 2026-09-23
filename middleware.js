export default function middleware(request) {
  const host = request.headers.get('host') || '';
  const { pathname } = new URL(request.url);

  const isPublicBrandHost =
    host === 'www.hyperseek.com.tw' || host === 'hyperseek.com.tw';

  if (!isPublicBrandHost) {
    return;
  }

  if (pathname.startsWith('/assets/') || pathname === '/holding.html') {
    return;
  }

  return new Response(null, {
    headers: { 'x-middleware-rewrite': '/holding.html' },
  });
}

export const config = {
  matcher: ['/((?!assets/).*)'],
};
