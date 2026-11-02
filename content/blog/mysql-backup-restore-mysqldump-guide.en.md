---
title: "mysqldump: a practical guide to backing up and restoring MySQL/MariaDB"
date: 2026-11-02
description: "How to back up a MySQL or MariaDB database with mysqldump, how to restore it, how to automate it with cron, and the most common mistakes to avoid."
tags: ["Guides", "Linux"]
translationKey: "mysql-backup-restore-guide"
---

If you run a site on WordPress, Laravel, or anything else backed by MySQL or MariaDB, backing up files isn't enough. You can have a perfect copy of all your code and uploads, but if the database is lost — a stray `DROP TABLE`, a plugin that corrupts data, a dead disk — the site is just as dead. [I've already written about rsync for file backups](/en/rsync-guide-file-backup-sync/), but a database lives a life of its own and needs a dedicated tool: **mysqldump**.

## Why file backups aren't enough

A database isn't a static file like a photo or a PDF: it's a set of interconnected tables, with indexes, foreign keys, and transactions that might be mid-flight at the exact moment you read them. Copying MySQL's raw binary files (usually under `/var/lib/mysql`) while the server is running is a great recipe for a corrupted, unusable backup: some files might get copied while the engine is still writing to them.

mysqldump solves this by working at a higher level: it connects to the database like any regular client, reads the data **consistently**, and translates it into a plain text file containing the SQL statements (`CREATE TABLE`, `INSERT INTO`...) needed to recreate it from scratch. The result is a file you can read, version, compress, move to another server, and — most importantly — restore without surprises.

## A simple dump

The basic command to export a database looks like this:

```
mysqldump -u username -p database_name > backup.sql
```

The `-p` flag without a value prompts for the password on screen (never type it in plain text directly in the command — it would end up in your shell history). If you'd rather not be interrupted, you can use a `.my.cnf` file with your credentials instead, more on that later.

The `backup.sql` file you get is just plain SQL text: you can open it in an editor, `grep` it for a specific line, or even copy out just the part you need.

<svg class="hi-diagram" width="300" height="130" viewBox="0 0 300 130" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="35" cy="65" r="26" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="61" y1="65" x2="105" y2="65" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="107" y="40" width="90" height="50" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="178" cy="50" r="5" class="hi-accent-dot"/>
  <line x1="197" y1="65" x2="241" y2="65" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="243" y="30" width="50" height="70" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="253" y="48" width="30" height="5" rx="2.5" class="hi-bar"/>
  <rect x="253" y="58" width="22" height="5" rx="2.5" class="hi-bar"/>
  <rect x="253" y="68" width="26" height="5" rx="2.5" class="hi-bar"/>
</svg>

The circle on the left is the live, running database; it flows through mysqldump (the highlighted box, with the yellow dot marking the point where data is read consistently) and ends up as a plain SQL text file on the right, ready to be compressed or moved elsewhere.

## Compressing the dump

A dump of a database with thousands of rows can get big fast, but it's also extremely compressible, since it's repetitive text. It's worth compressing it on the fly with `gzip`, without going through an uncompressed intermediate file:

```
mysqldump -u username -p database_name | gzip > backup.sql.gz
```

To restore it, you just reverse the process by piping `gunzip -c` or `zcat` into `mysql`, as shown further down.

## Options that actually matter

The basic command works, but on a production database with **InnoDB** tables (the default storage engine for years now) it's worth adding two flags:

```
mysqldump -u username -p --single-transaction --quick database_name | gzip > backup.sql.gz
```

- **`--single-transaction`**: starts the dump inside a single transaction, so InnoDB tables are read in a consistent state at a given instant, without blocking concurrent writes to the rest of the database. Without this flag, mysqldump locks tables during the export by default, which on a production site means your queries stall.
- **`--quick`**: forces mysqldump to read and write row by row instead of loading an entire table into memory before writing the dump. On large tables, this keeps the process from blowing up in RAM.

If you're still running **MyISAM** tables (rarer today, but it happens on older installs), `--single-transaction` won't help much since MyISAM doesn't support transactions: in that case mysqldump still locks tables for reading to guarantee consistency.

### Backing up all databases at once

