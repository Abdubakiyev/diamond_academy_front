export function getYoutubeId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.replace(/^(www|m)\./, '');
    if (host === 'youtu.be') return url.pathname.split('/')[1] || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v');
      const m = url.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      return m ? m[2] : null;
    }
  } catch {
    /* noto'g'ri havola */
  }
  return null;
}

export function getVimeoId(input: string): string | null {
  const m = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export const isDirectVideo = (url: string) => /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
