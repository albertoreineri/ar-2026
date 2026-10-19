---
title: "Let's Encrypt and Certbot: Free SSL Certificates, Explained Properly"
date: 2026-10-19
description: "How to get and automatically renew free SSL certificates on a Linux server with Certbot and Let's Encrypt, without relying on your hosting control panel."
tags: ["Guides", "Linux"]
translationKey: "lets-encrypt-certbot-guide"
---

A few years ago I wrote [a guide on redirecting http to https](/certificato-ssl-come-reindirizzare-http-a-https/) (article in Italian), assuming your hosting gives you an "Enable SSL" button in a control panel. That works great on shared hosting with cPanel or Plesk. But if you manage a VPS yourself — a plain Ubuntu instance running Nginx or Apache with no control panel — that button doesn't exist. You have to get and renew the certificate from the terminal yourself, and that's where **Let's Encrypt** and **Certbot** come in.

The good news: the process is simpler than it sounds, and it fully automates. Set it up once, and you never have to think about it again.

## What Let's Encrypt is

Let's Encrypt is a **free Certificate Authority (CA)**, run by a nonprofit (the Internet Security Research Group), that issues SSL/TLS certificates validated through an automated protocol called **ACME**. Before it existed, an SSL certificate cost tens of dollars a year and had to be renewed by hand, often forgotten about until the site started showing a "not secure" warning.

Let's Encrypt changed the rules with two deliberate choices:

- **certificates are free**, with no meaningful limit on the number of domains;
- **they last only 90 days**, specifically to push everyone toward automating renewal instead of doing it manually once a year.

That short lifespan is unsettling at first, but it's the whole point: if renewal is automated, 90 days versus a year makes no difference to you. If renewal is manual, 90 days forces you not to forget about it.

## What Certbot is

Certbot is the most widely used **ACME client** for talking to Let's Encrypt from the command line. It handles three things:

1. proving to the Let's Encrypt server that you actually control the domain you're requesting a certificate for;
2. downloading and installing the resulting certificate;
3. optionally setting up automatic renewal.

It's maintained by the Electronic Frontier Foundation and supports the most common web servers through dedicated plugins that edit your Nginx or Apache configuration for you.

## Prerequisites

Before starting, make sure you have:

- a **domain** that already points to your server's public IP (an up-to-date A or AAAA record — Let's Encrypt verifies the domain, not the IP);
- **Nginx or Apache** already running, with a virtual host configured for that domain;
- **ports 80 and 443 open** to the outside world. If you use UFW, [I've covered that in another article](/ufw-firewall-guide-ubuntu/): `sudo ufw allow "Nginx Full"` if you're on Nginx, or the equivalent profile for Apache.

Without these three conditions the certificate request will fail: Let's Encrypt needs to reach your server on port 80 (or 443, depending on the verification method) to confirm the domain is really yours.

## Installing Certbot

On Ubuntu and Debian, the most up-to-date way to install Certbot is via `snap`, since the apt package is often an older version:

```
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

If you'd rather stick with apt (fine too, just with a slightly older version):

```
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Swap `python3-certbot-nginx` for `python3-certbot-apache` if your web server is Apache.

## Requesting a certificate

With the Nginx plugin installed, the whole process comes down to one command:

```
sudo certbot --nginx -d yoursite.com -d www.yoursite.com
```

Certbot will ask for an email address (used for expiry notices, in the unlikely case automation fails) and have you accept the terms of service. Then it will:

1. verify you control the domain by answering an HTTP-01 challenge on port 80;
2. obtain the certificate from Let's Encrypt;
3. **automatically edit your Nginx configuration** to use the certificate and redirect http to https, if you agree to it.

For Apache the command is identical, just swap the flag:

```
sudo certbot --apache -d yoursite.com -d www.yoursite.com
```

If you'd rather Certbot not touch your web server config at all (say, because you manage it with a configuration-management tool like Ansible), you can get just the certificate with the standalone or webroot method:

```
sudo certbot certonly --webroot -w /var/www/yoursite -d yoursite.com
```

In this case the certificate ends up at `/etc/letsencrypt/live/yoursite.com/`, and it's up to you to reference it manually in your config.

## Automatic renewal

This is where Certbot really pays off compared to a certificate you bought by hand: installing it via snap or apt automatically registers a **systemd timer** (or, on older systems, a cron entry) that runs a check twice a day:

```
systemctl list-timers | grep certbot
```

The command the timer runs is essentially `certbot renew`, which **doesn't blindly renew everything**: it checks each certificate's expiry date and only renews the ones expiring within 30 days. You can run it manually at any time, it's harmless:

```
sudo certbot renew
```

<svg class="hi-diagram" width="300" height="260" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="40" r="22" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="82" y1="40" x2="130" y2="40" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="130" y="16" width="140" height="48" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="200" y1="64" x2="200" y2="94" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="130" y="96" width="140" height="48" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="245" cy="106" r="6" class="hi-accent-dot"/>
  <line x1="200" y1="144" x2="200" y2="174" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="130" y="176" width="140" height="48" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="130" y1="200" x2="90" y2="200" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="90" y1="200" x2="90" y2="62" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="90" y1="62" x2="60" y2="62" class="hi-muted-stroke" stroke-width="2"/>
</svg>

The circle on the left is the systemd timer waking up twice a day; from there it moves down through three steps on the right: check each certificate's expiry, renew (the highlighted box) only the ones within 30 days, then reload Nginx or Apache to pick up the new certificate — and the line looping back to the circle is the cycle repeating on its own, with no intervention from you.

To make sure everything works without waiting 60 days and finding out too late, use the dry run:

```
sudo certbot renew --dry-run
```

If this command succeeds, the real renewal will work the same way when the time comes.

## Wildcard certificates

If you need to cover every subdomain (`*.yoursite.com`) with a single certificate, the HTTP-01 challenge isn't enough — you need **DNS-01** verification, which requires creating a temporary TXT record on your DNS. Certbot supports this through plugins for the most common DNS providers (Cloudflare, Route53, DigitalOcean), which automate that step too:

```
sudo apt install python3-certbot-dns-cloudflare
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini -d "*.yoursite.com" -d yoursite.com
```

The credentials file holds an API token scoped to DNS management: treat it like a password and lock it down to `600` permissions.

## Common issues

**"Challenge failed" on the initial request.** Almost always a networking issue, not a Certbot one: the domain isn't pointing to the server yet, or a firewall (UFW, your cloud provider's firewall, or both) is blocking port 80 from the outside. Check with `curl -I http://yoursite.com` from a different machine.

**Rate limit hit.** Let's Encrypt limits you to 50 certificates per registered domain per week, and 5 identical duplicates per week. This happens when you run too many tests on the same domain in a short time: use the staging environment (`--staging`) until you're confident everything works, then switch to the real request.

**Automatic renewal doesn't seem to have run.** Check the logs with `journalctl -u certbot.timer` and `cat /var/log/letsencrypt/letsencrypt.log`: the cause is almost always a port that got closed in the meantime (a firewall reconfiguration) or a virtual host whose name changed over time.

## Bottom line

Let's Encrypt and Certbot turned HTTPS into the default configuration instead of a paid exception: install Certbot, request the certificate once, and from that point on renewal is a problem you've delegated to the system. The only real investment is getting the first setup right — domain correctly pointed, ports open, the right plugin for your web server — after which it's one of those things that, done properly once, needs no more thought for years.
