---
title: "A Simple Routing System in PHP"
date: 2021-06-04
description: "Using a routing system in PHP can bring big advantages to a project. The URLs of a site's web pages are very important, both for search engines and for users, who increasingly rely…"
tags: ["Guides", "PHP"]
translationKey: "php-routing-system"
---

Using a routing system in PHP can bring big advantages to a project.

A page's **URL** is **very important**, both for search engines and for users, who increasingly rely on it to navigate a site quickly.

*For example, if the URL of a page listing a series of articles is http://www.sitename.com/2019/05/15, a user who has even a basic understanding of how a browser and the web work will already know that if they delete the "15" from the URL they'll see the list of articles for that month, and if they delete "05" they'll see the list of articles for that year, and so on.*

This is part of the conventions that have developed over the years, and it's good practice to follow them when building a website.

One thing I never liked about the early websites I built was seeing ".php" at the end of the URL. These days it really looks unprofessional.

**But is it possible to create custom, SEO-friendly URLs without using a CMS or a framework?**

The answer is **absolutely YES!!!**

If you're interested in a simple solution for "hiding" the ".php" at the end of the URL, read this [article](/en/hide-file-extension-from-url/).

If you want to learn how to build a simple routing system in PHP, here's how you can do it.

## BUILDING A ROUTING MANAGEMENT SYSTEM FOR YOUR SITE

We're going to **direct all traffic to index.php and then "route" it to the page we want**.

### Directing all traffic to index.php

Open the .htaccess file (create it if it doesn't exist) and add the following code:

``` wp-block-code
RewriteEngine On

RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-d

RewriteCond %{REQUEST_FILENAME} !-f

RewriteRule ^(.+)$ index.php [QSA,L]
```

This way, any request made to the server will open the "index.php" file.

### Building a routing system

In the index.php file, add the following code:

``` wp-block-code
<?php

$request = $_SERVER['REQUEST_URI'];

switch ($request) {
    case '/' :
        require __DIR__ . '/views/index.php';
        break;
    case '' :
        require __DIR__ . '/views/index.php';
        break;
    case '/about-us' :
        require __DIR__ . '/views/about-us.php';
        break;
    default:
        require __DIR__ . '/views/404.php';
        break;
}
```

This will save the request sent to the server (the part of the URL after "www.sitename.com") into the **$request** variable.

Then, using a switch statement, you can call up the page that matches the URL request.

If the request is empty or a "**/**", it redirects to the **homepage**; otherwise, it can redirect to the correct page.

In this example I created a "**views**" folder in the site root, which holds the files for each individual page. This keeps the code leaner and easier to understand.

Finally, 404 error handling is already in place, with no need to add anything else to the .htaccess file.

### Creating the views

At this point, all that's left is to create the files for our **views** — the pages the user sees.

You can simply create the following files with the following code in each of them:

**/views/index.php**

``` wp-block-code
<h1>Home Page</h1>
```

**/views/about-us.php**

``` wp-block-code
<h1>About Us</h1>
```

**/views/404.php**

``` wp-block-code
<h1>404 Error</h1>
```

And there you go! You'll have a routing system in PHP that's simple to manage but functional.

This system is the foundation of <a href="https://orange.albertoreineri.it/" target="_blank" rel="noreferrer noopener">Orange CMS</a>, my own CMS built in PHP. By expanding it properly, you can achieve pretty satisfying results.

I hope this can be of help.

*Happy coding!*

If you found this article **useful**, leave me a comment or share it on social media — I'd **really appreciate it**!
