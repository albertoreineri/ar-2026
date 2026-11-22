---
title: "ScrollShame"
seoTitle: "ScrollShame: the Chrome extension that catches you doomscrolling"
description: "Free Chrome extension that calls you out, with growing irony, every time you open social media during work hours. No data collection."
date: 2026-11-22
translationKey: "project-scrollshame"
projectType: "Chrome extension · Personal project"
projectLinks:
  - label: "Install on Chrome ↗"
    url: "https://chromewebstore.google.com/detail/scrollshame/mgdncpkoggbpoddllnimhdcbcjljnafb"
    external: true
  - label: "Privacy Policy"
    url: "/en/scrollshame-privacy/"
image: "img/projects/scrollshame.jpg"
imageWidth: 1920
imageHeight: 1049
imageAlt: "ScrollShame in action on Facebook, Movement tone: a «Statue mode activated» popup nudging you to get up, with «You're right, I'm up» and «Keep going, who cares» buttons"
---

ScrollShame is the Chrome extension that interrupts you — with growing irony — every time you open a social media site during work hours. The more you go back to it in the same day, the sharper the message gets: it starts with a gentle nudge and ends with a playful dig.

- **Status**: published on the Chrome Web Store
- **Built with**: Chrome Extension Manifest V3, vanilla JavaScript, Shadow DOM, `chrome.storage`
- **Languages**: Italian and English, using Chrome's native i18n system
- **Made by**: me, on my own, for fun

## Why I made it

The problem isn't deciding not to open social media during work hours: it's that you do it without even noticing, out of reflex. A hard block didn't convince me — too rigid, and there's always a legitimate reason to open that tab. I wanted something that would interrupt the reflex with a moment of self-deprecating humour, and get progressively more direct if the reflex keeps repeating on the same day.

## What it does

- **3 selectable tones**: Movement (a nudge to walk around or stretch), Focus (a push against procrastination), and Philosophical (an ironic reflection on how time slips away)
- **Customizable active hours and days**, for example weekdays only during office hours
- **Quick snooze** for 30 minutes, 1 hour, 4 hours or until the next day, plus an automatic truce for anyone opening several tabs in a row
- **No data collection**: everything stays on the device, no account, no server

## How it's built

It's a Manifest V3 extension with a content script running on the supported social domains (Facebook, Instagram, YouTube, X/Twitter, LinkedIn, TikTok). The message is injected inside a **Shadow DOM**, to isolate its style from the host page's without `!important` everywhere. Preferences — tones, hours, days, snoozes — are saved with `chrome.storage`, and the two languages use Chrome's native i18n system instead of an external library.

## Privacy

The extension doesn't collect or transmit any data: everything stays local. Full details in the [privacy policy](/en/scrollshame-privacy/).
