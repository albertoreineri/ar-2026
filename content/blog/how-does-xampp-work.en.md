---
title: "How Does XAMPP Work"
date: 2020-03-20
description: "How to use XAMPP for local PHP development: starting Apache and MySQL, where to put your sites, how to open them in the browser and how to reach the database."
tags: ["Guides", "WordPress Basics"]
translationKey: "xampp-how-it-works"
aliases: ["/blog/how-does-xampp-work/"]
---

You've read the article about [setting up your PC for web development](https://albertoreineri.it/configurare-il-pc-per-sviluppare-in-wordpress/) *(article in Italian)*, you've installed all the programs, and you're ready to start developing!

## BUT HOW DOES XAMPP WORK?

While it's not a particularly complicated piece of software, the first approach can be a bit intimidating.

Today we'll see **how to start it up and get it running correctly**!

**First, launch XAMPP** by clicking its icon.

You'll land on a screen like this one:

On the left, you can see that **XAMPP provides a number of services.**

We're mainly interested in the first 2:

- **Apache** (the web server that lets WordPress run)
- **MySQL** (the database where we'll store the WordPress site's data)

Without further ado, **start both of these services** by clicking the "**Start**" button next to each of them.

If everything went well, "**Apache**" and "**MySQL**" should have a green background, like this:

At this point, our local server is up and running!

## NOW WHAT?

Now there are just a couple more things you need to know:

- **Where to actually put the websites** you want to "*run*" on the Apache server
- **How to manage the database**

Don't worry, this too is **easier done than said.**

### WHERE DO I PUT THE WEBSITES?

**XAMPP** provides a folder where you put all your websites.

You just need to **put your sites inside this folder** to be able to view them in your browser.

The folder is:

**Windows:** C:\xampp\htdocs

Every folder in this path will be a website and will be reachable through the browser.

### HOW DO I REACH THE WEBSITE FROM THE BROWSER?

We've seen where to put our websites — now let's see **how to open them from the browser.**

To view sites locally, you need to **tell the browser to look for our sites locally**, not on the www.

To do this, **in the address bar** type "*localhost*".

If you press enter, you should see XAMPP's default page, but we're not really interested in that — we want to see our own sites.

It's very simple: just type, after "localhost", a slash plus the folder inside htdocs containing your site.

#### Example:

- Go to the htdocs folder
- Create a folder called "test"
- Go into the folder
- Right-click and select "Open with Code" (you'll need Visual Studio Code for this — if you haven't installed it, [click here](https://albertoreineri.it/configurare-il-pc-per-sviluppare-in-wordpress/) *(article in Italian)*)
- Click "File – New File"
- Save it as "index.html"
- Inside the file, write "Hello World"
- Open your browser and type "localhost/test"

You should see a completely blank page with the text "Hello World" in the top left corner!

**Congratulations!** You just created **a website locally with XAMPP!**

## AND THE DATABASE?

I mentioned the database earlier, which is **fundamental for every WordPress site.**

To access the database, XAMPP automatically installs a site that lets you manage data simply and quickly: **phpMyAdmin**.

To access phpMyAdmin, just go to this **address** in your browser:

[localhost/phpmyadmin](http://localhost/phpmyadmin/)

And there you go — you just entered your local server's database management!

## TIPS:

A couple of tips to speed up your work:

- Create a shortcut on your desktop or taskbar to **XAMPP**
- Create a shortcut to the "**htdocs**" folder on your desktop or taskbar
- Add **phpMyAdmin** to your bookmarks

Great, **now you're ready to get serious!**
