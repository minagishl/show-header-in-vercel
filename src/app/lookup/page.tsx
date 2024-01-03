'use strict';

import dns from 'dns';
import GetGeo from '@/components/GetGeo';
import { headers } from 'next/headers';
import { LRUCache } from 'lru-cache';
import mobile from 'is-mobile';
import GetParams from '@/components/GetParams';
import AllowButton from '@/components/AllowButton';

const cache = new LRUCache({
  max: 500, // The maximum size of the cache
  ttl: 1000 * 60 * 30, // how long to live in ms
});

type list = {
  hostname?: string | null;
  lookup?: string | null;
  device?: string | null;
};

export default async function Page() {
  let data: list | null = {};

  // Mobile domain
  const domains: string[] = [
    'ocn.ne.jp', // ocn
    'spmode.ne.jp', // docomo
    'au-net.ne.jp', // au
    'enabler.ne.jp', // au
    'openmobile.ne.jp', // softbank
    'panda-world.ne.jp', // softbank
  ];

  // User IP address
  const headersList = headers();
  const ip: string | null = headersList.get('host')?.includes('localhost')
    ? '1.1.1.1' // Cloudflare DNS
    : headersList.get('x-forwarded-for') === 'string'
      ? headersList.get('x-forwarded-for')
      : headersList.get('x-vercel-proxied-for') || headersList.get('x-real-ip');

  // Debug IP address: 104.28.233.45

  // User host name
  if (!ip || ip === '::1' || ip === '') {
    console.log('ip address is not found');
  } else {
    data = cache.get(ip) as list;

    if (!data) {
      await lookupService(ip)
        .then((result) => {
          data = result;
          cache.set(ip, data);
        })
        .catch((_) => {});
    }
  }

  function lookupService(ip: string): Promise<list> {
    return new Promise((resolve, reject) => {
      dns.lookupService(ip, 0, (error, hostname) => {
        if (error) {
          reject(error);
        } else {
          dns.promises
            .lookup(hostname, { family: 4 })
            .then(({ address }) => {
              resolve({
                hostname: hostname,
                lookup: address,
                device: connectionType(hostname),
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  }

  function connectionType(hostname: string | null): string {
    if (hostname && domains.some((domain) => hostname.includes(domain))) {
      if (mobile({ ua: String(headersList.get('User-Agent')) })) {
        return 'Mobile Telecommunications Phone';
      } else {
        return 'Mobile communication, but not a phone.';
      }
    } else {
      if (mobile({ ua: String(headersList.get('User-Agent')) })) {
        return 'Possible phone call.';
      }
      return 'Unknown';
    }
  }

  function ipMatch(ip: string | null, lookup: any): boolean {
    if (ip === '8.8.8.8' || ip === '8.8.4.4') {
      return lookup === '8.8.8.8' || lookup === '8.8.4.4';
    } else if (ip === '1.1.1.1' || ip === '1.0.0.1') {
      return lookup === '1.1.1.1' || lookup === '1.0.0.1';
    } else {
      return ip === lookup;
    }
  }

  return (
    <div>
      <div className="markdown-body">
        <article className="prose hidden w-full">
          {typeof data === 'undefined' ? (
            <>
              <span>Disengage the VPN. Cannot get it right.</span>
              <br />
            </>
          ) : (
            ''
          )}
          <span>Your current network host name: {data?.hostname ? data.hostname : 'Unknown'}</span>
          <br />
          <span>iPv4 host name positive pull: {data?.lookup ? data.lookup : 'Unknown'}</span>
          <br />
          {ipMatch(ip, data?.lookup ? data.lookup : 'Unknown') ? (
            <span>IP address and host name match.</span>
          ) : (
            <span>IP address and host name do not match.</span>
          )}
          <br />
          <span>Your current device: {data?.device ? data.device : 'Unknown'}</span>
          <br />
          <span>
            Your current location: <GetGeo />
          </span>
          <br />
          <span>
            Redirect to URL: <GetParams />
          </span>
        </article>
      </div>
      {/* user view */}
      <div className="absolute top-0 flex h-screen w-screen items-center justify-center bg-zinc-50 px-5">
        <div className="w-full max-w-sm space-y-5 overflow-hidden overflow-ellipsis px-2 py-20">
          <h1 className="pb-3 pr-20 text-xl font-medium">
            You are attempting to send your location to the following site
          </h1>
          <span className="font-normal">
            This information may change your service experience.
            <br />
            <span className="whitespace-nowrap" id="redirect_url">
              <GetParams />
            </span>
          </span>
          <div className="space-y-3 pt-5">
            <AllowButton />
            <button className="w-full bg-zinc-100 py-3 text-zinc-900">
              <span className="text-lg font-medium">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
