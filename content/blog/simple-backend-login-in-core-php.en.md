---
title: "A Simple Backend Login in Core PHP"
date: 2021-05-31
description: "I made a new commit to this project, updating it to PDO, adding bind parameters to improve security, and slightly changing the software architecture. The updated code is in…"
tags: ["Guides", "PHP"]
translationKey: "php-backend-login"
---

*I made a new commit to this project, updating it to PDO, adding bind parameters to improve security, and slightly changing the software architecture. The updated code is in the GitHub repository linked in this article.*

It's true, these days there's a **ton of ready-made CMSs and frameworks** out there — just install them and voilà! Job done!

They all come with a login system to access a restricted area!

But I've always been the kind of person who isn't satisfied with the *ready-made meal* — I want to ***learn** how to cook*.

That's why I decided to **build my own CMS**, starting from scratch and using only HTML, CSS, JS and PHP.

One of the first things I had to build for my CMS was exactly that: a **login system** to access the restricted area.

## Login system in core PHP

I've now decided to **open source** a small system for accessing a restricted area.

You can find the source code for this little project on <a href="https://github.com/alby-dev" target="_blank" rel="noreferrer noopener">my GitHub profile</a>, at this address: <a href="https://github.com/alby-dev/Simple-login-and-registration-in-php" target="_blank" rel="noreferrer noopener">https://github.com/alby-dev/Simple-login-and-registration-in-php</a>

Let's skip the routing system and software architecture and **keep it simple** — let's just talk about the bare login itself.

### Restricted area

First, I created a "**login**" folder, which holds the files for the restricted area.

If I haven't logged in yet, I'll see the **login form**.

In the **index.php** file inside the login folder, I added the **form** to log in to the restricted area, with the form pointing to the **access.php** file, which contains the login-checking functions.

``` wp-block-code
      <!-- Login form -->
      <form class="" action="access.php" method="POST">
        <!-- Action -->
        <input type="hidden" name="action" value="login">
        <!-- Email or Username -->
        <label for="email">Email or Username</label>
        <input autofocus name="email" type="text">
        <!-- Password -->
        <label for="password">Password</label>
        <input name="password" id="password" placeholder="" type="password">
        <!-- Login Button -->
        <button type="submit">Login</button>
      </form>
      <!-- /Login form -->
```

**Access.php** handles both **login** and **registration** of new users. It's a file that contains only PHP — it runs the checks and then redirects to the correct page, depending on the type of request.

If I entered the correct credentials, it redirects to the **backend**.

If instead I entered the wrong credentials, it sends me back to the login form with an **error** message.

If I'm **creating a new user**, it follows the registration flow, sending a confirmation email with a link that, once clicked, confirms the account.

**access.php**

``` wp-block-code
<?php
//Config File
include("config.php");

//Control Action
if ($_POST['action'] == "login") {
    /*------------------------------------------------------
                        LOGIN
    -------------------------------------------------------*/
    ///$_Post variables
    $email = $_POST['email'];
    $password = $_POST['password'];

    //Query
    $sql = "SELECT * FROM users WHERE email = '" . $email . "' OR username ='" . $email . "'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {

            //Password control
            if (!(password_verify($password, $row["password"]))) {
                header("location: error.php?error=Wrong Password");
                die();
            }

            //Start Session
            session_start();

            //Save user id in session
            $_SESSION['id'] = $row["id"];

            //Redirect to backend homepage
            header("location: welcome.php");
            die();
        }
    } else {
        header("location: error.php?error=Wrong Email or Username");
        die();
    }
} elseif ($_POST['action'] == "register") {
     /*------------------------------------------------------
                        REGISTER
    -------------------------------------------------------*/
    $email = $_POST['email'];
    $username = $_POST['username'];
    $password = $_POST['password'];

    //Control if the user or email are already in the database
    $sql = "SELECT * FROM users WHERE email = '" . $email . "' OR username = '" . $username . "'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            header("location: error.php?error=Email or Username already register!");
        }
    }

    //Insert new user in DB
    $password = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username,email,password) 
    VALUES (
    '" . $username . "', 
    '" . $email . "', 
    '" . $password . "'
    )";
    if ($conn->query($sql) === TRUE) {       
        header("location: index.php");
    } else {
        header("location: error.php?error=" . $conn->error);
    }
}
$conn->close();
```

### Database

The database is a very simple MySQL setup, with a "**users**" table containing user data and the **encrypted password**.

To **block logged-out users** and only allow access to logged-in ones, you can use **session** variables, to be included in every file of the backend. This way, access is only granted to those who came through the login form. This part isn't in the GitHub repo, but it's very easy to add — maybe I'll add it when I have some time!

I hope this was **useful** and **interesting**.

If you want to **use** this form, try it out, or **improve** it, follow the **instructions** in the readme.txt file on GitHub.

*Happy coding!*
