
---
In October of 2025, I released Symphony v1.0, the music editor designed for beginners, to the world.

Symphony v1.0 was a cross-platform desktop app; an Electron-based Project Manager that launched an internal editor GUI made with Python's Pygame, as separate processes.

By public release 1.0.2, Symphony was already stable with minimal unexplained bugs or crashes. But one huge problem still plagued the program: ***the boot time.***

On one of my friend's laptops, it took over **2 minutes to boot**, consistently.

For clarity, I never had boot time issues when running the program on my computer. And for even *more* clarity, the boot time issue really only existed for the Python editor. So already, the problem was hard to catch; it didn't occur consistently, and it only affected half of the app.

So I decided to investigate.

> **Side note here:**
    At this point many people suggest searching Google, asking LLMs, or StackOverflow. And while these places often give great advice, it's often general advice that solves *general* problems. As an example, Google or ChatGPT might tell you the problem of slow starting can be fixed with aggresive caching, multi-process "lazy loading", or other slap-on-top solutions. But my vehement critique of these methods runs deep; not only do they prevent critical thinking and the ideation of *new* solutions, they're almost designed to get you deeper in technical debt (see how the solutions in this case frame slowness as a side-effect that can be suppressed, rather than an architectural problem to be weeded out?). So, my personal and professional opinion: don't start with these triage methods. Learn your codebase inside and out — every line of code. I promise you it's worth the time and energy, and you'll see how it genuinely saved my ass later in this post.
---

# Identifying the problem
Initially I thought the boot time was slow because of my code. This was unlikely to be the case (specifically because of wildly different speeds on different platforms), but I decided it was worth ruling out early.

### Question 1: Is it my code?
I added debug logs all throughout the bootup portion of my Python script:
```python
console.log("Imported Modules & Libraries "+ '(' + str(round(time.time() - lastTime, 5)) + ' secs)')
lastTime = time.time()
```
##### console.log() in Python? don't worry about that too much here — it's essentially a print() wrapper with extra debugging features.

Learned a lot from this — the main thing being that the bootup of the python program (referring to the time between top-of-script and GUI-opening) took anywhere from 1 to 4 seconds, and that this was consistent across pretty much every device.

### Question 2: Is it Python?
Next, I performed a "controlled experiment": I compared the boot times (using a stopwatch — *very high-tech*) of the unpackaged Python script and the packaged app on my computer and on the computer and on the computer it was very slow on.

| Version | My Computer | Slower Computer |
| --- | --- | --- |
| Unpackaged Python Script | ~ 1 second | ~ 3 seconds |
| Packaged App | ~ 2 seconds | 90 to 120 seconds |

More information gained here. This wasn't the most scientific experiment, but it revealed something clear: The unpackaged Python script wasn't having any substantial delays even on the slower computer.

This meant that the slowness was most likely happening *before the script was even running* on the computer.

I decided to take a look at the full architecture of my program.

# Stepping Back: My Architecture
Symphony v1.0.2 was an Electron app which launched a Python editor as a separate process. Because the `.symphony` file schema was essentially a pickled Python object, the Node IPC had no way of reading/writing information to them directly. This meant that every file-specific action (getting musical attributes, instantiating a new empty project, exporting to different formats, opening a project in the GUI), were actually spawning a fresh instance of Python, with the file's path and other info as system arguments `(sys.argv)`.

