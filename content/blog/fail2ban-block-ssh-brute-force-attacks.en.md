---
title: "Fail2ban: how to automatically block SSH brute-force login attempts"
date: 2026-09-28
description: "A practical guide to Fail2ban: how to install it, configure the SSH jail, understand bantime/findtime/maxretry, and extend it to other services without locking yourself out."
tags: ["Guides", "Linux"]
translationKey: "fail2ban-guide"
---

If you've ever opened the logs on a server with SSH exposed to the internet, you've seen this: hundreds of failed login attempts a day, usernames like `root`, `admin` or `test`, coming from IPs scattered all over the world. It's not a targeted attack on you specifically — it's bots constantly scanning the internet for open port 22 and weak passwords. **Fail2ban** is the simplest tool for turning that noise into automatic blocks instead of something you just learn to ignore.

## Why your server is already under attack

Your site doesn't need to be famous, and you don't need to have done anything to attract attention. Just having a public IP with SSH open is enough to become an automatic target. These bots don't know who you are: they try common username/password combinations, betting that someone, somewhere, left `admin`/`admin123` in place.

The real risk isn't so much that they'll guess a password (if you use SSH keys and have disabled password login, that risk is essentially zero) — it's the load these attempts generate: logs filling up, CPU wasted on authentication, and in the worst cases, actual unauthorized access on poorly configured servers.

## What fail2ban actually does

Fail2ban **is not a firewall**: it's a service that reads system logs, looks for patterns of failed authentication, and when an IP crosses a threshold of attempts within a given time window, tells the firewall to block it temporarily. It's the smart layer that decides "who" gets banned; the actual blocking is carried out by `iptables`, `nftables` or `firewalld`, depending on how the system is set up.

The whole thing runs on three concepts that show up in every configuration:

- **filter** — the regular expression that identifies a failed attempt in a log line (e.g. "Failed password for" in SSH logs).
- **jail** — the configuration that connects a filter to a specific service (SSH, Nginx, WordPress) along with its thresholds.
- **action** — what happens once the threshold is crossed: usually banning the IP in the firewall and, optionally, sending a notification.

<svg class="hi-diagram" width="300" height="230" viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="16" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="70" y1="62" x2="70" y2="92" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="94" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="70" y1="140" x2="70" y2="170" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="172" width="120" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="105" cy="182" r="6" class="hi-accent-dot"/>

  <line x1="130" y1="195" x2="180" y2="195" class="hi-muted-stroke" stroke-width="2"/>
  <rect x="180" y="172" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
</svg>

Top to bottom: system log (SSH) → filter that recognizes failed attempts → jail that counts against the thresholds and decides on the ban (highlighted) → firewall action that blocks the IP.

## Installing on Ubuntu/Debian

Fail2ban ships in the standard repositories of pretty much every distro. On Ubuntu or Debian:

```
sudo apt update
sudo apt install fail2ban
```

On dnf-based systems (Fedora, AlmaLinux, Rocky):

```
sudo dnf install fail2ban
```

Once installed, the service starts with a reasonably sane default configuration, but **don't edit it directly**. The files in `/etc/fail2ban/jail.conf` get overwritten on every package update: your customizations belong in a separate file that fail2ban automatically reads afterward.

```
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

## Setting up the SSH jail

Inside `jail.local` you'll find the `[sshd]` section. The three settings that actually matter are these:

```
[sshd]
enabled = true
port = ssh
maxretry = 5
findtime = 10m
bantime = 1h
```

- **maxretry** — how many failed attempts are allowed before the ban kicks in. 5 is a solid middle ground: low enough to stop bots, high enough that you won't get banned over a single password typo.
- **findtime** — the time window those attempts are counted within. If an IP exceeds `maxretry` attempts within 10 minutes, the ban triggers.
- **bantime** — how long the IP stays blocked. An hour is a good starting point; for persistent bots you can go much higher, using formats like `1d` or `1w`.

One setting worth adding right away is `bantime.increment`, which progressively increases the ban duration for anyone who keeps trying after being unbanned:

```
[DEFAULT]
bantime.increment = true
bantime.factor = 2
bantime.maxtime = 1w
```

After any change, restart the service:

```
sudo systemctl restart fail2ban
```

## Don't lock yourself out

The most common mistake — especially the first time you set up fail2ban on a remote server — is getting locked out of your own machine after a few failed attempts (often while testing a new SSH key). The fix is to whitelist your own IP with `ignoreip`, in the `[DEFAULT]` section:

```
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 YOUR.IP.HERE
```

You can list multiple addresses or subnets separated by spaces. If you work from IPs that change often (a company VPN, mobile networks), consider going a step further: authenticate **only** with SSH keys and disable password login entirely. At that point a bot guessing a password can't get in anyway, and you can safely raise `maxretry` without worrying about it.

## Checking what's actually happening

Fail2ban ships a command-line client to check its status in real time:

```
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

The second command shows how many IPs are currently banned on the SSH jail, along with their addresses. If you need to manually unban an IP (because it was yours, or because you changed your mind):

```
sudo fail2ban-client set sshd unbanip 123.45.67.89
```

For a detailed log of every ban and unban, with the reason attached:

```
sudo tail -f /var/log/fail2ban.log
```

## Extending it to other services

Fail2ban isn't just for SSH. Most distributions ship ready-made filters for Nginx, Apache, Postfix and other common services: just enable the matching jail in `jail.local`. For example, to block repeated attempts against `wp-login.php` on a WordPress site behind Nginx:

```
[nginx-botsearch]
enabled = true
```

For more specific cases, like protecting a WordPress login directly, you'll often need a custom filter that matches the exact log line your setup produces (this depends on how your stack logs failed attempts). The principle is exactly the same as the SSH jail — only what counts as a "failed attempt" changes.

## Bottom line

Fail2ban doesn't replace strong SSH keys, a properly configured firewall, or regular updates — but it's the simplest and most effective automatic defense against the background noise of the internet: bots knocking at random, every day, on every server exposed online. Install it, set up an SSH jail with sane thresholds, whitelist your own IP so you don't lock yourself out, and let the server handle banning whoever shouldn't be there.
