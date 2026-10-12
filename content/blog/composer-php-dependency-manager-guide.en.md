---
title: "Composer: a practical guide to PHP's dependency manager"
date: 2026-10-12
description: "What Composer is, how composer.json and composer.lock work together, the commands I use every day, semantic versioning, and the most common mistakes in modern PHP projects."
tags: ["Guides", "PHP"]
translationKey: "composer-guide"
---

If you've worked with PHP for a while, you've definitely run into a `composer.json` file inside a Laravel project, a command-line script, or a somewhat more serious WordPress plugin. **Composer** is PHP's dependency manager: it downloads the libraries your project needs, makes sure their versions are compatible with each other, and generates the autoloader, so you stop writing `require` by hand for every single file.

In this guide: what it actually does, the commands I use every day, and the mistakes almost everyone trips over the first time.

## What Composer is, and why you can't go back

Before Composer, PHP libraries were downloaded by hand, copied into a `libs/` folder, and included with `require_once`. It worked, but it had two big problems: updating a library meant overwriting files manually, and if two libraries depended on different versions of a third one, you'd only find out about the conflict in production, in the worst possible way.

Composer solves both problems. You declare **what you need** (e.g. "Monolog version 3, Guzzle version 7"), and it takes care of:

- downloading those libraries and all of their dependencies, cascading down;
- working out a set of versions that are compatible with each other;
- generating an autoloader that loads classes on demand, with no `require` statements scattered around.

Today, pretty much every modern PHP framework (Laravel, Symfony, Slim) and plenty of standalone libraries are installed this way. Even WordPress, in more structured projects, uses it to manage custom plugins and libraries instead of the usual FTP upload.

## composer.json and composer.lock: what each one is actually for

These are the two files Composer reads and writes, and the difference between them is what causes the most confusion.

**`composer.json`** is the one you write (or that Composer writes for you when you add a package). It contains version **constraints**, not exact versions:

```json
{
  "require": {
    "monolog/monolog": "^3.0",
    "guzzlehttp/guzzle": "^7.8"
  }
}
```

**`composer.lock`** is generated automatically by Composer and contains the **exact versions** that were actually installed, along with hashes to verify their integrity. You never write it by hand.

Why do you need the lock file? Because `^3.0` is a constraint that might resolve to `3.0.0` today and to `3.4.2` next month, if new compatible versions come out in the meantime. Without the lock file, two developers cloning the same repository at different times could end up with slightly different versions of the same libraries, and a bug that only shows up on one machine is one of the most frustrating things to debug.

**The lock file should always be committed to git**, even though that can feel counterintuitive for a "generated" file. It's the only way to guarantee that you, a teammate, and the production server are all running exactly the same versions.

## The commands I use every day

### composer install vs. composer update

This is the most important distinction, and the one that causes the most damage when it gets confused:

```
composer install
```

Reads `composer.lock` and installs **exactly** those versions. It doesn't touch the lock file. This is the command you run when you clone an existing project, and the one that should run in production or CI.

```
composer update
```

Ignores the locked versions, recalculates the latest versions compatible with the constraints in `composer.json`, and **overwrites** `composer.lock`. This is the command you run when you deliberately want to update dependencies — not the one you use to "spin up" a project you just cloned.

A simple rule: if you haven't just edited `composer.json` by hand and don't want to update anything, use `install`.

### Adding and removing packages

```
composer require guzzlehttp/guzzle
composer require --dev phpunit/phpunit
composer remove guzzlehttp/guzzle
```

`--dev` installs the package only as a development dependency (tests, linters, a debug bar): it won't be downloaded when someone installs the project in production with `composer install --no-dev`.

### Autoloading: no more manual require statements

Once something is installed, in your code it's just:

```php
require __DIR__ . '/vendor/autoload.php';

use Monolog\Logger;
$log = new Logger('app');
```

