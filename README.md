# Boiled Page editor component and script

Editor SCSS component and script for Boiled Page frontend framework. They are intended to create block based editors where users can easily add, sort and remove different type of contents.

## Install

Place `_editor.scss` file to `/assets/css/components` directory, and add its path to component block in `assets/css/app.scss` file. 

You will also need to place `editor.js` to `/assets/js` directory and add its path to `scripts` variable in `gulpfile.js` to be combined with other scripts.

## Naming conventions

- **`contents`:** An array of `content` objects.
- **`content`:** An object that defines type and content of a block.
- **`contentTypes`:** An array of `contentType` objects.
- **`contentType`:** An object that defines how content with this type is rendered inside a block or content is retrieved from it.
- **`blocks`:** An array of `block` objects.
- **`block`:** An object that represents a sortable and removable block.
- **`blockMenus`:** An array of `blockMenu` objects inside block. Every block contains 3 menus with the following actions: `moveUp`, `moveDown` and `remove`.
- **`blockMenu`:** An object that represents a runnable action on click.
- **`blockTypes`:** An array of `blockType` objects.
- **`blockType`:** An object that creates a new block with this type on click.
- **`blockTypeTrigger`:** An element that opens or closes block type list on click.

## Editor component

### Classes

HTML elements with the following classes are generated by JavaScript when editor is initialized.

Class name | Description | Example
---------- | ----------- | -------
`editor` | Applies editor. | `<div class="editor"></div>`
`editor-block-list` | Applies block list inside editor. | `<ul class="editor-block-list"></ul>`
`editor-block-list-item` | Applies a block inside block list. | `<li class="editor-block-list-item"></li>`
`editor-block-header` | Applies header of a block. | `<header class="editor-block-header"></header>`
`editor-block-header-menu-list` | Applies block menu list inside block header. | `<ul class="editor-block-header-menu-list"></ul>`
`editor-block-header-menu-list-item` | Applies a block menu inside block list. | `<li class="editor-block-header-menu-list-item"></li>`
`editor-block-header-menu-list-item--move-up` | Adds `move up` event specific properties to block menu. | `<li class="editor-block-header-menu-list-item editor-block-menu-list-item--move-up"></li>`
`editor-block-header-menu-list-item--move-down` | Adds `move down` event specific properties to block menu. | `<li class="editor-block-header-menu-list-item editor-block-menu-list-item--move-down"></li>`
`editor-block-header-menu-list-item--remove` | Adds `remove` event specific properties to block menu. | `<li class="editor-block-header-menu-list-item editor-block-menu-list-item--remove"></li>`
`editor-block-main` | Applies main area of a block. | `<div class="editor-block-main"></div>`
`editor-block-type-trigger` | Applies block type trigger inside editor. | `<button class="editor-block-type-trigger"></button>`
`editor-block-type-list` | Applies block type list inside editor. | `<ul class="editor-block-type-list"></ul>`
`editor-block-type-list-item` | Applies a block type inside block type list. | `<li class="editor-block-type-list-item"></li>`
`is-being-created` | Added to block while it is being created. | `<li class="editor-block-list-item is-being-created"></li>`
`is-removing` | Added to block while it is removing. | `<li class="editor-block-list-item is-removing"></li>`
`is-swapping` | Added to block while it is swapping. | `<li class="editor-block-list-item is-swapping"></li>`
`is-bouncing-up` | Added to block while it is bouncing up. | `<li class="editor-block-list-item is-bouncing-up"></li>`
`is-bouncing-down` | Added to block while it is bouncing down. | `<li class="editor-block-list-item is-bouncing-down"></li>`
`is-active` | Added to block while an action is running or block type while block type list is opened. | `<li class="editor-block-list-item is-active"></li>`
`is-opened` | Added to block type list when it is opened. | ``<ul class="editor-block-type-list is-opened"></ul>``

## Editor script

### Usage

To create a new editor instance, call `Editor` constructor the following way:

```js
// Create new editor instance
var editor = new Editor(options);

// Initialize editor instance
editor.init();
```

### Options

