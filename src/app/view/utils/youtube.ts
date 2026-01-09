export function toYouTubeEmbedUrl(videoUrl: string, videoId: string) {
  // safest: always use id for embed
  return `https://www.youtube.com/embed/${encodeURIComponent(
    videoId
  )}?autoplay=1&rel=0&modestbranding=1`;

  console.log(videoUrl);
  
}