If the server hosts multiple databases (common on a VPS shared between several sites), you can export all of them in one go:

```
mysqldump -u root -p --single-transaction --quick --all-databases | gzip > full-backup.sql.gz
```

Useful for a complete disaster-recovery copy of the server, but for a single site it's almost always better to have a separate dump per database: smaller, faster to restore, and you won't risk accidentally restoring another project's data on top of it.

## Restoring

Restoring a dump is just as simple — pipe the SQL file into the `mysql` client instead of out of it:

```
mysql -u username -p database_name < backup.sql
```

If the dump is compressed, decompress it on the fly in a pipe, without saving the uncompressed file to disk first:

```
gunzip -c backup.sql.gz | mysql -u username -p database_name
```

**Important:** the destination database (`database_name` in the command above) has to already exist — mysqldump won't create it for you unless you used `--databases` when exporting. If it doesn't exist yet:

```
mysql -u root -p -e "CREATE DATABASE database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Specifying the charset when creating the database avoids one of the most annoying restore problems: accented characters or emoji turning into question marks because the destination database uses a different charset than the source (typically the old `latin1` versus `utf8mb4`).

## Automating it with cron

A backup you only run by hand when you remember isn't a backup, it's a gamble. As I explained in the [guide to cron](/come-funziona-cron/) (article in Italian), the fix is a scheduled script that runs every night:

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d)
DEST=/home/backup/db
mkdir -p "$DEST"

mysqldump --defaults-extra-file=/etc/mysql-backup.cnf \
  --single-transaction --quick database_name | gzip > "$DEST/database_name_$DATE.sql.gz"

# keeps only the last 14 days
find "$DEST" -name "database_name_*.sql.gz" -mtime +14 -delete
```

and in the crontab:

```
0 2 * * * /home/user/backup-db.sh >> /var/log/db-backup.log 2>&1
```

The `/etc/mysql-backup.cnf` file referenced with `--defaults-extra-file` is the correct way to avoid writing the password into the script or the crontab, where anyone with server access could read it in plain text:

```
[client]
user=backup_user
password=a_long_dedicated_password
```

Lock it down with restrictive permissions (`chmod 600`), and if you can, create a MySQL user dedicated to backups with only `SELECT`, `LOCK TABLES`, and `SHOW VIEW` privileges — the account running the dumps doesn't need write access to the database.

## Dumping and restoring between different servers

mysqldump is also the right tool for migrating a database from one server to another, for example when switching hosting providers. The trick is to avoid saving an intermediate file whenever you can, and pipe straight from one server to the other over SSH:

```
mysqldump -u user -p --single-transaction database_name | \
  ssh user@new-server "mysql -u user -p database_name"
```

This way the dump never touches disk at all: it leaves the old server, streams through SSH, and lands directly in the database on the new server. Faster and safer than downloading a file, uploading it somewhere else, and importing it from there.

## Common problems

**"MySQL server has gone away" during a large dump.** The server closed the connection because the dump exceeded `max_allowed_packet`. Fix it by increasing the value both on the server (`my.cnf`) and by passing `--max-allowed-packet=256M` to mysqldump.

**The restore is painfully slow.** Normal for large databases: every `INSERT` in the dump gets executed with its indexes updated in real time. Adding `--disable-keys` to the dump (for MyISAM tables), or wrapping the import in a transaction with `--single-transaction` on the restore side where possible, helps a lot.

**Wrong charset after restoring.** As mentioned above, always create the destination database with the same charset as the original, and check it with `SHOW CREATE DATABASE database_name;` before importing, not after.

**The backup folder grows out of control.** Without rotation (like the `find -mtime +14 -delete` in the script above), you accumulate dumps for months until the disk fills up. [ncdu](/en/ncdu-disk-usage-from-the-terminal/) is the right tool to find that out — but it's better to prevent it with automatic rotation in the first place.

## Bottom line

mysqldump doesn't need complicated setup to be useful: a command with `--single-transaction` and `--quick`, a pipe into `gzip`, a scheduled script via cron, and rotation of old files are enough to sleep soundly. The one rule genuinely worth remembering is to test the restore at least once, on a throwaway database: a backup you've never tried to restore is, in practice, a backup you don't actually know works.
