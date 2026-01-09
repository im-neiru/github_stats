import type { Octokit } from '@octokit/core';

export async function rankLanguagesForViewer(
	octokit: Octokit
): Promise<{ name: string; score: number }[]> {
	const query = `
    query {
      viewer {
        repositories(
          first: 96
          ownerAffiliations: OWNER
          isFork: false
          orderBy: { field: UPDATED_AT, direction: DESC }
        ) {
          nodes {
            languages(first: 6, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

	const result = await octokit.graphql<{
		viewer: {
			repositories: {
				nodes: {
					languages: {
						edges: { size: number; node: { name: string } }[];
					};
				}[];
			};
		};
	}>(query);

	const totals: Record<string, number> = {};

	for (const repo of result.viewer.repositories.nodes) {
		const edges = repo.languages.edges;
		const repoTotal = edges.reduce((sum, e) => sum + e.size, 0);
		if (repoTotal === 0) continue;

		for (const edge of edges) {
			const name = edge.node.name;

			if (name == 'HTML' || name == 'CSS') {
				continue;
			}

			const normalized = edge.size / repoTotal;
			totals[name] = (totals[name] ?? 0) + normalized;
		}
	}

	const ranking = Object.entries(totals)
		.map(([name, score]) => ({ name, score }))
		.sort((a, b) => b.score - a.score)
		.slice(0, 12);

	const sum = ranking.reduce((a, { score }) => a + score, 0);

	for (const [index, { score }] of ranking.entries()) {
		ranking[index].score = (score / sum) * 100.0;
	}

	return ranking;
}
