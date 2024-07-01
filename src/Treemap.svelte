<script>

    import { onMount } from 'svelte';
    import { fetchOuter, fetchInner, outerData, innerData, dataPerCapita} from './stores.js';
    import { treemap, treemapSquarify, format, scaleLinear, scaleOrdinal} from 'd3';    
    import { get } from "svelte/store";
    import { fade, scale } from "svelte/transition";
    import { cubicInOut } from 'svelte/easing';

    export let step;

    let width;
    let height;

    let innerWidth;
    let innerHeight;

    let colorScaleCountry;
    let colorScaleIncome;

    let outerNodes = [];
    let innerNodes = [];

    const margin = { top: 10, bottom: 45, left: 10, leftBars: 75, right: 10};

    // Specify formatting function.
    const formater = format(",d");

    onMount(() => {
        fetchOuter("https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/treemap_outer.csv");
        fetchInner("https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/treemap_inner.csv");
    });

    $: if ($outerData) {
        const outerRoot = get(outerData);

        if (outerRoot) {
            const outerLayout = treemap()
                .tile(treemapSquarify)
                // .tile(treemapBinary)
                // .tile(treemapResquarify)
                .size(
                    [width - margin.left - margin.right, 
                    height - margin.top - margin.bottom]
                )
                .paddingOuter(1)
                .paddingInner(0)
                .round(true);
        
            outerLayout(outerRoot.sum(d => +d.ewaste));

            outerNodes = outerRoot.leaves();

            innerWidth = outerNodes[(outerNodes.length-1)].x1 - outerNodes[(outerNodes.length-1)].x0;
            innerHeight = outerNodes[(outerNodes.length-1)].y1 - outerNodes[(outerNodes.length-1)].y0;
        }

        colorScaleCountry = scaleOrdinal(
            outerNodes.map((d) => d.data.country),
            ["#53A182", "#A27C43", "#724292",
            "#724292", "#A27C43", "#53A182",  
            "#724292", "#A27C43", "#6D4587", 
            "#53A182", 
            "#d3d3d3"]
        );
    }

    $: if ($innerData) {
        const innerRoot = get(innerData);

        if (innerRoot) {
            const innerLayout = treemap()
                .tile(treemapSquarify)
                // .tile(treemapBinary)
                // .tile(treemapResquarify)
                .size([innerWidth, innerHeight])
                .paddingOuter(0)
                .paddingInner(0)
                .round(true);
        
            innerLayout(innerRoot.sum(d => +d.ewaste));

            innerNodes = innerRoot.leaves();
        }
    }

    // ************************************************

    let dataBars;

    let chartWidthBars;
    let chartHeightBars;

    let xDomainBars;
    let yDomainBars;
    let xScaleBars;
    let yScaleBars;

    let barSpaceBars;
    let barsToShowBars = 20;
    let barPaddingBars = .1;

    $: if ($dataPerCapita) {

        dataBars = $dataPerCapita;

        chartWidthBars = width - margin.right - margin.leftBars;
        chartHeightBars = height - margin.bottom - margin.top;

        xDomainBars = dataBars.map((d) => +d.ewaste_kg_capita);

        xScaleBars = scaleLinear()
            .domain([0, Math.max.apply(null, xDomainBars)])
            .range([0, chartWidthBars]);

        yDomainBars = dataBars.map((d) => d.country)

        yScaleBars = scaleLinear()
                .domain([0, 1])
                .range([0, chartHeightBars]);

        barSpaceBars = chartHeightBars / barsToShowBars;

        colorScaleIncome = scaleOrdinal(
            ["high", "middle", "low", "NA"],
            ["#53A182", "#A27C43", "#724292", "grey"]
        );

    }

</script>

<div
    class="chart"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