The following options are available for editor constructor:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`wrapper` | Object | null | Yes | Wrapper element of editor.
`contentTypes` | Array | [] | Yes | Array of `contentType` objects.
`contents` | Array | [] | No | Array of `content` objects.
`blocksClass` | String | 'editor-block-list' | No | Class added to block list element.
`blockClass` | String | 'editor-block-list-item' | No | Class added to block element.
`blockHeaderClass` | String | 'editor-block-header' | No | Class added to block header element.
`blockMenusClass` | String | 'editor-block-header-menu-list' | No | Class added to block menu list element.
`blockMenuClass` | String | 'editor-block-header-menu-list-item' | No | Class added to block menu element.
`blockMenuMoveUpClass` | String | 'editor-block-header-menu-list-item--move-up' | No | Class added to block menu element with `moveUp` action.
`blockMenuMoveDownClass` | String | 'editor-block-header-menu-list-item--move-down' | No | Class added to block menu element with `moveDown` action.
`blockMenuRemoveClass` | String | 'editor-block-header-menu-list-item--remove' | No | Class added to block menu element with `remove` action.
`blockMainClass` | String | 'editor-block-main' | No | Class added to block main element.
`blockTypeTriggerClass` | String | 'editor-block-type-trigger' | No | Class added to block type trigger element.
`blockTypesClass` | String | 'editor-block-type-list' | No | Class added to block type list element.
`blockTypeClass` | String | 'editor-block-type-list-item' | No | Class added to block type element.
`isBeingCreatedClass` | String | 'is-being-created' | No | Class added to block element while it is being created.
`isRemovingClass` | String | 'is-removing' | No | Class added to block element while it is removing.
`isSwappingClass` | String | 'is-swapping' | No | Class added to block element while it is swapping.
`isBouncingUpClass` | String | 'is-bouncing-up' | No | Class added to block element while it is bouncing up.
`isBouncingDownClass` | String | 'is-bouncing-down' | No | Class added to to block element while it is bouncing down.
`isActiveClass` | String | 'is-active' | No | Class added to block element while an action is running or block type trigger element when block type list is opened.
`isOpenedClass` | String | 'is-opened' | No | Class added to block type list element when it is opened.
`moveUpLabel` | String | 'Move up' | No | Text appended to block menu button element when action is `moveUp`.
`moveDownLabel` | String | 'Move down' | No | Text appended to block menu button element when action is `moveDown`.
`removeLabel` | String | 'Remove' | No | Text appended to block menu button element when action is `remove`.
`triggerLabel` | String | 'Add block' | No | Text appended to block type trigger element.
`blockHeadingTag` | String | 'h3' | No | Tag name of heading element to be created inside block header.
`beforeCreateCallback` | Function | - | No | Callback function before block is created.
`createCallback` | Function | - | No | Callback function after block is created.
`beforeRemoveCallback` | Function | - | No | Callback function before block is removed.
`removeCallback` | Function | - | No | Callback function after block is removed.
`bounceUpCallback` | Function | - | No | Callback function after block is bounced up.
`bounceDownCallback` | Function | - | No | Callback function after block is bounced down.
`beforeSwapCallback` | Function | - | No | Callback function before block swapping is started.
`swapCallback` | Function | - | No | Callback function after block swapping is finished.
`initCallback` | Function | - | No | Callback function after editor is initialized.
`destroyCallback` | Function | - | No | Callback function after editor is destroyed.

Available options for a `content` object:

Option| Type | Required | Description
------|------|----------|------------
`type` | String | Yes | Name of `contentType`.
`data` | Object | Yes | Structured content that is used for block rendering.

Available options for a `contentType` object:

Option| Type | Required | Description
------|------|----------|------------
`name` | String | Yes | Unique name of content type.
`label` | String | Yes | Label which appears in block type button and block headers with this content type.
`class` | String | Yes | Class added to block created with this content type.
`render` | Function | Yes | Callback function that returns the HTML markup inserted into block. It is called when a block is created with this content type.
`getData` | Function | Yes | Callback function that returns content from rendered block with this content type. It is is called internally trough `getContents` method.
`setFocus` | Function | No | Callback function that gives focus to the returned element. If no parameter is passed, the focus does not change. It is called when a block is created with this content type.
`renderCallback` | Function | No | Callback function called after block is rendered with this content type.

### Methods

#### Initialize editor

`init()` - Initialize editor. It creates events and elements, adds classes relevant to module.

#### Create block

`createBlock()` - Create block from given content.

Parameter | Type | Required | Description
----------|------|----------|------------
content | Number | Yes | A `content` object that defines type and initial content of block.
hasAnimation | Boolean | No | Block creation is animated or not. When no parameter is passed, the default value is `true`. Block is appended immediately if animation is disabled.
index | Integer | No | Append block at given index. If no parameter is passed, it is appended to the end of block list.

