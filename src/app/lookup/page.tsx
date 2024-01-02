'use strict';

import dns from 'dns';
import GetGeo from '@/components/GetGeo';
import { headers } from 'next/headers';
import { LRUCache } from 'lru-cache';
import mobile from 'is-mobile';
import GetParams from '@/components/GetParams';

const cache = new LRUCache({
	max: 500, // The maximum size of the cache
	ttl: 1000 * 60 * 30, // how long to live in ms
});

type list = {
	hostname?: string;
	lookup?: string;
	device?: string;
};

export default async function Page() {
	let data: list = {};
	const domains: string[] = ['spmode.ne.jp', 'au-net.ne.jp'];

	// User IP address
	const headersList = headers();
	const ip = headersList.get('host')?.includes('localhost')
		? '1.1.1.1' // Cloudflare DNS
		: headersList.get('x-forwarded-for') === 'string'
		? headersList.get('x-forwarded-for')
		: headersList.get('x-vercel-proxied-for') || headersList.get('x-real-ip');

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
				.catch((error) => {
					console.log(error);
				});
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

	function connectionType(hostname: string | undefined): string {
		if (!(typeof hostname === 'undefined') && domains.some((domain) => hostname.includes(domain))) {
			if (mobile({ ua: String(headersList.get('User-Agent')) })) {
				return 'Mobile Telecommunications Phone';
			} else {
				return 'Mobile communication, but not a phone.';
			}
		} else {
			return 'Unknown';
		}
	}

	function ipMatch(ip: string | null, lookup: string | undefined): boolean {
		if (ip === '8.8.8.8' || ip === '8.8.4.4') {
			return lookup === '8.8.8.8' || lookup === '8.8.4.4';
		} else if (ip === '1.1.1.1' || ip === '1.0.0.1') {
			return lookup === '1.1.1.1' || lookup === '1.0.0.1';
		} else {
			return ip === lookup;
		}
	}

	return (
		<div className='markdown-body'>
			<article className='prose max-w-full'>
				<span>Your current network host name: {data.hostname}</span>
				<br />
				<span>iPv4 host name positive pull: {data.lookup}</span>
				<br />
				{ipMatch(ip, data.lookup) ? (
					<span>IP address and host name match.</span>
				) : (
					<span>IP address and host name do not match.</span>
				)}
				<br />
				<span>Your current device: {data.device}</span>
				<br />
				<span>
					Your current location: <GetGeo />
				</span>
				<br />
				<GetParams />
			</article>
		</div>
	);
}
