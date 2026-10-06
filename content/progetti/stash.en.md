---
title: "Stash"
seoTitle: "Stash: compare Italian bonds, ETFs and deposit accounts"
description: "A browser app to compare Italian bonds, ETFs and deposit accounts after tax. No account, no server: your data stays on your computer."
date: 2026-10-06
translationKey: "project-stash"
url: "/en/projects/stash/"
projectType: "Web app · Open source"
projectUrl: "https://github.com/albertoreineri/Stash-Demo"
projectLinkLabel: "See the code on GitHub ↗"
image: "img/projects/stash.jpg"
imageWidth: 1920
imageHeight: 1046
imageAlt: "Stash, the Bonds page: filters for maturity, country and risk, and a table of Italian government bonds and other securities with net annual yield and a comparison with inflation and a deposit account"
---

Stash is the app I use to keep track of the financial data I care about: Italian government bonds, ETFs, funds, certificates and deposit accounts. It runs entirely in the browser, with no account and no server: your data stays on your computer.

- **Status**: I use it myself; the code is public on GitHub, under the MIT licence
- **Built with**: HTML, CSS and JavaScript with no build step, plus Node.js scripts for the data
- **Data sources**: Borsa Italiana, Yahoo Finance, Eurostat and the ECB
- **Made by**: me, alone, as a hobby

## Why I built it

I wanted one place for the financial data I care about, with returns calculated after tax and costs on an amount of my choosing. I made it for myself, as a hobby, and built it so that the data stays on my computer: no account, no server.

## What it does

- **Bonds**: it compares BTPs, BOTs and other government bonds by net yield after tax and costs, on the amount you choose. It applies 12.5% tax on Italian government bonds and 26% on the rest. There are filters for maturity, country, currency and risk, a 30-day trend, a comparison with inflation and a deposit account, and CSV export.
- **ETFs**: it projects historical returns over a number of years of your choosing, with 26% tax, and shows volatility too.
- **Funds, certificates and deposit accounts**: prices come from public pages. For deposit accounts the value is calculated from the gross rate and maturity.
- **Journal**: favourites, purchases (valued from public prices, or from rate and maturity, or entered by hand) and reflection notes, to write down why you made a choice and read it back later. Everything stays in the browser, with JSON export and import.
- **A guide for every page**: the first time, it opens by itself and explains how to read the page.

## How it's built

The site is a static folder: HTML, CSS and JavaScript, with no build step. No framework, no intermediate stages: you publish it as it is on GitHub Pages or Cloudflare Pages, and once it's open it works offline too.

The data is updated by Node.js scripts that read public sources: Borsa Italiana and Yahoo Finance for prices, simpletoolsforinvestors.eu for the list of government bonds, Eurostat for inflation and the ECB for deposit rates. To update it every day I use GitHub Actions, with a scheduled workflow that runs the scripts and saves the data files: free on a public repository, and with no server to maintain. There are also optional notifications via Telegram or email.

The interface is in Italian, on purpose: the tools and the tax rules are Italian.

### Public version and private version

The repository on GitHub is the public version: no personal data, with sample data (there's a sample journal you can import) and no server at all.

In my private version, with my real data, I added two small functions on Cloudflare Pages. One syncs the journal with a JSON file in a repository, and it's the one behind the "Sincronizzato" label you can see in the screenshot. The other starts the data update from a button. Neither is included in the public version.

## What I learned

- Public sources are unofficial and change format without notice, so I only trust what I've checked. I compared each source with my bank's figures: on five instruments, the calculated value matches the statement to the cent.
- For deposit accounts the formula (interest = capital × rate × days / 365, taxed at 26%) reproduces the interest the bank's app shows.
- A static site can do a lot, but it can't run commands or read sites that block requests from the browser. Updating the data on demand takes a small server function.

## Disclaimer

Stash is not financial advice: it shows public data and simple calculations, and the decisions are up to whoever uses the tool. It's a hobby I built for personal use and share as it is, with no warranty of any kind.
