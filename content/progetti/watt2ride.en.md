---
title: "Watt2Ride"
seoTitle: "Watt2Ride: an e-bike charging points map"
description: "A map to find where to charge your e-bike, with OpenStreetMap data refreshed every week and community contributions. Built by me."
date: 2026-10-06
translationKey: "project-watt2ride"
url: "/en/projects/watt2ride/"
projectType: "Web app · Personal project"
projectUrl: "https://watt2ride.com"
image: "img/projects/watt2ride.jpg"
imageWidth: 1920
imageHeight: 1050
imageAlt: "Watt2Ride: the map of e-bike charging points grouped by area, over Piedmont and the neighbouring regions"
---

Watt2Ride is a map for e-bike riders who want to know where to charge before finding out halfway along the route. The data comes from OpenStreetMap and refreshes itself every week; users fill in the rest, with favourites, reviews and suggested points. Around it there's a presentation site and a blog, in English and Italian.

- **Status**: online, at an early stage
- **Built with**: vanilla JavaScript, Cloudflare Pages, Functions and D1, OpenStreetMap
- **Made by**: me, alone, from the idea to the deploy, with AI helping to speed up the build

## Why I built it

I have an electric bike, and when I go somewhere I don't know I always have to work out the distances at home, before leaving, to be sure I can get back. Having to pedal all the way home for 25 km isn't pleasant and would ruin the ride.

So I built the map I needed: one that tells me where I can charge, without having to do the sums beforehand.

## What it does

- A public map you can browse without an account. Signing up is only needed to save favourites, write reviews and suggest new points.
- For each charging point it shows the useful details (cost, opening hours, date of the last survey) and the bars or services nearby.
- It tells you how complete a point's data is and warns you when the position is approximate. From there you can open the point on Google Maps or OpenStreetMap, or suggest an edit.
- Address search, with suggestions as you type. Favourites live in a list, and you can show them all on the map at once.
- It installs as an app on your phone (PWA).
- A bilingual interface, Italian and English, with a presentation site and a blog.
- A protected admin panel, to moderate the points suggested by users.

<div class="project-shots">
  <figure class="project-shot">
    <img src="/img/projects/watt2ride-mobile.jpg" alt="Watt2Ride on a phone: the map with the filter button and a bar with Near me, Search, Favourites and Menu" width="640" height="1028" loading="lazy">
    <figcaption>On a phone: a full-screen map and a bar with the main actions.</figcaption>
  </figure>
  <figure class="project-shot">
    <img src="/img/projects/watt2ride-details.jpg" alt="A charging point's details in the dark theme: a warning about the approximate position, data completeness at 20%, links to Google Maps and OpenStreetMap, and buttons to save to favourites and suggest an edit" width="900" height="907" loading="lazy">
    <figcaption>A point's details: position warning, data completeness, external links, favourites and review.</figcaption>
  </figure>
</div>

## How it's built

A premise first: this is the stack of an early-stage project, and it's simple on purpose. I wanted to get it online simply, without adding more management work on top of the servers I already look after. If the project takes off, I'll look at more robust solutions.

### No framework

Plain HTML, CSS and JavaScript, with a few Node scripts that have no npm dependencies. Not because I can't use frameworks: it's a deliberate choice, to keep the site light and easy to maintain, with no toolchain to keep updated.

### Serverless backend

The backend runs on Cloudflare Pages Functions, with a D1 database (SQLite). There's no traditional server to manage.

### Home-made authentication

- Passwords with **PBKDF2**, through Web Crypto.
- Sessions with HttpOnly cookies.
- Rate limiting.

I tuned the number of hash iterations to Cloudflare's free-plan limit of 10 ms of CPU. The number is stored for each user, so I can raise it in the future without invalidating existing accounts.

### The data pipeline

The charging point data isn't queried on every visit: a pipeline prepares it and publishes it as a static file. Once a week it starts on its own, and I don't have to do anything.

```
Overpass API → cleanup and deduplication → reverse geocoding → static JSON file
```

- **Cleanup**: it discards false positives, such as chargers for cars, which are of no use to e-bike riders.
- **Schedule**: every week with GitHub Actions, which also does the deploy.
- **Nearby points of interest**: a separate file, loaded only when the first panel opens. The site stays light and doesn't load a public service like Overpass.

### User data and the ODbL licence

User data (favourites, reviews) is kept structurally separate from the OpenStreetMap data, to respect the ODbL licence the latter is distributed under.

### Semi-automated content and social

The pipeline fetches photos from Pexels, generates the Instagram carousels (1080×1350, with Playwright) and queues them on Buffer for Instagram and Facebook.

### Controlled deploys

A `dist/` folder holds only the public files. Content-hash cache busting stops installed PWAs from staying stuck on an old version.

### Privacy

Google Analytics uses Consent Mode v2 with a cookie banner, so nothing is tracked before consent.
