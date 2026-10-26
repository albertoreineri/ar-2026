---
title: "rsync: a practical guide to syncing files and backups"
date: 2026-10-26
description: "How to use rsync to sync folders and run incremental backups, locally and on remote servers over SSH: the essential flags, common pitfalls, and a few useful tricks."
tags: ["Guides", "Linux"]
translationKey: "rsync-practical-guide"
---

If you manage a server, or even just your own computer, sooner or later you'll need to copy a folder full of files from one place to another: a backup, a migration, keeping two machines in sync. The first instinct is usually `cp -r`, or `scp -r` if the destination is remote. Both work, but they share one big flaw: they copy **everything**, every single time. If the folder is 50 GB and only 10 MB of it changed, you still wait for 50 GB to transfer. **rsync** solves exactly this problem, and it's one of the tools I reach for most often from the terminal.

## What rsync is, and why it's different from cp or scp

rsync (remote sync) compares the source and the destination and transfers **only the differences**: new files, changed files, deleted files (if you explicitly ask for that). To do this, it uses an algorithm that splits files into blocks and transfers only the blocks that actually changed, not the entire file.

The practical result: the first sync of a large folder takes about as long as a plain copy, but every sync after that is nearly instant, because rsync only has to deal with what changed since last time. For periodic backups, or for keeping two copies of the same project in sync, that's the difference between waiting an hour and waiting a few seconds.

On top of that, unlike `cp`, rsync can:

- preserve permissions, ownership, and timestamps from the original files;
- work over a remote connection via SSH, encrypting the transfer;
- resume an interrupted transfer instead of starting over from scratch;
- delete files from the destination that no longer exist in the source, if you ask it to.

## Basic syntax

```
rsync [options] source destination
```

The simplest example, syncing two folders on the same machine:

```
rsync -av /home/alberto/projects/ /mnt/backup/projects/
```

Here `-a` (archive) is the flag you'll use almost every time: it's a shorthand that enables recursion into subfolders, plus preservation of permissions, timestamps, symlinks, and ownership, all in one go. `-v` (verbose) shows what it's doing, file by file, which is useful for seeing exactly what gets transferred.

<svg class="hi-diagram" width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="30" width="110" height="60" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="26" y="48" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="26" y="60" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="26" y="72" width="64" height="6" rx="3" class="hi-bar"/>

  <line x1="122" y1="60" x2="168" y2="60" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="145" cy="60" r="5" class="hi-accent-dot"/>

  <rect x="170" y="30" width="110" height="60" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <rect x="186" y="48" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="186" y="60" width="30" height="6" rx="3" class="hi-bar"/>
  <rect x="186" y="72" width="64" height="6" rx="3" class="hi-bar"/>
</svg>

On the left, the source folder; on the right, the destination: rsync compares the files (the yellow dot marks the checkpoint) and transfers only the blocks that differ — here, the second row, shorter in the destination because it hasn't been updated yet.

**Watch out for the trailing slash (`/`) after the folder name**, because it completely changes the behavior:

- `rsync -av projects/ /backup/` copies the **contents** of `projects` into `/backup`.
- `rsync -av projects /backup/` copies the `projects` folder **itself** into `/backup`, creating `/backup/projects`.

This is the single most common mistake for people new to rsync, and you often only discover it by checking where the files actually ended up.

## Syncing with a remote server over SSH

The most common use case is backing up to (or from) a remote server, using SSH as the transport:

```
rsync -avz -e ssh /home/alberto/projects/ user@remote.server.com:/home/user/backup/
```

