---
title: "Linux package management: apt, dnf, pacman, Flatpak and Snap"
seoTitle: "Linux Package Managers: apt, dnf, pacman, Snap, Flatpak"
date: 2024-03-20
lastmod: 2026-09-24
description: "The essential commands for APT, DNF, Pacman, Flatpak, Snap and AppImage: install, update and remove software on Linux and manage repositories."
tags: ["Guides", "Linux"]
translationKey: "linux-package-management"
---

On Linux you don't download an installer from a website and click "Next". Software almost always comes from a **package manager**, which downloads it from signed repositories, resolves dependencies and knows exactly which files it put where, so it can update or remove them without leaving anything behind.

The catch is that every family of distributions has its own package manager, with its own syntax. When you work on different clients' servers you can go from Ubuntu to Rocky Linux to an Alpine container in the same day. This is the guide I wish I'd had: what packages are, the commands you actually need for each package manager, a comparison table, and the errors you'll run into sooner or later.

## What a package is

A package is an archive containing the software (binaries, libraries, config files, documentation) plus **metadata**: name, version, dependencies, scripts to run before and after installation. The package manager reads the metadata, checks the signature, installs any missing dependencies and records every file in a local database.

There are three main formats:

- **.deb**: Debian, Ubuntu, Linux Mint and derivatives. The package manager is **APT**, built on top of `dpkg`.
- **.rpm**: Fedora, Red Hat Enterprise Linux, Rocky Linux, AlmaLinux, openSUSE. The package manager is **DNF** (`zypper` on openSUSE), built on top of `rpm`.
- **.pkg.tar.zst**: Arch Linux and derivatives (Manjaro, EndeavourOS). The package manager is **pacman**.

On top of these there's **Alpine** with `apk`, which you'll often meet in Docker images, and the **universal** formats (Flatpak, Snap, AppImage), which run on any distribution by bundling their own dependencies.

## Native or universal packages?

The distinction matters more than it seems:

- **Native packages** are built for your distribution and share the system libraries. They're lightweight, well integrated, and get security patches from the distribution's team. The trade-off is that on a stable distribution like Debian or RHEL you'll often find versions that are months or years old.
- **Universal packages** bundle their own dependencies. You get the latest version straight from the developer, on any distribution, at the cost of more disk space, sometimes imperfect desktop integration, and security updates that depend on whoever publishes the package.

My rule of thumb: **native packages only on servers** (plus containers when you need a different version). **On a desktop**, native packages for the system and Flatpak for graphical apps.

## Commands side by side

The table I check when I jump from one distribution to another:

| Task | APT (Debian/Ubuntu) | DNF (Fedora/RHEL) | pacman (Arch) | apk (Alpine) |
|---|---|---|---|---|
| Refresh the package index | `apt update` | `dnf makecache` | `pacman -Sy` | `apk update` |
| Upgrade the system | `apt upgrade` | `dnf upgrade` | `pacman -Syu` | `apk upgrade` |
| Install | `apt install pkg` | `dnf install pkg` | `pacman -S pkg` | `apk add pkg` |
| Remove | `apt remove pkg` | `dnf remove pkg` | `pacman -R pkg` | `apk del pkg` |
| Remove with config and unused dependencies | `apt purge pkg` + `apt autoremove` | `dnf remove pkg` | `pacman -Rns pkg` | `apk del pkg` |
| Search | `apt search text` | `dnf search text` | `pacman -Ss text` | `apk search text` |
| Package details | `apt show pkg` | `dnf info pkg` | `pacman -Si pkg` | `apk info -a pkg` |
| Installed packages | `apt list --installed` | `dnf list --installed` | `pacman -Q` | `apk info` |
| Files installed by a package | `dpkg -L pkg` | `rpm -ql pkg` | `pacman -Ql pkg` | `apk info -L pkg` |
| Which package owns a file | `dpkg -S /path` | `rpm -qf /path` | `pacman -Qo /path` | `apk info --who-owns /path` |

Every command that changes the system needs `sudo` (or root, as is usually the case inside a container).

The last two rows are the ones that save me most often: finding **where a file comes from** in `/etc` or `/usr/bin` is the first step to understanding who put it there and how to update it.

## APT: Debian, Ubuntu and derivatives

### apt or apt-get?

