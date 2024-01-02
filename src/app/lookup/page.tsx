'use strict';

import dns from 'dns';
import GetGeo from '@/components/GetGeo';
import { headers } from 'next/headers';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
	max: 500, // The maximum size of the cache
	ttl: 1000 * 60 * 30, // how long to live in ms
});

type list = {
	hostname?: string;
	device?: string;
};

export default async function Page() {
	let data: list = {};

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
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}

	const ipv4Hostname = ['spmode.ne.jp', 'au-net.ne.jp'];

	function lookupService(ip: string): Promise<list> {
		return new Promise((resolve, reject) => {
			dns.lookupService(ip, 0, (error, hostname) => {
				if (error) {
					reject(error);
				} else {
					cache.set(ip, data);
					resolve({
						hostname: hostname,
						device: connectionType(hostname),
					});
				}
			});
		});
	}

	function connectionType(hostname: string): string {
		if (ipv4Hostname.includes(hostname)) {
			return 'smart phone';
		} else {
			return 'Unknown';
		}
	}

	return (
		<>
			<span>Your current network host name: {data.hostname}</span>
			<br />
			<span>Your current device: {data.device}</span>
			<br />
			<span>
				Your current location: <GetGeo />
			</span>
		</>
	);
}
