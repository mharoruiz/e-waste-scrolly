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

    const margin = { top: 10, bottom: 50, left: 10, leftBars: 80, right: 5};

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
            "#53A182", "#A27C43", "#724292",
            "#53A182", "#A27C43", "#724292",
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
                    in:scale={{ duration: 1000, easing: cubicInOut }}
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
                        class="label-name name-big"
                        clip-path="url(#clip-init)"
                        x={(width - margin.right - margin.left) * .05}
                        y={(width - margin.right - margin.left) * .125}
                    >
                        World
                    </text>
                    <text
                        class="label-value value-big"
                        clip-path="url(#clip-init)"
                        x={(width - margin.right - margin.left) * .1}
                        y={(width - margin.right - margin.left) * .2}
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
                            style={step == 3 || step == 4 ? 
                            `transition: fill 2000ms 1000ms ease,
                                fill-opacity 500ms 750ms ease, 
                                stroke-width 500ms 750ms ease, 
                                width 1000ms 1000ms ease, 
                                height 1000ms 1000ms ease, 
                                x 1500ms 1000ms ease, 
                                y 1500ms 1000ms ease;` : 
                            "transition: fill 1000ms ease;"}
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
                                    style={step == 3 || step == 4 ? 
                                    `transition: fill 2000ms 1000ms ease,
                                        fill-opacity 500ms 750ms ease, 
                                        stroke-width 500ms 750ms ease, 
                                        width 1000ms 1000ms ease, 
                                        height 1000ms 1000ms ease, 
                                        x 1500ms 1000ms ease, 
                                        y 1500ms 1000ms ease;` : 
                                    "transition: fill 1000ms ease;"}
                                />
                            {/each}
                        {/if}
                        <clipPath id="clip-{outNodeIndex}">
                            <use href="#rect-{outNodeIndex}" />
                        </clipPath>
                        {#if (step >= 1 && step <= 3) && outNodeIndex < 3 }
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-name name-mid"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={document.body.clientWidth < 1200 ?
                                    outNode.x0 + 8 : 
                                    outNode.x0 + 10}
                                y={document.body.clientWidth < 992 ?
                                    outNode.y0 + 22.5 :
                                    outNode.y0 + 25}
                            >
                                {outNode.data.country}
                            </text>
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-value value-mid"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={document.body.clientWidth < 1200 ?
                                    outNode.x0 + 14 : 
                                    outNode.x0 + 16}
                                y={document.body.clientWidth < 992 ?
                                    outNode.y0 + 40 :
                                    outNode.y0 + 42.5}
                            >
                                {outNode.data.country == "China" ? `${outNode.data.ewaste.toFixed(1)} bln kg` :
                                    outNode.data.ewaste.toFixed(1)}
                            </text>
                        {/if}
                        {#if step == 1 && outNodeIndex == 3}
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-name name-mid"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={document.body.clientWidth < 1200 ?
                                    outNode.x0 + 8 : 
                                    outNode.x0 + 10}
                                y={document.body.clientWidth < 992 ?
                                    outNode.y0 + 22.5 :
                                    outNode.y0 + 25}
                            >
                                Other
                            </text>
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-value value-mid"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={document.body.clientWidth < 1200 ?
                                    outNode.x0 + 14 : 
                                    outNode.x0 + 16}
                                y={document.body.clientWidth < 992 ?
                                    outNode.y0 + 40 :
                                    outNode.y0 + 42.5}
                            >
                                38.5
                            </text>
                        {/if}    
                        {#if (step == 2 || step == 3) && outNodeIndex >= 3}
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-name name-small"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={document.body.clientWidth < 1200 ?
                                    outNode.x0 + 7 : 
                                    outNode.x0 + 9}
                                y={document.body.clientWidth < 992 ?
                                    outNode.y0 + 17.5 :
                                    outNode.y0 + 20}
                            >
                                {outNode.data.country}
                            </text>
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-value value-small"
                                clip-path="url(#clip-{outNodeIndex})"
                                x={document.body.clientWidth < 1200 ?
                                    outNode.x0 + 13 : 
                                    outNode.x0 + 15}
                                y={document.body.clientWidth < 992 ?
                                    outNode.y0 + 32 :
                                    outNode.y0 + 34}
                            >
                                {outNode.data.ewaste.toFixed(1)}
                            </text>
                        {/if} 
                        {#if step == 4}
                            <rect
                                out:fade={{ duration: 4000, easing: cubicInOut }}
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

    text[class^='label-'] {
        fill:black;
        font-family: monospace;
    }

    .label-name {
        font-weight: 500;
    }
    .label-value {
        font-weight: 300;
    }

    /* Mobile arrangement */
    .name-big {
        font-size: 1.5em;
    }
    .value-big {
        font-size: 1em;
    }
    .name-mid {
        font-size: 1.4em;
    }
    .value-mid {
        font-size: .93em;
    }
    .name-small {
        font-size: 1em;
    }
    .value-small {
        font-size: .67em;
    }
    /* Tablet settings */
    @media all and (min-width: 600px) {
        .name-big {
            font-size: 1.75em;
        }
        .value-big {
            font-size: 1.16em;
        }
        .name-mid {
            font-size: 1.55em;
        }
        .value-mid {
            font-size: 1.03em;
        }
        .name-small {
            font-size: 1.1em;
        }
        .value-small {
            font-size: .73em;
        }
    }
    /* Laptop settings */
    @media all and (min-width: 992px) {
        .name-big {
            font-size: 2em;
        }
        .value-big {
            font-size: 1.33em;
        }
        .name-mid {
            font-size: 1.7em;
        }
        .value-mid {
            font-size: 1.13em;
        }
        .name-small {
            font-size: 1.2em;
        }
        .value-small {
            font-size: .8em;
        }
    }
  </style>