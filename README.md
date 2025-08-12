# TiddlyFlex

A powerful flexbox layout plugin for [TiddlyWiki 5](https://tiddlywiki.com) that transforms your wiki into a modern, multi-column workspace with advanced drag-and-drop functionality.

![TiddlyFlex Screenshot](https://github.com/user-attachments/assets/4d15cbea-945e-457b-97d1-007b2190d9f7)

## Features

### Core Layout Features
- **Multi-Column Layout**: Create multiple columns to organize your tiddlers across the screen
- **Flexible Arrangement**: Switch between horizontal and vertical layouts
- **Responsive Design**: Automatically adapts to different screen sizes
- **Configurable Sidebar**: Resizable sidebar with snap-to-width functionality
- **Full-Screen Mode**: Focus on individual tiddlers with distraction-free viewing

### Drag and Drop
- **Visual Tiddler Movement**: Drag tiddlers between columns and positions
- **Animated Transitions**: Smooth animations for all drag and drop operations
- **Configurable Animation**: Customize animation duration and curves
- **Toggle Dragging**: Enable/disable drag functionality with keyboard shortcuts

### Navigation & Keyboard Shortcuts
- **Keyboard Navigation**: Navigate between tiddlers and columns using keyboard shortcuts
- **Quick Actions**: Create new tiddlers, journals, and images with hotkeys
- **Column Management**: Add/remove columns instantly
- **Filter Integration**: Filter story river content with search functionality

### Customization Options
- **Ensemble System**: Save and load complete layout configurations
- **Theme Integration**: Works with all TiddlyWiki themes and color palettes
- **UI Customization**: Hide/show toolbars, controls, and interface elements
- **Content Templates**: Customizable view and edit templates
- **Box Shadows**: Configurable visual effects for tiddler containers

---

## Keyboard Shortcuts

TiddlyFlex comes with comprehensive keyboard shortcuts for efficient navigation and management:

### Layout Management
- **Ctrl+Alt+N**: Add a new column
- **Ctrl+Alt+M**: Remove a column
- **Alt+Shift+V**: Toggle between horizontal and vertical layout
- **Alt+D**: Toggle drag and drop mode on/off

### Navigation
- **Alt+Left**: Move to the previous column
- **Alt+Right**: Move to the next column
- **Alt+Up**: Navigate to the tiddler above
- **Alt+Down**: Navigate to the tiddler below

### Tiddler Management
- **Alt+Shift+Up**: Move current tiddler up
- **Alt+Shift+Down**: Move current tiddler down
- **Alt+Shift+Left**: Move current tiddler to the left column
- **Alt+Shift+Right**: Move current tiddler to the right column
- **Alt+E**: Edit the current tiddler
- **Alt+C**: Cancel or close the current tiddler

### View Options
- **Alt+Shift+F**: Toggle fullscreen view for current tiddler
- **Alt+F**: Filter the story river by search input

## Configuration

TiddlyFlex offers extensive customization options through the TiddlyWiki Control Panel:

### Sidebar Settings
- **Width**: Configure sidebar width in % or px (default: 25%)
- **Snap Width**: Set the width limit below which sidebar collapses (default: 100px)
- **Resizer**: Enable/disable sidebar resizing functionality

### Story River Configuration
- **Minimum Width**: Set minimum column width (default: 300px)
- **Padding**: Configure story river padding (default: 42px)
- **Animation Curve**: Choose animation style (linear, ease, etc.)
- **Box Shadow**: Customize tiddler container shadows

### Tiddler Appearance
- **Margin Bottom**: Space between tiddlers (default: 28px)
- **Controls Breakpoint**: When to hide tiddler controls based on column count
- **Hover Controls**: Show tiddler controls only on hover

### Drag & Drop
- **Animation Duration**: Configure drag animation speed (default: 175ms)
- **Visual Feedback**: Customize drag indicators and animations

## Ensemble System

The Ensemble system allows you to save and restore complete workspace configurations:

1. **Save Ensemble**: Capture current layout, column arrangement, open tiddlers, and all settings
2. **Load Ensemble**: Restore a previously saved workspace configuration
3. **Manage Ensembles**: Delete or overwrite existing configurations
4. **Icon Support**: Add custom icons to identify your ensembles

Access the Ensemble system through the sidebar "Ensemble" tab.

## Getting Started

1. After installation, TiddlyFlex will be available as a layout option
2. Access configuration options through the Control Panel → Settings → TiddlyFlex
3. Use **Ctrl+Alt+N** to add your first additional column
4. Start dragging tiddlers between columns or use keyboard shortcuts for navigation
5. Customize the interface to your preferences using the extensive configuration options
6. Save your preferred setup as an Ensemble for quick restoration

## Usage Tips

- **Column Management**: Start with 2-3 columns and adjust based on your screen size and workflow
- **Keyboard Navigation**: Master the Alt+Arrow key combinations for efficient navigation
- **Drag Mode**: Toggle drag mode off when you don't need it to prevent accidental movements
- **Fullscreen Focus**: Use Alt+Shift+F to focus on important content without distractions
- **Ensemble Workflows**: Create different Ensembles for different types of work (writing, research, etc.)

## Requirements

- TiddlyWiki 5.3.3 or higher
- Modern web browser with flexbox support

---

## Contributing

Everyone is welcome to create an Issue or a Pull request

## Installation

You can install the plugin in two ways

### Drag and Drop

- Go to the [plugin page](https://burningtreec.github.io/TiddlyFlex)
- Drag the plugin to your [TiddlyWiki](https://tiddlywiki.com)

### NodeJs

- clone this repository to your `$TIDDLYWIKI_PLUGIN_PATH`

```
git clone --depth=1 git@github.com:BurningTreeC/TiddlyFlex.git $TIDDLYWIKI_PLUGIN_PATH
```

- enable the plugin in your `tiddlywiki.info` file

```
"plugins": [
	"plugins/first-plugin",
	"plugins/second-plugin",
	"TiddlyFlex/TiddlyFlex"
	]
```


