---
title: "htop: a practical guide to monitoring server resources"
date: 2026-11-16
description: "How to read htop's output, interpret CPU, memory and load average, find the process slowing down your server, and get the most out of it from the command line."
tags: ["Guides", "Linux"]
translationKey: "htop-practical-guide"
---

The server slows down, a site responds sluggishly, some process seems to have gone haywire and is eating up resources. The first tool you should reach for before any other diagnosis is **htop**. It's interactive, shows everything in real time, and — most importantly — lets you act immediately on what you find, instead of running a different command for every piece of information.

If you often work in [tmux sessions on a remote server](/en/tmux-practical-guide/), htop is the perfect tool to keep open in a dedicated pane while you work in another.

## htop vs top: why prefer it

Practically every Linux system ships with `top` preinstalled: it shows processes, CPU and memory, but with an awkward, hard-to-read interface and no direct mouse or intuitive-key interaction. **htop** does the same job, only better: colored bars for CPU and memory, vertical and horizontal scrolling, columns you can sort with a click, and immediate actions (kill, renice, filter) without leaving the screen.

It's not always preinstalled, but it's in the repositories of pretty much every distribution:

```
sudo apt install htop    # Debian/Ubuntu
sudo dnf install htop    # Fedora, AlmaLinux, Rocky
```

Just start it with:

```
htop
```

## How to read the screen

The first time you open htop, there's a lot of information and it can feel overwhelming. In reality it splits into three distinct zones.

<svg class="hi-diagram" width="300" height="220" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="280" height="60" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="30" cy="28" r="4" class="hi-accent-dot"/>
  <rect x="25" y="40" width="250" height="8" rx="4" class="hi-bar"/>
  <rect x="25" y="52" width="180" height="8" rx="4" class="hi-bar"/>

  <line x1="150" y1="78" x2="150" y2="98" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="100" width="280" height="40" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="25" y="114" width="120" height="6" rx="3" class="hi-bar"/>
  <rect x="25" y="124" width="90" height="6" rx="3" class="hi-bar"/>

  <line x1="150" y1="148" x2="150" y2="168" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="170" width="280" height="40" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="25" y="182" width="60" height="6" rx="3" class="hi-bar"/>
  <rect x="100" y="182" width="60" height="6" rx="3" class="hi-bar"/>
  <rect x="175" y="182" width="90" height="6" rx="3" class="hi-bar"/>
  <rect x="25" y="195" width="80" height="6" rx="3" class="hi-bar"/>
  <rect x="150" y="195" width="50" height="6" rx="3" class="hi-bar"/>
</svg>

At the top (highlighted, with the yellow dot marking it as the first thing to check) the **CPU and memory bars**; in the middle a summary line with **load average, uptime and number of processes**; at the bottom the **process list**, sortable and scrollable.

### The bars at the top

Each CPU core gets its own bar, colored according to what that CPU time is spent on (user processes, system processes, I/O wait). Below that you'll find the RAM bar and, if present, the swap bar. A swap bar that keeps filling up is almost always a sign the server doesn't have enough RAM for the load it's being asked to handle.

### Load average

On the right (or at the top, depending on the theme) you'll see three numbers like `0.45 0.52 0.38`: this is the **load average** calculated over 1, 5 and 15 minutes. It represents the average number of processes that were waiting for CPU time in that interval. The practical rule is to compare it against the number of available cores: a load average of 4 on a 4-core server means the CPU is saturated; the same value on a 16-core server is irrelevant.

### The process list

Each row is a process, with columns for PID, user, CPU usage (`CPU%`) and memory usage (`MEM%`), running time, and the command that launched it. By default it's sorted by CPU usage, so the process causing the most trouble is usually already at the top.

## The shortcuts you'll actually use

htop is controlled almost entirely from the keyboard (the mouse works too, but over SSH on a remote server the keyboard is more convenient):

- `F6` (or `<` `>`) — change the sort column (handy for switching from "sort by CPU" to "sort by memory")
- `F9` — send a signal to the selected process (kill, but also gentler signals like `SIGTERM`)
- `F5` — switch to tree view, showing processes grouped by parent/child
- `/` — filter the list by typing a process name
- `u` — show only the processes belonging to a given user
- `F2` — opens the setup menu to add or remove columns, change colors, decide what shows up in the top bars
- `q` — quit

## Finding the process slowing everything down

The most common use case is: the server is slow, you need to find out why. The procedure with htop is always the same:

1. Look at the bars at the top: is it a CPU problem, a memory problem, or swap filling up?
2. Sort by the right metric (`F6`, then pick `CPU%` or `MEM%`).
3. Look at the process at the top. If the name doesn't tell you anything, press `F5` for tree view to see who launched it (an "anonymous" process is often the child of a service you'll recognize right away, like `php-fpm`, `mysqld` or `node`).
4. Decide whether to terminate it (`F9`, then pick the signal) or whether it's legitimate load that simply needs more resources on the server.

A detail that often confuses newcomers: a process using 100% of a single core on an 8-core server shows "100%" in htop's CPU column, not "12.5%". Keep that in mind when reading the numbers if you want the percentage relative to the machine's total CPU.

## Swap and memory: figuring out if you need more RAM

If the memory bar is almost always full and the swap bar keeps growing steadily (not just an occasional spike), that's the clearest sign the server needs more RAM, or that some service is configured to use too much of it (a classic case: MySQL with `innodb_buffer_pool_size` set higher than the available RAM, or too many PHP-FPM workers for the server's actual memory).

Swap itself isn't a problem — a small occasional use is normal — but swap that's constantly active makes everything much slower, because the system keeps shuffling data between RAM and disk instead of keeping it in fast memory.

## Configuring it the way you like

`F2` opens a menu with several useful sections:

- **Meters** — choose what to show in the top bars (you can add CPU temperature if available, network bandwidth, disk space)
- **Display options** — enable color support, default tree view, load average shown as a percentage of cores
- **Columns** — add useful columns like `TIME+` (total CPU time used by the process) or `IO_READ_RATE`/`IO_WRITE_RATE` if you need to see who's writing the most to disk

Your preferences are saved automatically in `~/.config/htop/htoprc`, so configure it once per user and server and you're set.

## When htop isn't enough

htop is perfect for a quick, interactive diagnosis, but it has one limitation: it only shows the **current** state, not history. If a server had a meltdown at 3 AM and you check it at 9, htop won't tell you anything about what happened. For that you need historical monitoring (tools like Netdata, Prometheus+Grafana, or even just system logs), while htop remains the right tool for "what's happening right now" once you're already connected to the server and need to figure things out fast.

## Wrapping up

htop turns a vague question like "why is the server slow" into a concrete answer in under a minute: check the bars at the top to see whether the bottleneck is CPU, memory or swap, sort the process list to isolate the culprit, and act on it directly from there if needed. It's one of those tools worth keeping within reach in every SSH session — maybe right next to a live log in another tmux pane.
