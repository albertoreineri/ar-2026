---
title: "How DNS Works (and Why You Should Understand It)"
date: 2026-09-18
description: "A practical guide to DNS: what happens when you type an address, the A, CNAME, MX and TXT records you'll use, and the mistakes to avoid when you move hosting."
tags: ["Guides", "Web Dev"]
translationKey: "how-dns-works"
---

Every time a client tells me "the site is down," the first thing I check, even before the server, is **DNS**. Most of the time the problem isn't the site: it's that the domain is pointing somewhere it shouldn't, or a change made an hour ago hasn't propagated yet.

DNS is one of those pieces of infrastructure we all use every day without ever seeing it — until it breaks. Understanding how it works saves you hours of unnecessary panic and stops you from making silly mistakes when you switch hosting, email providers or SSL certificates.

## What DNS is, in two sentences

The **Domain Name System** is the internet's address book: it translates human-readable names (`albertoreineri.it`) into machine-readable IP addresses (something like `76.76.21.21`). Without DNS, you'd have to memorize numbers for every site you visit — something nobody wants to do.

The key thing to keep in mind is that **DNS isn't a single server**, but a distributed, hierarchical system of thousands of servers scattered around the world, each responsible for a piece of the information.

## What happens when you type an address

When you type `www.example.com` into your browser and hit enter, a chain of requests kicks off that usually takes just a few milliseconds:

1. The browser checks whether it already has the answer in **cache** (locally or at the OS level).
2. If it doesn't, the request goes to a **recursive DNS resolver** — usually your internet provider's, or a public one like `1.1.1.1` (Cloudflare) or `8.8.8.8` (Google).
3. If the resolver doesn't already have the answer cached, it asks the **root servers**, which point it to the server responsible for that top-level domain (`.com`, `.it`, etc.).
4. The **TLD** (top-level domain) server in turn points to the server responsible for that specific domain: the **authoritative name server**.
5. The authoritative name server finally returns the correct IP, which the resolver hands back to the browser.
6. The browser connects directly to that IP and loads the site.

<svg class="hi-diagram" width="300" height="260" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="180" y="20" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="120" y1="43" x2="180" y2="43" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="180" y="107" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="235" y1="66" x2="235" y2="107" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="180" y="194" width="110" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <line x1="235" y1="153" x2="235" y2="194" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="270" cy="204" r="6" class="hi-accent-dot"/>

  <path d="M180 230 C 80 230, 40 150, 65 66" class="hi-muted-stroke" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="65" cy="66" r="4" class="hi-muted-stroke" stroke-width="2"/>
</svg>

Left to right, top to bottom: **browser** → **recursive resolver** → **root/TLD server** → **authoritative name server** (highlighted), which replies with the IP and closes the loop back to the browser.

All of this happens in the background, usually in under 100 milliseconds, thanks to the fact that almost every step gets **cached** at various levels. And it's exactly that caching that causes the most common issue you'll run into as a developer or site owner: **propagation**.

## Why a DNS change "doesn't show up right away"

Every DNS record has a value called **TTL** (Time To Live), expressed in seconds, which tells resolvers how long they can keep that answer cached before asking again. If the TTL is 3600, a resolver that has already looked up that record might keep returning the old value for an hour, even if you've already changed it.

This is why, after switching hosting or updating a record, **not everyone sees the change at the same time**: it depends on which resolver they're using and when that resolver last made a request.

**Practical tip**: if you know you'll be making a major change (hosting migration, email switch), lower the TTL of the affected records to 300 seconds a few days beforehand. The change will propagate much faster, and you can always raise it again afterward.

## The DNS records you'll actually use

You don't need to know all of them, but you'll run into these constantly when working on sites and domains:

- **A** — points a domain name to an **IPv4** address (e.g. `example.com → 76.76.21.21`). The most common record, the one that points your site to the right server.
- **AAAA** — like an A record, but for **IPv6** addresses.
- **CNAME** — creates an **alias**: points a subdomain to another domain name instead of directly to an IP (e.g. `www.example.com → example.com`). Handy because if the IP behind it changes, you don't need to update every alias.
- **MX** — indicates which servers handle **email** for the domain, with a numeric priority (lower = higher priority). Get this wrong and email stops arriving.
- **TXT** — a free-text field, mostly used for **ownership verification** (Google Search Console, Cloudflare) and anti-spam records like **SPF** and **DKIM**, which tell mail servers which IPs are authorized to send email on behalf of your domain.
- **NS** — indicates which **name servers** are authoritative for the domain. If you move a domain to a new DNS provider, these are the records you need to update at your registrar.

## A common mistake: confusing the registrar with the DNS provider

When you register a domain, the **registrar** (where you buy it: GoDaddy, Namecheap, Google Domains…) isn't necessarily who manages its DNS records. You can perfectly well register a domain with one provider and manage its DNS with another — Cloudflare, for example, which offers a free, fast DNS panel with extra protections built in.

To do this, you just need to change the domain's **name servers (NS)** from your registrar's panel, pointing them to the ones provided by the new DNS provider. From that point on, it's the new provider that answers queries for that domain, not the registrar.

This is useful to know because it explains situations like: "I changed a record at my registrar but the site isn't changing" — maybe the actual DNS has been managed on Cloudflare for months, and editing records from the wrong panel simply has no effect.

## How to check your DNS configuration

From the terminal, with no external tools needed, you can query a domain's records directly:

```
dig example.com A
dig example.com MX
dig example.com TXT
```

Or, if `dig` isn't available (typical on Windows without WSL):

```
nslookup example.com
```

If you want to check whether a change has already propagated across different resolvers around the world, sites like whatsmydns.net query from dozens of locations at once, so you're not left waiting in the dark wondering if you did something wrong.

## In short

DNS isn't magic: it's a hierarchy of servers passing along the question "who's responsible for this domain?" until someone has the definitive answer, and that answer gets cached for however long you decided with the TTL. Knowing this takes away the anxiety of "the change isn't showing up" and helps you diagnose in thirty seconds problems that would otherwise seem mysterious: a domain that won't resolve, email that isn't arriving, a site loading the old version after a migration.

Next time you switch hosting, just remember two things: lower the TTL a few days beforehand, and always check with `dig` before blaming the server.