The other big piece of info I knew was that **Python is an interpreted language**; it requires an interpreter to run, what is usually the global installation of Python on your PC. But for distributed apps (like Symphony), you can't rely on a global Python installation since there's no guarantee your users will have Python, and it's anti-user to expect people to download an entire runtime just to use your app. So, for this case exactly, Python has an installer (aptly named `PyInstaller`) that turns your .py file into an executable that can run on any platform.
### Quick Crash Course:
- Executables are universal — any Windows computer, for example, can run an EXE. For *compiled languages* (like C, C++, Rust, etc.) your code, originally in plaintext, is *converted into that universal language* that your computer can understand. This is called compiling, or building your app.
- But remember: **Python is interpreted. Not compiled.** this means that there is mostly *no way* to turn the plaintext .py directly into machine-readable instructions. As in, the way that Python infers type, structure, and "dynamic everything" basically makes it really hard to convert into low-level instructions, at least in the most stable public version of the language. So all `PyInstaller` is doing when it turns a .py into a .exe is **bundling an entire Python Interpreter along with your .py file** (I'm simplifying a bit, but not much tbh) that is distributed with your app.

At runtime, when you run a PyInstaller app, it spins up an entire Python interpreter (and all of its not-so-small dependencies) to read and execute your app. It's like **building a new car from spare parts every time** you want to drive somewhere.

##### This has its benefits, like being able to dynamically import regular Python `.py` files as modules *at run-time*, or providing a basic assurance of "build / no-build parity" (and ensuring an error post-build is probably a code issue that can be spotted & fixed without needing to build again). But by no means is it efficient or elegant.

> **Side note here (again):**
    You might be wondering, if PyInstaller is so inefficient, and by extension Python isn't really meant to be distributed like this, why I chose it for my app over something more performant and distributable like Qt, or easy and conventionally used like React/Electron (which I was already using for the PM). The simple answer: React/Electron is too DOM-focused for an app that needs to support complex realtime graphics like waveforms or audio visualizers, and Qt, as a solo developer, adds so much boilerplate and low-level programming that the benefits of performance would have been squashed by the verbosity of making an app in C++. *Python, with Pygame, was just the only one that gave me rapid iteration + high-level programming with **pixel-level** UI control.*

### The Key Problem: Booting Up the Python Interpreter
After looking at the architecture, and the results of the "experiment", it became obvious what the problem was:
> Spinning up the Python Interpreter every time we tried to open the GUI *was the bottleneck*, on some computers.
At this point, it didn't matter to me *why*; the reason could have been any number of things, and it was most likely not something I could improve currently without this project becoming a million times out-of-scope for what was originally a hobby project. But it was clear where we had to go from here:

- Step 1: Boot the Python program ONCE instead of a new instance with each symphony file
- Step 2: Create a live mode of communication between the PM and editor that was more stable and customizable than sysargs
- Step 3: Treat opening, reading, instantiating .symphony files as simple instructions to an already-running program, not a new instance.

I named this migration "hot starting" — essentially keeping a python instance **hot** and giving it instructions in real time, as opposed to spinning up a cold instance for simple commands. The diagram below explains the difference visually:

![hot start diagram](https://www.dropbox.com/scl/fi/1hfakcbocaman79s6nyxz/optimization-diagram-1.png?rlkey=r97b9aphof6vold7u9zodatie&st=06wguy7h&raw=1)

Now, let's take a look at that chart again:

| Version | My Computer | Slower Computer |
| --- | --- | --- |
| Unpackaged Python Script | ~ 1 second | ~ 3 seconds |
| Packaged App | ~ 2 seconds | ~ 90 to 120 seconds |
| New Unpackaged Python Script | ~ 0.5 seconds | ~ 1.5 seconds |
| New Packaged App | ~ 0.5 seconds | ~ 1.5 seconds |

The results speak for themselves. With the bootup of Python being decoupled with the loading or mutating of .symphony files, there's no runtime overhead with the packaged application. This makes the load times of the packaged app identical to the unpackaged program, ensuring there really are *no practical compromises* in the new architecture.

---
Now, this rewrite was **NOT** small. But in this article I chose to go over the thought process behind the rewrite as opposed to dwelling on the practicalities to echo a point I made in the beginning: it takes *knowing your code at the atomic level* to make the actual best decisions. Absolutely no one in their right mind would have recommended I spend a month literally exploding and reassembling my codebase from the bottom up, with no clear completion date. But I knew that was exactly what was needed to be done to ensure that Symphony has a longevity to scale with the things I hope to add to it.

> *Generic advice gets you pretty far; highly-specific knowledge is what gets you 100% there.*

If you're actually interested in the process behind this massive architectural rewrite (spoiler: it wasn't just hot-starting), I'll make a post here about that soon and link it below. For now, enjoy this smiley face :)