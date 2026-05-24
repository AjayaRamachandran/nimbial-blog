*The next version of Symphony is coming soon, here's everything that's arriving your way.*

## Performance: Faster Load Times
By changing the underlying architecture for how we load the Symphony editor, we're expecting project load times to shrink vastly from as long as *2 minutes* on some older computers down to less than half a second. The key tech upgrade we're utilizing here is migrating from a **cold-start** architecture (where the editor program runtime has to spin up from zero every time you open a project) to a **hot-start** architecture, where the editor silently spins up with the project manager in the background, and loads just the editor GUI when you open a project. Because the runtime is already active, these hot-start times are next to nothing, and we hope this will make jumping into your active workspaces more seamless than ever.

## Performance: Optimized Rendering
To allow for advanced realtime graphics, we built Symphony's UI from the ground up in a python-based game library. However, this means we're trading high CPU usage for the benefits of the realtime loop. But with 1.1, we're tightly optimizing the render loop to utilize deferred rendering, screen-space culling, and bounding-box optimization. This not only means that you'll see a real boost in FPS and a drop in CPU usage, but this sets Symphony up for far more advanced graphics down the line, such as allowing support for visual plugin support.

## Visual: Slate Design Language
With the Project Manager of Symphony 1.0, we established the Slate design language as a UI standard for legibility, accessbility, and brand unity. With 1.1, we're extending this to the editor, unifying both with a consistent identity, while making the editor feel fresh and modern.

## Under the hood: Changing how Symphony data is stored
We're doing a complete redesign of how notes and note data are stored under the hood. While visually, this means not much will change, changing the architecture in this way means that entire notes can now store metadata fields, which sets Symphony up nicely to support plugins in the *next* version.

---

We think these updates are exciting and will make Symphony even more clear of a choice for musical experimenters. We can't wait to see what you make with it soon!

#### ETA: Spring 2026