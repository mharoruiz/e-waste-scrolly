<script>
    
    import { dataPerCapita } from './stores.js';
    import { scaleLinear, scaleOrdinal} from 'd3'; 
    import { fade } from "svelte/transition";
    import { quartIn } from 'svelte/easing';

    export let step;

    let data;

    let width;
    let height;
    const margin = { top: 10, bottom: 45, left: 75, right: 10 };

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

    let colorScale;

    $: if ($dataPerCapita) {

        data = $dataPerCapita;

        chartWidth = width - margin.right - margin.left;
        chartHeight = height - margin.bottom - margin.top;

        xDomain = data.map((d) => +d.ewaste_kg_capita);

        xScale = scaleLinear()
            .domain([0, Math.max.apply(null, xDomain)])
            .range([0, chartWidth]);

        yDomain = data.map((d) => d.country)

        yScale = scaleLinear()
                .domain([0, 1])
                .range([0, chartHeight]);

        xGrid = xScale.ticks(width > 400 ? 5 : 3)

        barSpace = chartHeight / barsToShow;

        colorScale = scaleOrdinal(
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
    {#if step >= 4}
        <svg width={width} height={height}
            in:fade={{ duration: 3000, easing: quartIn }}
        >
            <g transform="translate({margin.left}, {margin.top})">
                <g transform="translate(0 {step <= 4 ? 0 : 
                        step == 6 ? -(49) * barSpace :
                        step == 7 ? -(172) * barSpace :
                        0}) 
                        scale(1, {step == 8 ? barsToShow / yDomain.length :
                        1})"
                    style="transition: transform 2s cubic-bezier(.5,.2,0,1)"
                >
                    {#each data as yVal, idx}
                        <text
                            class="y-axis-label label"
                            text-anchor="end"
                            x="-5"
                            dy=".3em"
                            y={(barSpace * idx) + (barSpace * 0.5)}
                            style="opacity:{step == 8 ? 0 : 1};
                                transition: opacity .5s ease-in-out"
                        >
                            {yVal.country}
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
                            style="fill: {yVal.income == "middle" && yVal.ewaste_kg_capita > 2.5 ? 
                                "rgb(215, 215, 215)" : 
                                "rgb(30, 30, 30)"};
                                opacity:{step == 8 ? 0 : 1};
                                transition: opacity .5s ease-in-out"
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
                                stroke-width="0.45px"
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
                        y={ margin.top + chartHeight + margin.bottom * .66}
                    >
                        kg/capita
                    </text>
                </g>
                <g transform="translate({xScale(7.87)},0)"
                    style="opacity: {step == 8 ? 1 : 0}; 
                    transition: opacity 2s ease-in-out"
                >
                    <line
                        y1={-tbPadding}
                        y2={chartHeight + tbPadding} 
                        stroke-width="1.5px"
                        stroke-dasharray="5,5"
                        stroke="#D13E3E"
                    />
                    <text 
                        class="plot-annotation label"
                        text-anchor="start" 
                        dx=".5em" 
                        y={yScale(.85)}
                    >
                        Global average:
                    </text>
                    <text 
                        class="plot-annotation label"
                        text-anchor="start" 
                        dx=".5em" 
                        y={yScale(.89)}
                    >
                        7.87 kg/capita
                    </text>
                </g>
            </g>
        </svg>
    {/if}
</div>

<style>
    .label {
        font-family: monospace;
    }

    .x-axis-label, .y-axis-label {
        fill:black;
        font-weight: 400;
        font-size:.75em
    }

    .x-axis-title {
        fill: black;
        font-weight: 500;
        font-size: .9em;
    }

    .rank-label {
        font-size: .66em
    }

    .plot-annotation {
        fill: #D13E3E;
        font-size: .9em;
    }

</style>