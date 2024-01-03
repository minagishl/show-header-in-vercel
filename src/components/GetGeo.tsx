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

  function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position as GeolocationPosition),
        (error) => reject(error as GeolocationPositionError),
        options || {}
      );
    });
  }

  useEffect(() => {
    if (navigator.geolocation) {
      // Get the user's current position
      getCurrentPosition({ maximumAge: 5000, enableHighAccuracy: true })
        .then((position) => {
          const { latitude, longitude } = position.coords;

          // Get the user's location from the latitude & longitude
          fetch(`api/reverse?format=json&accept-language=en&lat=${latitude}&lon=${longitude}`)
            .then((response) => response.json())
            .then((data) => {
              setGeo(data);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log('Failed to acquire current location', error);
        });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  // Takes a long time to load the first time.
  return <span>{geo ? geo.display_name : 'We are in the process of acquiring...'}</span>;
}
