<script lang="ts">
	type Language = {
		name: string;
		score: number;
	};

	type Props = { languages: Language[] };

	const { languages }: Props = $props();

	const barHeight = 20;
	const gap = 12;
	const labelWidth = 50;
	const maxBarWidth = 120;
	const maxScore = Math.max(...languages.map((l) => l.score));

	const totalHeight = languages.length * (barHeight + gap) + gap;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="200"
	height={totalHeight}
	viewBox={`0 0 200 ${totalHeight}`}
	class="rounded-lg shadow-xl"
>
	<rect width="200" height={totalHeight} fill="#111827" rx="8" />

	{#each languages as lang, i (lang.name)}
		{@const y = gap + i * (barHeight + gap)}
		{@const calculatedWidth = (lang.score / maxScore) * maxBarWidth}

		<text
			x={labelWidth - 8}
			y={y + barHeight / 2}
			fill="#9ca3af"
			font-size="9"
			font-family="sans-serif"
			text-anchor="end"
			font-weight="600"
			dominant-baseline="middle"
		>
			{lang.name}
		</text>

		<rect x={labelWidth} {y} width={maxBarWidth} height={barHeight} fill="#1f2937" rx="4" />

		<rect x={labelWidth} {y} width={calculatedWidth} height={barHeight} fill="#4ade80" rx="4">
			<title>{lang.name}: {lang.score}</title>
		</rect>
	{/each}
</svg>
