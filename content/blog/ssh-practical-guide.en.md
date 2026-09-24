---
title: "SSH: a practical guide to keys, config, tunnels and security"
seoTitle: "SSH Guide: Keys, Config, Tunnels and Server Security"
date: 2024-03-12
lastmod: 2026-09-24
description: "A practical SSH guide: ed25519 keys, ssh-agent, the ~/.ssh/config file, file transfers, tunnels, server hardening and common errors like Permission denied."
tags: ["Guides", "Linux"]
translationKey: "ssh-guide"
---

I spend a good part of my day inside SSH sessions: clients' servers, staging machines, containers, routers. It's the tool I use most after my editor, and also the one most developers use at 10% of its potential: `ssh user@ip`, a password, and that's it.

This guide starts from the basics but goes straight to what makes a difference in daily work: key-based authentication, the `~/.ssh/config` file, tunnels to reach services that aren't exposed, securing the server, and the errors you'll definitely run into.

## What SSH is and what happens when you connect

**SSH** (Secure Shell) is a protocol for opening an encrypted channel between two machines over an untrusted network. A remote shell goes through it, as do file transfers, tunnels to other services, and Git. The de facto standard is **OpenSSH**, preinstalled on Linux and macOS and built into Windows 10 and 11 too.

When you run `ssh`, three things happen in order:

1. **The server identifies itself** with its *host key*. The client compares it with the ones stored in `~/.ssh/known_hosts`: that's how you know you're talking to the right server and not to someone in the middle.
2. **Client and server agree on a session key** through a Diffie-Hellman key exchange, without the key ever crossing the network. Recent OpenSSH versions use a hybrid exchange by default, designed to resist future quantum computers too.
3. **You authenticate**, with a password or, much better, with a key.

## The first connection

```
ssh user@server.example.com
ssh -p 2222 user@203.0.113.10     # port other than 22
```

The first time you'll see something like this:

```
The authenticity of host 'server.example.com (203.0.113.10)' can't be established.
ED25519 key fingerprint is SHA256:x3Jk...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Almost everyone types `yes` without reading. On a server you created yourself, you can check the fingerprint from the provider's console with `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`. It's the one moment a man-in-the-middle attack can go unnoticed.

If you ever see **"REMOTE HOST IDENTIFICATION HAS CHANGED"**, stop. Usually the server was reinstalled or the IP moved to another machine, but it's also exactly the warning you'd see during an attack. Once you're sure the change is legitimate, remove the old key:

```
ssh-keygen -R server.example.com
```

## Key-based authentication

Passwords over SSH have two problems: they can be guessed (and bots try constantly on every exposed server), and you have to type them every time. Keys solve both.

### Generating the key

```
ssh-keygen -t ed25519 -C "alberto@laptop"
```

**Ed25519** is the algorithm to use today: short, fast and secure keys. RSA is only for very old systems that support nothing else, and in that case use at least 4096 bits.

The command creates two files in `~/.ssh/`:

- `id_ed25519`: the **private key**. It never leaves your computer.
- `id_ed25519.pub`: the **public key**. This is the one you copy to servers.

When it asks for a **passphrase**, set one. If someone steals your laptop or a backup, a private key without a passphrase is direct access to all your servers. With `ssh-agent` (below) you type it once per session, so it's no hassle.

### Copying the key to the server

```
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server.example.com
```

`ssh-copy-id` appends the public key to the server's `~/.ssh/authorized_keys` file and sets the right permissions. Windows doesn't have it: from PowerShell you can do the same by hand.

```
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh user@server.example.com "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

From now on `ssh user@server.example.com` no longer asks for the server's password.

### ssh-agent: type the passphrase once

