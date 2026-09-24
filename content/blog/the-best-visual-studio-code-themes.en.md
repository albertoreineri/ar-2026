---
title: "The best VS Code themes in 2026, light and dark"
seoTitle: "The Best VS Code Themes, Light and Dark"
date: 2022-07-04
lastmod: 2026-09-24
description: "The dark and light VS Code themes worth using in 2026, how to make them follow your system theme, and the trick to never mix up production and local again."
tags: ["Web Dev"]
translationKey: "vscode-themes"
aliases: ["/blog/the-best-visual-studio-code-themes/"]
---

I spend more hours inside VS Code than in any other program, and the theme is what I look at the whole time. It won't make you a better programmer, but good contrast and syntax colours that really tell things apart tire your eyes less and make code faster to read.

This is my selection, revised for 2026: a few themes, chosen because they're maintained and well made, not because they have the most downloads. For previews I've linked the Marketplace pages, which always have up-to-date screenshots.

## How to install and switch themes

From the Extensions panel (`Ctrl + Shift + X`) search for the theme's name and install it. Then `Ctrl + K`, `Ctrl + T` opens the theme picker: scroll with the arrow keys for a live preview and press `Enter` to confirm.

Before installing anything, try the built-in themes: **Dark Modern** and **Light Modern** are the defaults in recent versions and they're well made. The built-ins also include **Solarized** (light and dark), **Quiet Light** and the high-contrast variants.

## Dark themes

**[One Dark Pro](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme)**: the port of Atom's theme, and still the most installed theme on the Marketplace. Balanced colours, nothing over the top: if you don't know where to start, start here.

**[Tokyo Night](https://marketplace.visualstudio.com/items?itemName=enkia.tokyo-night)**: deep blues and soft but clearly distinct syntax colours. It has a slightly lighter *Storm* variant and a daytime version. It's the theme I use most often.

**[Catppuccin](https://marketplace.visualstudio.com/items?itemName=Catppuccin.catppuccin-vsc)**: pastel colours, in four flavours (three dark and one light, *Latte*). Its strength is the ecosystem: it exists for terminals, browsers, Slack and almost everything else, so you can have the same look everywhere.

**[Dracula](https://marketplace.visualstudio.com/items?itemName=dracula-theme.theme-dracula)**: high contrast and saturated colours, purple and pink on a dark background. It divides people: you either love it or it wears you out within an hour. This one also exists for hundreds of other apps.

**[GitHub Theme](https://marketplace.visualstudio.com/items?itemName=GitHub.github-vscode-theme)**: GitHub's official theme, with dark and light variants, including colour-blind-friendly and high-contrast ones. Understated and very readable, and code looks the same as in your pull requests.

**[Night Owl](https://marketplace.visualstudio.com/items?itemName=sdras.night-owl)**: created by Sarah Drasner with night owls and colour-blind accessibility in mind. It also includes a light variant, *Light Owl*.

**[Gruvbox](https://marketplace.visualstudio.com/items?itemName=jdinhlife.gruvbox)**: warm tones, browns and ochres, low contrast. It comes from the Vim world and is ideal if you find the blues and purples of most dark themes tiring.

## Light themes

Light themes have a bad reputation among developers, but in a bright room or outdoors they're more readable than any dark theme. The problem is that many are badly made, with colours designed for a dark background and adapted as an afterthought. These aren't:

**GitHub Light** (from the [GitHub Theme](https://marketplace.visualstudio.com/items?itemName=GitHub.github-vscode-theme) above): the most balanced light theme I know. Syntax colours dark and saturated enough to read well even with the sun on the screen.

**Catppuccin Latte** (from the [Catppuccin](https://marketplace.visualstudio.com/items?itemName=Catppuccin.catppuccin-vsc) pack): pastel even in its light version, less glaring than pure white.

**Solarized Light** (built into VS Code): designed around precise contrast criteria, with a cream background instead of white. It was born in 2011 and has never gone out of fashion.

**Light Owl** (from the [Night Owl](https://marketplace.visualstudio.com/items?itemName=sdras.night-owl) pack): high contrast and clearly distinct colours, great for presentations and screen sharing.

## Light by day, dark by night

You don't have to choose. VS Code can follow your operating system's theme and switch on its own:

```
{
  "window.autoDetectColorScheme": true,
  "workbench.preferredDarkColorTheme": "Tokyo Night Storm",
  "workbench.preferredLightColorTheme": "GitHub Light Default"
}
```

With your system set to automatic, the editor switches theme at sunrise and sunset without you having to think about it.

## The trick I actually use: one colour per environment

More than the theme itself, the customisation that has saved me the most trouble is this: giving the title bar a different colour per project. When you work over [Remote SSH](/en/the-9-best-visual-studio-code-extensions/) on a production server, a red bar reminds you at every moment where you are.

In the project's `.vscode/settings.json` (or in the remote host's settings):

```
{
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#8b1e1e",
    "titleBar.activeForeground": "#ffffff",
    "statusBar.background": "#8b1e1e"
  }
}
```

If you'd rather do it in one click with a ready-made palette, the [Peacock](https://marketplace.visualstudio.com/items?itemName=johnpapa.vscode-peacock) extension does exactly this.

## The font matters as much as the theme

A good theme with a mediocre font is still mediocre. The two I recommend are **[JetBrains Mono](https://www.jetbrains.com/lp/mono/)** and **[Fira Code](https://github.com/tonsky/FiraCode)**, both free, designed for code and with **ligatures**: `=>`, `!==` and `>=` become a single glyph. Once one is installed on your system:

```
{
  "editor.fontFamily": "'JetBrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6
}
```

Ligatures are a matter of taste: if they confuse you, turn them off and keep the font.

## In short

Start with a built-in theme. If it doesn't convince you, try One Dark Pro or Tokyo Night for dark and GitHub Light for light, turn on automatic switching with your system and pick a font made for code. For the rest of the setup I rounded up [the VS Code extensions I actually use](/en/the-9-best-visual-studio-code-extensions/).
