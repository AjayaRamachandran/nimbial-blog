# LLMs 101

If you're in the AI space, you must already be aware of the fact that language models are basically giant webs of numbers (parameters) that compute some configuration of matrix multiplications (inference) to predict words or chunks of words (tokens) in sequence. This process is quite computational, and can tax some of the highest-end consumer-grade GPUs.

Generally, across models within a single fleet (think: the GPT-5.5 lineup), more parameters makes a model has, the smarter it behaves. This is because larger models perform less compression on the knowledge space, so they can retain more information. However, notice how I said "within a single fleet" — this is because with better training methods (developed over time), you can compress higher-quality knowledge into less parameters; and we see this happen across generations of models of the same size (27B models of today outperform 27B models of a year ago).

In order to run a model on a computer, you need to load all the model's weights into RAM\* — the larger the model, the more RAM you'll need. Additionally, larger param count means more of those matrix multiplications, so inference is really driven by two factors: size is limited by the amount of RAM you have, and token speed is limited by how fast your GPU/CPU is.

##### * technically, you could load params on your disk, but the read/write times on disk are often so abysmally slow that we can rule this out as a viable option in most cases.

> All other variables (context engineering, pruning, harness quality, etc.) we can think of as noise, since we're analyzing the base intelligence of these models, and these harnesses can often be applied to any model (with varying success).

---

So, we've recapped. From the above descriptions, we can draw two conjectures:
1. Better training is bringing model sizes of comparative intelligence *down*.
2. Consumer hardware is improving (more RAM/VRAM, faster throughput), bringing the maximum model size runnable on local hardware *up*.

From these conjectures, my theory to you (which I originally posited almost half a year ago) is that these two trends are graphs in the space of "parameter size" plotted against "time". And they're moving in opposite directions. Meaning they will intersect.

> To be more pedantic, the "consumer hardware" graph is a family of graphs, all trending **upward**. There will always be a delta between what high-end PCs can do and what laptops and mobile phones can, but the weaker ones will simply lag behind chronologically from the high-end; meaning they too will eventually cross all the same thresholds.

> And to be even more pedantic, technically the "model size" graph is a family of graphs too, all trending **downward**. For simpler tasks like line completion, the necessary amount of parameters required to do it well (with diminishing returns beyond that amount) has *already been encapsulated* by consumer hardware many months ago. And more complex tasks (like deep coding agents) have yet to intersect, but will soon. Right now is the pivotal moment where **general chatbot-level intelligence** can now be accomplished by 27B models, which is *just* about small enough to run on higher-end consumer GPUs, and will only become more comfortably nestled in that spot.

Here's a graph to visually explain what I'm getting at:

![graph detailed](assets/images/detailed_ai_trend_graph.png)

## The Takeaway

The key point to note here is not when exactly these graphs will intersect (although that can also be predicted, see below for more), but that we basically know for certain that **they will.** That essentially means Cloud Inference is an *ever-receding pocket* of the AI market share, that will soon be dominated by local models running on people's PCs (and eventually phones).

---

# For the interested: Can we actually predict when this will happen?

Yes, actually! Take any metric (for this exercise I chose LLMStats), and pick a score of that metric you wish to attain (I chose 50). Then choose a device (I chose iPhone). We will be predicting when an iPhone will be able to run a model that scores 50 on this metric.

First, let's plot the raw parameter counts of open source models that got a score near that target score, over time.

{{llm-stats-open-models-graph}}

Using the scores near 50, we can make a prediction of how many parameters *would be* required to achieve a score of 50, in that time sample. Assuming incremental score changes require exponentially more effort, we use the following equation to calculate a "50-score Param Mean":

$$
\text{50-score Param Mean} = \frac{1}{n}\sum_{i=1}^{n}\exp\left(\log(P_i)\cdot\frac{50}{S_i}\right)
$$

Alright, now let's do the counter-graph — let's plot the estimate for param size that can be run on an iPhone based on its specs:

For the phone-side estimate, we can use the recent iPhone RAM steps and a simple Q4 quantization density. A 4-bit model takes about `0.5` bytes per parameter; adding a rough `20%` runtime overhead gives:

$$
\text{Runnable Params (B)} = \frac{\text{RAM (GB)}}{0.5 \cdot 1.2}
$$

{{iphone-param-capacity-graph}}

## Putting it all together

Now we can fit both sides with exponential regressions. The first curve is the estimated parameter count required for an open model to score `50` on LLMStats. The second curve is the estimated number of Q4 parameters that can fit into the highest-RAM iPhone of each year. Where they intersect would be a rough estimate of when iPhones can support the RAM necessary to run a model that gets 50 on this benchmark.

{{iphone-intersection-projection-graph}}

With these assumptions, the curves intersect around **November 2026**, at roughly **24B parameters**. In plainer terms: if the recent open-model compression trend and the recent high-end iPhone RAM trend both continue, then the first iPhone capable of holding a score-50 open model in memory would arrive at EOY 2026. (Of course, iPhones don't launch at small enough timesteps for this to be totally accurate, but it is potentially a conservative estimate on the *next* generation of iPhones.)

There's a ton of small details not gone over in this article, but to me, the fact that we can make these predictions is a strong sign that the AI landscape is about to shift dramatically. The kings of the industry are sitting on pretty wobbly thrones right now; especially as the frontier prioritizes peak intelligence over affordability, their domain will very soon cover things like research, academia, and perhaps as singular oracles within large companies — leaving the rest of the market for smaller open models to sweep in. 

We're in the era of open-source small language models, and the best part about it is that a step forward in any domain actually brings us closer, not further, to this reality. And that gets me fired up.