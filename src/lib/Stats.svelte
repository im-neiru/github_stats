<script lang="ts">
	type Language = { name: string; score: number };
	type Props = { languages: Language[] };

	const { languages }: Props = $props();


	const size = 400;
	const cx = size / 2;
	const cy = size / 2;
	const radius = size * 0.3;
	const barCount = languages.length;


	const logScale = (score: number) => Math.log10(score + 1);


	const maxScore = Math.max(...languages.map((l) => logScale(l.score)));

	const angles: number[] = languages.map((_, i) => (i / barCount) * 2 * Math.PI);


	const colorMap: Map<string, string> = new Map([
		['TypeScript', '#3178c6'],
		['Rust', '#dea584'],
		['JavaScript', '#f7df1e']
		// add more later
	]);

	// Convert polar coordinates to cartesian
	const polarToCartesian = (r: number, theta: number): [number, number] => {
		const x = cx + r * Math.sin(theta);
		const y = cy - r * Math.cos(theta);
		return [x, y];
	};

	// Compute points for each language
	const points: [number, number][] = languages.map((lang, i): [number, number] => {
		const r = (logScale(lang.score) / maxScore) * radius;
		return polarToCartesian(r, angles[i]);
	});

	// Smooth path generator using cubic Bezier
	const createSmoothPath = (pts: [number, number][]): string => {
		if (pts.length < 3) {
			let path = `M ${pts[0][0]} ${pts[0][1]}`;
			for (let i = 1; i < pts.length; i++) {
				path += ` L ${pts[i][0]} ${pts[i][1]}`;
			}
			path += ' Z';
			return path;
		}

		const n = pts.length;
		let path = `M ${pts[0][0]} ${pts[0][1]}`;
		for (let i = 0; i < n; i++) {
			const p0 = pts[(i - 1 + n) % n];
			const p1 = pts[i];
			const p2 = pts[(i + 1) % n];
			const p3 = pts[(i + 2) % n];

			const c1x = p1[0] + (p2[0] - p0[0]) / 6;
			const c1y = p1[1] + (p2[1] - p0[1]) / 6;
			const c2x = p2[0] - (p3[0] - p1[0]) / 6;
			const c2y = p2[1] - (p3[1] - p1[1]) / 6;

			path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
		}

		path += ' Z';
		return path;
	};

	const path = createSmoothPath(points);
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}>

	<!-- define gradients -->
	<defs>
		{#each languages as lang, i (lang.name)}
			{@const i1 = (i + 1) % barCount}
			<linearGradient id={`gradFill${i}`} gradientUnits="userSpaceOnUse" x1={points[i][0]} y1={points[i][1]}
											x2={points[i1][0]} y2={points[i1][1]}>
				<stop offset="0%" stop-color={colorMap.get(languages[i].name) ?? '#9ca3af'} stop-opacity="0.6" />
				<stop offset="100%" stop-color={colorMap.get(languages[i1].name) ?? '#9ca3af'} stop-opacity="0.6" />
			</linearGradient>
		{/each}

		<linearGradient id="gradStroke" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="#22c55e">
				<animate attributeName="stop-color" values="#22c55e;#4ade80;#22c55e" dur="3s" repeatCount="indefinite" />
			</stop>
			<stop offset="100%" stop-color="#4ade80">
				<animate attributeName="stop-color" values="#4ade80;#22c55e;#4ade80" dur="3s" repeatCount="indefinite" />
			</stop>
		</linearGradient>
	</defs>

	<!-- draw spider grid -->
	{#each languages as lang, i (lang.name)}
		{@const [x, y] = polarToCartesian(radius, angles[i])}
		<line x1={cx} y1={cy} x2={x} y2={y} stroke="#374151" stroke-width="0.5" />
	{/each}

	<!-- draw radar fill with pulsing animation -->
	<g>
		{#each languages as lang, i (lang.name)}
			{@const i1 = (i + 1) % barCount}
			{@const p0 = points[(i - 1 + barCount) % barCount]}
			{@const p1 = points[i]}
			{@const p2 = points[i1]}
			{@const p3 = points[(i1 + 1) % barCount]}
			{@const c1x = p1[0] + (p2[0] - p0[0]) / 6}
			{@const c1y = p1[1] + (p2[1] - p0[1]) / 6}
			{@const c2x = p2[0] - (p3[0] - p1[0]) / 6}
			{@const c2y = p2[1] - (p3[1] - p1[1]) / 6}
			<path d={`M ${cx} ${cy} L ${p1[0]} ${p1[1]} C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]} Z`}
						fill={`url(#gradFill${i})`} stroke="none" />
		{/each}
		<animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
	</g>

	<!-- draw radar outline -->
	<path d={path} fill="none" stroke="url(#gradStroke)" stroke-width="2">
		<animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" fill="freeze" />
	</path>

	<!-- draw axis labels -->
	{#each languages as lang, i (lang.name)}
		{@const [x, y] = polarToCartesian(radius + 20, angles[i])}
		<text x={x} y={y} font-size="10" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle"
					fill={colorMap.get(lang.name) ?? '#9ca3af'}>
			{lang.name}
		</text>
	{/each}
</svg>