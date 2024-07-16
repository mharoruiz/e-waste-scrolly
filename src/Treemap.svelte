<script>
    
    import { onMount } from 'svelte';
    import { fetchOuter, fetchInner, outerData, innerData, ewasteData } from './stores.js';
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

    let outNodes = [];
    let inNodes = [];

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
    let tweenedFillOut;
    let tweenedFillIn;
    let tweenedWidthOut;
    let tweenedHeightOut;
    let tweenedWidthIn;
    let tweenedHeightIn;
    let tweenedXOut;
    let tweenedXIn;
    let tweenedYOut;
    let tweenedYIn;
    let tweenedFillOpacity;
    let tweenedStrokeWidth;

    let outTreemap = false;
    let inTreemap = false;
    let tweensInitialized = false; 

    // Fetch data
    onMount(() => {
        fetchOuter("https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/treemap_outer.csv");
        fetchInner("https://raw.githubusercontent.com/mharoruiz/datasets/main/e-waste/treemap_inner.csv");
    });

    // Out treemap settings
    const setupOutTreemap = function(outerRoot) {
        outerWidth = width - margin.left - margin.right;
        outerHeight = height - margin.top - margin.bottom;

        const outerLayout = treemap()
            .tile(treemapSquarify)
            .size([outerWidth, outerHeight])
            .paddingOuter(1)
            .paddingInner(0)
            .round(true);

        outerLayout(outerRoot.sum(d => +d.ewaste));
        outNodes = outerRoot.leaves();
        outMaxIdx = outNodes.length - 1;

        innerWidth = outNodes[outMaxIdx].x1 - outNodes[outMaxIdx].x0;
        innerHeight = outNodes[outMaxIdx].y1 - outNodes[outMaxIdx].y0;
    }

    // In treemap settings
    const setupInTreemap = function(innerRoot) {
        const innerLayout = treemap()
            .tile(treemapSquarify)
            .size([innerWidth, innerHeight])
            .paddingOuter(0)
            .paddingInner(0)
            .round(true);

        innerLayout(innerRoot.sum(d => +d.ewaste));
        inNodes = innerRoot.leaves();
    }

    // Set initial tweened values
    const initializeTweens = function() {

        // Fill opacity
        tweenedFillOpacity = tweened(
            .75, 
            {
                delay: 500,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // Stroke width
        tweenedStrokeWidth = tweened(
            .2, 
            {
                delay: 500,
                duration: 1000,
                easing: cubicInOut
            }
        );

        // Out treemap
        // Fill
        tweenedFillOut = tweened(
            outNodes.map((_, i) => palette1[i]), 
            {
                duration: 1000,
                easing: cubicInOut,
                interpolate: interpolate
            }
        );
        
        // Width 
        tweenedWidthOut = tweened(
            outNodes.map((d) => d.x1 - d.x0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // Height
        tweenedHeightOut = tweened(
            outNodes.map((d) => d.y1 - d.y0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // X-values
        tweenedXOut = tweened(
            outNodes.map((d) => d.x0), 
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );           
        // Y-values
        tweenedYOut = tweened(
            outNodes.map((d) => d.y0), 
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );

        // In treemap
        // Fill
        tweenedFillIn = tweened(
            inNodes.map(() => "#D3D3D3"), 
            {
                duration: 1000,
                easing: cubicInOut,
                interpolate: interpolate
            }
        );
        // Width
        tweenedWidthIn = tweened(
            inNodes.map((d) => d.x1 - d.x0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );
        // Height
        tweenedHeightIn = tweened(
            inNodes.map((d) => d.y1 - d.y0), 
            {
                delay: 1000,
                duration: 1000,
                easing: cubicInOut
            }
        );      
        // X-values
        tweenedXIn = tweened(
            inNodes.map((d) => d.x0 + outNodes[outMaxIdx].x0),
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );   
        // Y-values
        tweenedYIn = tweened(
            inNodes.map((d) => d.y0 + outNodes[outMaxIdx].y0), 
            {
                delay: 1500,
                duration: 1000,
                easing: cubicInOut
            }
        );   

        tweensInitialized = true;
    }

    // Set tween values for treemap
    const setTreemapTweens = function() {
        // Fill opacity
        const setTreemapFillOpacity = function() {
            tweenedFillOpacity.set(.75);

        }
        // Stroke width
        const setTreemapStrokeWidth = function() {
            tweenedStrokeWidth.set(.2);
        }
        // Fill
        const setTreemapFill = function() {
            tweenedFillOut.set(
                outNodes.map((_, i) => step < 2 ? palette1[i] : palette2[i]), 
                {duration: step == 3 ? 2500: 1000}
            );
            tweenedFillIn.set(
                inNodes.map(() => "#D3D3D3"), 
                {duration: step == 3 ? 2500: 1000}
            );
        }
        // Width
        const setTreemapWidth = function() {
            tweenedWidthOut.set(
                outNodes.map((d) => d.x1 - d.x0)
            );
            tweenedWidthIn.set(
                inNodes.map((d) => d.x1 - d.x0)
            );
        };
        // Height
        const setTreemapHeight = function() {
            tweenedHeightOut.set(
                outNodes.map((d) => d.y1 - d.y0)
            );
            tweenedHeightIn.set(
                inNodes.map((d) => d.y1 - d.y0)
            );
        };
        // X-values
        const setTreemapX = function() {
            tweenedXOut.set(
                outNodes.map((d) => d.x0)
            );
            tweenedXIn.set(
                inNodes.map((d) => d.x0 + outNodes[outMaxIdx].x0)
            );
        };
        // Y-values
        const setTreemapY = function() {
            tweenedYOut.set(
                outNodes.map((d) => d.y0)
            );
            tweenedYIn.set(
                inNodes.map((d) => d.y0 + outNodes[outMaxIdx].y0)
            );
        };

        setTreemapFillOpacity();
        setTreemapStrokeWidth();
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
        // Fill opacity
        const setBarplotFillOpacity = function() {
            tweenedFillOpacity.set(1);

        }
        // Stroke width
        const setBarplotStrokeWidth = function() {
            tweenedStrokeWidth.set(0);
        }
        // Fill
        const setBarplotFill = function() {
            tweenedFillOut.set(
                outNodes.map((d) => colorScaleBars(d.data.income)),
                {duration: 2500}
            );
            tweenedFillIn.set(
                inNodes.map((d) => colorScaleBars(d.data.income)),
                {duration: 2500}
            );
        }
        // Width
        const setBarplotWidth = function() {
            tweenedWidthOut.set(
                outNodes.map((d) => xScaleBars(d.data.ewaste_capita))
            )
            tweenedWidthIn.set(
                inNodes.map((d) => xScaleBars(d.data.ewaste_capita))
            )
        };
        // Height
        const setBarplotHeight = function() {
            let height = barSpaceBars - (2 * barSpaceBars * barPaddingBars);
            tweenedHeightOut.set(outNodes.map(() => height));
            tweenedHeightIn.set(inNodes.map(() => height));
        };
        // X-values
        const setBarplotX = function() {
            tweenedXOut.set(outNodes.map(() => margin.leftBars - margin.left));
            tweenedXIn.set(inNodes.map(() => margin.leftBars - margin.left));
        };
        // Y-values
        const setBarplotY = function() {
            tweenedYOut.set(outNodes.map((d) => 
                (barSpaceBars * (d.data.rank_capita - 1)) + (barSpaceBars * barPaddingBars)
            ));
            tweenedYIn.set(inNodes.map((d) => 
                (barSpaceBars * (d.data.rank_capita - 1)) + (barSpaceBars * barPaddingBars)
            ));
        };

        setBarplotFillOpacity();
        setBarplotStrokeWidth();
        setBarplotFill();
        setBarplotWidth();
        setBarplotHeight();
        setBarplotX();
        setBarplotY();
    }

    // Reactivity
    // $: if ($outerData) {
    //     const outerRoot = get(outerData);
    //     if (outerRoot) {
    //         setupOutTreemap(outerRoot);
    //         outTreemap = true;
    //     }
    // }

    // $: if ($innerData) {
    //     const innerRoot = get(innerData);
    //     if (innerRoot) {
    //         setupInTreemap(innerRoot);
    //         inTreemap = true;
    //     }
    // }

    $: if ($outerData && $innerData) {
        const outerRoot = get(outerData);
        const innerRoot = get(innerData);
        if (outerRoot) {
            setupOutTreemap(outerRoot);
            outTreemap = true;
        }
        if (innerRoot) {
            setupInTreemap(innerRoot);
            inTreemap = true;
        }
    }

    $: if(outTreemap && inTreemap && !tweensInitialized) {
        initializeTweens();
    }

    $: if (width && height) {
        if (outTreemap && inTreemap) {
            setupOutTreemap(get(outerData));
            setupInTreemap(get(innerData));
            if (step < 4) {
                setTreemapTweens();
            }
        }
        if ($ewasteData) {
            setupBarplot($ewasteData);
            if (step == 4) {
                setBarplotTweens(); 
            }
        }
    }

    $: if (tweensInitialized) {
        if (step < 4) {
            setTreemapTweens();
        } else if (step == 4) {
            setBarplotTweens();
        }
    }

    // $: console.log({tweens: tweensInitialized, out: outTreemap, in: inTreemap, step: step})

</script>


<div 
    class="treemap-container"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
>
    <svg 
        {width} 
        {height}
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
                    {#each outNodes as outNode, outNodeIdx}
                        {#if outNode.data.country != "Other"}
                            <rect
                                id="rect-{outNodeIdx}"
                                x={$tweenedXOut[outNodeIdx]}
                                y={$tweenedYOut[outNodeIdx]}
                                width={$tweenedWidthOut[outNodeIdx]}
                                height={$tweenedHeightOut[outNodeIdx]}
                                stroke="black"
                                stroke-width="{$tweenedStrokeWidth}px"
                                fill={$tweenedFillOut[outNodeIdx]}
                                fill-opacity={$tweenedFillOpacity}
                            /> 
                        {:else}
                            {#each inNodes as _, inNodeIdx}
                                <rect
                                    x={$tweenedXIn[inNodeIdx]}
                                    y={$tweenedYIn[inNodeIdx]}
                                    width={$tweenedWidthIn[inNodeIdx]}
                                    height={$tweenedHeightIn[inNodeIdx]}
                                    stroke="black"
                                    stroke-width="{$tweenedStrokeWidth}px"
                                    fill={$tweenedFillIn[inNodeIdx]}
                                    fill-opacity={$tweenedFillOpacity}
                                />
                            {/each}
                        {/if}
                        <clipPath id="clip-{outNodeIdx}">
                            <use href="#rect-{outNodeIdx}" />
                        </clipPath>
                        {#if (step >= 1 && step <= 3) && outNodeIdx < 3 }
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-name name-mid"
                                clip-path="url(#clip-{outNodeIdx})"
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
                                clip-path="url(#clip-{outNodeIdx})"
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
                        {#if step == 1 && outNodeIdx == 3}
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-name name-mid"
                                clip-path="url(#clip-{outNodeIdx})"
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
                                clip-path="url(#clip-{outNodeIdx})"
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
                        {#if (step == 2 || step == 3) && outNodeIdx >= 3}
                            <text
                                in:fade={{ duration: 1500, easing: cubicInOut }}
                                out:fade={{ duration: 1000, easing: cubicInOut }}
                                class="label-name name-small"
                                clip-path="url(#clip-{outNodeIdx})"
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
                                clip-path="url(#clip-{outNodeIdx})"
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
        top: 0;
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