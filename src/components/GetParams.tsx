'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GetParams() {
	const [redirect_uri, setRedirect_url] = useState<string | null>(null);
	const params = useSearchParams();

	useEffect(() => {
		// Query string
		setRedirect_url(params.get('redirect_uri'));
	}, [params]);

	// Takes a long time to load the first time.
	return <span>Redirect to URL: {redirect_uri ? redirect_uri : 'Unknown'}</span>;
}