The agent keeps unlocked keys in memory for the length of your session:

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l                          # loaded keys
```

On almost every Linux desktop the agent already starts with the graphical session. On macOS you can store the passphrase in the Keychain with `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`, and add `UseKeychain yes` to the config (we'll get there shortly).

Avoid **agent forwarding** (`ssh -A`) to servers you don't fully trust: whoever is root on that server can use your keys while you're connected. There's a better way to hop from one server to another: `ProxyJump`.

## The ~/.ssh/config file

If you're still typing `ssh -p 2222 -i ~/.ssh/client_ed25519 deploy@203.0.113.10`, this is the section that will change your days. In `~/.ssh/config` you give each server a name:

```
Host *
    ServerAliveInterval 60
    AddKeysToAgent yes
    # macOS only:
    # UseKeychain yes

Host client-prod
    HostName 203.0.113.10
    User deploy
    Port 2222
    IdentityFile ~/.ssh/client_ed25519
    IdentitiesOnly yes

Host client-db
    HostName 10.0.0.5
    User deploy
    ProxyJump client-prod
```

Now `ssh client-prod` is all it takes. The name works everywhere SSH is used: `scp`, `rsync`, Git and the Remote SSH extension for [VS Code](/en/the-9-best-visual-studio-code-extensions/).

The directives that make the file worth it:

- **`IdentitiesOnly yes`**: use only the key specified. Without it, the client tries every key in the agent, and with many keys the server shuts the door after a few attempts ("Too many authentication failures").
- **`ServerAliveInterval 60`**: sends a keepalive every 60 seconds, so routers and firewalls don't drop idle connections and you stop finding your terminal frozen with "Broken pipe".
- **`ProxyJump`**: reaches an internal server (here the database, which isn't exposed to the internet) through a *bastion host*, transparently. `ssh client-db` does everything on its own, and your keys never leave your computer.

Another optimisation I use everywhere is **multiplexing**: the first connection stays open in the background and later ones to the same host reuse it, skipping the handshake. Every connection after the first becomes instant:

```
Host *
    ControlMaster auto
    ControlPath ~/.ssh/cm-%C
    ControlPersist 10m
```

## Transferring files

```
scp dump.sql client-prod:/tmp/
scp client-prod:/var/log/nginx/error.log .
```

`scp` is fine for a single file. Recent OpenSSH versions use the SFTP protocol under the hood, which is safer than the old SCP protocol, and for normal use nothing changes.

For folders, large transfers or repeated syncs, use **rsync**: it copies only the differences and resumes if the connection drops.

```
rsync -avz --progress ./dist/ client-prod:/var/www/site/public/
rsync -avzn --delete ./dist/ client-prod:/var/www/site/public/   # -n: dry run, changes nothing
```

Two rsync details that cause damage. The **trailing slash** on the source matters: `dist/` copies the folder's *contents*, `dist` copies the folder itself. And before using `--delete` (which removes files from the destination that no longer exist in the source) always run the command with `-n` first, to see what would happen.

## Tunnels: reaching services that aren't exposed

Port forwarding is the SSH feature that solves the most problems and that the fewest people know.

### Local tunnel (`-L`)

The typical case: MySQL on the server listens only on `localhost`, as it should, but you want to connect with a GUI client from your computer.

```
ssh -N -L 3307:localhost:3306 client-prod
```

Now your client connects to `127.0.0.1:3307` and talks to the server's MySQL through SSH. `-N` means "don't open a shell, just the tunnel". The database stays invisible to the internet: far better than opening port 3306 in the firewall. My guide to the [LAMP stack on Ubuntu](/en/how-to-install-a-lamp-stack/) shows how to create a dedicated database user to use this way.

### Remote tunnel (`-R`)

The opposite: you expose a port from your computer on the server. It's useful, for example, to show a client an app running on your development machine, or to let a local app receive a webhook.

```
ssh -N -R 8080:localhost:3000 client-staging
```

Port 8080 on the server now leads to port 3000 on your computer.

### SOCKS proxy (`-D`)

```
ssh -N -D 1080 client-prod
```

Creates a local SOCKS proxy: point your browser at it and you browse as if you were the server. It's handy for reaching admin panels that are only accessible from the client's internal network.

## Long sessions: tmux

If the connection drops during a system upgrade or a two-hour database import, the process may die with it. The fix is to work inside **tmux**, which keeps the session alive on the server even when you disconnect:

```
tmux new -s work          # new session
# Ctrl+b then d           # detach, processes keep running
tmux attach -t work       # reattach, even from another computer
```

And a trick few people know: if an SSH session freezes and stops responding to anything, press `Enter`, then `~`, then `.`. It's the SSH client's escape sequence and it kills the connection instantly, without closing the terminal.

## Securing the server

Any server with port 22 open gets login attempts from bots within minutes of booting. A few settings make them irrelevant.

### sshd configuration

Instead of editing `/etc/ssh/sshd_config`, create a separate file: it survives package upgrades and it's clear what you changed.

```
sudoedit /etc/ssh/sshd_config.d/01-hardening.conf
```

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers alberto deploy
```