Here `-z` compresses data during transfer (useful on slow connections, pointless if you're already transferring compressed files like images or video), and `-e ssh` explicitly specifies SSH as the channel, though in most cases it's already the default once SSH is installed.

If you're using SSH keys (and you should — I covered this in the [practical guide to SSH](/en/ssh-practical-guide/)) and a non-standard port, you can specify it like this:

```
rsync -avz -e "ssh -p 2222" /home/alberto/projects/ user@remote.server.com:/home/user/backup/
```

To copy in the opposite direction, from the remote server to your own machine, just swap source and destination:

```
rsync -avz -e ssh user@remote.server.com:/var/www/site/ /home/alberto/site-backup/
```

## Simulate before you run it: --dry-run

Before running a command that touches a lot of files, especially one that includes `--delete` (more on that in a moment), it's always worth simulating the operation first:

```
rsync -avz --dry-run /home/alberto/projects/ /mnt/backup/projects/
```

With `--dry-run`, rsync shows you exactly what it *would* do — which files it would copy, which it would delete — without touching anything. It's the safety net that keeps you from getting an unpleasant surprise, especially with long commands or when running against a production server.

## Keeping two folders identical: --delete

By default, rsync adds and updates files in the destination, but never deletes anything. If a file is removed from the source, it still sticks around in the destination. That's fine for a backup you want to accumulate over time, but not if you want the destination to be an exact mirror of the source.

```
rsync -avz --delete /home/alberto/projects/ /mnt/backup/projects/
```

`--delete` removes anything from the destination that no longer exists in the source. It's a powerful option, and if used in the wrong direction (say, by accidentally swapping source and destination) it can wipe out data you meant to keep. **Always run it with `--dry-run` first**, especially the first few times you use it on a new pair of folders.

## Excluding files and folders

You rarely want to sync literally everything. Folders like `node_modules`, `.git`, cache files, or temporary logs usually don't belong in a backup:

```
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '*.log' /home/alberto/projects/ /mnt/backup/projects/
```

If the exclusion list grows long, it's cleaner to put it in a file and reference that instead:

```
rsync -avz --exclude-from='excludes.txt' /home/alberto/projects/ /mnt/backup/projects/
```

where `excludes.txt` contains one pattern per line, using the same syntax as the examples above.

## Incremental backups with history: --link-dest

A trick I use a lot for backing up a site or a project is combining rsync with `--link-dest`, which creates "incremental" backups while saving disk space: unchanged files are linked via hard links to the copy from the previous backup, instead of being physically duplicated.

```
rsync -avz --delete --link-dest=/mnt/backup/2026-10-25/ /home/alberto/projects/ /mnt/backup/2026-10-26/
```

The result is a `2026-10-26` folder that contains the full state of the source as of that date, but only uses real disk space for the files that actually changed since the previous day's backup. Each backup folder is still fully browsable and complete on its own, as if it were a standalone copy: it's the same idea used by tools like Apple's Time Machine, or by `rsnapshot`, which is itself built on top of rsync using this exact technique.

## Automating it with cron

Once you've nailed down the right command, it's worth automating it. I wrote about this in the [guide to cron](/en/cron-jobs-linux-guide/): just add a line to your crontab, for example to run a backup every night at 3 AM:

```
0 3 * * * rsync -avz --delete /var/www/site/ /mnt/backup/site/ >> /var/log/site-backup.log 2>&1
```

The redirect to a log file matters: cron has no terminal to show output to, so without saving it somewhere you'll have no way of finding out a backup failed until you actually need it and it isn't there.

## A few more useful options

- `--progress`: shows transfer progress file by file, handy when copying a few very large files and you want to see where you stand.
- `-n`: alias for `--dry-run`, for whoever is typing commands on the fly.
- `--max-size=100M`: skips files larger than the given threshold, useful for leaving huge database dumps out of a "lightweight" backup.
- `--backup --backup-dir=previous/`: instead of overwriting modified files, moves them into a separate folder before updating them — an extra safety net.
- `-u` (update): skips files in the destination that are newer than the ones in the source, useful if you sync in both directions and want to avoid overwriting more recent changes.

## Bottom line

rsync isn't just "a faster cp": it's the right tool any time you need to keep two copies of the same data in sync, locally or across different servers, without wasting bandwidth and time re-transferring what hasn't changed. Always start with `--dry-run` when the command is new or destructive (`--delete` especially), automate it with cron once you trust the command, and consider `--link-dest` if you want a backup history without blowing up your disk usage. Once the right command is sitting in your crontab, backups stop being something you have to think about.
