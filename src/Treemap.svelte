<script>
    import { onMount } from 'svelte';
    import { fetchOuter, fetchInner, outerData, innerData, dataPerCapita } from './stores.js';
    import { treemap, treemapSquarify, scaleLinear, scaleOrdinal, interpolate } from 'd3';    
    import { get } from "svelte/store";
    import { tweened } from 'svelte/motion';
    import { fade, scale } from "svelte/transition";
    import { cubicInOut } from 'svelte/easing';

    export let step;

    //  Define chart dimensions
    let width;
    let height;
    const margin = { top: 10, bottom: 50, left: 10, leftBars: 85, right: 10 };

    // *** Treemap ***

    // Define variables
    let outerWidth;
    let outerHeight;

    let innerWidth;
    let innerHeight;

    let outerNodes = [];
    let innerNodes = [];

    let outMaxIdx;

    let palette1 = [
        "#53A182", "#A27C43", "#724292", 
        "#D3D3D3", "#D3D3D3", "#D3D3D3", 
        "#D3D3D3", "#D3D3D3", "#D3D3D3", 
        "#D3D3D3"];

    let palette2 = [
        "#53A182", "#A27C43", "#724292", 
        "#53A182", "#A27C43", "#724292", 
        "#53A182", "#A27C43", "#724292", 
        "#53A182"];

    //  Define tweened values
    let tweenedFillOuter;
    let tweenedFillInner;
    let tweenedWidthOuter;
    let tweenedHeightOuter;
    let tweenedWidthInner;
    let tweenedHeightInner;
    let tweenedXOuter;
    let tweenedXInner;
    let tweenedYOuter;
    let tweenedYInner;


    // Fetch data
    onMount(() => {
        fetchOuter("https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/treemap_outer.csv");
        fetchInner("https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/treemap_inner.csv");
    });

    // Outer treemap settings
    const setupOuterTreemap = function(outerRoot) {
        outerWidth = width - margin.left - margin.right;
        outerHeight = height - margin.top - margin.bottom;

        const outerLayout = treemap()
            .tile(treemapSquarify)
            .size([outerWidth, outerHeight])
            .paddingOuter(1)
            .paddingInner(0)
            .round(true);

        outerLayout(outerRoot.sum(d => +d.ewaste));
        outerNodes = outerRoot.leaves();
        outMaxIdx = outerNodes.length - 1;

        innerWidth = outerNodes[outMaxIdx].x1 - outerNodes[outMaxIdx].x0;
        innerHeight = outerNodes[outMaxIdx].y1 - outerNodes[outMaxIdx].y0;
    }

    // Inner treemap settings
    const setupInnerTreemap = function(innerRoot) {
        const innerLayout = treemap()
            .tile(treemapSquarify)
            .size([innerWidth, innerHeight])
            .paddingOuter(0)
            .paddingInner(0)
            .round(true);

        innerLayout(innerRoot.sum(d => +d.ewaste));
        innerNodes = innerRoot.leaves();
    }

    // Set initial tweened values
    const initializeTweens = function() {

        // Outer treemap
        // Fill
        if (step < 2) {
            tweenedFillOuter = tweened(
                outerNodes.map((_, i) => palette1[i]), 
                {
                    duration: 1000,
                    easing: cubicInOut,
                    interpolate: interpolate
                }
            )
        } else {
            tweenedFillOuter.set(
                outerNodes.map((_, i) => palette2[i])
            );
        }
        
        // Width 
        tweenedWidthOuter = tweened(
            outerNodes.map((d) => d.x1 - d.x0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // Height
        tweenedHeightOuter = tweened(
            outerNodes.map((d) => d.y1 - d.y0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // X-values
        tweenedXOuter = tweened(
            outerNodes.map((d) => d.x0), 
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );           
        // Y-values
        tweenedYOuter = tweened(
            outerNodes.map((d) => d.y0), 
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );

        // Inner treemap
        // Fill
        tweenedFillInner = tweened(
            innerNodes.map(() => "#D3D3D3"), 
            {
                duration: 1000,
                easing: cubicInOut,
                interpolate: interpolate
            }
        );
        // Width
        tweenedWidthInner = tweened(
            innerNodes.map((d) => d.x1 - d.x0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // Height
        tweenedHeightInner = tweened(
            innerNodes.map((d) => d.y1 - d.y0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );      
        // X-values
        tweenedXInner = tweened(
            innerNodes.map((d) => d.x0 + outerNodes[outMaxIdx].x0),
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );   
        // Y-values
        tweenedYInner = tweened(
            innerNodes.map((d) => d.y0 + outerNodes[outMaxIdx].y0), 
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );    
    }

    // Set tween values for treemap
    const setTreemapTweens = function() {
        // Fill
        const setTreemapFill = function() {
            tweenedFillOuter.set(
                outerNodes.map((_, i) => palette2[i])
            );
            tweenedFillInner.set(
                innerNodes.map(() => "#D3D3D3")
            );
        }
        // Width
        const setTreemapWidth = function() {
            tweenedWidthOuter.set(
                outerNodes.map((d) => d.x1 - d.x0)
            );
            tweenedWidthInner.set(
                innerNodes.map((d) => d.x1 - d.x0)
            );
        };
        // Height
        const setTreemapHeight = function() {
            tweenedHeightOuter.set(
                outerNodes.map((d) => d.y1 - d.y0)
            );
            tweenedHeightInner.set(
                innerNodes.map((d) => d.y1 - d.y0)
            );
        };
        // X-values
        const setTreemapX = function() {
            tweenedXOuter.set(
                outerNodes.map((d) => d.x0)
            );
            tweenedXInner.set(
                innerNodes.map((d) => d.x0 + outerNodes[outMaxIdx].x0)
            );
        };
        // Y-values
        const setTreemapY = function() {
            tweenedYOuter.set(
                outerNodes.map((d) => d.y0)
            );
            tweenedYInner.set(
                innerNodes.map((d) => d.y0 + outerNodes[outMaxIdx].y0)
            );
        };

        setTreemapFill();
        setTreemapWidth();
        setTreemapHeight();
        setTreemapX();
        setTreemapY();
    }

    // *** Barplot ***

    //  Define variables 
    let chartWidthBars;
    let chartHeightBars;

    let xDomainBars;
    let xScaleBars;

    let yDomainBars;
    let yScaleBars;

    let colorScaleBars;

    let barSpaceBars;
    const barsToShowBars = 20;
    const barPaddingBars = .1;

    // Barplot settings
    function setupBarplot(dataBars) {
        // Define dimensions
        chartWidthBars = width - margin.right - margin.leftBars;
        chartHeightBars = height - margin.bottom - margin.top;

        // X scale
        xDomainBars = dataBars.map((d) => +d.ewaste_kg_capita);
        xScaleBars = scaleLinear()
            .domain([0, Math.max.apply(null, xDomainBars)])
            .range([0, chartWidthBars]);

        // Y scale
        yDomainBars = dataBars.map((d) => d.country);
        yScaleBars = scaleLinear()
            .domain([0, 1])
            .range([0, chartHeightBars]);

        // Color scale
        colorScaleBars = scaleOrdinal(
            ["high", "middle", "low", "NA"],
            ["#53A182", "#A27C43", "#724292", "grey"]
        );

        barSpaceBars = chartHeightBars / barsToShowBars;
    }

    // Set tweened values for barplot
    function setBarplotTweens() {
        // Fill
        const setBarplotFill = function() {
            tweenedFillOuter.set(
                outerNodes.map((d) => colorScaleBars(d.data.income)),
                {duration: 2000}
            );
            tweenedFillInner.set(
                innerNodes.map((d) => colorScaleBars(d.data.income)),
                {duration: 2000}
            );
        }
        // Width
        const setBarplotWidth = function() {
            tweenedWidthOuter.set(
                outerNodes.map((d) => xScaleBars(d.data.ewaste_capita))
            )
            tweenedWidthInner.set(
                innerNodes.map((d) => xScaleBars(d.data.ewaste_capita))
            )
        };
        // Height
        const setBarplotHeight = function() {
            let height = barSpaceBars - (2 * barSpaceBars * barPaddingBars);
            tweenedHeightOuter.set(outerNodes.map(() => height));
            tweenedHeightInner.set(innerNodes.map(() => height));
        };
        // X-values
        const setBarplotX = function() {
            tweenedXOuter.set(outerNodes.map(() => margin.leftBars - margin.left));
            tweenedXInner.set(innerNodes.map(() => margin.leftBars - margin.left));
        };
        // Y-values
        const setBarplotY = function() {
            tweenedYOuter.set(outerNodes.map((d) => 
                (barSpaceBars * (d.data.rank_capita - 1)) + (barSpaceBars * barPaddingBars)
            ));
            tweenedYInner.set(innerNodes.map((d) => 
                (barSpaceBars * (d.data.rank_capita - 1)) + (barSpaceBars * barPaddingBars)
            ));
        };

        setBarplotFill();
        setBarplotWidth();
        setBarplotHeight();
        setBarplotX();
        setBarplotY();
    }

    // Transition settings
    const tweenedFillOpacity = tweened(.75, {
        delay: 500,
        duration: 1000,
        easing: cubicInOut
    });

    const tweenedStrokeWidth = tweened(.2, {
        delay: 500,
        duration: 1000,
        easing: cubicInOut
    });

    // Reactivity
    $: if ($outerData) {
        const outerRoot = get(outerData);
        if (outerRoot) {
            setupOuterTreemap(outerRoot);
            if (step < 3 ) {
                initializeTweens();
            } else if (step == 3) {
                setTreemapTweens();
            }
        }
    }

    $: if ($innerData) {
        const innerRoot = get(innerData);
        if (innerRoot) {
            setupInnerTreemap(innerRoot);
            if (step < 3 ) {
                initializeTweens();
            } else if (step == 3) {
                setTreemapTweens();
            }
        }
    }

    $: if ($dataPerCapita) {
        setupBarplot($dataPerCapita);
        if (step == 4) {
            setBarplotTweens();
        }
    }

    $: if (step < 4) {
        tweenedFillOpacity.set(.75);
        tweenedStrokeWidth.set(.2);
    } else if (step == 4) {
        tweenedFillOpacity.set(1);
        tweenedStrokeWidth.set(0);
    }

</script>


<div 
    class="treemap-container"
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
            {#if step == 0}
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
                        stroke-width=".35px"
                        fill="#9F9F9F"
                        fill-opacity=.75
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
                        61.9 bil. kg
                    </text>
                </g>
            {:else if step >= 1 && step <= 4}
                <g
                    in:fade={{ duration: step == 1 ? 1000 : 0, easing: cubicInOut }}
                    out:fade={{ duration: 1000, easing: cubicInOut }}
                    transform-origin=center
                >
                    {#each outerNodes as outNode, outNodeIndex}
                        {#if outNode.data.country != "Other"}
                            <rect
                                id="rect-{outNodeIndex}"
                                x={$tweenedXOuter[outNodeIndex]}
                                y={$tweenedYOuter[outNodeIndex]}
                                width={$tweenedWidthOuter[outNodeIndex]}
                                height={$tweenedHeightOuter[outNodeIndex]}
                                stroke="black"
                                stroke-width="{$tweenedStrokeWidth}px"
                                fill={$tweenedFillOuter[outNodeIndex]}
                                fill-opacity={$tweenedFillOpacity}
                                style={step == 1 ? 
                                    `-webkit-transition: fill 1000ms ease-in-out;
                                    -moz-transition: fill 1000ms ease-in-out;
                                    -ms-transition: fill 1000ms ease-in-out;
                                    -o-transition: fill 1000ms ease-in-out;
                                    transition: fill 1000ms ease-in-out;`:
                                    ""}
                            /> 
                        {:else}
                            {#each innerNodes as _, inNodeIndex}
                                <rect
                                    x={$tweenedXInner[inNodeIndex]}
                                    y={$tweenedYInner[inNodeIndex]}
                                    width={$tweenedWidthInner[inNodeIndex]}
                                    height={$tweenedHeightInner[inNodeIndex]}
                                    stroke="black"
                                    stroke-width="{$tweenedStrokeWidth}px"
                                    fill={$tweenedFillInner[inNodeIndex]}
                                    fill-opacity={$tweenedFillOpacity}
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
                                {outNode.data.country == "China" ? 
                                    `${outNode.data.ewaste.toFixed(1)} bil. kg` :
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

    .treemap-container {
        position: absolute;
        top:0;
        height: 100%;
        width: 100%
    }

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

    /* Mobile settings */
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