The **`01-`** name isn't random. In `sshd_config` the **first** occurrence of each directive wins, and files in `sshd_config.d/` are read in alphabetical order. Ubuntu cloud images often include a `50-cloud-init.conf` that sets `PasswordAuthentication yes`: name your file `99-hardening.conf` and your setting gets ignored without any warning. To see the configuration actually in effect:

```
sudo sshd -T | grep -Ei 'passwordauthentication|permitrootlogin'
```

Before applying, check the syntax and **keep a second SSH session open** until you've confirmed you can log back in. If you get something wrong, that session is your only way to fix it without going through the provider's console.

```
sudo sshd -t
sudo systemctl restart ssh
```

On Ubuntu 24.04 the service is called `ssh` and it's socket-activated: if you change the **port**, you then need `sudo systemctl daemon-reload && sudo systemctl restart ssh.socket`, otherwise SSH keeps listening on the old port.

To edit these files from the terminal, my [practical guide to nano](/en/nano-editor-beginners-guide/) may help, and it also explains why to use `sudoedit`.

### Firewall and fail2ban

Keep the SSH port open in the firewall before enabling it (`sudo ufw allow OpenSSH`) and, if you can, restrict it to the IPs you work from. **fail2ban** reads the logs and temporarily bans IPs that fail to log in too many times. On Debian and Ubuntu SSH protection is active as soon as you install it:

```
sudo apt install fail2ban
sudo fail2ban-client status sshd
```

With password login disabled fail2ban matters less, but it cuts the noise in the logs and the load from the attempts.

**Changing the port** from 22 to something else drastically reduces automated attempts, but it's not a real security measure: a scan finds it in seconds. Do it for cleaner logs if you like, not instead of keys.

## Common errors

**"Permission denied (publickey)".** The server accepts none of the keys you offered. First of all, connect in verbose mode, which tells you which keys it tries and what the server answers:

```
ssh -v client-prod
```

The most frequent causes are: wrong user, the key isn't in `authorized_keys`, or **permissions too open** on the server. SSH rejects keys if `~/.ssh` isn't `700`, if `authorized_keys` isn't `600`, or if the home directory is writable by other users. On the server side, `sudo journalctl -u ssh` tells you the exact reason.

**"WARNING: UNPROTECTED PRIVATE KEY FILE!".** Same rule, client side: the private key is readable by other users. `chmod 600 ~/.ssh/id_ed25519`.

**"Connection refused" or "Connection timed out".** They're not the same thing. *Refused* means the machine answers but nothing is listening on that port: SSH is down or listening on another port. *Timed out* means no answer comes back at all: a firewall, a cloud security group or a network problem is dropping the packets.

**"Too many authentication failures".** The agent offered too many wrong keys before the right one. Add `IdentityFile` and `IdentitiesOnly yes` for that host in the config.

**"Broken pipe" after a few minutes idle.** A router or firewall is dropping idle connections. `ServerAliveInterval 60` in the config fixes it.

## In short

Ed25519 keys with a passphrase, a `~/.ssh/config` with a name for every server, `ProxyJump` instead of agent forwarding, tunnels instead of open ports, rsync for transfers, tmux for long jobs. On the server, no passwords and no root, and check with `sshd -T` that the configuration is what you think it is.

When you're connected and the server's disk turns out to be full, [ncdu](/en/ncdu-disk-usage-from-the-terminal/) tells you in seconds where to look.
