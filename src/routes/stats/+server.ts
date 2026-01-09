import type { RequestHandler } from './$types';
import { render } from 'svelte/server';
import StatsSvg from '$lib/Stats.svelte';

export const GET: RequestHandler = async () => {
	const result = render(StatsSvg, {
		props: {}
	});

	return new Response(result.body, {
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
