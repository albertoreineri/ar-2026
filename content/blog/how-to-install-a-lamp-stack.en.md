---
title: "How to install a LAMP stack on Ubuntu 24.04 (Apache, MySQL, PHP)"
seoTitle: "LAMP on Ubuntu 24.04: Apache, MySQL and PHP 8.3"
date: 2022-06-20
lastmod: 2026-09-24
description: "Apache, MySQL 8 and PHP 8.3 on Ubuntu 24.04: firewall, virtual host with .htaccess, a dedicated database user, HTTPS with Let's Encrypt and common errors."
tags: ["Guides", "Linux"]
translationKey: "lamp-stack-install"
---

**LAMP** stands for **L**inux, **A**pache, **M**ySQL and **P**HP: the operating system, the web server, the database and the language that generates the pages. It's the stack a huge share of the web still runs on, WordPress and Laravel included, and the most direct way to understand what really happens between the browser's request and the server's response.

In this guide we'll set up a complete LAMP stack on **Ubuntu 24.04 LTS**, ready to host a real site: not just installing packages, but also the firewall, a virtual host, a dedicated database user and HTTPS. At the end you'll find the errors I see most often when someone asks me for help with a server.

## Before you start

You'll need:

- a server or virtual machine running **Ubuntu 24.04** and a user with `sudo` privileges (don't work directly as root);
- SSH access, if the server is remote;
- for HTTPS, a **domain** with an A record pointing to the server's IP. If you're not sure how to set that up, I wrote a guide on [how DNS works](/en/how-dns-works/).

On Ubuntu 26.04 the steps are the same. Only the PHP and MySQL version numbers change, and you can check them with `php -v` and `mysql --version`. On **Debian** everything is the same with one exception: the repositories don't ship `mysql-server` but **MariaDB** (`sudo apt install mariadb-server`), which is compatible for almost every use.

We'll edit several config files along the way: I use nano, and if you don't know it I wrote a [practical guide with the essential shortcuts](/en/nano-editor-beginners-guide/).

## Step 1: update the system and set up the firewall

```
sudo apt update && sudo apt upgrade
```

Ubuntu ships **UFW**, a simple front end for the firewall. Before enabling it, allow SSH: if you enable it without this rule on a remote server, you'll lock yourself out.

```
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

We'll open the web ports right after installing Apache.

## Step 2: Apache

```
sudo apt install apache2
```

Apache starts on its own and is enabled at boot. The package registers the **Apache Full** profile in UFW, which opens ports 80 (HTTP) and 443 (HTTPS):

```
sudo ufw allow "Apache Full"
```

Now open the server's IP address in your browser (or `http://localhost` if you're working locally): you should see Apache's welcome page. If you don't know the server's public IP:

```
curl -4 icanhazip.com
```

`hostname -I` shows the addresses of the network interfaces instead, which on a server behind NAT or a local VM won't match the public IP.

## Step 3: MySQL

```
sudo apt install mysql-server
```

On Ubuntu 24.04 this installs **MySQL 8.0**. Then run the script that removes the insecure defaults:

```
sudo mysql_secure_installation
```

The script asks whether to enable the **VALIDATE PASSWORD** component, which rejects weak passwords. On a production server it makes sense, but keep in mind it can break tools that generate passwords automatically. Answer `Y` to every other question: it removes anonymous users, disables remote root login and drops the test database.

One thing that confuses many people: on Ubuntu the **MySQL root user** authenticates with the `auth_socket` plugin, meaning it's based on the system user connecting, not on a password. That's why you get into the console without being asked anything:

```
sudo mysql
```

It's a sensible choice: only people with `sudo` on the server can administer the database. The practical consequence is that **your PHP application must never use root**. Create a dedicated database and user for each site:

```
CREATE DATABASE example;
CREATE USER 'example'@'localhost' IDENTIFIED BY 'a-long-random-password';
GRANT ALL PRIVILEGES ON example.* TO 'example'@'localhost';
EXIT;
```

In MySQL 8 the default character set is already `utf8mb4`, so emoji and special characters work with no extra configuration. You don't need `FLUSH PRIVILEGES` either: with `CREATE USER` and `GRANT` the permissions apply immediately.

## Step 4: PHP

```
sudo apt install php libapache2-mod-php php-mysql
```

On Ubuntu 24.04 you get **PHP 8.3**, already wired into Apache through `mod_php`. Almost every real application needs a few more extensions. This is the set I usually install, and it covers WordPress, Laravel and most CMSs:

```
sudo apt install php-curl php-gd php-mbstring php-xml php-zip php-intl
sudo systemctl restart apache2
```

`php -m` lists the active modules.

## Step 5: the virtual host

By default Apache serves the `/var/www/html` folder. For a real site it's worth creating a dedicated **virtual host**: each domain gets its own folder, configuration and logs, and you can host as many as you like on the same server. The examples use `example.com`: replace it with your domain.

```
sudo mkdir -p /var/www/example.com/public
sudo chown -R $USER:$USER /var/www/example.com
```

The `public` subfolder is a good habit: only what's inside it is reachable from the web, while config, `.env` files and application code can live one level up. It's the same layout Laravel uses.

Create the config file:

```
sudo nano /etc/apache2/sites-available/example.com.conf
```

```
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com/public

    <Directory /var/www/example.com/public>
        AllowOverride All
        Require all granted
        DirectoryIndex index.php index.html
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/example.com-error.log
    CustomLog ${APACHE_LOG_DIR}/example.com-access.log combined
</VirtualHost>
```

Three details that make a difference:

- **`AllowOverride All`** lets you use `.htaccess` files. Ubuntu's default config ignores them, which is why so many rewrite rules "don't work". You need them, for example, to [hide the .php extension from URLs](/en/hide-file-extension-from-url/) or to build a [routing system in PHP](/en/simple-php-routing-system/).
- **`DirectoryIndex`** makes Apache look for `index.php` before `index.html`, for this site only, without touching the global config.
- **Separate logs per site**: when something breaks, you don't have to dig through a single file that mixes every domain.

Enable the site and the `rewrite` module (needed by almost every CMS and framework), and disable the default site:

```
sudo a2ensite example.com.conf
sudo a2enmod rewrite
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

`apache2ctl configtest` must answer `Syntax OK`. Make a habit of running it **before** every reload: a syntax error in one virtual host can stop Apache from starting again, taking every site on the server down with it.

## Step 6: check that PHP works

Create a test file:

```
echo "<?php phpinfo();" > /var/www/example.com/public/info.php
```

Open `http://example.com/info.php`: if you see the page with the PHP version and the list of modules, Apache is running PHP correctly. **Delete the file right away**, because it exposes details about the server's configuration to anyone:

```
rm /var/www/example.com/public/info.php
```

## Step 7: HTTPS with Let's Encrypt

In 2026 a site without HTTPS isn't an option. With **Certbot** the certificate is free and renews itself. The method the project recommends is the snap (there's more on snaps in my guide to [Linux package management](/en/linux-package-management-explained/)):

