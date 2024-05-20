export function getIdFromUrl(url) {
  const youtubeComHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com']

  if (url.includes(' ')) {
    return null
  }

  let uri
  try {
    uri = new URL(url)
  } catch (e) {
    return null
  }

  if (!['https:', 'http:'].includes(uri.protocol)) {
    return null
  }

  // youtube.com/watch?v=xxxxxxxxxxx
  if (
    youtubeComHosts.includes(uri.hostname) &&
    uri.pathname.split('/').length > 1 &&
    uri.pathname.split('/')[1] === 'watch' &&
    uri.searchParams.has('v')
  ) {
    const videoId = uri.searchParams.get('v')
    return isValidId(videoId) ? videoId : null
  }

  // youtu.be/xxxxxxxxxxx
  if (uri.hostname === 'youtu.be' && uri.pathname.length > 1) {
    const videoId = uri.pathname.substr(1)
    return isValidId(videoId) ? videoId : null
  }

  // youtube.com/shorts/xxxxxxxxxxx
  // youtube.com/embed/xxxxxxxxxxx
  // youtube.com/live/xxxxxxxxxxx
  if (
    youtubeComHosts.includes(uri.hostname) &&
    uri.pathname.split('/').length === 3 &&
    ['shorts', 'embed', 'live'].includes(uri.pathname.split('/')[1])
  ) {
    const videoId = uri.pathname.split('/')[2]
    return isValidId(videoId) ? videoId : null
  }

  return null
}

function isValidId(id) {
  return /^[_\-a-zA-Z0-9]{11}$/.test(id)
}
