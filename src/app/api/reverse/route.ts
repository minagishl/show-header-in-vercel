import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500, // The maximum size of the cache
  ttl: 1000 * 60 * 30, // how long to live in ms
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('accept-language') || 'en';
  const latitude = searchParams.get('lat') || null;
  const longitude = searchParams.get('lon') || null;
  const format = searchParams.get('format') || 'json';
  let data = null;

  if (!latitude || !longitude) {
    return new Response('Missing latitude or longitude', {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const formatter: string[] = ['xml', 'json', 'jsonv2', 'geojson', 'geocodejson'];

  if (!formatter.some((formatter) => format.includes(formatter))) {
    return new Response('Please specify the correct format', {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const str = language + '-' + latitude + '-' + longitude + '-' + format;
  const replaced = str.replace(/\./g, '-');

  // Check if the cache has the data
  data = cache.get(replaced);

  if (data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=${format}&accept-language=${language}&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).catch((err) => {
      console.log(err);
      return new Response('An error has occurred.', {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    if (format === 'xml') {
      const data = await res.text();
      cache.set(replaced, data); // Set the cache
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }

    data = await res.json();
    cache.set(replaced, data);

    return Response.json({ data });
  }
}
