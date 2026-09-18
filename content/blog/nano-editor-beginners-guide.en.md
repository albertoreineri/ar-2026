---
title: "Nano Editor: A Beginner's Guide"
date: 2022-06-27
description: "Linux users have plenty of options when it comes to text editors. From basic to advanced, there are tons of text editors out there, but some like Vim and Emacs can be quite intimidating…"
tags: ["Guides", "Linux"]
translationKey: "nano-editor-guide"
---

[Linux](/en/tags/linux/) users have plenty of options when it comes to text editors. From basic to advanced, there are tons of text editors out there, but some like Vim and Emacs can be quite intimidating for less experienced users.

This is where Nano comes to the rescue — arguably the best text editor for beginners.

## Nano

Nano is a simple, lightweight text editor built specifically for Unix systems and command-line desktop environments. It's licensed under the GNU General Public License and emulates the Pico text editor.

## How to install Nano

I'm using Ubuntu for this tutorial, but the installation process is the same on other Linux distributions.

Before installing, it's worth checking whether the Nano text editor is already installed on your system. Some Linux distributions ship with Nano pre-installed.

To check, run the following command in your terminal.

``` wp-block-code
$ nano --version
```

If you get an output with the current version of nano, you can skip the installation since Nano is already installed on your system.

Installing the Nano text editor is straightforward — just run the following command in your terminal and wait for the installation to complete.

``` wp-block-code
$ sudo apt-get install nano
```

CentOS/Red Hat Enterprise Linux (RHEL) users can use the following command to install Nano.

``` wp-block-code
$ sudo yum install nano
```

Now that Nano is correctly installed on your system and ready to use, let's move on to a beginner's guide to using the Nano text editor.

## Guide to using the Nano text editor

Let's see how to use the Nano text editor.

### How to open/close the Nano text editor

The command to open the Nano text editor is the following.

``` wp-block-code
$ nano filename
```

You can open various types of files in the Nano text editor, including .txt, .php, .html and many others. You just need to type the file name followed by an extension to open that particular file in the Nano editor. For example, let's say you need to open a file called my_file.txt, the command would be as follows.

``` wp-block-code
$ nano my_file.txt
```

Make sure you're in the directory where the file was saved. If the file isn't present in the directory, the Nano text editor will create a new file in the current directory.

Once the file is open, you'll notice the Nano interface shows the file name at the top, while at the bottom you'll mostly see shortcuts like cut, replace, go to line and justify. Here ˄ means the **CTRL** key on your keyboard.

For example, to **write** or save your changes, you need to press CTRL + O on your keyboard.

If you're opening a configuration file, make sure to use the **–w** option — this tells the Nano editor to open the configuration file in a standard format. If you don't use this option, the Nano editor will wrap the file's text to fit the window, which ends up being hard to read.

## How to search / replace text

**CTRL + W** is the shortcut to search for a word in the editor. Now you need to enter the text you want to search for and then press Enter. To keep searching for the same text, use the **ALT + W** key.

To replace text, you need to use **CTRL + R** — the editor will take you to the first instance of the text you want to replace; to replace all occurrences of the text, press **A**. But if you only want to replace one occurrence, press **Y**.

## How to copy and paste text

Copy-pasting isn't as straightforward in the Nano editor as in other text editors. If you want to cut and paste a particular line, you first need to move the cursor to the beginning of that line.

Now you need to press **CTRL + K** to cut the line, then move the cursor to where you want to paste it, and finally press **CTRL + U** to paste the line.

To copy and paste a particular string or word, you need to select that word or string by pressing **CTRL + 6** or **ALT + A**, making sure the cursor is at the beginning of the word.

Now you can use **CTRL + K** and **CTRL + U** to cut and paste the word or string.

That's how you can get started using the Nano text editor. Editing a text file from the command line isn't easy, but the Nano text editor makes it simpler. It's reliable and one of the easiest command-line tools to use.

From beginners to professionals, everyone finds the Nano text editor a useful command-line tool. I hope this guide has definitely helped you get started with Nano.

Below is a list of frequently used commands:

## Handy Nano shortcuts

<figure class="wp-block-table">
<table>
<thead>
<tr>
<th>Command</th>
<th>Action</th>
</tr>
</thead>
<tbody>
<tr>
<td>CTRL + A</td>
<td>Go to the beginning of the line</td>
</tr>
<tr>
<td>CTRL + E</td>
<td>Go to the end of the line</td>
</tr>
<tr>
<td>CTRL + Y</td>
<td>Scroll down the page</td>
</tr>
<tr>
<td>CTRL + V</td>
<td>Scroll up the page</td>
</tr>
<tr>
<td>CTRL + _</td>
<td>Go to a specific line</td>
</tr>
<tr>
<td>CTRL + C</td>
<td>Show current cursor position</td>
</tr>
<tr>
<td>CTRL + V</td>
<td>Scroll up</td>
</tr>
<tr>
<td>CTRL + W</td>
<td>Search for text</td>
</tr>
<tr>
<td>CTRL + D</td>
<td>Delete the character under the cursor</td>
</tr>
<tr>
<td>CTRL + K</td>
<td>Delete the whole line</td>
</tr>
<tr>
<td>CTRL + \</td>
<td>Replace a string</td>
</tr>
<tr>
<td>CTRL + O</td>
<td>Save the content without exiting</td>
</tr>
<tr>
<td></td>
<td></td>
</tr>
</tbody>
</table>
</figure>
