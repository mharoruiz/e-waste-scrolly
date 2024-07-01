<script>

  import Scrolly from "./Scrolly.svelte";
  import Treemap from "./Treemap.svelte";
  import Barplot from "./Barplot.svelte";

  let value;

  const steps = [
      "<p><a href='https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx' target='_blank'>The Global E-Waste Monitor</a> reported that in 2022 alone, the world generated about 62 billion kg of e-waste.</p>",
      "<p><span class='color-label'>China</span>, <span class='color-label'>the US</span> and <span class='color-label'>India</span> are by far the largest individual producers of discarded electronics.</p>",
      "<p>Together with the other countries in the top 10, they generate about 60% of global e-waste.</p>",
      "<p>However, these 10 countries account for 54% of the global population, for which their e-waste contribution is somewhat 'fair'.",
      "<p>To get a better sense of what countries dispose the most electronics, let's look at per capita generation of e-waste.",
      "<p><span class='high color-label'>High-income</span> countries are among the top producers of e-waste per capita.</p>",
      "<p>To find the first <span class='mid color-label'>middle-income</span> country in the per-capita ranking, we have to go down to position 50.</p>",
      "<p>Wheareas the bottom of the ranking is dominated by <span class='low color-label'>low-income</span> countries.</p>",
      "<p>Richer countries bear a larger reponsibility for e-waste generation, with per capita contributions well-above the global average.</p>"
  ]

</script>

<div class="article-div">

    <h1 class="article-title">
        The World has an E-waste Problem
    </h1>

    <p class="article-info">     
        <span class="article-author">
            Miguel Haro Ruiz
        </span> 
        |
        <span class="article-date">
            May-June 2024
        </span>
    </p> 
            
    <p class="article-text">Look around. You are probably surrounded by electronics; from the device you are using to read this to the refrigerator that keeps your food fresh, including LED lamps, screens, printers, photovoltaic panels... Electronic devices make our lives easier and in recent decades, we have become extremely dependent on them. As small and large appliances break or become obsolete, they turn into e-waste, which can pose import environmental and health threats if not disposed appropriately.</p>
            
    <div class="section-container">
        <div class="steps-container">
            <Scrolly bind:value>
              {#each steps as text, i}
                <div class="step" class:active={value === i}>
                  <div class="step-content">{@html text}</div>
                </div>
              {/each}
            </Scrolly>
        </div>
      
        <div class="sticky">
            <Treemap step={value}/>
            <Barplot step={value}/>
        </div>
        
    </div>

</div>

<style>

    :global(body) {
      overflow-x: hidden;
    }

    :global(.color-label) {
        font-weight: bold;
    }
  
    /* :global(.chn) {
        color: #57A888;
    }
  
    :global(.usa) {
        color: #6D4587; 
    }
  
    :global(.ind) {
        color: #876D45;
    } */
  
    :global(.high) {
        color: #53A182;
    }
  
    :global(.mid) {
        color: #A27C43;
    }
  
    :global(.low) {
        color: #724292; 
    }
  
    .section-container {
        margin-top: 1em;
        text-align: center;
        transition: background 100ms;
        display: flex;
    }
  
    .step {
        height: 80vh;
        display: flex;
        place-items: center;
        justify-content: center;
    }
  
    .step-content {
        font-size: 1rem;
        background: white;
        color: black;
        opacity: 0.33;
        border-radius: 5px;
        padding: .5rem 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: opacity 500ms ease;
        box-shadow: 1px 1px 10px rgba(0, 0, 0, .2);
        text-align: left;
        width: 75%;
        margin: auto;
        max-width: 300px;
    }
  
    .step-content:first-of-type {
        margin-top: 60vh;
    }
  
    .step-content:last-of-type {
        margin-bottom: 60vh;
    }
  
    .sticky {
        position: sticky;
        top: 15%;
        flex: 1 1 60%;
    }
  
    :global(.chart) {
        position: absolute;
        top: 0;
        left: 5%;
        height: 80vh;
        width: 90%;
    }

    .step.active .step-content {
        opacity: 1;
    }

    .steps-container,
    .sticky {
        height: 100%;
    }

    .steps-container {
        flex: 1 1 40%;
        z-index: 10;
    }

    @media all and (max-width: 600px) {
        .section-container {
            flex-direction: column-reverse;
        }
        .sticky {
            width: 95%;
            margin: auto;
        }
    }
</style>