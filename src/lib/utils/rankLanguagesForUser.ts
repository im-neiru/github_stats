import { Octokit } from 'octokit';

export async function rankLanguagesForViewer(
	octokit: Octokit
): Promise<{ name: string; score: number }[]> {
	const query = `
    query {
      viewer {
        repositories(
          first: 48
          ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
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

	const totals = new Map<string, number>();

	for (const repo of result.viewer.repositories.nodes) {
		let repoTotal = 0;
		const repoCounts = new Map<string, number>();

		for (const edge of repo.languages.edges) {
			let name = edge.node.name;

			if (['RenderScript', 'Dockerfile', 'Shell', 'Rich Text Format'].includes(name)) continue;
			if (name === 'Sass' || name === 'SCSS') name = 'Sass/SCSS';

			repoCounts.set(name, (repoCounts.get(name) ?? 0) + edge.size);
			repoTotal += edge.size;
		}

		for (const [name, size] of repoCounts) {
			const percentage = (size / repoTotal) * 100;
			totals.set(name, (totals.get(name) ?? 0) + percentage);
		}
	}

	const ranking = Array.from(totals.entries())
		.map(([name, score]) => ({ name, score }))
		.sort((a, b) => b.score - a.score)
		.slice(0, 15);

	const sum = ranking.reduce((a, { score }) => a + score, 0);

	for (let i = 0; i < ranking.length; i++) {
		ranking[i].score = Math.log10(ranking[i].score + 1);
	}

	const max = Math.log10(sum + 1);

	for (let i = 0; i < ranking.length; i++) {
		ranking[i].score = ranking[i].score / max;
	}

	return ranking;
}
