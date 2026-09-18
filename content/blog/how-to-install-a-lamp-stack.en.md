---
title: "How to Install a LAMP Stack (Linux, Apache, MySQL, PHP) on Ubuntu"
date: 2022-06-20
description: "Introduction A 'LAMP' stack is a group of open source software that's typically installed together to enable a server to host dynamic websites and web apps. The term is actually an…"
tags: ["Guides", "Linux"]
translationKey: "lamp-stack-install"
---

## Introduction

A "LAMP" stack is a group of open source software that's typically installed together to enable a server to host dynamic websites and web apps. The term is actually an acronym representing the **L**inux operating system, with the **A**pache web server. Site data is stored in a **M**ySQL database, and dynamic content is processed by **P**HP.

In this guide, we'll install a LAMP stack on an Ubuntu server.

## Prerequisites

This tutorial is built on Ubuntu, but it works on all Debian-based distros, such as Pop!_OS, Elementary OS, Linux Mint, etc.

## Step 1: Installing Apache

The Apache web server is a popular open source web server that can be used together with [PHP](https://albertoreineri.it/le-basi-di-php/) *(article in Italian)* to host dynamic websites. It's well documented and has been widely used throughout most of the web's history.

First, make sure your `apt` cache is up to date with:

``` wp-block-code
sudo apt update
```

If this is the first time you've used `sudo` in this session, you'll be asked to provide your user password to confirm your permissions.

Once the cache is updated, you can install Apache by running:

``` wp-block-code
sudo apt install apache2
```

After entering this command, `apt` will tell you which packages it intends to install and how much disk space they'll take up. Press `Y` and then `ENTER` to confirm, and the installation will proceed.

And there you go! Apache is installed!

You can do a quick check to make sure everything went as expected by visiting your server's public IP address in your web browser. If you're local, just open your browser and type in the address bar:

``` wp-block-code
http://localhost
```

If instead you're setting up a remote web server, you'll need to enter your IP address:

``` wp-block-code
http://your_server_ip
```

You should now see Apache's default web page in your browser, which is there for informational and testing purposes. It should look something like this:

If you see this page, your web server is now correctly installed and accessible through your firewall.

### How to find your server's public IP address

If you're setting up a remote web server and don't know your server's public IP address, there are several ways to find it. It's usually the address you use to connect to your server via SSH.

There are several ways to do this from the command line. First, you can use the *iproute2* tools to get your IP address by typing this:

``` wp-block-code
ip addr show eth0 | grep inet | awk '{ print $2; }' | sed 's/\/.*$//'
```

This will return two or three lines. They're all valid addresses, but your computer may only be able to use one of them, so feel free to try them out.

An alternative method is to use the `curl` utility to contact an external party and ask how it *sees* your server. This is done by asking a specific server what your IP address is:

``` wp-block-code
sudo apt install curl
curl http://icanhazip.com
```

Whichever method you use to get your IP address, type it into your browser's address bar to view Apache's default page.

## Step 2: Installing MySQL

Now that your web server is up and running, it's time to install MySQL. MySQL is a database management system. Basically, it will organize and provide access to databases where your site can store information.

Once again, we'll use `apt` to fetch and install this software:

``` wp-block-code
sudo apt install mysql-server
```

**Note**: in this case, you don't need to run `sudo apt update` before this command. That's because you recently ran it in the commands above to install Apache. Your computer's package index should already be up to date.

This command will also show you a list of the packages that will be installed, along with how much disk space they'll take up. Enter `Y` to continue.

Once installation is complete, run a simple security script pre-installed with MySQL that will remove some dangerous default settings and lock down access to your database system (if you're local, this isn't strictly necessary). Start the interactive script by running:

``` wp-block-code
sudo mysql_secure_installation
```

This will ask if you want to configure the `VALIDATE PASSWORD PLUGIN`.

**Note:** enabling this feature is somewhat of a judgment call. If enabled, passwords that don't match the specified criteria will be rejected by MySQL with an error. This will cause problems if you use a weak password together with software that automatically configures MySQL user credentials, such as Ubuntu's packages for phpMyAdmin. It's safe to leave validation disabled, but you should always use strong, unique passwords for your database credentials.

Answer `Y` for yes, or anything else to continue without enabling it.

``` wp-block-code
VALIDATE PASSWORD PLUGIN can be used to test passwords
and improve security. It checks the strength of password
and allows the users to set only those passwords which are
secure enough. Would you like to setup VALIDATE PASSWORD plugin?

Press y|Y for Yes, any other key for No:
```

If you answer "yes," you'll be asked to select a password validation level. Keep in mind that if you enter `2`, the strongest level, you'll get errors when trying to set a password that doesn't contain numbers, upper and lower case letters, and special characters, or that's based on common dictionary words.

``` wp-block-code
There are three levels of password validation policy:

LOW    Length >= 8
MEDIUM Length >= 8, numeric, mixed case, and special characters
STRONG Length >= 8, numeric, mixed case, special characters and dictionary                  file

Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG: 1
```

Regardless of whether you chose to set up `VALIDATE PASSWORD PLUGIN`, your server will next ask you to select and confirm a password for the MySQL **root** user. This shouldn't be confused with the **system root**. The **database root** user is an administrative user with full privileges over the database system. Even though the default authentication method for the MySQL root user does away with the use of a password, **even when one is set**, you should define a strong password here as an extra security measure. We'll get to that in a moment.

If you enabled password validation, you'll be shown the strength of the root password you just entered, and your server will ask if you want to change that password. If you're happy with your current password, type `N`:

``` wp-block-code
Using existing password for root.

Estimated strength of the password: 100
Change the password for root ? ((Press y|Y for Yes, any other key for No) : n
```

For the rest of the questions, press `Y` and press `ENTER` at each prompt. This will remove some anonymous users and the test database, disable remote root logins, and load these new rules so MySQL immediately respects the changes made.

Once done, check if you can access the MySQL console by typing:

``` wp-block-code
sudo mysql
```

This will connect to the MySQL server as the administrative **root** database user, which is inferred from the use of `sudo` when running this command. You should see output like this:

``` wp-block-code
OutputWelcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 5
Server version: 5.7.34-0ubuntu0.18.04.1 (Ubuntu)

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

To exit the MySQL console, type:

``` wp-block-code
exit
```

Keep in mind that you don't need to provide a password to connect as the **root** user, even if one was defined while running `mysql_secure_installation`. That's because the default authentication method for the administrative MySQL user is `unix_socket` instead of `password`. While this might seem like a security issue at first, it actually makes the database server more secure, because the only users allowed to log in as the MySQL **root** user are system users with sudo privileges connecting from the console or through an application running with those same privileges. In practical terms, this means you won't be able to use the administrative database **root** user to connect from your PHP application. The MySQL account acts as a safeguard, in case the default authentication method is ever changed from `unix_socket` to `password`.

For better security, it's best to have dedicated user accounts with more limited privileges set up for each database, especially if you plan on hosting multiple databases on your server — but I'll cover that in more detailed guides in the future.

Your MySQL server is now installed and secured. Let's now see how to install PHP, the final component of the LAMP stack.

## Step 3: Installing PHP

PHP is the component of the setup that will process code to display dynamic content. It can run scripts, connect to your MySQL databases to fetch information, and hand the processed content to your web server so it can show the results to your visitors.

Once again, we'll use the apt system to install PHP. In addition to the php package, you'll also need to integrate libapache2-mod-php into Apache and the php-mysql package to let PHP connect to MySQL databases. Run the following command to install all three packages and their dependencies:

``` wp-block-code
sudo apt install php libapache2-mod-php php-mysql
```

This should install PHP without any issues. We'll test it in a moment.

### Changing Apache's directory index (optional)

In some cases, you'll want to change how Apache serves files when a directory is requested. By default, if a user requests a directory from the server, Apache will first look for a file called `index.html`. But we want to tell the web server to prefer PHP files over others, so that Apache looks for `index.php` first. Otherwise, an `index.html` file placed in the application's document root will always take precedence over an `index.php` file.

To make this change, open the `dir.conf` configuration file in a text editor of your choice. Here we'll use `nano`:

``` wp-block-code
sudo nano /etc/apache2/mods-enabled/dir.conf
```

You should see something like this:

``` wp-block-code
<IfModule mod_dir.c>
    DirectoryIndex index.html index.cgi index.pl index.php index.xhtml index.htm
</IfModule>
```

Move the PHP index file (highlighted above) to the first position after `DirectoryIndex`, like this:

``` wp-block-code
<IfModule mod_dir.c>
    DirectoryIndex index.php index.html index.cgi index.pl index.xhtml index.htm
</IfModule>
```

Once done, save and close the file by pressing `CTRL+X`. Confirm the save by typing `Y` and then press `ENTER` to confirm the file's save location.

Next, restart the Apache web server so the changes take effect. You can do this with the following command:

``` wp-block-code
sudo systemctl restart apache2
```

You can also check the status of the `apache2` service using `systemctl`:

``` wp-block-code
sudo systemctl status apache2
```

``` wp-block-code
Sample Output● apache2.service - The Apache HTTP Server
   Loaded: loaded (/lib/systemd/system/apache2.service; enabled; vendor preset: enabled)
  Drop-In: /lib/systemd/system/apache2.service.d
           └─apache2-systemd.conf
   Active: active (running) since Thu 2021-07-15 09:22:59 UTC; 1h 3min ago
 Main PID: 3719 (apache2)
    Tasks: 55 (limit: 2361)
   CGroup: /system.slice/apache2.service
           ├─3719 /usr/sbin/apache2 -k start
           ├─3721 /usr/sbin/apache2 -k start
           └─3722 /usr/sbin/apache2 -k start

Jul 15 09:22:59 ubuntu1804 systemd[1]: Starting The Apache HTTP Server...
Jul 15 09:22:59 ubuntu1804 apachectl[3694]: AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 127.0.1.1. Set the 'ServerName' di
Jul 15 09:22:59 ubuntu1804 systemd[1]: Started The Apache HTTP Server.
```

Press `Q` to exit this status view.

## Step 4: Setting up a virtual host (recommended)

When using the Apache web server, you can use *virtual hosts* to encapsulate configuration details and host more than one domain from a single server. We'll now set up a sample domain called **my_domain**, which you can replace with the domain name you want to use.

Apache has a default server block enabled out of the box, configured to serve documents from the `/var/www/html` folder. While that works fine for a single site, it can get unwieldy if you host multiple sites. Instead of editing `/var/www/html`, let's create a directory structure inside `/var/www` for the **my_domain** site, leaving `/var/www/html` as the default directory to serve if a client request doesn't match any other site.

Create the directory for **my_domain** as follows:

``` wp-block-code
sudo mkdir /var/www/my_domain
```

Then, assign ownership of the directory with the `$USER` environment variable, which refers to the currently logged-in user:

``` wp-block-code
sudo chown -R $USER:$USER /var/www/my_domain
```

The permissions on your web root should be correct if you haven't changed its umask value, but you can still type:

``` wp-block-code
sudo chmod -R 755 /var/www/my_domain
```

Now create a sample `index.html` page using `nano` or your preferred editor:

``` wp-block-code
nano /var/www/my_domain/index.html
```

Inside, add the following sample HTML code:

``` wp-block-code
<html>
    <head>
        <title>My Domain</title>
    </head>
    <body>
        <h1>My domain WORKS!!!</h1>
    </body>
</html>
```

Save and close the file when you're done.

For Apache to serve this content, you need to create a virtual host file with the right directives. Instead of editing the default configuration file located at `/etc/apache2/sites-available/000-default.conf` directly, let's create a new one at `/etc/apache2/sites-available/my_domain.conf`:

``` wp-block-code
sudo nano /etc/apache2/sites-available/my_domain.conf
```

Paste the following configuration block, which is similar to the default one but updated for our new directory and domain name:

``` wp-block-code
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    ServerName my_domain
    ServerAlias www.my_domain
    DocumentRoot /var/www/my_domain
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Notice that we updated the `DocumentRoot` to our new directory, and `ServerAdmin` to an email the administrator of **my_domain** can access. We also added two directives: `ServerName`, which establishes the base domain that should match this virtual host definition, and `ServerAlias`, which defines other names that should match as if they were the base name.

Save and close the file when you're done.

Now let's enable the file with the `a2ensite` tool:

``` wp-block-code
sudo a2ensite my_domain.conf
```

Finally, disable the default site defined in `000-default.conf`:

``` wp-block-code
sudo a2dissite 000-default.conf
```

Next, let's test for configuration errors:

``` wp-block-code
sudo apache2ctl configtest
```

You should see the following output:

``` wp-block-code
OutputSyntax OK
```

Restart Apache to apply the changes:

``` wp-block-code
sudo systemctl restart apache2
```

Apache should now be serving your domain name. You can test this by navigating to `http://my_domain`, and you should see the HTML page you just created working correctly.

With that, your virtual host is fully configured. Before making further changes or deploying an application, though, it would be worth proactively testing the PHP setup in case there are issues that need to be fixed.

## Step 5: Testing PHP processing on the web server

To verify your system is correctly configured for PHP, create a PHP script called `info.php`. For Apache to find and serve this file correctly, it needs to be saved in the web root directory.

Create the file in the web root you created in the previous step by running:

``` wp-block-code
sudo nano /var/www/my_domain/info.php
```

This will open an empty file. Add the following text, which is valid PHP code, inside the file:

``` wp-block-code
<?php
phpinfo();
```

Once done, save and close the file.

Now you can check whether your web server is able to correctly display the content generated by this PHP script. To test it, visit this page in your web browser. You'll need your server's public IP address or domain name again.

The address you'll want to visit is:

``` wp-block-code
http://my_domain/info.php
```

The page you land on should look something like this:

This page provides some basic information about your server from PHP's point of view. It's useful for debugging and for making sure settings are applied correctly.

If you can see this page in your browser, your PHP setup is working as expected.

You'll probably want to remove this file after this test, because it could actually expose information about your server to unauthorized users. To do that, run the following command:

``` wp-block-code
sudo rm /var/www/my_domain/info.php
```

You can always recreate this page if you need to access this information again later.

## Conclusion

Now that you've installed a LAMP stack, you have plenty of choices for what to do next. You've installed a platform that will let you install most types of websites and web software on your server.

All that's left is to start installing or building your PHP sites on your new LAMP stack!

Happy coding!
