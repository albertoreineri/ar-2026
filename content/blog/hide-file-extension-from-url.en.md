---
title: "Hiding the .php extension from URLs with .htaccess"
seoTitle: "Remove .php from URLs with .htaccess"
date: 2019-12-19
lastmod: 2026-09-24
description: "A few lines of mod_rewrite in your .htaccess file to hide the .php extension from URLs and redirect old requests to the clean version."
tags: ["Guides", "Web Dev"]
translationKey: "hide-url-extension"
---

`/about` is cleaner than `/about.php`. It's not strictly an SEO matter, since Google doesn't care about the extension. The point is that a URL without an extension doesn't depend on the technology: if the site later moves to a framework or a static site generator, the addresses stay the same and you don't lose links or rankings.

On a plain PHP site, with no CMS or framework, a few lines in the `.htaccess` file are all it takes.

{{< youtube VWqwsKL2-mM >}}

## The code

In the site's root, in the `.htaccess` file (create it if it doesn't exist):

```
RewriteEngine On

# 1. /index.php and /folder/index.php -> / and /folder/
RewriteCond %{THE_REQUEST} \s/+(.*/)?index(\.php)?[\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]

# 2. /page.php -> /page (visible redirect, except for POST forms)
RewriteCond %{REQUEST_METHOD} !POST
RewriteCond %{THE_REQUEST} \s/+(.+?)\.php[\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]

# 3. /page -> page.php (internal rewrite, invisible to the user)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^(.+)$ $1.php [L]
```

What each block does:

1. **The home page and indexes** don't become `/index`: anyone landing on `/index.php` is sent to `/`.
2. **Old URLs with `.php`** (external links, Google results, bookmarks) are redirected to the clean version with a **301**. The 301 is what tells Google the address has changed for good, and it carries the rankings over to the new URL.
3. **Requests without an extension** are served by the matching `.php` file, with no redirect: the address bar keeps showing `/about`.

## Why it's written this way

The code you'll find around (including the first version of this article) is often shorter. These are the details that make the difference.

**`THE_REQUEST` rather than `REQUEST_URI`.** `THE_REQUEST` is the browser's original request, before any rewriting. If rule 2 looked at `REQUEST_URI`, it would also see the `.php` added internally by rule 3, and the result would be an infinite redirect.

**POST forms are excluded.** If a form has `action="contact.php"` and the server answers with a redirect, the browser repeats the request as GET and the submitted data is lost, with no visible error. With the `!POST` condition old forms keep working. Still, update your links and form `action`s to the extension-less version.

**Explicit `R=301`.** A bare `R` produces a **302**, a temporary redirect, and Google keeps treating the old URL as the main one.

**`NE`** stops special characters in URLs from being encoded twice during the redirect.

## Before going live: test with 302

Browsers cache 301 redirects very aggressively. If you get a rule wrong and test it with a 301, your browser will keep following the wrong redirect even after you've fixed it. While testing, replace `R=301` with `R=302` and work in a private window. Once everything works, switch back to `R=301`.

From the terminal you can check the redirects without a browser in the way:

```
curl -I https://example.com/about.php
```

The response should show `HTTP/1.1 301` and `Location: https://example.com/about`.

## If it doesn't work

**Error 500 as soon as you save the file.** Usually `mod_rewrite` isn't enabled, and Apache doesn't recognise `RewriteEngine`. On Debian and Ubuntu: `sudo a2enmod rewrite && sudo systemctl restart apache2`. The exact reason is always in Apache's error log.

**The rules are ignored.** Apache isn't reading the `.htaccess` file: `AllowOverride All` is missing from the virtual host. My guide to the [LAMP stack on Ubuntu](/en/how-to-install-a-lamp-stack/) has the complete configuration.

**The site lives in a subfolder.** If the site is at `example.com/project/`, add `RewriteBase /project/` below `RewriteEngine On`, and in rules 1 and 2 replace `/%1` with `/project/%1`.

**You're on nginx.** nginx doesn't read `.htaccess` files. The equivalent of rule 3 goes in the server configuration:

```
location / {
    try_files $uri $uri/ @php;
}

location @php {
    rewrite ^(.*)$ $1.php last;
}
```

## One step further

Hiding the extension is the right fix when every page is already its own `.php` file. If you want URLs with parameters, like `/article/how-dns-works`, or a 404 page handled in PHP, the next step is a router: I wrote about building a [simple routing system in PHP](/en/simple-php-routing-system/) from scratch, without a framework.
