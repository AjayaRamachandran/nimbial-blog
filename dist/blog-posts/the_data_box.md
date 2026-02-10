We've all seen the demos. The flashy new products that seem to crop up every few days. The latest models from companies like OpenAI and Anthropic that claim to "revolutionize" AI, stating features like "writes your whole codebase for you" and "builds an entire app end-to-end". It seems that while AI is getting more and more powerful, the only way that that power is being advertised right now is by showing how much of the dev/engineering process it can automate. But our never-ending quest to automate more and more might actually be the very reason that AI is plateauing. I present to you the Data Box theory.

*Side note, before I get into the weeds of it, I want to say that this article is mainly talking about AI in the context of coding agents, although the ideas here still apply to other subjects.*

Imagine an assistant. A human assistant. An intern, let's say. Let's suppose you've never met this intern, and you need them to make you a coffee. If this intern is not very good at making coffee, you might have to be very specific with your instructions. Your request might be something like this:

> "Please turn on the coffee machine, press the 10oz button, and wait a minute. When the machine finishes warming up, place a mug underneath the spout and press the "Go" button. Once the coffee is done brewing and fills the mug, please add 1 sugar packet (found next to the machine) and a few drops of creamer, stir it, then bring it to me.

But let's say, you're all about efficiency. You don't want to say all that; you expect the intern to fill the gaps and be "smarter" about it all. You want an intern who can take the following request...

> "Bring me a coffee, please."

... and know what to do. Let's say this intern fills the mug to just 8oz, adds two creamers and two sugars, and brings it to you. You still got your coffee, but it wasn't how you wanted.

### This is a fundamental limit of information: as inference *increases*, specificity *decreases.*

We can imagine the information as a whole with a box, whose area represents the size of the task. The height of the box is the amount of inference that we expect from a model trying to execute the task, and the width is how much specificity we get over how it does that task.

![task box analogy](https://www.dropbox.com/scl/fi/k6ioji02b5aok5rghq5z4/data-box-diagram-1.png?rlkey=at7plrey6gmxbtutt04le61dn&st=x3cw4hey&raw=1)

If we assume the area of the box to be the informational "size" of the task, we can assume it must be roughly constant for any given task, regardless of the specificity (the width of the box). Thus, as the specificity decreases, the models "extrude" (infer) more to get to the same product. This isn't meant to prove anything mathematically, but it serves as a mental model for why inference and specificity are sort of inversely related.

The way AI is trending right now, is maximizing inference to the point where specificity is nearly lost. Look at this example on OpenAI's launch page for GPT-5.

![gpt-5 launch post](https://www.dropbox.com/scl/fi/4mz3baq3fdzhfcqkmzxl1/openai-gpt-5-launch.png?rlkey=e61yadvwj8ybxvbpkqcwg4s9j&st=5rmi288r&raw=1)
##### From OpenAI (openai.com), image from https://platform.openai.com/docs/guides/latest-model

Creating an app with a single prompt sounds like an impressive pitch, until you get past the novelty and think about practical usage for a moment. Because, as an individual or as a company, if I'm using AI to help me create code, I want it to help me realize *my (company's) vision*, and it is essentially impossible to fit the intricacies of that specific vision in a single sentence. In other words, it's "make me a web app to host my brand's blog posts", and that's all fun and games, until it's "use my brand guide for the formatting" and "change the size of the paragraph text" and "actually, don't build it that way, because I want to be able to add new pages easily, so use this architecture instead", and at a certain point, you realize, this back forth is not getting anywhere, and each prompt is taking forever (because these "build it all in one prompt" models think for several times longer than the "dumber" ones), and your patience is running thin. Eventually, it becomes legitimately more efficient to just **build the app by hand** the way you wanted. Oh, and by the way, you just boiled a lake.

The point is, there's only a certain amount of "smartness" we want in our AI before the loss in specificity makes the models *less* efficient. In my opinion, we already passed that threshold right around mid-2024, with the launch of GPT-4o.

We're racing toward the wrong goal in the world of AI. The best coding models are the ones that make using them feel as natural and integrated into the programming experience as possible, not the ones that can build the most of the app with the smallest prompt. I'm vouching for smaller models that can autocomplete the line I'm writing or the method I'm finishing up, or suggest changes in the file I'm in to make it more future-proof and readable.

And before you say "it can already do that", let me tell you - it really can't, and it's because of one thing: **training**. We're training bigger and bigger models (GPT-5 supposedly has nearly 2 trillion parameters), which are so large that, even when running on some of the most powerful distributed hardware, can't do on-the-fly suggestions anymore. That's not even talking about the fact that we're training the models *to be able to make entire apps from a sentence*, a fundamentally different goal than what I've described. As such, it's not good at doing the little tasks. From my experience using GPT-5 and 5.1, these models tend to overanalyze simple tasks, and do far too much to solve the problem at hand (multiple chains of to-dos, entire file rewrites, etc.), and that's no accident. They've been trained to be that way, and unless we shift our approach, they won't be good at anything less.

---

It's never been a better time to work with small, local models. Consumer hardware is ever-improving, and it's finally possible to run LLMs on our hardware. If you're interested in running your own open-source model locally, and want a near-identical experience to what you can get with cloud models, check out [LocalizeAI](https://github.com/AjayaRamachandran/localize-ai), a client interface and model framework I built to run models on your own hardware, providing a web-based chatbot interface and easily configurable backend that supports many LLMs.