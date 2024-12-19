import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const extractVideoIdFromUrl = (url) => {
  if (!url) return null;
  
  // Si ya es un ID de YouTube, retornarlo
  if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
    return url;
  }

  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
    /\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /embed\/([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('Found video ID:', match[1], 'using pattern:', pattern);
      return match[1];
    }
  }
  return null;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Searching for:', query);

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      }
    });

    const $ = cheerio.load(response.data);
    let videoId = null;
    let title = "";
    let thumbnail = "";

    // Método 1: Buscar en el contenido del script
    const scripts = $('script').get();
    for (const script of scripts) {
      const content = $(script).html() || '';
      if (content.includes('ytInitialData')) {
        try {
          const dataMatch = content.match(/var\s+ytInitialData\s*=\s*({.+?});/);
          if (dataMatch) {
            const ytInitialData = JSON.parse(dataMatch[1]);
            const contents = ytInitialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
            
            if (contents && contents.length > 0) {
              const videos = contents[0]?.itemSectionRenderer?.contents;
              const firstVideo = videos?.find(item => item.videoRenderer);
              
              if (firstVideo?.videoRenderer) {
                videoId = firstVideo.videoRenderer.videoId;
                title = firstVideo.videoRenderer.title.runs[0].text;
                thumbnail = firstVideo.videoRenderer.thumbnail.thumbnails[0].url;
                console.log('Found video using Method 1:', { videoId, title });
              }
            }
          }
        } catch (e) {
          console.error('Error parsing script content:', e);
        }
      }
    }

    // Método 2: Buscar en los enlaces de video
    if (!videoId) {
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('/watch?v=')) {
          const possibleId = extractVideoIdFromUrl(href);
          if (possibleId) {
            videoId = possibleId;
            title = $(element).text().trim() || title;
            const img = $(element).find('img').first();
            thumbnail = img.attr('src') || thumbnail;
            console.log('Found video using Method 2:', { videoId, title });
            return false; // Break the loop
          }
        }
      });
    }

    // Método 3: Buscar en los metadatos
    if (!videoId) {
      const ogVideo = $('meta[property="og:video:url"]').attr('content');
      if (ogVideo) {
        videoId = extractVideoIdFromUrl(ogVideo);
        title = $('meta[property="og:title"]').attr('content') || title;
        thumbnail = $('meta[property="og:image"]').attr('content') || thumbnail;
        console.log('Found video using Method 3:', { videoId, title });
      }
    }

    // Método 4: Intentar extraer directamente de la query si parece una URL de YouTube
    if (!videoId && (query.includes('youtube.com') || query.includes('youtu.be'))) {
      videoId = extractVideoIdFromUrl(query);
      console.log('Found video using Method 4:', { videoId });
    }

    console.log('Final result:', { videoId, title, thumbnail });

    const result = {
      items: [{
        id: { videoId: videoId || "" },
        snippet: {
          title: title || "",
          thumbnails: {
            default: { url: thumbnail || "" }
          }
        }
      }]
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({
      items: [{
        id: { videoId: "" },
        snippet: {
          title: "",
          thumbnails: {
            default: { url: "" }
          }
        }
      }]
    });
  }
}
