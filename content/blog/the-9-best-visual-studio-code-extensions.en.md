---
title: "The best VS Code extensions in 2026 (and the ones you no longer need)"
seoTitle: "The Best VS Code Extensions in 2026"
date: 2023-10-29
lastmod: 2026-09-24
description: "The VS Code extensions I actually use in 2026: code quality, Git, remote development over SSH and containers, PHP and AI, plus the ones now built in."
tags: ["Web Dev"]
translationKey: "vscode-extensions"
aliases: ["/blog/the-9-best-visual-studio-code-extensions/"]
---

The first version of this article recommended Bracket Pair Colorizer, Debugger for Chrome and Auto Rename Tag. Today all three are pointless: their features are **built into VS Code**, and the extension at best duplicates something you already have.

That's why I rewrote the list from scratch. Extensions aren't free: each one slows startup a little, uses memory and **runs with your user's full permissions**. My rule is to install only what I use every week, and to check every now and then whether the editor already does the same thing on its own.

## Before installing: what VS Code already does

These settings replace three or four extensions you'll still find on almost every list. Open them with `Ctrl + Shift + P` → "Preferences: Open User Settings (JSON)":

```
{
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.linkedEditing": true,
  "editor.stickyScroll.enabled": true,
  "editor.formatOnSave": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

- **Coloured brackets** (`bracketPairColorization`): what Bracket Pair Colorizer did, but native and much faster. Its own author deprecated the extension.
- **Closing tag rename** (`linkedEditing`): edit `<div>` and `</div>` updates itself. What Auto Rename Tag did, for HTML and JSX.
- **JavaScript debugging in the browser**: the built-in debugger has handled Chrome and Edge for years. Debugger for Chrome is deprecated.
- **Sticky scroll**: keeps the signature of the function or class you're in pinned at the top of the screen. In long files it's more useful than any extension.

## Code quality

### [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Shows ESLint errors as you type and can fix them on save. Since ESLint 9 the configuration uses the *flat* format (`eslint.config.js`): if the extension reports nothing in a new project, the cause is almost always a config in the old `.eslintrc` format.

### [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Formats JavaScript, TypeScript, CSS, HTML, JSON, YAML and Markdown according to fixed rules, so the team stops arguing about commas and indentation. Set it as the default formatter and let it run on save:

```
{
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

If you're starting a JavaScript project from scratch, also look at [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome): it's both linter and formatter, with a single config file, and it's much faster. On existing projects with ESLint and Prettier already configured, switching isn't worth it.

### [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

Shows errors and warnings right on the line, instead of making you hover over the squiggle. It sounds minor, but it changes how you read code: you see errors while you type, not when you open the problems panel.

### [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

Reads the project's `.editorconfig` file and applies its rules for indentation, line endings and charset. The value is that the file works across editors, not just VS Code: the colleague on PhpStorm or Vim follows the same rules.

### [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

A spell checker that understands code: it splits `camelCase` and `snake_case` and checks each word. It catches typos in variable names, comments and UI strings before they reach production. Dictionaries for other languages are available as separate extensions.

## Git

### [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

Shows next to each line who changed it, when and in which commit, and lets you browse a file's history without leaving the editor. It's the first thing I check when I need to understand *why* a piece of code is written a certain way. Some advanced features, like the full commit graph or team features, require a subscription. The free part covers everyday use.

If you mainly care about the branch graph, [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph) is a lighter, free alternative.

## Remote development and containers

These are the extensions the old version of this article was missing entirely, and they're the ones I use most.

### [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

Opens a folder on a remote server as if it were local: file explorer, integrated terminal, search, extensions, all running on the server. It reads your `~/.ssh/config`, so hosts you've already configured show up on their own. For working on a server's configuration or debugging on a staging machine, it's far more comfortable than editing files one by one in the terminal. For quick edits, it's still worth [knowing nano](/en/nano-editor-beginners-guide/).

### [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

You define the development environment in a `.devcontainer/devcontainer.json` file (Docker image, PHP or Node version, required extensions) and VS Code opens the project inside that container. Anyone who clones the repository gets the same environment in one click, without installing anything on their machine. For projects with several people, or old projects that need old PHP versions, it's the cleanest solution I know.

## Languages

### [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client)

VS Code's built-in PHP support is minimal. Intelephense adds real autocompletion, go-to-definition, find references and error analysis across the whole project, `vendor` included. After installing it, disable the built-in "PHP Language Features" extension to avoid duplicate suggestions. Some features, like symbol rename, are in the paid version, which is cheap and a one-time purchase.

### [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

Schema-based validation and autocompletion for YAML files: `docker-compose.yml`, GitHub Actions workflows, Kubernetes manifests. It catches the wrong indentation or the misspelled key before a failed pipeline does.

## AI assistants

In 2026 an AI assistant in the editor has become the norm. The ones worth knowing:

- **[GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)**: the most integrated into VS Code, with inline completion, chat and an agent mode that edits multiple files. It has a free plan with monthly limits, enough to find out whether it suits you.
- **[Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)**: Anthropic's official extension. It works on the whole project: reads the code, proposes multi-file changes that you review as diffs, runs commands in the terminal.
- **[Continue](https://marketplace.visualstudio.com/items?itemName=Continue.continue)**: open source, lets you use the model you want, including local models through Ollama. It's the right option when code can't leave your machine.

Two warnings from someone who uses them daily. Code you send to an external service leaves your machine: before using them on client projects, check what your contract says. And generated code should be read like a very fast junior colleague's: often right, sometimes wrong with great confidence.

## Looks

### [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)

Distinct icons for each file type and for the most common folders (`src`, `tests`, `config`, `.github`). It won't make you more productive, but spotting the right file in the tree at a glance is nice. If you're also after a colour theme, I rounded up [the best themes for VS Code](/en/the-best-visual-studio-code-themes/).

## The ones I dropped

- **Bracket Pair Colorizer**, **Auto Rename Tag** and **Debugger for Chrome**: replaced by native features, as shown above.
- **Live Server**: handy for a static HTML file, but poorly maintained. For plain HTML there's Microsoft's [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server). In a modern project your build tool, Vite for example, already does the live reloading.

## Use profiles

VS Code **profiles** (`Ctrl + Shift + P` → "Profiles: New Profile") let you keep separate sets of extensions and settings: one for PHP, one for frontend, a minimal one for writing docs. Each project loads only what it needs, and the editor stays fast.

To carry your setup to another machine there's the built-in Settings Sync. If you'd rather keep something in a dotfiles repository:

```
code --list-extensions > extensions.txt
cat extensions.txt | xargs -L 1 code --install-extension
```

## A note on security

A VS Code extension is code running with your user's permissions: it can read your files, your SSH keys, your `.env` files. Malicious extensions imitating popular ones have been found on the Marketplace more than once. Before installing, check the publisher (the check mark means a verified publisher), the install count and the date of the last update. And every now and then, open your installed extensions and uninstall the ones you no longer use.
