---
title: "tmux: a practical guide to the terminal multiplexer"
date: 2026-11-09
description: "How to use tmux to run multiple terminal sessions in parallel, keep processes alive after an SSH disconnect, and organize your work into windows and panes."
tags: ["Guides", "Linux"]
translationKey: "tmux-practical-guide"
---

Ever launched a long-running command on a remote server over SSH and lost everything because the connection dropped? Or had to open ten different terminals just to keep an eye on a log, an editor, and a running process at the same time? **tmux** solves both problems with a single tool, and it's already installed or trivially installable on pretty much any Linux server.

If you already use [SSH to connect to your servers](/en/ssh-practical-guide/), tmux is the natural next step: it gives you persistent work sessions that survive disconnections and that you can pick up again exactly where you left them.

## What a terminal multiplexer is

tmux (**t**erminal **mu**ltiple**x**er) is a program that runs inside your terminal and lets you create multiple virtual "screens" within a single connection. You can open separate windows, split them into panes, switch between them with a keyboard shortcut, and most importantly **detach** from everything without closing anything: the processes keep running on the server, and when you reconnect you find everything exactly as you left it.

The real difference compared to just opening several terminal windows on your own machine is that with tmux the session lives **on the server**, not on the client. If your SSH connection drops, if you close your laptop, if you switch networks: the tmux session stays right there, alive, ready to be resumed.

<svg class="hi-diagram" width="300" height="160" viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="15" width="280" height="130" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="30" cy="35" r="4" class="hi-accent-dot"/>

  <line x1="150" y1="25" x2="150" y2="135" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="25" y="50" width="100" height="35" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="35" y="62" width="50" height="5" rx="2.5" class="hi-bar"/>
  <rect x="35" y="72" width="35" height="5" rx="2.5" class="hi-bar"/>

  <rect x="25" y="95" width="100" height="35" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="35" y="107" width="45" height="5" rx="2.5" class="hi-bar"/>
  <rect x="35" y="117" width="60" height="5" rx="2.5" class="hi-bar"/>

  <rect x="165" y="50" width="110" height="80" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="178" y="65" width="55" height="5" rx="2.5" class="hi-bar"/>
  <rect x="178" y="75" width="70" height="5" rx="2.5" class="hi-bar"/>
  <rect x="178" y="85" width="40" height="5" rx="2.5" class="hi-bar"/>
  <rect x="178" y="105" width="60" height="5" rx="2.5" class="hi-bar"/>
</svg>

The big rectangle is the tmux **session** (the yellow dot marks it as active); inside it there are two **windows** (on the left, like browser tabs) and a window on the right split into several side-by-side **panes**.

## Installing it and starting your first session

It's in the official repositories on pretty much every distro:

```
sudo apt install tmux      # Debian/Ubuntu
sudo dnf install tmux      # Fedora
```

To start a new session, just type:

```
tmux
```

You'll land in a terminal that looks almost identical to before, except for a green status bar at the bottom showing the session name and the time. From here on, anything you run inside this window survives a detach.

## The prefix and the shortcuts you'll actually use

Every tmux command goes through a **prefix**, `Ctrl+b` by default. You press it, release it, then press the key for the command you want to run. It's not a combo held down together, it's a sequence.

The shortcuts you'll use every single day are few:

- `Ctrl+b` then `d` — **detach**, step away from the session while leaving it running on the server
- `Ctrl+b` then `c` — create a new window
- `Ctrl+b` then `n` / `p` — switch to the next/previous window
- `Ctrl+b` then a number (`0`, `1`, `2`...) — jump straight to that numbered window
- `Ctrl+b` then `%` — split the current pane vertically (two columns)
- `Ctrl+b` then `"` — split the current pane horizontally (two rows)
- `Ctrl+b` then the arrow keys — move between panes

To actually quit tmux (not just detach), close every window, for example by typing `exit` in each one, or press `Ctrl+b` then `x` to close the current pane with a confirmation prompt.

## Sessions: the whole reason you use tmux

