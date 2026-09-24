---
title: "Nano: a practical guide to the terminal text editor"
seoTitle: "Nano Editor: Commands and Shortcuts Cheat Sheet"
date: 2022-06-27
lastmod: 2026-09-24
description: "A practical guide to nano: open, save and exit, search and replace, copy and paste, the essential shortcuts, the .nanorc file and the most common mistakes."
tags: ["Guides", "Linux"]
translationKey: "nano-editor-guide"
---

Sooner or later you'll be on a server with a config file to edit and no GUI in sight. On almost every [Linux](/en/tags/linux/) distribution the first editor you'll find is **nano**: lightweight, preinstalled nearly everywhere, and with its shortcuts printed at the bottom of the screen, so you don't get trapped inside it the way everyone does with Vim the first time.

I've used Vim for years, yet for a quick change to an `sshd_config` or a virtual host I still reach for nano. This guide covers what you actually need: opening, saving and exiting, the shortcuts I use every day, configuring it with `.nanorc`, and the mistakes everyone runs into sooner or later.

## Nano in a nutshell

Nano is a terminal text editor released under the GNU GPL, born as a free clone of **Pico**. It has no modes like Vim: you open the file and type. Every command is a key combination, and the main ones are always visible in the two lines at the bottom.

The help bar uses two symbols:

