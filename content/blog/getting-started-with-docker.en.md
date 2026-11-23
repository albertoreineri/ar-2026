---
title: "Docker: a practical guide to getting started with containers"
date: 2026-11-23
description: "What Docker actually is, why it's worth using even for small projects, and how to write your first Dockerfile and your first docker-compose.yml, step by step."
tags: ["Guides", "Linux"]
translationKey: "docker-practical-guide"
---

"It works on my machine" is probably the most-uttered sentence in the history of software development, usually right before something breaks on the server. A different PHP version, a missing extension, an environment variable nobody remembers setting. **Docker** exists to get rid of that problem: instead of giving you "an environment similar to" production, it gives you the exact same one, because you package it yourself along with your code.

It's not a tool just for big teams or complex infrastructure. I use it regularly even for small projects, simply because it saves me from installing (and uninstalling) different versions of PHP, Node, or a database directly on my own computer or on a shared server.

## What Docker is (and isn't)

Docker isn't a virtual machine, even though at first glance it can look like it does the same thing. A VM virtualizes an entire operating system, with its own kernel, its own drivers, its own processes — heavy to boot, heavy to maintain. A **container**, on the other hand, shares the kernel of the host system and only isolates the application's processes, filesystem, and network. The result is that a container starts in under a second and takes up a fraction of the space an equivalent VM would.

The practical difference: you can run dozens of containers on the same machine without noticing any slowdown, while the same number of VMs would bring the server to its knees.

## Three key words: Dockerfile, image, container

This is where almost everyone gets confused when starting out, so it's worth nailing down:

- A **Dockerfile** is a text recipe: a list of instructions saying "start from this base, copy these files, install these dependencies, run this command on startup."
- An **image** is the result of that recipe: a static, ready-to-use package containing everything needed to run the application.
- A **container** is a running instance of an image. You can spin up one, ten, or a hundred copies from the same image, each isolated from the others.

<svg class="hi-diagram" width="300" height="130" viewBox="0 0 300 130" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="35" width="80" height="60" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="24" y="52" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="24" y="64" width="40" height="6" rx="3" class="hi-bar"/>
  <rect x="24" y="76" width="46" height="6" rx="3" class="hi-bar"/>

  <line x1="92" y1="65" x2="118" y2="65" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="120" y="35" width="80" height="60" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="134" y="50" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="134" y="62" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="134" y="74" width="30" height="6" rx="3" class="hi-bar"/>

  <line x1="202" y1="65" x2="228" y2="65" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="215" cy="65" r="5" class="hi-accent-dot"/>

  <circle cx="260" cy="48" r="28" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="260" cy="90" r="18" class="hi-fill hi-ink-stroke" stroke-width="2"/>
</svg>

Left to right: the Dockerfile (the recipe), the image that results from building it, and the running containers — here two circles of different sizes, as a reminder that from the same image you can spin up as many copies as you need, even with different resource limits.

## The essential commands

Before writing a Dockerfile, it's worth playing around with an existing image to get a feel for a container's lifecycle:

```
docker run -d -p 8080:80 --name my-nginx nginx
```

Here `-d` starts the container in the background (detached), `-p 8080:80` maps port 8080 on your machine to port 80 inside the container, `--name` gives it a readable name instead of a random ID, and `nginx` is the image name, pulled automatically from Docker Hub if you don't already have it locally.

The other commands you'll use constantly:

```
docker ps                 # running containers
docker ps -a               # including stopped ones
docker logs my-nginx       # container output
docker exec -it my-nginx bash   # get a shell inside the container
docker stop my-nginx
docker rm my-nginx
docker images              # downloaded/built images
docker rmi nginx           # remove an image
```

`docker exec -it` is probably the one I reach for most during debugging: it opens an interactive shell inside the already-running container, handy for checking files, environment variables, or logs without changing anything.

## Writing your first Dockerfile

Say you have a simple Node.js application. A minimal but sensible Dockerfile looks like this:

```
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

A few choices here that aren't arbitrary:

- `node:20-alpine` uses an **Alpine** variant, a minimal Linux distribution: the final image ends up being tens of MB instead of hundreds.
- `COPY package*.json ./` followed by `RUN npm ci` **before** `COPY . .` isn't accidental: Docker caches every instruction, so as long as `package.json` hasn't changed, the next build skips the dependency install entirely, saving minutes every time you just change application code.
- `npm ci` instead of `npm install` installs the exact versions locked in `package-lock.json`, guaranteeing a reproducible build.

Build the image with:

```
docker build -t my-app:1.0 .
```

and run it with `docker run -d -p 3000:3000 my-app:1.0`.

## Volumes: making data survive the container

A container is meant to be disposable: you destroy it and recreate it without a second thought, for example when you update the image. The catch is that anything written to the container's filesystem is lost the moment you remove it. For a database, or for files uploaded by users, that's not acceptable.

The fix is **volumes**: folders managed by Docker (or mounted from the host's filesystem) that stay alive even after the container is removed.

```
docker run -d --name my-db -v db-data:/var/lib/mysql mysql:8
```

`db-data` here is a Docker-managed volume: if you delete and recreate the `my-db` container, the data inside `/var/lib/mysql` stays intact in the volume, ready for whichever container mounts it next.

## Orchestrating multiple containers with docker-compose

Almost no real application is made of a single container: there's usually at least an app and a database, often a cache or a reverse proxy too. Hand-typing every `docker run` command with the right networks and volumes quickly becomes unmanageable. **docker-compose** solves this by describing the entire stack in a single YAML file.

<svg class="hi-diagram" width="300" height="170" viewBox="0 0 300 170" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="110" height="70" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <rect x="36" y="40" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="36" y="52" width="60" height="6" rx="3" class="hi-bar"/>
  <rect x="36" y="64" width="70" height="6" rx="3" class="hi-bar"/>

  <rect x="170" y="20" width="110" height="70" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="186" y="40" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="186" y="52" width="40" height="6" rx="3" class="hi-bar"/>

  <line x1="130" y1="55" x2="170" y2="55" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="150" cy="55" r="5" class="hi-accent-dot"/>

  <line x1="225" y1="90" x2="225" y2="120" class="hi-muted-stroke" stroke-width="2"/>
  <rect x="190" y="122" width="70" height="30" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="200" y="134" width="50" height="6" rx="3" class="hi-bar"/>
</svg>

On the left, the app container (the box with the heavier outline); on the right, the database container, linked over the internal network Compose creates automatically (the yellow dot marks that connection); below, the volume that keeps the database's data around even when the container is stopped.

A `docker-compose.yml` for a web app with a database might look like this:

```
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/mydb
    depends_on:
      - db

  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=mydb
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

Two things worth noting: inside the network Compose creates, the `app` service can reach the database simply by using `db` as the hostname (the service's name), with no need to know an IP or configure anything. And one single command brings up the whole stack:

```
docker compose up -d
```

while `docker compose down` stops and removes it (volumes stick around unless you add `-v`).

## A few good practices

- **Use a `.dockerignore`**, same idea as `.gitignore`: avoid copying `node_modules`, `.git`, or log files into the image, keeping it smaller and the build faster.
- **Don't run processes as root** inside the container when you don't have to: many official images (including `node`) let you switch to an unprivileged user with `USER node` in the Dockerfile.
- **Use explicit image tags** (`node:20-alpine`, not just `node:latest`): `latest` changes over time, and what works today can break after an update you never actually reviewed.
- **Clean up regularly** with `docker system prune`, which removes stopped containers, unreferenced images, and unused networks: on a server that's been running Docker for months, this can free up several GB.

## Bottom line

Docker doesn't remove the complexity of an application, it makes it **explicit and reproducible**: everything needed to run the project, from dependencies to environment variables, ends up written in a Dockerfile or a docker-compose.yml, instead of living only in the memory of whoever configured the server three years ago. If you manage even a single server running more than one project, it's worth spending an afternoon containerizing at least the most fragile one — the difference shows up at the next deploy, or the next time you switch servers.
