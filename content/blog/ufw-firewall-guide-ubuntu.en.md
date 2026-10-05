---
title: "UFW: how to set up a firewall on Ubuntu/Debian"
date: 2026-10-05
description: "A practical guide to UFW (Uncomplicated Firewall): how to enable it without losing SSH access, the essential rules, application profiles, and rate limiting against brute-force attacks."
tags: ["Guides", "Linux"]
translationKey: "ufw-firewall-guide"
---

If you're running a server with key-based SSH and [Fail2ban](/en/fail2ban-block-ssh-brute-force-attacks/) in place, you've already covered two important layers of defense. But one piece is still missing: a firewall that decides, port by port, what's allowed into the server and what isn't. On Ubuntu and Debian, the simplest tool for that is **UFW**, Uncomplicated Firewall — and despite the reassuring name, it's easy to misconfigure it and lock yourself out of your own server. Here's how to set it up properly.

## What UFW is and why you need it

UFW isn't a firewall in its own right: it's a simplified front end on top of `iptables` (or `nftables`, depending on the distro), built to spare you from writing rules by hand in a fairly cryptic syntax. The goal is the same as any firewall: block all unsolicited traffic by default, and only open the ports your server genuinely needs to expose.

Why do you need it even if you already have other protections in place? Because fail2ban and SSH keys reduce the risk on one specific service (SSH), but they do nothing to stop a bot from probing a database accidentally left exposed, an admin panel sitting on a non-standard port, or any other service running on the box that you're not even aware of. The firewall is the safety net that blocks everything by default, regardless of what's listening.

## Installing it and checking the initial state

On Ubuntu, UFW is almost always already installed. If it isn't:

```
sudo apt update
sudo apt install ufw
```

Check the current status before touching anything:

```
sudo ufw status verbose
```

If you've never configured it, it's probably `inactive`. **Don't enable it yet**: the most common mistake is turning UFW on with its default policy (which blocks all incoming traffic) before opening the SSH port, and getting locked out at the next reboot or disconnect.

## The default policies

UFW starts from two general rules that apply to any traffic not otherwise specified:

```
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

This combination is the right starting point for most servers: it blocks every connection coming in from outside, while letting the server itself reach out freely (for updates, API calls, sending mail, and so on). From here on, any service you want reachable from outside needs an explicit rule to allow it.

## Step one: open SSH before enabling UFW

This is the step that keeps you from getting locked out. Before enabling UFW, make sure the SSH port is authorized:

```
sudo ufw allow OpenSSH
```

If you use a non-standard SSH port (good practice, but it needs to be specified), use the port number instead of the profile:

```
sudo ufw allow 2222/tcp
```

Only then should you enable UFW:

```
sudo ufw enable
```

The system asks for confirmation because it might disrupt existing connections — but with SSH already authorized, your current session stays open and you don't lose access.

## How UFW decides what gets through

UFW evaluates rules in the order they were added, and stops at the first one that matches the incoming traffic. If nothing matches, the default policy (usually `deny`) kicks in.

<svg class="hi-diagram" width="300" height="230" viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="16" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="70" y1="62" x2="70" y2="92" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="94" width="120" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="105" cy="104" r="6" class="hi-accent-dot"/>
  <line x1="70" y1="140" x2="70" y2="170" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="172" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>

  <line x1="130" y1="117" x2="180" y2="117" class="hi-muted-stroke" stroke-width="2"/>
  <rect x="180" y="94" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
</svg>

Top to bottom: incoming packet → UFW walks through the rules in order (highlighted: the point where it finds the first match) → if nothing matches, the default policy applies. On the right: the final action, allow or deny, decided by the first rule that matched.

That's why rule order matters: if you open a port broadly and then try to add a more specific exception afterward, UFW may have already made its decision based on the first rule it found. In practice, for most everyday setups simple rules (allow on a port, deny from an IP) don't create ambiguity — but it's worth keeping in mind once rules start to overlap.

## Opening only the ports you actually need

For a typical web server, there are only a handful of ports to open:

```
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Or, if you'd rather use the built-in application profiles (UFW ships with several for common services):

```
sudo ufw app list
sudo ufw allow "Nginx Full"
```

`ufw app list` shows every profile available on the system, registered automatically by the packages themselves (Nginx, Apache, and OpenSSH all register their own profiles on install). Using them is convenient because they stay readable months later, far more than a bare port number would.

Avoid opening ports "just in case you need them later": every open port is attack surface. If a service only runs locally (a database that's only ever accessed by an application on the same machine), it shouldn't show up in your UFW rules at all — it's simply never exposed externally, and that's exactly how it should stay.

## Restricting access to specific IPs

Not every port needs to be open to the entire world. If a service (an admin panel, a database port used by a management tool) should only be reachable from you or a small set of IPs, specify the source:

```
sudo ufw allow from 203.0.113.42 to any port 5432
```

This authorizes only that IP to reach port 5432 (typically PostgreSQL), blocking everyone else. You can also specify an entire subnet:

```
sudo ufw allow from 203.0.113.0/24 to any port 5432
```

It's the same idea as the whitelist you set up with `ignoreip` in fail2ban, just applied at the network level instead of the authentication level: traffic from unauthorized IPs never even gets to attempt a connection.

## Rate limiting: an extra layer of defense for SSH

UFW includes a feature that's often overlooked but genuinely useful: `limit`, which temporarily blocks an IP that attempts too many connections to the same port in a short window. For SSH:

```
sudo ufw limit OpenSSH
```

This doesn't replace fail2ban (which is far more configurable and works off application logs, not just connection counts), but it adds a basic layer of protection even if fail2ban happens to be down or not yet installed. Running both together is useful redundancy, not overkill.

## Checking, editing, and removing rules

To see the active rules with reference numbers (handy for removing them):

```
sudo ufw status numbered
```

To delete a specific rule using the number shown:

```
sudo ufw delete 3
```

To remove a rule by the same syntax used to create it:

```
sudo ufw delete allow 8080/tcp
```

And if something goes wrong and you want to start over:

```
sudo ufw reset
```

Careful: `reset` disables UFW and wipes every rule, SSH included. If you run this on a remote server, make sure you have an alternative way in (your provider's console, physical access) before doing so, because you'll need to re-authorize SSH from scratch.

## Don't forget IPv6

If your server has a public IPv6 address (increasingly common with cloud providers), UFW handles IPv6 automatically as long as the `IPV6` directive in `/etc/default/ufw` is set to `yes` (the default on Ubuntu). Any rule you write with `ufw allow` gets applied to IPv6 as well, so in most cases there's nothing extra to do — but it's worth double-checking once with:

```
sudo ufw status verbose
```

If the output doesn't mention IPv6 anywhere, check that directive before assuming the server is protected on both protocols.

## Bottom line

UFW doesn't remove the need to understand what's actually running on your server, but it makes it trivial to apply the single most important principle of network security: block everything by default, and open only what's needed, explicitly. Enable it by always authorizing SSH first, keep the rule list as short as possible, and run it alongside fail2ban rather than instead of it: one blocks by default, the other reacts to suspicious behavior on whatever you've left open. Together they cover a lot more ground than either would on its own.