```
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --apache -d example.com -d www.example.com
```

Certbot reads the virtual host, obtains the certificate, creates the config for port 443 and, if you ask it to, adds the redirect from HTTP to HTTPS. Renewal is automatic. You can check it with:

```
sudo certbot renew --dry-run
```

For this to work, the domain must already point to the server and port 80 must be open: Let's Encrypt verifies that you own the domain by making an HTTP request to the server.

## One step further: PHP-FPM

`mod_php` is the simplest way to run PHP with Apache, but not the most efficient: it ties PHP to every Apache process, which then has to use the `prefork` MPM, the heaviest one. On a server with real traffic it pays to switch to **PHP-FPM**, which runs PHP in a separate process pool, together with the `event` MPM:

```
sudo apt install php-fpm
sudo a2dismod php8.3 mpm_prefork
sudo a2enmod mpm_event proxy_fcgi setenvif
sudo a2enconf php8.3-fpm
sudo apache2ctl configtest && sudo systemctl restart apache2
```

If you have a different PHP version, replace `8.3` with yours. The benefit isn't just memory: with FPM you can give each site its own pool running as its own system user, so a compromised site can't read the others' files.

## Common errors

**"AH00558: Could not reliably determine the server's fully qualified domain name".** It's a warning, not an error: Apache works anyway. To get rid of it:

```
echo "ServerName localhost" | sudo tee /etc/apache2/conf-available/servername.conf
sudo a2enconf servername && sudo systemctl reload apache2
```

**The browser downloads the PHP file instead of running it.** Apache isn't handing `.php` files to the interpreter: the `php8.3` module (or the `php8.3-fpm` config) isn't enabled. Check with `apache2ctl -M | grep -i php` and enable it again.

**403 Forbidden.** Apache can't read the folder, or the `<Directory>` block with `Require all granted` is missing. The `www-data` user must be able to read the files and traverse every folder in the path: `namei -l /var/www/example.com/public/index.php` shows the permissions of the whole path at once.

**Rules in `.htaccess` are ignored.** `AllowOverride All` is missing from the virtual host, or you haven't enabled `mod_rewrite` with `a2enmod rewrite`.

**"Access denied for user 'root'@'localhost'" from the application.** That's `auth_socket` doing its job: root doesn't authenticate with a password. Don't change root's authentication method: create a dedicated user as shown in step 3.

**Apache won't start: "Address already in use".** Something else is holding port 80, often a previously installed nginx. `sudo ss -tlnp | grep ':80'` tells you which process.

## In short

A production-ready LAMP stack is more than `apt install`: the firewall on before the server is exposed, one virtual host per site, one database user per application, HTTPS from day one and `configtest` before every reload. It's five extra minutes at install time, and it saves you hours of figuring out why something doesn't work.
