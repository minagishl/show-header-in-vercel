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
	hostname: string;
	device?: string;
};

export default function Page() {
	let data: list | undefined;

	// User IP address
	const headersList = headers();
	const ip = headersList.get('host')?.includes('localhost')
		? '1.1.1.1'
		: headersList.get('x-forwarded-for') === 'string'
		? headersList.get('x-forwarded-for')
		: headersList.get('x-vercel-proxied-for') || headersList.get('x-real-ip');

	// User host name
	if (!ip || ip === '::1' || ip === '') {
		console.log('ip address is not found');
	} else {
		data = cache.get(ip) as list;

		if (!data) {
			dns.lookupService(ip, 0, (error, hostname) => {
				if (error) {
					console.log(error);
				} else {
					data = {
						hostname: hostname,
						device: connectionType(hostname),
					};
					cache.set(ip, data);
					// console.log('cache set');
				}
			});
		}
	}

	function connectionType(hostname: string) {
		if (hostname.includes('spmode.ne.jp')) {
			return 'smart phone';
		} else {
			return 'Unknown';
		}
	}

	return (
		<>
			<span>Your current network host name: {data ? data.hostname : ''}</span>
			<br />
			<span>Your current device: {data ? data.device : ''}</span>
			<br />
			<span>
				Your current location: <GetGeo />
			</span>
		</>
	);
}