`apt` is the interface designed for interactive use: more readable output, a progress bar, colours. `apt-get` and `apt-cache` are the older commands with stable output, and they're the ones to use **in scripts** and `Dockerfile`s: `apt` itself warns that its command-line interface may change. Use `apt` by hand, `apt-get` in automation.

### Everyday commands

```
sudo apt update                 # download the updated repository index
sudo apt upgrade                # upgrade packages without removing any
sudo apt full-upgrade           # upgrade even when removals or new dependencies are needed
sudo apt install nginx
sudo apt remove nginx           # remove the package, keep its configuration
sudo apt purge nginx            # also remove its configuration in /etc
sudo apt autoremove             # remove dependencies that are no longer needed
apt policy nginx                # installed and candidate version, and from which repository
sudo apt-mark hold nginx        # pin a package at its current version
```

`apt update` doesn't upgrade anything: it only downloads the list of what's available. It's the most common misunderstanding for people coming from other systems.

### Repositories and keys, the current way

Repositories are defined in `/etc/apt/sources.list` and in the files under `/etc/apt/sources.list.d/`. Recent releases (Ubuntu 24.04 onwards, for example) use the **deb822** format, with `.sources` files instead of the old `deb ...` lines.

To add a third-party repository, say for a database or Docker, `apt-key` is deprecated and gone from the latest releases. The correct way is to store the key in its own file and tie it **only** to that repository:

```
sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://repo.example.com/key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/example.gpg
```

Then `/etc/apt/sources.list.d/example.sources`:

```
Types: deb
URIs: https://repo.example.com/apt
Suites: stable
Components: main
Signed-By: /etc/apt/keyrings/example.gpg
```

`Suites` and `Components` vary by repository: you'll find them in the publisher's documentation. With `Signed-By` that key is trusted only for that repository, instead of for the whole system as it was with `apt-key`.

nano is perfectly fine for editing these files from the terminal: I wrote a [practical guide to nano](/en/nano-editor-beginners-guide/) with the essential shortcuts.

### Automatic updates on servers

On a Debian or Ubuntu server, it's worth letting security patches install themselves with `unattended-upgrades`:

```
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

By default it only installs security updates, which is exactly what you want. Feature updates are yours to apply, when you decide.

## DNF: Fedora, RHEL, Rocky Linux, AlmaLinux

**YUM** was the long-standing package manager in the Red Hat world. Since RHEL 8 it has been replaced by **DNF**, and the `yum` command survives only as an alias. Fedora 41 and later use **DNF5**, a faster rewrite: the basic commands are the same, but some subcommands (like `config-manager`) changed syntax, so watch out for old guides.

```
sudo dnf upgrade                # upgrade the system (also refreshes metadata)
sudo dnf install nginx
sudo dnf remove nginx           # also removes dependencies no longer in use
dnf provides /usr/bin/dig       # which package provides a file or command
dnf repolist                    # enabled repositories
dnf history                     # transaction history
sudo dnf history undo 42        # roll back transaction number 42
```

`dnf history undo` is something APT lacks, and it has saved me more than once after an upgrade gone wrong.

Repositories are `.repo` files in `/etc/yum.repos.d/`. On RHEL and its clones many common packages (such as `htop` or `ncdu`) aren't in the base repositories but in **EPEL**. On Rocky Linux and AlmaLinux 9:

```
sudo dnf install epel-release
sudo dnf config-manager --set-enabled crb
```

## pacman: Arch Linux and derivatives

Arch is a **rolling release** distribution: there are no "versions", the system updates continuously. That changes how you use pacman.

```
sudo pacman -Syu                # sync and upgrade the whole system
sudo pacman -S nginx            # install (after a -Syu!)
sudo pacman -Rns nginx          # remove package, unused dependencies and config files
pacman -Ss text                 # search the repositories
pacman -Qi nginx                # details on an installed package
pacman -Qdtq                    # orphaned packages
sudo pacman -Rns $(pacman -Qdtq) # remove orphans
```

The one rule never to break: **don't run `pacman -Sy pkg`**, i.e. refresh the index and install a package without upgrading the rest of the system. That's a partial upgrade, unsupported on Arch, and sooner or later it breaks libraries. Always `-Syu` first, then install.

Software that isn't in the official repositories lives in the **AUR** (Arch User Repository): community-maintained build recipes, installed with a helper like `yay` or `paru`. They're scripts written by anyone, so read the `PKGBUILD` before installing.

## apk: Alpine and containers

Alpine is the base of a huge number of Docker images, so you'll meet `apk` even if you've never installed it on a real machine. In a `Dockerfile` the right form is:

```
RUN apk add --no-cache curl ca-certificates
```

`--no-cache` avoids leaving the package index inside the image. The equivalent for Debian images is `apt-get update && apt-get install -y --no-install-recommends ... && rm -rf /var/lib/apt/lists/*`, all in the same `RUN`.

## Flatpak

Flatpak is the de facto standard for **desktop applications** distributed independently of the distribution. Apps run in a **sandbox** with declared permissions, and the main repository is **Flathub**.

```
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.gimp.GIMP
flatpak run org.gimp.GIMP
flatpak update
flatpak uninstall --unused      # remove runtimes no app uses anymore
```

Apps are identified by a reverse-domain name (`org.gimp.GIMP`), which you can find with `flatpak search`. If an app can't see a folder or a device, the cause is almost always a sandbox permission: manage it with `flatpak override` or, more comfortably, with the **Flatseal** app.

## Snap

Snap is the universal format developed by Canonical and ships by default in Ubuntu, which also uses it to distribute Firefox. Unlike Flatpak it also works for services and command-line tools, and it's for example the recommended way to install **Certbot** on Ubuntu.

```
sudo snap install certbot --classic
snap list
sudo snap refresh               # update (it does this automatically anyway)
sudo snap refresh --hold        # pause automatic updates
sudo snap remove certbot
```

`--classic` installs the snap without sandbox confinement, which tools that need free access to the system require.

Snap is also the most debated format, and the criticism has solid grounds:

- **Centralised store**: there's only one store, run by Canonical, with a server that isn't open source. You can't add alternative repositories as you can with Flatpak.
- **Automatic updates**: snaps update themselves. You can postpone or pause them, but on a server, software changing without you deciding is not a minor detail.
- **System clutter**: every snap is mounted as a loop device, and `df` and `lsblk` fill up with `/snap/...` entries.

## AppImage

An AppImage is a single executable file containing the app and its dependencies. There's nothing to install: download it, make it executable and run it.

```
chmod +x Application.AppImage
./Application.AppImage
```

Two things guides often leave out. AppImages have **no sandbox** by default: they run with all of your user's permissions, exactly like any binary downloaded from the internet, so only download them from sources you trust. They also need **FUSE 2**, which recent distributions no longer install by default. On Ubuntu 24.04, for example, you need:

```
sudo apt install libfuse2t64
```

There's no central update mechanism: each app updates in its own way, or you download the new version by hand.

## Common errors (and how to fix them)

**"Could not get lock /var/lib/dpkg/lock-frontend".** Another process is using APT. It's almost always `unattended-upgrades` working in the background right after boot. **Don't delete the lock file**: wait a few minutes, or check who's holding it with `ps aux | grep -E 'apt|dpkg'`. If a previous operation really was interrupted, `sudo dpkg --configure -a` puts the database back in order.

**"The following packages have been kept back".** `apt upgrade` won't install upgrades that need new dependencies or removals. `apt full-upgrade` installs them, once you've read what it proposes to remove. On Ubuntu, if the message mentions upgrades "deferred due to phasing", there's nothing to do: Canonical rolls out some updates gradually, to a percentage of machines at a time, and they'll arrive on their own.

**"NO_PUBKEY" or "repository is not signed".** The repository key is missing or expired. Download the updated key from the vendor's documentation and store it in `/etc/apt/keyrings/`, as shown above, instead of using `apt-key`.

**"Unable to locate package".** In order: you haven't run `apt update` (typical in containers, which start with an empty index), the name is different (look it up with `apt search`), or the package lives in a repository that isn't enabled, like `universe` on Ubuntu.

**"Unable to find a match" on RHEL and derivatives.** The package is almost always in EPEL or CRB, which aren't enabled by default.

**"invalid or corrupted package (PGP signature)" on Arch.** The keyring is older than the keys used to sign the new packages, usually after months without upgrading. Update the keyring first, then everything else: `sudo pacman -Sy archlinux-keyring && sudo pacman -Su`.

## In short

The concepts are the same everywhere: signed repositories, an index to refresh, dependencies resolved automatically, and a database that knows which file belongs to which package. Only the syntax changes, and for that the table above is all you need.

If you're setting up a server, the natural next step is installing the web stack: here's my guide to [installing a LAMP stack on Ubuntu](/en/how-to-install-a-lamp-stack/).
