---
title: "Cron Jobs: How to Schedule Automated Tasks on Linux"
date: 2026-09-21
description: "A practical guide to cron and crontab: how to read the syntax, schedule recurring backups and scripts, where the output actually goes, and the most common mistakes to avoid."
tags: ["Guides", "Linux"]
translationKey: "how-cron-works"
---

If you manage even a single server, sooner or later you'll need something to run automatically: a nightly backup, cleaning up temp files, sending out a newsletter, renewing an SSL certificate. On Linux, the tool that's been doing this for decades is called **cron**, and it's probably the most underrated daemon on the whole system.

The bad news is its syntax looks like it came out of a riddle. The good news is that once the logic clicks, you never forget it.

## What cron is, in two sentences

**Cron** is a daemon that runs in the background on nearly every Unix-like system, checking minute by minute whether there's a command that needs to run on a predefined schedule. The rules you give it are called **cron jobs**, and they live inside configuration files called **crontabs** (short for "cron table").

There's nothing to install: on Ubuntu, Debian, CentOS and practically every server distro, cron is already there, active by default.

## The crontab syntax, explained once and for all

Every line in a crontab has this shape:

```
* * * * * command-to-run
```

The five asterisks represent, in order: **minute** (0-59), **hour** (0-23), **day of month** (1-31), **month** (1-12), and **day of week** (0-6, where 0 is Sunday).

<svg class="hi-diagram" width="300" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="70" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="130" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="190" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="250" y="20" width="40" height="46" rx="12" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="275" cy="30" r="5" class="hi-accent-dot"/>

  <line x1="35" y1="66" x2="35" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="95" y1="66" x2="95" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="155" y1="66" x2="155" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="215" y1="66" x2="215" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="270" y1="66" x2="270" y2="100" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="15" y="110" width="270" height="50" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="30" y="124" width="60" height="8" rx="4" class="hi-bar"/>
  <rect x="100" y="124" width="90" height="8" rx="4" class="hi-bar"/>
  <rect x="200" y="124" width="70" height="8" rx="4" class="hi-bar"/>
  <rect x="30" y="140" width="120" height="8" rx="4" class="hi-bar"/>
</svg>

Left to right: **minute**, **hour**, **day of month**, **month**, **day of week** (highlighted, with the accent dot as a reminder that it's the last field — and the one people forget about most), all five feeding into the command to run, shown in the box below.

A few real examples are worth more than a page of explanation:

```
0 3 * * *      → every day at 3:00 AM
*/15 * * * *   → every 15 minutes
0 9 * * 1      → every Monday at 9:00 AM
0 0 1 * *      → the first day of every month, at midnight
30 2 * * 1-5   → at 2:30 AM, Monday through Friday
```

The asterisk `*` means "every possible value" for that field. A slash `/` marks a step (`*/15` = "every 15 units"). A dash `-` marks a range (`1-5` = "Monday through Friday"). A comma `,` lets you list multiple values (`1,15` = "the 1st and the 15th of the month").

## How to edit a crontab

You never edit the cron file by hand: you use the `crontab` command, which also takes care of notifying the daemon whenever it needs to reload.

```
crontab -e
```

This opens the default editor (often nano or vim) with the current user's crontab. From there you add one line per job, save and exit: cron picks up the change on its own, no restart needed.

Other useful commands:

```
crontab -l      # list the current user's active jobs
crontab -r      # remove ALL of the current user's jobs (irreversible, be careful)
sudo crontab -e -u www-data   # edit another user's crontab
```

Every system user has their own crontab, independent from everyone else's. If a job needs root privileges (e.g. restarting a service), it belongs in root's crontab, not your regular user's.

## A real example: automated database backups

Say you want to dump your database every night at 2:00 AM, keeping the date in the filename:

```
0 2 * * * /usr/bin/mysqldump -u backup_user -p'password' db_name > /home/backup/db_$(date +\%Y\%m\%d).sql
```

Notice the double `%` (`\%`) instead of a single one: inside a crontab, the `%` character has a special meaning (it inserts a newline into the command), so whenever you actually need it in the command itself — like here with `date +%Y%m%d` — it always has to be escaped with a backslash.

One more thing to watch for with more complex scripts: **always use absolute paths**. Cron runs jobs with a much sparser environment (`PATH`, variables) than your interactive shell, so a command that works fine when you run it manually from the terminal can fail silently inside cron simply because it can't find the executable.

## Where the output goes (and why you never see it)

By default, cron emails the output of every job (both stdout and stderr) to the crontab's owner, using the system's local mail service — which on most modern servers isn't even configured. The result: the output vanishes into thin air and you never notice when a job is actually failing.

The simplest fix is to redirect the output yourself, straight to a log file:

```
0 3 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

`>>` appends the output to the file (without overwriting it), and `2>&1` sends errors (stderr) to the same place as regular output (stdout). If the backup ever stops working, that log is the first place to look.

If instead you want to **discard** the output entirely (handy for very noisy commands whose result you don't care about), you can send it to `/dev/null`:

```
*/5 * * * * /home/user/noisy-script.sh > /dev/null 2>&1
```

## Common mistakes that waste hours of debugging

**Forgetting the environment**: as mentioned, cron doesn't load your `.bashrc` or `.bash_profile`. If your script relies on environment variables defined there (e.g. `NODE_ENV`, custom paths), define them explicitly at the top of the script or directly in the crontab.

**Relative paths**: a script that does `cd folder` or calls `python script.py` without an absolute path will probably fail, because cron's working directory isn't what you'd expect. Always prefer `cd /absolute/path && command`, or point to full paths directly.

**Missing permissions**: if the script writes files or folders, make sure the crontab's owner actually has the right permissions on those paths. A script that was tested manually as root and then ends up in a regular user's crontab is a classic cause of silent failures.

**Overlapping runs**: if a job runs every 5 minutes but occasionally takes longer than 5 minutes to finish, you risk having multiple instances of the same script running at once, with unpredictable results (two backups writing to the same file, for example). You can prevent this with `flock`, which guarantees only one instance runs at a time:

```
*/5 * * * * flock -n /tmp/my-script.lock /home/user/my-script.sh
```

If the script is already running, `flock -n` makes the new attempt exit immediately instead of starting a second one.

## In short

You don't need to fully master cron to use it well: the five syntax fields, the habit of always using absolute paths, and redirecting output to a log file instead of letting it vanish into an email nobody reads — that's really all it takes. With those three things down, you can automate backups, cleanups, notifications and any recurring script without having to remember to run it yourself every time.

Next time you catch yourself doing the same manual task every day at the same time, ask yourself if it isn't time to hand it off to cron.
