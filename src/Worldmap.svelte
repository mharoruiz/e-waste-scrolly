<script>

    import { ewasteData } from './stores.js';
    import { json, geoMercator, geoEqualEarth, geoEquirectangular, geoPath, scaleOrdinal, select, selectAll, zoom, zoomIdentity } from "d3";
    import { onMount } from "svelte";
    import * as topojson from 'topojson-client';
    import Tooltip from './Tooltip.svelte';
    
    // Chart dimensions and margins
    let width;
    let height;
    const margin = { top: 45, bottom: 0, left: 25, right: 10 };

    let svg;
    let zoomBehavior;

    $: mapWidth = width - (margin.left + margin.right);
    $: mapHeight = height - (margin.top + margin.bottom);
    
    // Map variables
    const topojsonPath = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
    let topojsonData;
    let geojsonRaw;
    let geojson;
    let countries = [];
    let policyLevels = [.4, .6, .8, 1];

    const colorScale = scaleOrdinal(
        ["TRUE", "FALSE", "NA", undefined],
        ["#428067", "#764b93", "grey", "grey"]
    );

    const hueScale = scaleOrdinal(
        [0, 1, 2, 3, 4],
        [.75, .4, .6, .8, 1]
    );

    let data;

    // Reactivity variables
    let hoverCountry = null;
    let x;
    let y;
    
    // Load and transform data
    onMount(async () => {
        topojsonData = await json(topojsonPath);
        geojsonRaw = topojson.feature(topojsonData, topojsonData.objects.countries);
        geojson = {
            type: "FeatureCollection",
            features: geojsonRaw.features
            .filter(feature => feature.properties.name != "Antarctica")
            .map(feature => ({
                type: "Feature",
                geometry: feature.geometry,
                id: feature.id,
                name: feature.properties.name
            }))
        }
    });

    // Prepare Projection
    $: projection = geoEquirectangular().fitSize([mapWidth, mapHeight], geojson);
    $: pathGenerator = geoPath(projection);

    // Generate path for each country poligon
    $: if (geojson) {
        countries = geojson.features.map(feature => {
            return {
                ...feature,
                path: pathGenerator(feature)
            };
        });
    };

    $: if ($ewasteData) {
        data = $ewasteData;
    }

</script>

<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

<div 
    class="map-container"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
>
    <!-- <div class="zoom-control">
        <button 
            type="button" 
            id="zoom-in" 
            class="zoom material-symbols-outlined"
        >
            add
        </button>
        <button 
            type="button" 
            id="zoom-out" 
            class="zoom material-symbols-outlined"
        >
            remove
        </button>
        <button 
            type="button" 
            id="zoom-reset" 
            class="zoom material-symbols-outlined"
        >
            crop_free
        </button>
    </div> -->
    <svg
        {width}
        {height}
    >
        {#each policyLevels as level, i}
            <rect
                x={i * 27.5 + 80}
                y=0
                width=25
                height=10 
                fill="#428067"
                fill-opacity={level} 
            />
        {/each}
        <text 
            class="legend-text"
            x=75
            y=8
            text-anchor="end"
        >
            Weaker policy
        </text>
        <text 
            class="legend-text"
            x=192.5
            y=8
            text-anchor="start"
        >
            Stronger policy
        </text>
        <g
            transform="translate({margin.left}, {margin.top})"
            width={mapWidth}
            height={mapHeight}
        >
            {#each countries as { path, name }}
                <path
                    class="country-path"
                    class:active={hoverCountry === name}
                    d={path}
                    fill={colorScale(data.find((d) => d.country === name)?.national_policy)}
                    fill-opacity={hueScale(data.find((d) => d.country === name)?.policy_level)}
                    on:mouseenter={(event) => {
                        x = event.x;
                        y = event.y;
                        hoverCountry = name;
                    }}
                    on:mousemove={(event) => {
                        x = event.x
                        y = event.y
                    }}
                    on:mouseleave={() => hoverCountry = null}
                />
            {/each}
        </g>
    </svg>
</div>

<Tooltip 
    {x} {y} 
    countryName={hoverCountry}
    nationalPolicy={data.find((d) => d.country === hoverCountry)?.national_policy == "TRUE" ? "Yes" : "No"}
    epr={data.find((d) => d.country === hoverCountry)?.epr == "TRUE" ? "Yes" : "No"}
    collectionTarget={data.find((d) => d.country === hoverCountry)?.collection_target == "TRUE" ? "Yes" : "No"}
    recyclingTarget={data.find((d) => d.country === hoverCountry)?.recycling_target == "TRUE" ? "Yes" : "No"}
/>
  

<style>
    .map-container {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 100%;
    }

    .country-path {
        stroke: none;
        stroke-width: 1px;
        -webkit-transition: all 250ms ease-in-out;
        -moz-transition: all 250ms ease-in-out; 
        -ms-transition: all 250ms ease-in-out; 
        -o-transition: all 250ms ease-in-out; 
        transition: all 250ms ease-in-out;
    }

    .country-path.active {
        stroke: black;
    }

    /* .zoom-control {
        position: absolute;
        bottom: 2.5%;
        left: 5%;
        display: flex;
        flex-flow: column wrap;
        gap: 5px;
    }

    .zoom {
        border-radius: 2.5px;
        border-width: 1px;
        background-color: rgb(250, 250, 250);
        padding: 2.5px 2.5px;
        cursor: pointer;
    } */
</style>