---
title: "Typewriter Note"
seoTitle: "Typewriter Note: a minimal typewriter-style notes app"
description: "A blank sheet in the browser, in the style of a typewriter: no formatting, just the text. Designed, built and launched by me."
date: 2026-10-06
translationKey: "project-typewriter-note"
url: "/en/projects/typewriter-note/"
projectType: "Web app · Personal project"
projectUrl: "https://typewriternote.com"
image: "img/projects/typewriternote.jpg"
imageAlt: "Typewriter Note: the list of notes on the left and an open note on the right, in monospace type"
---

Typewriter Note is a notes app that gets out of your way. It runs in the browser, uses a monospace font and has a full-screen focus mode that hides everything except the text. No headings, no bold, no font picker: I took them out, on purpose.

- **Status**: online since 20 September 2026, at an early stage
- **Built with**: Cloudflare Pages, Functions and D1
- **Made by**: me, alone, in my spare time

## Why I built it

I wanted a place to write short stories without twenty windows open: a blank sheet and nothing else. Most note apps keep adding features. I wanted one that does the opposite. Taking things out is harder than adding them, which is exactly why it interested me.

## What it does

- Monospace type and plain text only: no headings, bold or font choices, on purpose.
- A full-screen focus mode that hides everything but the text.
- Tags to sort your notes, and a trash bin to restore the ones you deleted.
- Word and character count.
- Export of your notes to CSV.
- It installs as an app on desktop and mobile, with a light and a dark theme.

## What it doesn't do

It doesn't handle chapters or complex projects, and it doesn't pretend it can: the app says so openly. If you're writing a novel with a structure to manage, a tool built for that will serve you better. This one is for the first draft of the short thing.

## How it's built

Hosting and backend run on Cloudflare: Pages for the site, Functions for the server-side code and D1 for the database, all on the free plan. There's no traditional server to patch or keep running, and while the project is small it costs almost nothing to host.

This is the stack of an early-stage project, and I picked it on purpose: I wanted to get it online simply, without adding more management work on top of the servers I already look after. The price is depending on one platform and its limits, a price I'm happy to pay for now. If the project takes off, I'll look at more robust solutions. For now, simple beats scalable.

## Accounts and privacy

You sign up with an email and a password, with email verification. There's also a demo that needs no account, limited to three notes.

I didn't do privacy by halves. The site has a cookie banner built on Google Consent Mode v2 (Google Analytics only starts if you accept) and a real privacy policy. You can delete your account from the settings, and your data is permanently removed after 30 days.
