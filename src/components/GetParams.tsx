'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GetParams() {
	const [redirect_url, setRedirect_url] = useState<string | null>(null);
	const params = useSearchParams();

	useEffect(() => {
		// Query string
		setRedirect_url(params.get('redirect_url'));
	}, [params]);

	// Takes a long time to load the first time.
	return <span>Redirect to URL: {redirect_url ? redirect_url : 'Unknown'}</span>;
}
