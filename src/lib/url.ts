export const getURL = () => {
  // For client-side, use the current hostname if on dev domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'dev.gp.pandamonium-gaming.com') {
      return 'https://dev.gp.pandamonium-gaming.com/';
    }
  }

  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000';

  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};
