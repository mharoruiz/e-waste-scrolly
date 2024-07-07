<script>

  import Scrolly from "./Scrolly.svelte";
  import Treemap from "./Treemap.svelte";
  import Barplot from "./Barplot.svelte";

  let value;

  let width;
  let height;

  const steps = [
      "<p class='step-content-text'><a href='https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx' target='_blank'>The Global E-Waste Monitor</a> reported that in 2022 alone, the world generated about 62 billion kg of e-waste.</p>",
      "<p class='step-content-text'><span class='color-label'>China</span>, <span class='color-label'>the US</span> and <span class='color-label'>India</span> are by far the largest individual producers of discarded electronics.</p>",
      "<p class='step-content-text'>The top 10 countries generate about 60% of global e-waste.</p>",
      "<p class='step-content-text'>However, they also account for 54% of the global population, for which their e-waste contribution is somewhat 'fair'.",
      "<p class='step-content-text'>To get a better sense of what countries dispose the most electronics, let's look at per capita contributions.",
      "<p class='step-content-text'><span class='high color-label'>High-income</span> countries are among the top producers of e-waste per capita.</p>",
      "<p class='step-content-text'>To find the first <span class='mid color-label'>middle-income</span> country in the per-capita ranking, we have to go down to position 50.</p>",
      "<p class='step-content-text'>Wheareas the bottom of the ranking is dominated by <span class='low color-label'>low-income</span> countries.</p>",
      "<p class='step-content-text'>Overall, richer countries are largely responsible for e-waste generation, with per-capita contributions well-above the world average.</p>"
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
            July 3, 2024
        </span>
    </p> 
            
    <p class="article-text">
        Think about the device you are using to read this article. How long have you had it for? You probably got it to replace an old one that stopped working or became obsolete. Think about how many of this kind you have had in your life. Now try to remember all the devices of any kind you have ever had; phones, tables, laptops, smart-TVs… and all their accesories; chargers, speakers, projectors, power banks, headphones… You probably keep and still use a small portion of these, but what happened to the ones you got rid of? 
    </p>

    <p class="article-text">
        Electronic devices make our lives easier and in recent decades, we have become extremely dependent on them. As small and large appliances break or become outdated, they turn into e-waste, which can pose import environmental and health threats if not disposed appropriately.
    </p>
            
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
            <div class="chart">
                <Treemap step={value}/>
                <Barplot step={value}/>
            </div>
        </div>
    </div>

    <p class="article-text">
        People in high-income countries tend to have more disposable income, which combined with a wider catalog of electronics available for purcharse, leads to faster consumption cycles and as a result, more waste. 
    </p>

</div>

<style>

    :global(body) {
      overflow-x: hidden;
    }

    .article-title {
        font-family: var(--section-font);
        text-align: center;
        font-weight: 600;
    }

    .article-text {
        font-family: var(--main-font);
        font-weight: 300;
    }

    .article-author{
        margin-bottom: 0;
        font-weight: 400;
        font-family: var(--section-font);
    }

    .article-date {
        margin-top: 0;
        font-style: italic;
    }

    .section-container {
        display: flex;
        position: relative;
        margin-top: 1em;
        text-align: center;
    }

    .steps-container {
        flex: 1 1 40%;
        z-index: 10;
    }
  
    .step {
        height: 80vh;
        display: flex;
        place-items: center;
        justify-content: center;
    }

    .step-content {
        background: white;
        color: black;
        opacity: 0.33;
        border-radius: 5px;
        padding: 1rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        -webkit-transition: opacity 500ms ease;
        -moz-transition: opacity 500ms ease; 
        -ms-transition: opacity 500ms ease; 
        -o-transition: opacity 500ms ease; 
        transition: opacity 500ms ease;
        box-shadow: 1px 1px 10px rgba(0, 0, 0, .2);
        text-align: left;
        width: 80%;
        margin: auto;
        /* max-width: 300px; */
    }

    .step-content:first-of-type {
        margin-top: 60vh;
    }
  
    .step-content:last-of-type {
        margin-bottom: 60vh;
    }

    :global(.step-content-text) {
        font-family: var(--main-font);
        font-weight: 300;
        margin: 0;
    }

    :global(.color-label) {
        font-weight: bold;
    }

    :global(.high) {
        color: #53A182;
    }
  
    :global(.mid) {
        color: #A27C43;
    }
  
    :global(.low) {
        color: #724292; 
    }

    .sticky {
        position: sticky;
        position: -webkit-sticky; 
        width: 100%;
        height: 100%;
        top: 10%;
        flex: 1 1 60%;
    }
  
    .chart {
        position: relative;
        top: 0;
        left: 5%;
        width: 95%;
        height: 80vh;
    }

    .step.active .step-content {
        opacity: 1;
    }

    .steps-container,
    .sticky {
        height: 100%;
    }

    /* Mobile arrangement */
    .article-title {
        font-size: 2.5em;
        margin: 0 auto 20px;
    }
    .article-info {
        font-size: 1.25em;
        margin: 40px auto 60px
    }
    .article-text {
        font-size: 1.5em;
        line-height: 1.75;
        margin: 40px auto;
    }
    .step-content {
        font-size: 1.4em;
    }
    /* Tablet settings */
    @media all and (min-width: 600px) {
        .article-title {
            font-size: 3.5em;
            margin: 0 auto 20px;
        }
        .article-info {
            font-size: 1.25em;
            margin: 40px auto 60px
        }
        .article-text {
            font-size: 1.75em;
            line-height: 1.75;
            margin: 50px auto;
        }
        .step-content {
            font-size: 1.6em;
        }
    }
    /* Laptop settings */
    @media all and (min-width: 992px) {
        .article-title {
            font-size: 4em;
            margin: 0 auto 30px;
        }
        .article-info {
            font-size: 1.6em;
            margin: 45px auto 90px;
        }
        .article-text {
            font-size: 2em;
            line-height: 1.5;
            margin: 60 auto;
        }
        .step-content {
            font-size: 1.85em;
        }
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

    @media all and (max-width: 600px) {
        .section-container {
            flex-direction: column-reverse;
        }
        .chart {
            left: 1.25%;
            width: 97.5%;
        }
    }
</style>