The key command is `tmux attach`. After detaching with `Ctrl+b d`, the session keeps running in the background. To pick it back up:

```
tmux attach
```

If you have more than one active session, tmux will tell you and you'll need to specify which one to resume:

```
tmux list-sessions
tmux attach -t session-name
```

It's worth giving sessions a sensible name instead of leaving the default numeric one, especially if you keep several open for different projects:

```
tmux new -s deploy-staging
tmux new -s production-logs
```

This is the classic scenario where tmux saves your day: you kick off a data import that takes an hour, detach with `Ctrl+b d`, close your laptop, and go to lunch. The process keeps running on the server. When you're back, `tmux attach -t session-name` and you're exactly where you left off, output and all.

## Windows and panes: organizing your work

A **window** in tmux is the equivalent of a browser tab: it takes up the whole screen, and you can switch between windows without losing anything running in the others. A **pane**, on the other hand, splits the current window's space into multiple tiles visible at the same time.

A very common setup for anyone working on a web project is:

```
Ctrl+b %     # split into two columns
Ctrl+b "     # split the right-hand pane into two rows
```

The result: an editor or shell for commands on the left, the application logs (`tail -f`) in the top right, and maybe `htop` to keep an eye on server load in the bottom right. All visible at once, inside the same terminal window.

To resize panes you can hold the prefix and use arrow keys repeatedly right after pressing `Ctrl+b` (by default it stays "live" for a moment after the prefix), or more simply just drag the pane borders with your mouse once you've enabled mouse support (more on that below).

## A minimal config file that's worth having

tmux reads its configuration from `~/.tmux.conf`. You don't need much to noticeably improve the experience:

```
# enable mouse support (click to switch pane, drag to resize)
set -g mouse on

# keep a lot of scroll history per window
set -g history-limit 10000

# start window numbering at 1 instead of 0
set -g base-index 1

# reduce the delay after Esc, useful if you run Vim/Neovim inside tmux
set -sg escape-time 0
```

After editing it, there's no need to restart tmux: just reload the config from your active session with `Ctrl+b` then `:` and type:

```
source-file ~/.tmux.conf
```

## tmux vs screen

Anyone who's worked on Linux servers for a while has probably also run into `screen`, tmux's historical predecessor. They do roughly the same thing — persistent sessions, windows, detach/attach — but tmux has a more flexible pane model (you can split them into almost any layout, not just a fixed grid), a more readable configuration syntax, and active development, while `screen` has been essentially stagnant for years. If you get to choose on a new server, choose tmux.

## Common errors

**"sessions should be nested with care, unset $TMUX to force"** — you're trying to open tmux from inside another tmux session that's already active. This is usually a mistake: if you connected over SSH and see this message, your login shell is probably already launching tmux automatically. Use `tmux attach` instead of `tmux` to resume the existing session, or detach first with `Ctrl+b d`.

**The mouse doesn't work / selects text in a weird way** — remember to add `set -g mouse on` to your config file. Without that line, mouse clicks get passed straight to the underlying terminal instead of being handled by tmux.

**Copying text feels awkward** — with the mouse disabled, selecting text with your trackpad the way you normally would in a terminal still works; just hold `Shift` while selecting (on most terminal emulators) to bypass tmux and use the terminal's native selection instead.

**The session disappeared after a server reboot** — tmux doesn't persist its state to disk, it lives in memory. If the server reboots or the tmux server process gets killed, the session is gone for good. For processes that genuinely need to survive a reboot, you need a supervisor like `systemd` or `supervisord`, not tmux.

## When to use it (and when not to)

tmux is great for interactive work on remote servers: manual deployments, live debugging, log monitoring, long work sessions you don't want to lose to a dropped connection. It's not the right tool for running a production service permanently in the background — for that you want `systemd`, Docker, or a dedicated process manager, which handle automatic restarts and logging far more robustly.

But for day-to-day terminal work on a server, especially if you spend more than a few minutes a day in one, it's one of those tools that pays back the time you invest learning it within the first week.