>
    <svg 
        width={width} 
        height={height}
    >
        <g
            transform="translate({margin.left}, {margin.top})"
        >
            {#if step < 1}
                <g
                    in:scale={{ duration: 750, easing: cubicInOut }}
                    out:fade={{ duration: 1000, easing: cubicInOut }}
                    transform-origin=center
                >
                    <rect
                        id="rect-init"
                        width={width - margin.right - margin.left}
                        height={height - margin.top - margin.bottom}
                        stroke="black"
                        stroke-width=".5px"
                        fill="#898a74"
                        opacity=".66"
                    />
                    <clipPath id="clip-init">
                        <use href="#rect-init" />
                    </clipPath>
                    <text
                        class="country-label-name"
                        clip-path="url(#clip-init)"
                        x={7.5}
                        y={20}
                    >
                        World
                    </text>
                    <text
                        class="country-label-value"
                        clip-path="url(#clip-init)"
                        x={10}
                        y={35}
                    >
                        61.9 bln kg
                    </text>
                </g>
            {:else if step >= 1 && step <= 4}
                <g
                    in:fade={{ duration: 1000, easing: cubicInOut }}
                    out:fade={{ duration: 1000, easing: cubicInOut }}
                    transform-origin=center
                >
                    {#each outerNodes as outNode, outNodeIndex}
                        <rect
                            id="rect-{outNodeIndex}"
                            x={step == 4 ? (margin.leftBars - margin.left) : outNode.x0}
                            y={step == 4 ? 
                                (barSpaceBars * (outNode.data.rank_capita - 1)) + (barSpaceBars * barPaddingBars) : 
                                outNode.y0}
                            width={step == 4 ? xScaleBars(outNode.data.ewaste_capita) : outNode.x1 - outNode.x0}
                            height={step == 4 ? 
                                barSpaceBars - (2 * barSpaceBars * barPaddingBars) : 
                                outNode.y1 - outNode.y0}
                            stroke={outNode.data.country == "Other" ? "none" : "black"}
                            stroke-width={step == 4 ? "0" : ".2px"}
                            fill={step == 1 && outNodeIndex <= 2 ? colorScaleCountry(outNode.data.country) :
                                step == 1 && outNodeIndex > 2 && outNode.data.country != "Other" ? "#d3d3d3" :
                                step == 1 && outNode.data.country == "Other" ? "none":
                                (step == 2 || step == 3) && outNode.data.country != "Other" ? colorScaleCountry(outNode.data.country) :
                                (step == 2 || step == 3) && outNode.data.country == "Other" ? "none" :
                                step == 4 && outNode.data.country != "Other" ? colorScaleIncome(outNode.data.income) :
                                "none"}
                            fill-opacity={step == 4 ? "1" : ".75"}
                        /> 
                        {#if outNode.data.country == "Other"}
                            {#each innerNodes as inNode, inNodeIndex}
                                <rect
                                    id="rect-{outNodeIndex + inNodeIndex}"
                                    x={step == 4 ? (margin.leftBars - margin.left) : outNode.x0 + inNode.x0}
                                    y={step == 4 ? 
                                        (barSpaceBars * (inNode.data.rank_capita - 1)) + (barSpaceBars * barPaddingBars) : 
                                        outNode.y0 + inNode.y0}
                                    width={step == 4 ? xScaleBars(inNode.data.ewaste_capita) : inNode.x1 - inNode.x0}
                                    height={step == 4 ? 
                                        barSpaceBars - (2 * barSpaceBars * barPaddingBars) : 
                                        inNode.y1 - inNode.y0}
                                    stroke="black"
                                    stroke-width={step == 4 ? "0" : ".2px"}
                                    fill={step == 4 ? colorScaleIncome(inNode.data.income) : "#d3d3d3"}
                                    fill-opacity={step == 4 ? "1" : ".75"}
                                />
                            {/each}
                        {/if}
                        <clipPath id="clip-{outNodeIndex}">
                            <use href="#rect-{outNodeIndex}" />
                        </clipPath>
                        {#if step < 2 && outNodeIndex <= 3 }
                            <text
                                in:fade={{ duration: 1000, easing: cubicInOut }}
                                out:fade={{ duration: 750, easing: cubicInOut }}
                                class="country-label-name"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={outNode.x0 + 5}
                                y={outNode.y0 + 20}
                            >
                                {outNode.data.country == "Japan" ?  "Other": 
                                    outNode.data.country}
                            </text>
                            <text
                                in:fade={{ duration: 1000, easing: cubicInOut }}
                                out:fade={{ duration: 750, easing: cubicInOut }}
                                class="country-label-value"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={outNode.x0 +  7.5}
                                y={outNode.y0 +  35}
                            >
                                {outNode.data.country == "China" ? `${outNode.data.ewaste.toFixed(1)} bln kg` : 
                                    outNode.data.country == "Japan" ?  "38.5": 
                                    outNode.data.ewaste.toFixed(1)}
                            </text>
                        {:else if step == 2 || step == 3}
                            <text
                                in:fade={{ duration: 1000, easing: cubicInOut }}
                                out:fade={{ duration: 750, easing: cubicInOut }}
                                class="country-label-name"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={outNode.x0 + 5}
                                y={outNode.y0 + 20}
                            >
                                {outNode.data.country}
                            </text>
                            <text
                                in:fade={{ duration: 1000, easing: cubicInOut }}
                                out:fade={{ duration: 750, easing: cubicInOut }}
                                class="country-label-value"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={outNode.x0 + 7.5}
                                y={outNode.y0 + 35}
                            >
                                {outNode.data.country == "China" ? 
                                    `${outNode.data.ewaste.toFixed(1)} bln kg` : 
                                    outNode.data.ewaste.toFixed(1)}
                            </text>
                        {/if} 
                        {#if step == 4}
                            <rect
                                x={-margin.left}
                                y={chartHeightBars}
                                width={width}
                                height={margin.bottom * 2}
                                fill="white"
                            />
                        {/if}
                    {/each}
                </g>
            {/if}
        </g>
    </svg>
</div>

<style>

    rect[id^="rect-"] {
        transition: fill-opacity 500ms 750ms ease,
            stroke-width 500ms 750ms ease,
            width 1000ms 1000ms ease,
            height 1000ms 1000ms ease,
            x 1500ms 1000ms ease, 
            y 1500ms 1000ms ease,
            fill 2000ms 1000ms ease;
    }

    .country-label-name {
        fill:black;
        font-weight: 500;
        font-family: monospace;
        font-size:1em
    }

    .country-label-value {
        fill:black;
        font-weight: 300;
        font-family: monospace;
        font-size:.66em
    }
  </style>