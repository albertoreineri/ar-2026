---
title: "ncdu: find what's eating your disk space from the terminal"
seoTitle: "ncdu: Analyze Disk Usage from the Terminal"
date: 2024-03-12
lastmod: 2026-09-24
description: "How to use ncdu to find what's filling a Linux server's disk, the most common culprits, and what to do when the disk is full but ncdu finds nothing."
tags: ["Guides", "Linux"]
translationKey: "ncdu-disk-usage"
---

"No space left on device" is one of the most mundane and most destructive errors a server can throw. The database stops writing, logs stop, PHP sessions fail, and sometimes you can't even finish logging in over SSH. At that point you don't need a theory of storage management: you need to know **what** is taking up the space, and fast.

The tool I've used for this for years is **ncdu**. In this guide you'll find how to use it well, the options that matter on a production server, the culprits I find most often, and what to do in the sneakiest case: the disk is full, but ncdu finds nothing.

## Before ncdu: `df`

The first command is always `df`, to find out **which** filesystem is full:

```
df -h
```

Look at the `Use%` column and the mount point (`Mounted on`). The full disk might not be the system one: it could be a separate volume for `/var` or for backups, for example.

## What ncdu is

**ncdu** (NCurses Disk Usage) is an interactive terminal interface built on the same idea as `du`: it scans a directory, works out how much each subfolder takes up and shows you the list sorted by size. You step into folders with the arrow keys, go back up, and in ten seconds you get to the 40 GB file that shouldn't be there.

Version 2, rewritten in Zig, is faster and uses far less memory on filesystems with millions of files. Some distributions still ship 1.x: the commands described here work on both.

## Installation

```
# Debian, Ubuntu
sudo apt install ncdu

# Fedora
sudo dnf install ncdu

# RHEL, Rocky, AlmaLinux (needs EPEL)
sudo dnf install epel-release && sudo dnf install ncdu

# Arch
sudo pacman -S ncdu

# macOS
brew install ncdu
```

On RHEL and its derivatives ncdu isn't in the base repositories: if EPEL is new to you, it's explained in my [guide to Linux package management](/en/linux-package-management-explained/).

## How I run it on a server

This is the command I use almost every time:

```
sudo ncdu -x /
```

- **`sudo`**: without root privileges ncdu can't read many system folders, and the totals come out too low.
- **`-x`**: stay on one filesystem. Without this option ncdu also walks into mounted disks, network shares and `/proc`, and the result tells you nothing about which disk is full. If `df` told you the problem is on `/var`, run `sudo ncdu -x /var`.

Other useful options:

```
sudo ncdu -rx /                    # read-only: disables deletion
sudo ncdu -x --exclude /srv/backup /
sudo ncdu -x -o /tmp/scan.json /   # save the scan to a file, no interface
ncdu -f /tmp/scan.json             # open a saved scan
```

I always use **`-r`** mode on production servers, especially when someone else is working on them. With `-rr` you also disable opening a shell from the interface. Exporting the scan with **`-o`** is handy on very large disks: you run it once, maybe overnight, and then explore it at your leisure, even on another machine.

## The keys you need

| Key | Action |
|---|---|
| `↑` `↓` (or `j` `k`) | Move through the list |
| `→` / `Enter` (or `l`) | Open the folder |
| `←` (or `h`, `<`) | Go back to the parent folder |
| `s` / `n` / `C` | Sort by size / name / number of items |
| `a` | Toggle between disk usage and apparent size |
| `c` | Show how many files each folder contains |
| `g` | Switch the percentage and graph display |
| `e` | Show or hide hidden and excluded files |
| `i` | Details on the selected item |
| `d` | Delete the selected item (asks for confirmation) |
| `r` | Recalculate the current folder |
| `b` | Open a shell in the current folder |
| `q` | Quit |

The `c` key together with sorting by `C` is underrated: it shows you folders with **hundreds of thousands of small files**, which don't weigh much in GB but can exhaust the inodes (more on that below).

About the `d` key: it works, but on a server I'd rather find the culprit with ncdu and then fix it with the right command. Deleting an open log file or a Docker file by hand usually causes more problems than it solves.

## The usual suspects

After years of filled-up servers, the suspects are almost always the same.

**The systemd journal** (`/var/log/journal`). With no limit it can grow to several GB. Check and shrink it:

```
journalctl --disk-usage
sudo journalctl --vacuum-size=500M
```

To make the limit permanent, set `SystemMaxUse=500M` in `/etc/systemd/journald.conf` and restart `systemd-journald`.

**Application logs** (`/var/log/nginx`, `/var/log/apache2`, Laravel logs in `storage/logs`). The problem is almost always a log nobody rotates. The fix is a **logrotate** rule in `/etc/logrotate.d/`, not deleting it by hand every so often.

**Docker** (`/var/lib/docker`). Old images, stopped containers, build cache. Look first, then clean up:

```
docker system df
docker system prune
```

Careful: `docker system prune --volumes` also deletes volumes not attached to any container, which could mean a database's data. Don't add it without knowing what's inside.

**MySQL binary logs** (`/var/lib/mysql/binlog.*`). MySQL 8 enables them by default and keeps them for 30 days. On a write-heavy server they can outweigh the database itself. Don't delete the files by hand: from the MySQL console use `PURGE BINARY LOGS BEFORE NOW() - INTERVAL 3 DAY;`, and shorten retention with `binlog_expire_logs_seconds`. If you don't use replication or point-in-time recovery, consider whether you need them at all. There's more on this in my guide to the [LAMP stack on Ubuntu](/en/how-to-install-a-lamp-stack/).

**Package cache and old kernels.** `sudo apt clean` empties `/var/cache/apt/archives`. `sudo apt autoremove` removes kernels no longer in use, which on a small `/boot` are a classic cause of failed upgrades.

**Old snap revisions** (`/var/lib/snapd`). By default each snap keeps three versions. `sudo snap set system refresh.retain=2` brings it down to the minimum allowed.

**Forgotten backups.** The database dump taken "just to be safe" before an upgrade, a year ago, in root's home. ncdu finds them in a second.

## The disk is full, but ncdu finds nothing

The most frustrating case: `df` says 100%, ncdu adds up to 20 GB on a 50 GB disk. There are three causes, in order of frequency.

### Deleted files still held open

On Linux, deleting a file removes its name, but the space is freed only when **the last process holding it open closes it**. The classic: someone deletes a 30 GB log while the service is still writing to it. The file disappears from ncdu, but the space stays used.

```
sudo lsof +L1
```

lists deleted files that are still open, along with the process holding them. The clean fix is to restart that service. If you can't, you can empty the file through the process's file descriptor (using the PID and descriptor number shown in the `lsof` output):

```
sudo truncate -s 0 /proc/PID/fd/NUMBER
```

The lesson for next time: to empty a log that's in use, don't delete it, **truncate** it: `sudo truncate -s 0 /var/log/file.log`.

### Out of inodes

A filesystem has a maximum number of files, not just of bytes. Run out and you get "No space left on device" with the disk half empty:

```
df -i
```

If `IUse%` is at 100%, look for the folder with millions of small files: in ncdu press `c` to see the counts and `C` to sort. The usual culprits are PHP sessions that never get cleaned up, application caches and mail queues.

### Files hidden under a mount point

If you write to `/mnt/data` while the disk isn't mounted, the files end up on the system disk. When the disk is mounted later, those files stay there but become invisible. To see them, mount the root again somewhere else with a bind mount:

```
sudo mkdir /mnt/root-bind
sudo mount --bind / /mnt/root-bind
sudo ncdu -x /mnt/root-bind
```

When you're done, `sudo umount /mnt/root-bind`.

## What if ncdu isn't installed?

On a client's server you can't always install packages. `du` is everywhere and gives the same answer, just less comfortable to navigate:

```
sudo du -xh --max-depth=1 / 2>/dev/null | sort -h
```

Then repeat on the biggest folder until you reach the culprit.

## In short

`df -h` to find which disk is full, `sudo ncdu -x` to find what's filling it, and the right command to fix it: `journalctl --vacuum-size`, logrotate, `docker system prune`, `PURGE BINARY LOGS`. If the numbers don't add up, `lsof +L1` and `df -i` solve almost every mystery.

For editing config files like `journald.conf` or logrotate rules, my [practical guide to nano](/en/nano-editor-beginners-guide/) may come in handy. And if you're working on remote servers every day, here's my [practical guide to SSH](/en/ssh-practical-guide/).
