# Color Picker for VS Code

Helper with GUI to generate color codes such as CSS color notations.  
And, a command [`Convert Color`](#convert-color) to change the color notation.

A dialog box is shown by pressing `Alt + C P` keys or command `Pick Color`. If a cursor is positioned on a string that is color notation at that time, that string is selected as target for editing.

![s-01](https://github.com/anseki/vscode-color/raw/master/s-01.gif)

* Supported color spaces to edit the color: HSB (HSV), RGB, Lab, and CMYK. With alpha channel.
* Supported color notations to output the color: `hsb()`/`hsba()`, `hsl()`/`hsla()`, `hwb()`, `rgb()`/`rgba()`, RGB-Hex 3/4/6/8 digits, CSS Named Color, `device-cmyk()` and `gray()`.
* Custom color palettes supported.
* Multiple cursors supported.

![s-02](https://github.com/anseki/vscode-color/raw/master/s-02.gif)

## Install

You need [Node.js](https://nodejs.org/) (including NPM) installed and available in your `$PATH`.  
**Note:** If you use a Node Version Manager (e.g. nvm), the Node.js might not be available in a process VS Code will run, until you make it.

Then, launch the Command Pallete (`Ctrl + Shift + P` or `Cmd + Shift + P`) and type `ext install`, and then look for "Color Picker".  
**Note:** If a few NPM modules that the extension uses are not found in your computer, those will be installed automatically. Then, only when first launching, it may take some little time for setting up. (Wait for the finish without closing VS Code.)

## Usage

A dialog box is shown by pressing `Alt + C P` keys or command `Pick Color`.  
If a cursor is positioned on a string that is color notation at that time, that string is selected as target for editing. The color notation is recognized even if it includes line-breaks and comments.  
For example:

```css
background-color: hsl(
  136,
  77%, /* When it is blurred, change to 32% */
  84%
  );
```

Multiple cursors also supported.

You can see tooltip information for some controls in the dialog box by hovering a mouse on those.

### Convert Color

When a cursor or multiple cursors are positioned on strings that are color notation, press `Alt + C C` keys or run a command `Convert Color`.  
Then a list of color notations is shown. The each target string is converted to a same color with the notation you chose.

![s-03](https://github.com/anseki/vscode-color/raw/master/s-03.gif)

It is converted with the notation you chose and current state of `Pick Color` dialog box.  
For example, you turned on an `UC` (upper-case) checkbox of `RGB-Hex` in the dialog box, and you invoked the command `Convert Color` with a string `white` as a target and `RGB-Hex` notation, then that `white` is converted to `#FFF`. If you turned off that checkbox, it is converted to `#fff`.

![s-04](https://github.com/anseki/vscode-color/raw/master/s-04.png)

## Options

You can specify following options by User Settings or Workspace Settings.

### `colorHelper.pickerForm`

A name of preset package that switches UI and features.  
Allowed values are:

* `default`

![default](https://github.com/anseki/vscode-color/raw/master/s-default.png)

* `largePalette`

![largePalette](https://github.com/anseki/vscode-color/raw/master/s-largePalette.png)

* `simple`

![simple](https://github.com/anseki/vscode-color/raw/master/s-simple.png)

* `compact`

![compact](https://github.com/anseki/vscode-color/raw/master/s-compact.png)

* `compact2`

![compact2](https://github.com/anseki/vscode-color/raw/master/s-compact2.png)

* `byPalette`

![byPalette](https://github.com/anseki/vscode-color/raw/master/s-byPalette.png)

### `colorHelper.storeDir`

A path to directory that contains your color palettes.  
For information about color palettes, see `README.md` that is found in that directory.

### `colorHelper.resident`

Stands by for a quick response.  
After the dialog box is opened, it stays in memory even after it is closed until VS Code is exited (or VS Code might unload it).
