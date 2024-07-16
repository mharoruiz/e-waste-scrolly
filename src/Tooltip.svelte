<script>

    import { onMount } from 'svelte';
    import { bodyWidth } from './stores';

	export let x;
	export let y;

    export let countryName;

    export let nationalPolicy;
    export let epr;
    export let collectionTarget;
    export let recyclingTarget;

    const updateWidth = function() {
        bodyWidth.set(document.body.clientWidth);
    };

    onMount(() => {
        window.addEventListener('resize', updateWidth);
        updateWidth();
    });

    $: tooltipContent = [
        {name: "National Policy", variable: nationalPolicy},
        {name: "EPR", variable: epr},
        {name: "Collection Target", variable: collectionTarget},
        {name: "Recycling Target", variable: recyclingTarget}
    ]
	
</script>

{#if countryName != null}
    <div 
        class="tooltip" 
        style="top: {y + 15}px; 
            left: {x < $bodyWidth / 2 ? x + 15 + "px" : ""}; 
            right: {x > $bodyWidth / 2 ? $bodyWidth - x + 15 + "px" : ""};"
    >
        <div class="tooltip-title">{countryName}</div>
        <div class="tooltip-content">
            {#each tooltipContent as {name, variable}}
                <div class="content-line">
                    <p class="line-name">{name}:</p>
                    <p 
                       class="line-variable {
                           variable == "Yes" ?
                           "yes" :
                           variable == "No" ?
                           "no" :
                           "null"
                       }"
                    >
                       {variable == undefined ? "N/A" : variable}
                   </p>
                </div>
            {/each}
        </div>
    </div>
{/if}  

<style>
	.tooltip {
		position: fixed;
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: space-between;
		border: 1px solid #ddd;
		box-shadow: 1px 1px 1px #ddd;
		background: white;
		border-radius: 4px;
		padding: 7.5px;
        overflow: hidden;
	}

    .tooltip-title {
        font-family: var(--main-font);
        font-weight: 500;
        margin-bottom: 5px;
    }

    .tooltip-content {
        width: 90%;
        padding: 0 10px 5px;
    }

    .content-line {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: .5px dotted #8a8a8a;
        margin: 0 0 5px;
    }

    .line-name {
        font-family: var(--main-font);
        margin: 0 
    }
    .line-variable {
        font-family: var(--main-font);
        font-weight: 500;
        margin: 0;
    }

    .line-variable.yes {
        color: #428067;
    }

    .line-variable.no {
        color: #764b93;
    }

    .line-variable.null {
        color: grey;
    }

    /* Mobile settings*/
    .tooltip {
        width: 150px;
    }
    .tooltip-title {
        font-size: 1.25em;
    }
    .line-name, 
    .line-variable {
        font-size: 1.1em;
    }
    /* Tablet settings */
    @media all and (min-width: 600px) {
        .tooltip {
            width: 200px;
        }
        .tooltip-title {
            font-size: 1.5em;
        }
        .line-name, 
        .line-variable {
            font-size: 1.3em;
        }
    }
    /* Desktop settings */
    @media all and (min-width: 992px) {
        .tooltip {
            width: 250px;
        }
        .tooltip-title {
            font-size: 1.75em;
        }
        .line-name, 
        .line-variable {
            font-size: 1.5em;
        }
    }
</style>