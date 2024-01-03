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

type yahooGeo = {
  data: {
    ResultInfo: {
      Count: number;
      Total: number;
      Start: number;
      Latency: number;
      Status: number;
      Description: string;
      Copyright: string;
      CompressType: string;
    };
    Feature: [
      {
        Geometry: {
          Type: string;
          Coordinates: string;
        };
        Property: {
          Country: {
            Code: string;
            Name: string;
          };
          Address: string;
          AddressElement: [
            {
              Name: string;
              Kana: string;
              Level: string;
              Code?: string;
            },
          ];
        };
      },
    ];
  };
};

export default function GetGeo() {
  const [geo, setGeo] = useState<geo | yahooGeo | null>(null);
  const [address, setAddress] = useState<string>('');

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
              if (geo) {
                if ('data' in geo) {
                  setAddress(geo.data.Feature[0].Property.Address);
                } else if ('display_name' in geo) {
                  // Check if 'display_name' property exists in geo
                  setAddress(geo.display_name); // Access 'display_name' property
                }
              }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Takes a long time to load the first time.
  return <span>{geo ? address : 'We are in the process of acquiring...'}</span>;
}