Composer generates `vendor/autoload.php` by following the **PSR-4** standard: a convention that maps class namespaces to folders on disk. It also works for your own code, not just external libraries: in the `autoload` section of your `composer.json` you can say "the `App\\` namespace maps to the `src/` folder", and suddenly your own classes load themselves too, with no `require` in sight.

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "src/"
    }
  }
}
```

After changing this section you need a `composer dump-autoload` to regenerate the map.

## What actually happens when you install something

<svg class="hi-diagram" width="220" height="300" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="16" width="180" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="110" y1="62" x2="110" y2="92" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="20" y="92" width="180" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="175" cy="102" r="6" class="hi-accent-dot"/>
  <line x1="110" y1="138" x2="110" y2="168" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="20" y="168" width="180" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="110" y1="214" x2="110" y2="244" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="20" y="244" width="180" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
</svg>

Top to bottom: **composer.json**, with the version constraints you wrote → Composer's **resolver** (highlighted, since it's the crucial step), which works out a dependency tree where every constraint is satisfied at once → **composer.lock**, with the exact versions found and verified → the **vendor/** folder, with the downloaded code and the generated, ready-to-use autoloader.

The tricky part is exactly the resolver: if two libraries require incompatible versions of a third dependency, that's where the operation stops, before a single file is even downloaded.

## Semantic versioning and constraints: what ^ and ~ mean

The symbols in front of version numbers in `composer.json` follow **semantic versioning** (MAJOR.MINOR.PATCH, e.g. `3.4.2`):

- **`^3.4`** – allows updates that don't change the MAJOR number: `3.5.0` and `3.99.0` are fine, `4.0.0` is not. This is the constraint I use almost always: by convention, a MAJOR version bump is allowed to contain breaking changes.
- **`~3.4`** – stricter, only allows PATCH-number updates: `3.4.9` is fine, `3.5.0` is not.
- **`3.4.2`** (no symbols) – pins that exact version, no automatic updates. Only useful in specific cases, since you're giving up even automatic security patches.
- **`*`** – any version. Almost always worth avoiding: it's a bet that whatever the next version turns out to be, it won't break anything.

In practice, `^` is the right balance between "I get fixes and improvements" and "I don't end up with versions that change their API without warning."

## Composer and WordPress: why it's different here

In a Laravel or Symfony project, Composer manages the *entire* project: even the framework itself is a dependency in `composer.json`. In WordPress, things are more of a hybrid, because core and most plugins are still installed from the dashboard or via FTP, not through Composer.

Where Composer becomes genuinely useful in a WordPress project is for the **custom libraries** you use in your plugins or themes: an HTTP client, a PDF parser, a validation library. Instead of downloading a zip by hand and dropping it into a `libs/` folder, you require it with `composer require` and get versioning, updates and autoloading for free. Some more advanced setups ([Roots' Bedrock](https://roots.io/bedrock/), for instance) push the idea further, managing WordPress core and WPackagist plugins through Composer too, but that's an extra step that only makes sense once a project is already structured enough to benefit from it.

## Common mistakes

### "Your requirements could not be resolved to an installable set of packages"

This is the resolver failing to find a combination of versions that satisfies every constraint. Before panicking, try `composer why-not vendor/package 3.0`: it tells you exactly which other dependency is blocking that version. Often the fix is to update the library causing the conflict too, not just the one you're trying to install.

### Should vendor/ be committed to git?

**No**, `vendor/` should never go into git. It's bulky, it contains third-party code that isn't yours, and `composer.lock` is enough to recreate it identically with a `composer install`. The one real exception is some very locked-down deploy environments with no internet access during deploy, where carrying `vendor/` along is preferred: a rare case, not the rule.

### "Allowed memory size exhausted" during an update

Composer's resolver can be memory-hungry on projects with a lot of dependencies. If this happens, try:

```
COMPOSER_MEMORY_LIMIT=-1 composer update
```

which temporarily removes PHP's memory limit for that command. If the problem keeps happening on a low-RAM server, it's worth running the update locally and only shipping the updated `composer.lock` to production, running just `composer install` there.

## In short

`composer install` to install what's already locked in the lock file, `composer update` only when you actually want to update versions, `^` as the default constraint in most cases, and `composer.lock` always committed to git. With these few rules in mind, the part of Composer that seems most mysterious — why does my teammate have a different version of the same library? — stops being a mystery.

If you're setting up a PHP project from scratch, you might also be interested in my guide on [how to choose a framework](/come-scegliere-un-framework/) (article in Italian), or, if you'd rather start from a CMS, [the must-have plugins for every WordPress site](/i-plugin-indispensabili-per-ogni-sito-wordpress-facile-da-installare-e-configurare/) (article in Italian).
