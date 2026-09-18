---
title: "Hiding the File Extension at the End of a URL"
date: 2019-12-19
description: "These days, seeing a file extension at the end of a URL isn't great, both for SEO and for the impression the site makes on the end user — it's better to hide it. The ability to…"
tags: ["Guides", "Web Dev"]
translationKey: "hide-url-extension"
---

These days, seeing a file extension at the end of a URL isn't great, both for SEO and for the impression the site makes on the end user — it's better to hide it.

The **ability to choose your own URLs** is essential for building a good website. By using PHP pages correctly, you can simply achieve this result by hiding just the extension from the URL.

In this guide, we'll see how to **"remove" the .php** from the end of the URL.

To do this, just **add the following code to the .htaccess file** in the site root. If the .htaccess file doesn't exist, create it using a text editor.

``` wp-block-code
RewriteEngine on

RewriteCond %{THE_REQUEST} /([^.]+)\.php [NC]

RewriteRule ^ /%1 [NC,L,R]

RewriteCond %{REQUEST_FILENAME}.php -f

RewriteRule ^ %{REQUEST_URI}.php [NC,L]
```

This way, all your ".php" files will be shown without the extension.

Doing this makes the whole site look better. The URLs will be much more "*SEO friendly*," and it also benefits the site's security.

If you look at modern websites from big companies, pretty much none of them still use a file extension at the end of the URL.

Today we can also use frameworks that let us manage URLs in a completely custom, optimal way, but you don't always need a whole framework. For small projects, it's often better to build things from scratch, and in those cases a few lines of code in the .htaccess file are enough to easily hide the extension from the URL.

If you want to learn how to build a simple routing system, to better organize your website and manage your URLs, read this [article](/en/simple-php-routing-system/). It's pretty basic and simple, but it can be used for small, no-frills projects. It's certainly nothing like <a href="https://laravel.com/" target="_blank" rel="noreferrer noopener">Laravel</a>'s routing, for example, but it can be a good starting point for improving your skills.
