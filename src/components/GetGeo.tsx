'use client';

import { useState, useEffect } from 'react';

type geo = {
	place_id: number;
	licence: string;
	osm_type: string;
	osm_id: number;
	lat: string;
	lon: string;
	class: string;
	type: string;
	place_rank: number;
	importance: number;
	addresstype: string;
	name: string;
	display_name: string;
	address: {
		neighbourhood: string;
		suburb: string;
		city: string;
		province: string;
		'ISO3166-2-lvl4': string;
		region: string;
		postcode: string;
		country: string;
		country_code: string;
	};
	boundingbox: string[];
};

export default function GetGeo() {
	const [geo, setGeo] = useState<geo | null>(null);

	useEffect(() => {
		if (navigator.geolocation) {
			const watcher = navigator.geolocation.watchPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${latitude}&lon=${longitude}`
					);
					const data = (await response.json()) as geo;
					setGeo(data);
				},
				(error) => {
					console.log('Failed to acquire current location', error);
				}
			);

			// When the component is unmounted, clear the geolocation watcher
			return () => navigator.geolocation.clearWatch(watcher);
		} else {
			console.log('Geolocation is not supported by this browser.');
		}
	}, []);

	return <span>{geo ? geo.display_name : ''}</span>;
}
