<script>

    import { ewasteData } from './stores.js';
    import { scaleLinear, scaleOrdinal} from 'd3';
    import { tweened } from 'svelte/motion';
    import { fade } from "svelte/transition";
    import { cubicInOut, quartIn, expoInOut } from 'svelte/easing';

    export let step;

    let data;

    let width;
    let height;
    const margin = { top: 10, bottom: 50, left: 85, right: 10 };

    let chartWidth;
    let chartHeight;

    let xDomain;
    let yDomain;
    let xScale;
    let yScale;
    let xGrid;

    let barSpace;
    let barsToShow = 20;
    let barPadding = .1;
    let tbPadding = 5;

    const colorScale = scaleOrdinal(
        ["high", "middle", "low", "NA"],
        ["#53A182", "#A27C43", "#724292", "grey"]
    );

    // Set initial tweened values
    let tweenedTranslateY = tweened(0, {
        duration: 2500,
        easing: expoInOut
    });
    let tweenedScaleY = tweened(1, {
        duration: 2500,
        easing: expoInOut
    });
    let tweenedTextOpacity = tweened(1, {
        duration: 500,
        easing: cubicInOut
    });

    $: if ($ewasteData) {
        data = $ewasteData;

        chartWidth = width - margin.right - margin.left;
        chartHeight = height - margin.bottom - margin.top;

        xDomain = data.map((d) => +d.ewaste_kg_capita);

        xScale = scaleLinear()
            .domain([0, Math.max.apply(null, xDomain)])
            .range([0, chartWidth]);

        yDomain = data.map((d) => d.country);

        yScale = scaleLinear()
            .domain([0, 1])
            .range([0, chartHeight]);

        xGrid = xScale.ticks(width > 300 ? 5 : 3);

        barSpace = chartHeight / barsToShow;

        // Set tweened values depending on step
        if (step == 5) {
            tweenedTranslateY.set(0);
            tweenedScaleY.set(1);
            tweenedTextOpacity.set(1);
        } else if (step == 6) {
            tweenedTranslateY.set(-(49) * barSpace);
            tweenedScaleY.set(1);
            tweenedTextOpacity.set(1);
        } else if (step == 7) {
            tweenedTranslateY.set(-(172) * barSpace);
            tweenedScaleY.set(1);
            tweenedTextOpacity.set(1, {
                duration: 1500
            });
        } else if (step == 8) {
            tweenedTranslateY.set(0);
            tweenedScaleY.set(barsToShow / yDomain.length);
            tweenedTextOpacity.set(0);
        }
    }
</script>

<div
    class="barplot-container"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
>
    {#if step >= 4}
        <svg 
            {width} 
            {height}
            in:fade={{ duration: 2500, easing: quartIn }}
            out:fade={{ duration: 1000, easing: cubicInOut }}
        >
            <g transform="translate({margin.left} {margin.top})">
                <g 
                    transform="translate(0 {$tweenedTranslateY}) 
                        scale(1 {$tweenedScaleY})"
                >
                    {#each data as yVal, idx}
                        <text
                            class="y-axis-label label"
                            text-anchor="end"
                            x="-5"
                            dy=".3em"
                            y={(barSpace * idx) + (barSpace * 0.5)}
                            style="opacity:{$tweenedTextOpacity};"
                        >
                            {yVal.country_short}
                        </text>
                        {#if step > 4}
                            <rect
                                x="0"
                                y={(barSpace * idx) + (barSpace * barPadding)}
                                width={xScale(yVal.ewaste_kg_capita)}
                                height={barSpace - (2 * barSpace * barPadding)}
                                fill={colorScale(yVal.income)}
                            />
                        {/if}
                        <text
                            class="rank-label label"
                            text-anchor="start"
                            x={yVal.ewaste_kg_capita > 2.5 ? 10 : xScale(yVal.ewaste_kg_capita) + 5}
                            y={(barSpace * idx) + (barSpace * 0.65)}
                            style="opacity:{$tweenedTextOpacity};"
                        >
                                {#if idx == 0}
                                    Rank: #{idx+1}
                                {:else if (idx + 1) % 5 == 0}
                                    #{idx+1}
                                {/if}
                        </text>
                    {/each}
                </g>
                <rect
                    x={-margin.left}
                    y={-margin.top * 2}
                    width={width}
                    height={margin.top * 2}
                    fill="white"
                />
                <rect
                    x={-margin.left}
                    y={chartHeight}
                    width={width}
                    height={margin.bottom * 2}
                    fill="white"
                />
                <g>
                    {#each xGrid as xVal}
                        <g transform="translate({xScale(xVal)},0)">
                            <line 
                                y1={-tbPadding}
                                y2={chartHeight + tbPadding} 
                                stroke-width="0.25px"
                                stroke="black" />
                            <text 
                                class="x-axis-label label"
                                text-anchor="middle" 
                                dy="1.25em" 
                                y={chartHeight + tbPadding}
                            >
                              {xVal}
                            </text>
                        </g>
                    {/each}
                    <text
                        class="x-axis-title label"
                        text-anchor="middle"
                        x={chartWidth / 2}
                        y={ margin.top + chartHeight + margin.bottom * .725}
                    >
                        kg/capita
                    </text>
                </g>
                {#if step == 8}
                    <g transform="translate({xScale(7.87)},0)"
                        in:fade={{ duration: 2000, easing: cubicInOut }}
                    >
                        <line
                            y1={-tbPadding}
                            y2={chartHeight + tbPadding} 
                            stroke-width="1.5px"
                            stroke-dasharray="5,5"
                            stroke="#D13E3E"
                        />
                        <text 
                            class="avg-annotation label"
                            text-anchor="start" 
                            dx=".5em" 
                            y={yScale(.85)}
                        >
                            7.87
                        </text>
                        <text 
                            class="avg-annotation label"
                            text-anchor="start" 
                            dx=".5em" 
                            y={yScale(.85) + 17.5}
                        >
                            World average
                        </text>
                    </g>
                {/if}
            </g>
        </svg>
    {/if}
</div>

<style>

    .barplot-container {
        position: absolute;
        top:0;
        height: 100%;
        width: 100%
    }

    .label {
        font-family: monospace;
        fill:black;
    }

    .x-axis-label, .y-axis-label {
        font-weight: 400;
    }

    .x-axis-title {
        font-weight: 500;
    }

    .rank-label {
        fill:#1c1c1c
    }

    .avg-annotation {
        fill: #D13E3E;
        text-shadow: .75px .75px 0 #cbcbcb;
    }

    /* Mobile and tablet settings */
    .x-axis-label, .y-axis-label {
        font-size: .9em
    }
    .x-axis-title {
        font-size: 1.15em;
    }
    .rank-label {
        font-size: .8em
    }
    .avg-annotation:first-of-type {
        font-size: 1.15em;
    }
    .avg-annotation {
        font-size: 1em;
    }
    /* Desktop settings */
    @media all and (min-width: 992px) {
        .x-axis-label, .y-axis-label {
            font-size: 1em
        }
        .x-axis-title {
            font-size: 1.3em;
        }
        .rank-label {
            font-size: .9em
        }
        .avg-annotation:first-of-type {
            font-size: 1.265em;
        }
        .avg-annotation {
            font-size: 1.1em;
        }
    }

</style>