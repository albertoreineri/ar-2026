---
title: "A simple routing system in PHP, no framework"
seoTitle: "PHP Routing from Scratch, No Framework"
date: 2021-06-04
lastmod: 2026-09-24
description: "How to build a simple router in plain PHP: send all traffic to index.php with .htaccess, map URLs to pages, handle dynamic parameters and a proper 404."
tags: ["Guides", "PHP"]
translationKey: "php-routing-system"
---

A site's URLs matter, to search engines and to people. An address like `/articles/2026/05` is readable, memorable, and can be "trimmed" by hand to go up to the month's or the year's list. An address like `/articles.php?year=2026&month=05` does the same job, but badly.

A CMS or a framework like Laravel handles all this for you. But for a small project, or to understand what frameworks do behind the scenes, a router written from scratch takes a few dozen lines of PHP. If all you need is to drop `.php` from your URLs, there's an even simpler solution: [hiding the extension with .htaccess](/en/hide-file-extension-from-url/). If you want full control over your addresses, here's how.

{{< youtube lFtPh9eoPrc >}}

The idea is simple: **send every request to `index.php`** and decide there, in PHP, which page to show.

## 1. All traffic to index.php

In the site's root, create (or open) the `.htaccess` file:

```
RewriteEngine On
RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+)$ index.php [QSA,L]
```

The two conditions exclude files and folders that actually exist: CSS, JavaScript and images are still served directly by Apache. Everything else ends up at `index.php`. `QSA` keeps the query string, so `$_GET` keeps working.

For the `.htaccess` file to be read, Apache needs `mod_rewrite` enabled and `AllowOverride All` in the virtual host. On Ubuntu neither is on by default: my guide to the [LAMP stack on Ubuntu](/en/how-to-install-a-lamp-stack/) shows how to set them up.

If you use **nginx**, the equivalent is one line in the `server` block:

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

## 2. The router

In `index.php`:

```
<?php

// Path only, no query string: /about?utm_source=x becomes /about
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Strip the trailing slash, so /about/ and /about are the same page
$path = rtrim($path, '/') ?: '/';

$routes = [
    '/'        => 'home.php',
    '/about'   => 'about.php',
    '/contact' => 'contact.php',
];

if (isset($routes[$path])) {
    require __DIR__ . '/views/' . $routes[$path];
    exit;
}

http_response_code(404);
require __DIR__ . '/views/404.php';
```

Three details that make the difference compared with the naive version, which feeds `$_SERVER['REQUEST_URI']` straight into a `switch`:

- **`parse_url`**: `REQUEST_URI` includes the query string too. Without this line, a visitor coming from a campaign with `?utm_source=newsletter` is enough to send your home page to a 404.
- **The trailing slash**: `/about` and `/about/` are different URLs. Normalising them avoids pages that can't be found because of one character.
- **`http_response_code(404)`**: without it, the error page is served with a 200 status and Google treats it as a valid page to index. That's what shows up in Search Console as a *soft 404*.

Routes live in an array rather than a `switch`: adding a page is one line, and the full list of the site's URLs is readable at a glance.

## 3. The views

In the `views` folder, create one file per page:

**views/home.php**

```
<h1>Home page</h1>
```

**views/about.php**

```
<h1>About</h1>
```

**views/404.php**

```
<h1>Page not found</h1>
```

Header, footer and menu can go in two separate files (`views/partials/header.php` and `footer.php`) included in each view, or directly in `index.php`, before and after the view's `require`.

## 4. URLs with parameters

A router really earns its keep when URLs carry data: `/article/how-dns-works`, `/product/42`. For these cases a regular expression is enough, added before the 404 response:

```
if (preg_match('#^/article/([a-z0-9-]+)$#', $path, $matches)) {
    $slug = $matches[1];
    require __DIR__ . '/views/article.php';
    exit;
}
```

Inside `views/article.php` the `$slug` variable holds the last part of the URL, and you use it to look up the article in the database, always with a prepared statement. If the article doesn't exist, respond with `http_response_code(404)` there too.

The regular expression also acts as a **security filter**: it only accepts lowercase letters, digits and hyphens, so no slashes, dots or other odd characters can reach the parameter.

## 5. GET and POST

A contact form uses the same URL in two ways: `GET /contact` shows the form, `POST /contact` receives it. Just include the method in the route keys:

```
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'GET /'        => 'home.php',
    'GET /about'   => 'about.php',
    'GET /contact' => 'contact.php',
    'POST /contact' => 'contact-send.php',
];

$key = $method . ' ' . $path;

if (isset($routes[$key])) {
    require __DIR__ . '/views/' . $routes[$key];
    exit;
}
```

## A security rule

Whatever you add, **never build a file path directly from the URL**. Something like `require 'views/' . $path . '.php'` looks elegant, but it opens the door to requests like `/../../config` and lets people include files that were never meant to be reachable. With the explicit route map and the strict regular expressions above, the problem doesn't exist.

## Trying it locally without Apache

PHP's built-in server accepts a *router script*, so you can try everything without `.htaccess` and without installing anything:

```
php -S localhost:8000 index.php
```

In that case, add a line at the top of `index.php` that lets static files be served directly, otherwise they'd go through the router too:

```
if (PHP_SAPI === 'cli-server' && is_file(__DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) {
    return false;
}
```

## When to move to something more serious

This router is perfectly fine for a site with a few dozen pages or a small admin panel. It's also the foundation of [Orange CMS](/orange/), the CMS I wrote in PHP. Once you start needing middleware (authentication, CSRF), route groups or generating URLs from route names, you're rewriting a framework: at that point it's worth using a library like [FastRoute](https://github.com/nikic/FastRoute) or going straight to a framework like Slim or Laravel.
