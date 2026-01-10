import type { RequestHandler } from './$types';
import { render } from 'svelte/server';
import StatsSvg from '$lib/Stats.svelte';
import { Octokit } from 'octokit';
import { SECRET_GITHUB_API_KEY } from '$env/static/private';
import { rankLanguagesForViewer } from '$lib/utils/rankLanguagesForUser';

const octokit = new Octokit({ auth: SECRET_GITHUB_API_KEY });

export const GET: RequestHandler = async () => {
	const languages = await rankLanguagesForViewer(octokit);

	const result = render(StatsSvg, {
		props: {
			languages
		}
	});

	return new Response(result.body, {
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