- `^` means **Ctrl**: `^O` means `Ctrl + O`.
- `M-` means **Meta**, i.e. the **Alt** key (Option on a Mac, see [common mistakes](#common-mistakes-and-how-to-get-out-of-them)): `M-U` means `Alt + U`.

## Installing nano

First check whether it's already there:

```
nano --version
```

If it isn't, install it with your distribution's package manager (if that's new territory, I wrote a [guide to Linux package management](/en/linux-package-management-explained/)):

```
# Debian, Ubuntu and derivatives
sudo apt install nano

# Fedora, RHEL, Rocky, AlmaLinux
sudo dnf install nano

# Arch Linux
sudo pacman -S nano

# Alpine (common in Docker containers)
apk add nano

# macOS
brew install nano
```

A note for macOS: in recent versions the system `nano` command is actually a link to **pico**, which doesn't read `.nanorc` and lacks most of the features described here. Homebrew gets you the real GNU nano.

## Opening, saving and exiting

To open a file (or create it if it doesn't exist):

```
nano filename.txt
```

A few variants I use often:

```
nano +42 config.php      # open the file with the cursor on line 42
nano -l nginx.conf       # show line numbers
nano -v /var/log/syslog  # read-only: no accidental edits
```

Once inside:

- **Save**: `Ctrl + O`, then `Enter` to confirm the file name. Recent versions also have `Ctrl + S`, which saves without asking.
- **Exit**: `Ctrl + X`. If there are unsaved changes, nano asks whether to save them: `Y` for yes, `N` to quit without saving, `Ctrl + C` to cancel and stay in the file.

### Editing system files: prefer `sudoedit`

To edit a file in `/etc`, the reflex is `sudo nano /etc/...`. It works, but the whole editor then runs as root. The cleaner alternative is:

```
sudoedit /etc/ssh/sshd_config
```

`sudoedit` (same as `sudo -e`) copies the file to a temporary location, opens it with your editor **as your regular user** and with your own configuration, then puts it back with the right permissions when you save. It uses the editor set in `SUDO_EDITOR`, `VISUAL` or `EDITOR`: if nano doesn't open, see below for how to set it.

## Search and replace

- `Ctrl + W` opens search: type the text and press `Enter`.
- `Alt + W` jumps to the next match, `Alt + Q` to the previous one.
- `Ctrl + \` (or `Alt + R`) opens replace: nano asks for the text to find, then its replacement. At each match press `Y` to replace it, `N` to skip it or `A` to replace them all.

Inside the search prompt, `Alt + R` toggles **regular expressions** and `Alt + C` makes the search case-sensitive. For example, `^#?Port ` with regex enabled finds the port line in `sshd_config`, commented out or not.

## Selecting, copying and pasting

Copy and paste in nano doesn't use `Ctrl + C` / `Ctrl + V`, and that confuses everyone at first:

1. Put the cursor at the start of the text and press `Alt + A` (or `Ctrl + 6`) to start a selection.
2. Move the cursor to the end of the text you need.
3. Press `Alt + 6` to **copy** or `Ctrl + K` to **cut**.
4. Move the cursor where you want the text and press `Ctrl + U` to paste.

With no selection, `Ctrl + K` cuts the whole line the cursor is on. Press it several times in a row and it stacks the lines up: the quickest way to move a block.

To paste text coming **from outside** (a browser, for example), use your terminal's paste: `Ctrl + Shift + V` on Linux, `Cmd + V` on a Mac.

## Shortcuts worth keeping at hand

This is the table I'd keep printed next to the monitor. `Ctrl + G` opens the full help anyway, right inside nano.

| Shortcut | Action |
|---|---|
| `Ctrl + O` | Save (asks to confirm the name) |
| `Ctrl + S` | Save without asking |
| `Ctrl + X` | Exit |
| `Ctrl + G` | Help with every command |
| `Ctrl + W` | Search |
| `Alt + W` / `Alt + Q` | Next / previous match |
| `Ctrl + \` | Search and replace |
| `Ctrl + _` | Go to a specific line (and column) |
| `Ctrl + A` / `Ctrl + E` | Start / end of line |
| `Ctrl + Y` / `Ctrl + V` | Page up / page down |
| `Alt + \` / `Alt + /` | Start / end of file |
| `Ctrl + C` | Show cursor position (line and column) |
| `Alt + A` | Start a selection |
| `Alt + 6` | Copy the line or selection |
| `Ctrl + K` | Cut the line or selection |
| `Ctrl + U` | Paste |
| `Alt + U` / `Alt + E` | Undo / redo |
| `Alt + 3` | Comment or uncomment the line or selection |
| `Alt + }` / `Alt + {` | Indent / unindent |
| `Alt + N` | Toggle line numbers |
| `Ctrl + R` | Insert the contents of another file |
| `Ctrl + J` | Justify the paragraph |

`Alt + 3` alone is worth the read: to disable a config block on the fly, select it and comment it out in one go, using the right comment character for that file type.

## Configuring nano with `.nanorc`

The defaults are bare-bones. The `~/.nanorc` file (for your user) or `/etc/nanorc` (system-wide) changes them for good. This is a reasonable starting point:

```
set linenumbers          # always show line numbers
set constantshow         # cursor position always in the status bar
set indicator            # scrollbar on the side
set autoindent           # keep the previous line's indentation
set tabsize 4
set tabstospaces         # spaces instead of tabs (see YAML below)
set mouse                # click to place the cursor and select
set backup               # keep a copy of the file before saving
set backupdir "~/.cache/nano/backups"

# syntax highlighting
include "/usr/share/nano/*.nanorc"
```

Two notes. The `backupdir` folder must exist (`mkdir -p ~/.cache/nano/backups`), otherwise nano can't write the backup. The path to the syntax files varies by system: with Homebrew on Apple Silicon it's `/opt/homebrew/share/nano/*.nanorc`. On Debian and Ubuntu the `include` is often already in `/etc/nanorc`.

### Nano as the default editor

Many programs (`git commit`, `crontab -e`, `visudo`, `sudoedit`) open whatever editor is set in the `VISUAL` and `EDITOR` variables. To use nano, add this to your `~/.bashrc` or `~/.zshrc`:

```
export EDITOR=nano
export VISUAL=nano
```

On Debian and Ubuntu you can also pick the system editor with `sudo update-alternatives --config editor`. Git has its own setting:

```
git config --global core.editor nano
```

## Common mistakes (and how to get out of them)

**"Error writing ...: Permission denied" when saving.** You opened a system file without `sudo` and already made all your changes. Don't quit and lose your work: press `Ctrl + O`, change the name to `/tmp/filename` and save it there. Then copy it into place with `sudo cp /tmp/filename /original/path`. Next time, use `sudoedit`.

**Alt shortcuts don't work on a Mac.** macOS Terminal doesn't send Option as Meta. In *Terminal → Settings → Profiles → Keyboard*, enable "Use Option as Meta key". In iTerm2, set the left Option key to "Esc+". Alternatively, press and release `Esc` and then the letter: `Esc`, `U` is the same as `Alt + U`.

**YAML that won't parse after editing.** YAML doesn't allow tabs for indentation. If you edit a `docker-compose.yml` or an Ansible playbook with nano set to tabs, the file breaks with nothing visible on screen. `set tabstospaces` in `.nanorc` (or the `-E` option) fixes this for good. Watch out for the opposite case: `Makefile`s actually require tabs.

**Long lines split in two.** Old versions of nano, like the ones still found on CentOS 7, wrapped long lines on their own by inserting real line breaks, which is deadly in a config file. On old versions, open files with `nano -w`. Since nano 4.0 this behaviour is off by default. If a long line bothers you on screen, `Alt + S` turns on visual-only wrapping, which doesn't change the file.

**A file full of `^M` characters or "Converted from DOS format".** The file has Windows line endings (CRLF). Nano converts them when reading. When saving, in the `Ctrl + O` prompt, `Alt + D` chooses whether to write it back in DOS or Unix format. For shell scripts and config files you want Unix.

**Terminal frozen after `Ctrl + S`.** It happens on older systems or terminals with XON/XOFF flow control enabled: `Ctrl + S` freezes the output instead of saving. `Ctrl + Q` unfreezes it. Then save with `Ctrl + O`.

**"I'm stuck inside an editor and can't get out."** If you see shortcuts at the bottom, you're in nano: `Ctrl + X`. If you see nothing and every line at the bottom is just `~`, you're in Vim: press `Esc`, then type `:q!` and `Enter` to quit without saving.

## Nano or Vim?

It's not a contest. Nano is the right choice for targeted edits: a parameter in a config file, a line in the crontab, a commit message. When you spend hours inside a file, or need repetitive edits across many lines, Vim (or a real editor over SSH, like VS Code Remote) pays back the time it takes to learn.

Even as a Vim user, though, knowing nano well pays off: it's almost always installed, even in a minimal container or on a client's server where you can't install anything. If you work on remote servers a lot, you may also find my [practical guide to SSH](/en/ssh-practical-guide/) and the guide to [ncdu for analyzing disk usage](/en/ncdu-disk-usage-from-the-terminal/) useful.
