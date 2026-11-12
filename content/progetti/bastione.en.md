---
title: "Bastione"
seoTitle: "Bastione: a medieval strategy game in the browser"
description: "A medieval strategy game in the browser: build a village, manage resources and defend it from enemy waves. Free, no install."
date: 2026-11-12
translationKey: "project-bastione"
url: "/en/projects/bastione/"
projectType: "Game · Personal project"
projectUrl: "/bastione/"
projectLinkLabel: "Play now →"
image: "img/projects/bastione.jpg"
imageWidth: 1920
imageHeight: 1047
imageAlt: "Bastione: a medieval village with a fortress, houses, a stone quarry and fields, surrounded by a river and forests, with the resource bar and an enemy wave on the way"
---

Bastione is a medieval strategy game that runs in the browser: build a village, manage its resources and hold off the waves of enemies coming from the rival castle. No install, no account: open the page and play.

- **Status**: online, 3 playable levels
- **Built with**: plain JavaScript and [Phaser 3](https://phaser.io/) for the game engine, with art from [Kenney](https://kenney.nl/) (CC0 licence)
- **Made by**: me, alone, with AI as a hand to speed up the build

A note on language: the interface is in Italian — resources, building names, menus. The game is driven by icons and position, so it's playable without reading a word, but the text itself won't be translated.

## Why I made it

I like management and real-time strategy games, and I wanted to understand what it takes to build one: a map, a self-sustaining economy, pathfinding that doesn't break with dozens of units moving at once, an enemy that does more than walk in a straight line. Bastione is the result: small enough to finish, complete enough to be an actual game.

## What it does

- **Build a village** on a map with trees, stone, iron, rivers and water: woodcutters, quarries, mines, farms, cows, a bakery, a market, houses.
- **The economy runs on its own**: workers gather and deliver resources (wood, stone, iron, grain, bread, cheese, gold) without constant micromanagement; the market buys and sells what's missing or spare.
- **Raise an army** at the barracks — archers, infantry, armoured troops, catapults — and build walls, gates, a moat and towers to defend the perimeter.
- **The enemy attacks in waves** from its own castle, with its own defenders and towers, and heads straight for your buildings if it breaks through: you need to close the gaps before it arrives.
- **3 levels** with different maps and difficulty.
- **Works on phones too**: one-finger scrolling, pinch zoom, buttons built for touch.

## How it's built

The engine is [Phaser 3](https://phaser.io/), loaded from a CDN; everything else is plain JavaScript, no build step and no framework — `.js` files loaded one after another on the page, no bundler. The art uses sprites from Kenney's *RTS: Medieval* pack, under a CC0 licence.

The parts that took the most time:

- **Pathfinding**: units have to move across a map with trees, water, buildings and walls that keep changing, without blocking each other or walking through obstacles.
- **Balancing**: resource costs and yields, wave timing, fortress health — all numbers tuned by hand, playing and replaying until the difficulty curve felt right.
- **Touch controls**: the mouse-first interactions (drag to build a wall, click to select) need a parallel interface for anyone playing on a phone, with confirm buttons instead of drags.

## Where to find it

You play it directly online, at [Bastione](/bastione/): no sign-up, no download.