#### Move up block

`moveUpBlock()` - Move up block at given index.

Parameter | Type | Required | Description
----------|------|----------|------------
index | Integer | Yes | The index at which to move up block.

#### Move down block

`moveDownBlock()` - Move down block at given index.

Parameter | Type | Required | Description
----------|------|----------|------------
index | Integer | Yes | The index at which to move down block.

#### Remove block

`removeBlock()` - Remove block at given index.

Parameter | Type | Required | Description
----------|------|----------|------------
index | Integer | Yes | The index at which to remove block.

#### Get contents

`getContents()` - Get contents from existing blocks. It loops trough each block, calls `getData` function of related `contentType`, then returns all contents as an array.

#### Destroy editor

`destroy()` - Destroy editor. It removes created events and elements relevant to module.

#### Check editor is initialized or not

`getIsInitialized()` - Check editor is initialized or not. It returns `true` when it is already initialized, `false` if not.

## Examples

### Example 1

The following example shows an editor with 2 content types: a heading and a paragraph. The first one contains 2, the other one contains only 1 fields.

```html
<div class="editor" data-editor></div>
```

Add `editor` property to `app` object in `assets/js/app.js`.

```js
editor: null
```

Place the following code inside `assets/js/app.js` to create a new editor with 2 available content types, and render an initial block from each type.

```js
app.editor = new Editor({
  wrapper: document.querySelector('[data-editor]'),
  contents: [
    {
      type: 'heading',
      data: {
        text: 'Lorem ipsum dolor sit amet',
        level: 3
      }
    },
    {
      type: 'paragraph',
      data: {
        text: 'Pellentesque placerat tortor nunc, ut posuere sapien mollis non.'
      }
    }
  ],
  contentTypes: [
    {
      name: 'heading',
      label: 'Heading',
      class: 'editor-block-list-item--heading',
      render: function(data, uid) {

        // Init variables
        var out = '';
        var text = data.text || '';
        var textId = 'heading-text-' + uid;
        var levelId = 'heading-level-' + uid;
        var level = data.level;

        // Create return string
        out += '<div class="grid grid--gutter grid--uniform">';
        out += '<div class="grid-col grid-col--1of2 grid-col--small--full">';
        out += '<div class="form-item">';
        out += '<label class="form-label" for="' + textId + '">Text</label>';
        out += '<input name="' + textId + '" id="' + textId + '" class="form-input" type="text" value="' + text + '" />';
        out += '</div>';
        out += '</div>';
        out += '<div class="grid-col grid-col--1of2 grid-col--small--full">';
        out += '<div class="form-item">';
        out += '<label class="form-label" for="' + levelId + '">Level</label>';
        out += '<select name="' + levelId + '" id="' + levelId + '" class="form-input form-input--select">';
        for (var i = 2; i < 7; i++) {
          out += '<option value="' + i + '"' + (i == level ? ' selected' : '') + '>Heading ' + i + '</option>';
        }
        out += '</select>';
        out += '</div>';
        out += '</div>';
        out += '</div>';

        return out;
      },
      getData: function(block) {

        // Get element(s)
        var text = document.getElementById('heading-text-' + block.uid);
        var level = document.getElementById('heading-level-' + block.uid);

        return {
          text: text.value,
          level: parseInt(level.value)
        };
      },
    },
    {
      name: 'paragraph',
      label: 'Paragraph',
      class: 'editor-block-list-item--paragraph',
      render: function(data, uid) {

        // Init variables
        var out = '';
        var text = data.text || '';
        var textId = 'paragraph-text-' + uid;

        // Create return string
        out += '<div class="grid grid--gutter grid--uniform">';
        out += '<div class="grid-col grid-col--full">';
        out += '<div class="form-item">';
        out += '<label class="form-label" for="' + textId + '">Text</label>';
        out += '<textarea name="' + textId + '" id="' + textId + '" class="form-input form-input--textarea">' + text + '</textarea>';
        out += '</div>';
        out += '</div>';
        out += '</div>';

        return out;
      },
      getData: function(block) {

        // Get element(s)
        var text = document.getElementById('paragraph-text-' + block.uid);

        return {
          text: text.value
        };
      }
    }
  ]
});
app.editor.init();
```

