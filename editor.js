/**
 * Editor - v1.0.0
 * Copyright 2020 Abel Brencsan
 * Released under the MIT License
 */
var Editor = function(options) {

	'use strict';

	// Test required options
	if (typeof options.wrapper !== 'object') {
		throw 'Editor "wrapper" option must be an object';
	} 
	if (typeof options.contentTypes !== 'object') {
		throw 'Editor "contentTypes" option must be an object';
	} 

	// Default editor instance options
	var defaults = {

		wrapper: null,
		contentTypes: [],
		contents: [],
		
		// Element classes
		blocksClass: 'editor-block-list',
		blockClass: 'editor-block-list-item',
		blockHeaderClass: 'editor-block-header',
		blockMainClass: 'editor-block-main',
		blockMenusClass: 'editor-block-menu-list',
		blockMenuClass: 'editor-block-menu-list-item',
		blockMenuMoveUpClass: 'editor-block-menu-list-item--move-up',
		blockMenuMoveDownClass: 'editor-block-menu-list-item--move-down',
		blockMenuRemoveClass: 'editor-block-menu-list-item--remove',
		blockTypeTriggerClass: 'editor-block-type-trigger',
		blockTypesClass: 'editor-block-type-list',
		blockTypeClass: 'editor-block-type-list-item',

		// State classes
		isBeingCreatedClass: 'is-being-created',
		isRemovingClass: 'is-removing',
		isSwappingClass: 'is-swapping',
		isBouncingUpClass: 'is-bouncing-up',
		isBouncingDownClass: 'is-bouncing-down',
		isActiveClass: 'is-active',
		isOpenedClass: 'is-opened',

		// Labels
		moveUpLabel: 'Move up',
		moveDownLabel: 'Move down',
		removeLabel: 'Remove',
		triggerLabel: 'Add block',

		// Node names
		blockHeadingTag: 'h3',

		// Callback functions
		beforeCreateCallback: null,
		createCallback: null,
		beforeRemoveCallback: null,
		removeCallback: null,
		bounceUpCallback: null,
		bounceDownCallback: null,
		beforeSwapCallback: null,
		swapCallback: null,
		initCallback: null,
		destroyCallback: null
	};

	// Extend editor instance options with defaults
	for (var key in defaults) {
		this[key] = (options.hasOwnProperty(key)) ? options[key] : defaults[key];
	}

	// Editor instance variables
	this.blocks = {
		element: null,
		blockTypes: {
			element: null,
			triggerElement: null,
			isOpened: false,
			items: []
		},
		items: []
	};
	this.action = null;
	this.activeIndex = null;
	this.focusedElement = null,
	this.scrollOffset = null;
	this.isScrollEnabled = true;
	this.isInitialized = false;

};

Editor.prototype = function () {

	'use strict';

	var editor = {

		// Unique identifier
		uid: 1,

		/**
		* Initialize editor. (public)
		*/
		init: function() {

			// Prevent re-initialization
			if (this.isInitialized) return;

			// Create blocks from contents
			editor.createBlocks.call(this, this.contents);

			// Add event listeners
			document.addEventListener('keydown', this);
			document.addEventListener('click', this);

			// Attach event handler
			this.handleEvent = function(event) {
				editor.handleEvents.call(this, event);
			};

			// Finish initialization
			this.isInitialized = true;
			if (this.initCallback) this.initCallback.call(this);
		},

		/**
		* Create blocks from contents. (private)
		* @param contents array
		*/
		createBlocks: function(contents) {

			// Init variables
			var elem, triggerElem, items;

			// Create and append blocks element
			if (!this.blocks.element) {
				this.blocks.element = editor.createBlocksElem.call(this);
				this.wrapper.append(this.blocks.element);
			}

			// Create and append block types
			if (!this.blocks.blockTypes.element) {

				// Create elements and objects
				elem = editor.createBlockTypesElem.call(this);
				triggerElem = editor.createBlockTypeTriggerElem.call(this);
				items = editor.createBlockTypes.call(this);

				// Append elements
				for (var i = 0; i < items.length; i++) {
					elem.append(items[i].element);
				}
				this.wrapper.append(triggerElem);
				this.wrapper.append(elem);

				// Create block types
				this.blocks.blockTypes = {
					element: elem,
					triggerElement: triggerElem,
					isOpened: false,
					items: items
				};
			}

			// Create block from each content
			for (var i = 0; i < this.contents.length; i++) {
				editor.createBlock.call(this, this.contents[i], false);
			}
		},

		/**
		* Create block from given content. (private)
		* @param content object
		* @param hasAnimation boolean
		* @param index integer
		*/
		createBlock: function(content, hasAnimation, index) {

			// Check there is no running action
			if (this.action) return;

			// Set default animation state
			if (typeof hasAnimation === 'undefined') {
				hasAnimation = true;
			}

			// Set default after index
			if (typeof index === 'undefined') {
				index = this.blocks.items.length;
			}

			// Check its required methods and attributes of content exist
			if (typeof content.type !== 'string') {
				throw 'Content `type` must be defined as a string';
			}
			if (typeof content.data !== 'object') {
				throw 'Content `data` must be defined as an object';
			}

			// Check index is in range
			if (index > this.blocks.items.length || index < 0) {
				throw 'Block index must be between 0 and ' + this.blocks.items.length;
			}

			// Init variables
			var block, renderedData;
			var contentType = editor.getContentType.call(this, content.type);

			// Check content type and its required methods and attributes exist
			if (typeof contentType === 'undefined') {
				throw 'Content type is not defined';
			}
			if (typeof contentType.name !== 'string') {
				throw 'Content type `name` must be defined as a string';
			}
			if (typeof contentType.label !== 'string') {
				throw 'Content type `label` must be defined as a string';
			}
			if (typeof contentType.render !== 'function') {
				throw 'Content type has no `render` method';
			}
			if (typeof contentType.getData !== 'function') {
				throw 'Content type has no `getData` method';
			}

			// Set action and active index
			if (hasAnimation) {
				this.action = 'createBlock';
				this.activeIndex = index;
			}

			// Create block
			block = {
				uid: editor.uid,
				type: content.type,
				element: editor.createBlockElem.call(this, contentType),
				headerElement: editor.createBlockHeaderElem.call(this, contentType),
				mainElement: editor.createBlockMainElem.call(this),
				menus: {
					element: editor.createBlockMenusElem.call(this),
					items: editor.createBlockMenus.call(this)
				}
			}

			// Append block menu elements
			for (var i = 0; i < block.menus.items.length; i++) {
				block.menus.element.append(block.menus.items[i].element);
			}

			// Append block menus element
			block.headerElement.append(block.menus.element);

			// Render and append data
			renderedData = contentType.render.call(this, content.data, editor.uid);
			block.mainElement.innerHTML = renderedData;

			// Append block header and main elements
			block.element.append(block.headerElement);
			block.element.append(block.mainElement);
		
			// Append block element
			if (index == this.blocks.items.length) {
				this.blocks.element.append(block.element);
			}
			else {
				this.blocks.element.insertBefore(block.element, this.blocks.items[index].element);
			}
			
			// Add to blocks
			this.blocks.items.splice(index, 0, block);

			// Add animation related attributes and classes
			if (hasAnimation) {

				// Set user-defined focus
				if (typeof contentType.setFocus === 'function') {
					this.focusedElement = contentType.setFocus.call(this, block);
					if (this.focusedElement) {
						editor.setFocus.call(this, this.focusedElement);
					}
				}

				// Set scroll offset
				this.scrollOffset = block.element.offsetHeight;

				// Set classes and attributes
				block.element.style.maxHeight = block.element.offsetHeight + 'px';
				block.element.classList.add(this.isBeingCreatedClass);
				block.element.classList.add(this.isActiveClass);
			}

			// Close block types
			editor.closeBlockTypes.call(this, this.blocks.blockTypes);

			// Increment UID
			editor.uid++;

			// Call render callbak
			if (typeof contentType.renderCallback === 'function') {
				contentType.renderCallback.call(this, block);
			}

			// Call callback function
			if (hasAnimation) {
				if (this.beforeCreateCallback) this.beforeCreateCallback.call(this, block);
			}
			else {
				if (this.createCallback) this.createCallback.call(this, block);
			}
		},

		/**
		* Block is created. (private)
		*/
		isBlockCreated: function() {
			
			// Init variables
			var index = this.activeIndex;
			var block = this.blocks.items[index];

			// Remove classes
			block.element.classList.remove(this.isBeingCreatedClass);
			block.element.classList.remove(this.isActiveClass);
			block.element.style.maxHeight = '';

			// Scroll window
			if (!editor.isElementInViewport.call(this, block.element) && this.isScrollEnabled) {
				window.scrollBy({
					top: this.scrollOffset,
					behavior: 'smooth'
				});
			}

			// Reset instance settings
			this.action = null;
			this.activeIndex = null;
			this.focusedElement = null;
			this.scrollOffset = null;
						
			// Call callback function
			if (this.createCallback) this.createCallback.call(this, block);
		},

		/**
		 * Remove block at given index. (private)
		 * @param index integer
		 */
		removeBlock: function(index) {

			// Check there is no running action
			if (this.action) return;

			// Init variables
			var blockMenu;
			var block = this.blocks.items[index];

			// Set focused element
			if (this.blocks.items.length > 1) {
				if (index > 0) {
					blockMenu = this.blocks.items[index -1].menus.items[2];
				}
				else {
					blockMenu = this.blocks.items[index + 1].menus.items[2];
				}
				this.focusedElement = blockMenu.buttonElement;
			}
			else {
				this.focusedElement = this.blocks.blockTypes.triggerElement;
			}

			// Set action and active index
			this.action = 'removeBlock';
			this.activeIndex = index;

			// Set maximum height for collapse animation
			block.element.style.maxHeight = block.element.offsetHeight + 'px';

			// Add classes
			block.element.classList.add(this.isActiveClass);
			block.element.classList.add(this.isRemovingClass);

			// Call callback function
			if (this.beforeRemoveCallback) this.beforeRemoveCallback.call(this, block);
		},

		/**
		 * Block is removed. (private)
		 */
		isBlockRemoved: function() {

			// Init variables
			var index = this.activeIndex;
			var blockElem = this.blocks.items[index].element;

			// Remove event listeners
			blockElem.removeEventListener('animationend', this);

			// Remove block
			blockElem.parentNode.removeChild(blockElem);
			this.blocks.items.splice(index, 1);

			// Set focus
			editor.setFocus.call(this, this.focusedElement);

			// Reset instance settings
			this.action = null;
			this.activeIndex = null;
			this.focusedElement = null;

			// Call callback function
			if (this.removeCallback) this.removeCallback.call(this);
		},

		/**
		 * Move up block at given index. (public)
		 * @param index integer
		 */
		moveUpBlock: function(index) {

			// Check there is no running action
			if (this.action) return;

			// Check index is in range
			if (index >= this.blocks.items.length || index < 0) {
				throw 'Block index must be between 0 and ' + (this.blocks.items.length -1);
			}

			// Bounce or move up block
			if (index == 0) {
				this.action = 'bounceUpBlock';
				this.activeIndex = 0;
				editor.bounceUpBlock.call(this);
			}
			else {
				this.action = 'moveUpBlock';
				this.activeIndex = index;
				editor.swapBlocks.call(this, index);
			}
		},

		/**
		 * Move down block at given index. (public)
		 * @param index integer
		 */
		moveDownBlock: function(index) {

			// Check there is no running action
			if (this.action) return;

			// Check index is in range
			if (index >= this.blocks.items.length || index < 0) {
				throw 'Block index must be between 0 and ' + (this.blocks.items.length -1);
			}

			// Init variables
			var lastIndex = this.blocks.items.length - 1;

			// Move or bounce down block
			if (index == lastIndex) {
				this.action = 'bounceDownBlock';
				this.activeIndex = lastIndex;
				editor.bounceDownBlock.call(this);
			}
			else {
				this.action = 'moveDownBlock';
				this.activeIndex = index;
				editor.swapBlocks.call(this);
			}
		},

		/**
		 * Bounce up uppermost block. (private)
		 */
		bounceUpBlock: function() {

			// Init variables
			var index = this.activeIndex;
			var blockElem = this.blocks.items[index].element;

			// Add classes
			blockElem.classList.add(this.isBouncingUpClass);
			blockElem.classList.add(this.isActiveClass);
		},

		/**
		 * Block is bounced up. (private)
		 */
		isBlockBouncedUp: function() {

			// Init variables
			var index = this.activeIndex;
			var block = this.blocks.items[index];
			
			// Remove classes
			block.element.classList.remove(this.isBouncingUpClass);
			block.element.classList.remove(this.isActiveClass);
			
			// Reset instance settings
			this.action = null;
			this.activeIndex = null;
			
			// Call callback function
			if (this.bounceUpCallback) this.bounceUpCallback.call(this, block);
		},

		/**
		 * Bounce down lowermost block. (private)
		 */
		bounceDownBlock: function() {

			// Init variables
			var index = this.activeIndex;
			var blockElem = this.blocks.items[index].element;

			// Add classes
			blockElem.classList.add(this.isBouncingDownClass);
			blockElem.classList.add(this.isActiveClass);
		},

		/**
		 * Block is bounced down. (private)
		 */
		isBlockBouncedDown: function() {

			// Init variables
			var index = this.activeIndex;
			var block = this.blocks.items[index];
			
			// Remove classes
			block.element.classList.remove(this.isBouncingDownClass);
			block.element.classList.remove(this.isActiveClass);

			// Reset instance settings
			this.action = null;
			this.activeIndex = null;
			
			// Call callback function
			if (this.bounceDownCallback) this.bounceDownCallback.call(this, block);
		},

		/**
		 * Swap blocks. (private)
		 */
		swapBlocks: function() {

			// Init variables
			var index = this.activeIndex;
			var indexes = editor.getSwappingBlockIndexes.call(this);
			var block = this.blocks.items[index];
			var pBlockElem = this.blocks.items[indexes[0]].element;
			var sBlockElem = this.blocks.items[indexes[1]].element;

			// Set focused element
			this.focusedElement = document.activeElement;

			// Set scroll offset
			if (indexes[0] == index) {
				this.scrollOffset = sBlockElem.offsetHeight;
			}
			else {
				this.scrollOffset = (pBlockElem.offsetHeight * -1);
			}

			// Add classes
			block.element.classList.add(this.isActiveClass);
			pBlockElem.classList.add(this.isSwappingClass);
			sBlockElem.classList.add(this.isSwappingClass);
			
			// Add translations
			pBlockElem.style.transform = 'translateY(' + sBlockElem.offsetHeight + 'px)';
			sBlockElem.style.transform = 'translateY(-' + pBlockElem.offsetHeight + 'px)';
		
			// Call callback function
			if (this.beforeSwapCallback) this.beforeSwapCallback.call(this, block);
		},

		/**
		 * Blocks are swapped. (private)
		 */
		areBlocksSwapped: function() {

			// Init variables
			var index = this.activeIndex;
			var indexes = editor.getSwappingBlockIndexes.call(this);
			var block = this.blocks.items[index];
			var pBlock = this.blocks.items[indexes[0]];
			var sBlock = this.blocks.items[indexes[1]];

			// Remove classes
			block.element.classList.remove(this.isActiveClass);
			pBlock.element.classList.remove(this.isSwappingClass);
			sBlock.element.classList.remove(this.isSwappingClass);
			
			// Remove translations
			pBlock.element.style.transform = '';
			sBlock.element.style.transform = '';

			// Swap primary and secondary blocks
			this.blocks.element.insertBefore(sBlock.element, pBlock.element);
			this.blocks.items[indexes[0]] = sBlock;
			this.blocks.items[indexes[1]] = pBlock;

			// Set focus
			editor.setFocus.call(this, this.focusedElement);

			// Scroll window
			if (!editor.isElementInViewport.call(this, block.element) && this.isScrollEnabled) {
				window.scrollBy({
					top: this.scrollOffset,
					behavior: 'smooth'
				});
			}

			// Reset instance settings
			this.action = null;
			this.activeIndex = null;
			// this.focusedElement = null;
			this.scrollOffset = null;
						
			// Call callback function
			if (this.swapCallback) this.swapCallback.call(this, block);
		},

		/**
		* Create block menus. (private)
		*/
		createBlockMenus: function() {

			// Init variables
			var menuElem, buttonElem, className, label;
			var menus = [];
			var actions = [
				{
					action: 'moveUp',
					label : this.moveUpLabel,
					class : this.blockMenuMoveUpClass
				},
				{
					action: 'moveDown',
					label : this.moveDownLabel,
					class : this.blockMenuMoveDownClass
				},
				{
					action: 'remove',
					label : this.removeLabel,
					class : this.blockMenuRemoveClass
				}
			];

			// Create menus
			for (var i in actions) {

				// Set variables
				className = actions[i].class;
				label = actions[i].label;

				// Create elements
				menuElem = editor.createBlockMenuElem.call(this, className);
				buttonElem = editor.createBlockMenuButtonElem.call(this, label);
				
				// Append button
				menuElem.append(buttonElem);

				// Create block menu
				menus.push({
					action: actions[i].action,
					element: menuElem,
					buttonElement: buttonElem
				});
			}

			// Return value
			return menus;
		},

		/**
		* Create block types. (private)
		*/
		createBlockTypes: function() {

			// Init variables
			var blockType, contentType;
			var blockTypes = [];

			// Create menus
			for (var i = 0; i < this.contentTypes.length; i++) {
				contentType = this.contentTypes[i];
				blockType = editor.createBlockType.call(this, contentType);
				blockTypes.push(blockType);
			}

			// Return value
			return blockTypes;
		},

		/**
		* Create block type. (private)
		* @param contentType object
		*/
		createBlockType: function(contentType) {

			// Init variables
			var typeElem, buttonElem;
			var label = contentType.label;

			// Create elements
			typeElem = editor.createBlockTypeElem.call(this);
			buttonElem = editor.createBlockTypeButtonElem.call(this, label);

			// Append button
			typeElem.append(buttonElem);

			// Return value
			return {
				type: contentType.name,
				element: typeElem,
				buttonElement: buttonElem,
			};
		},

		/**
		* Toggle block types. (private)
		* @param blockTypes object
		*/
		toggleBlockTypes: function(blockTypes) {
			if (blockTypes.isOpened) {
				editor.closeBlockTypes.call(this, blockTypes);
			}
			else {
				editor.openBlockTypes.call(this, blockTypes);
			}
		},

		/**
		* Open block types. (private)
		* @param blockTypes object
		*/
		openBlockTypes: function(blockTypes) {

			// Add classes
			blockTypes.element.classList.add(this.isOpenedClass);
			blockTypes.triggerElement.classList.add(this.isActiveClass);

			// Set attributes
			blockTypes.triggerElement.setAttribute('aria-expanded','true');
			blockTypes.element.setAttribute('aria-hidden','false');
			blockTypes.isOpened = true;
		},

		/**
		* Close block types. (private)
		* @param blockTypes object
		*/
		closeBlockTypes: function(blockTypes) {

			// Remove classes
			blockTypes.element.classList.remove(this.isOpenedClass);
			blockTypes.triggerElement.classList.remove(this.isActiveClass);

			// Set attributes
			blockTypes.triggerElement.setAttribute('aria-expanded','false');
			blockTypes.element.setAttribute('aria-hidden','true');
			blockTypes.isOpened = false;

			// Set focus to trigger when no focused element is set
			if (!this.focusedElement) {
				if (blockTypes.element.contains(document.activeElement)) {
					editor.setFocus.call(this, blockTypes.triggerElement);
				}
			}
		},

		/**
		* Create blocks element. (private)
		*/
		createBlocksElem: function() {

			// Create elements
			var blocksElem = document.createElement('ul');

			// Add classes
			blocksElem.classList.add(this.blocksClass);

			// Return value
			return blocksElem;
		},

		/**
		* Create block element. (private)
		* @param contentType object
		*/
		createBlockElem: function(contentType) {

			// Create elements
			var blockElem = document.createElement('li');

			// Add classes
			blockElem.classList.add(this.blockClass);
			if (contentType.class) {
				blockElem.classList.add(contentType.class);
			}

			// Add event listeners
			blockElem.addEventListener('animationend', this);

			// Return value
			return blockElem;
		},

		/**
		* Create block header element. (private)
		* @param contentType object
		*/
		createBlockHeaderElem: function(contentType) {

			// Create elements
			var headerElem = document.createElement('header');
			var headingElem = document.createElement(this.blockHeadingTag);

			// Add classes
			headerElem.classList.add(this.blockHeaderClass);
			headingElem.innerHTML = contentType.label;

			// Append elements
			headerElem.append(headingElem);
			
			// Return value
			return headerElem;
		},

		/**
		* Create block main element. (private)
		*/
		createBlockMainElem: function() {

			// Create elements
			var mainElem = document.createElement('div');

			// Add classes
			mainElem.classList.add(this.blockMainClass);

			// return value
			return mainElem;
		},

		/**
		* Create block menus element. (private)
		*/
		createBlockMenusElem: function() {

			// Create elements
			var menusElem = document.createElement('ul');

			// Add classes
			menusElem.classList.add(this.blockMenusClass);

			// Return value
			return menusElem;
		},

		/**
		* Create block menu element. (private)
		* @param className string
		*/
		createBlockMenuElem: function(className) {
			
			// Create elements
			var menuElem = document.createElement('li');

			// Add classes
			menuElem.classList.add(this.blockMenuClass);
			if (className) {
				menuElem.classList.add(className);
			}

			// return value
			return menuElem;
		},

		/**
		* Create block menu button element. (private)
		* @param label string
		*/
		createBlockMenuButtonElem: function(label) {
			
			// Create element
			var buttonElem = document.createElement('button');

			// Set attributes
			buttonElem.type = 'button';
			buttonElem.innerHTML = label;
			
			// return value
			return buttonElem;
		},

		/**
		* Create block types element. (private)
		*/
		createBlockTypesElem: function() {

			// Create elements
			var typesElem = document.createElement('ul');

			// Set attributes
			typesElem.setAttribute('aria-hidden','true');

			// Add classes and attributes
			typesElem.classList.add(this.blockTypesClass);

			// Return value
			return typesElem;
		},

		/**
		* Create block type trigger element. (private)
		*/
		createBlockTypeTriggerElem: function() {

			// Create element
			var triggerElem = document.createElement('button');

			// Set attributes
			triggerElem.type = 'button';
			triggerElem.innerHTML = this.triggerLabel;
			triggerElem.setAttribute('aria-expanded','false');

			// Add classes
			triggerElem.classList.add(this.blockTypeTriggerClass);

			// return value
			return triggerElem;
		},

		/**
		* Create block type element. (private)
		*/
		createBlockTypeElem: function() {

			// Create elements
			var typeElem = document.createElement('li');

			// Add classes
			typeElem.classList.add(this.blockTypeClass);

			// return value
			return typeElem;
		},

		/**
		* Create block type button element. (private)
		* @param label string
		*/
		createBlockTypeButtonElem: function(label) {
			
			// Create element
			var buttonElem = document.createElement('button');

			// Set attributes
			buttonElem.type = 'button';
			buttonElem.innerHTML = label;
			
			// return value
			return buttonElem;
		},

		/**
		 * Get contents from existing blocks. (public)
		 */
		getContents: function() {

			// Init variables
			var content, block;
			var contents = [];

			// Get content from each block
			for (var i = 0; i < this.blocks.items.length; i++) {
				block = this.blocks.items[i];
				content = editor.getContent.call(this, block);
				if (typeof content !== 'undefined') {
					contents.push(content);
				}
			}

			// return value
			return contents;
		},

		/**
		 * Get content from given block. (private)
		 * @param block object
		 */
		getContent: function(block) {
			
			// Init variables
			var data;
			var type = block.type;
			var contentType = editor.getContentType.call(this, type);

			// Content type has get data method
			if (typeof contentType.getData == 'function') {
				data = contentType.getData.call(this, block);

				// Return value
				return {
					type: type,
					data: data
				}
			}
		},

		/**
		* Get content type by name. (private)
		* @param name string
		*/
		getContentType: function(name) {

			// Find type by name
			for (var i = 0; i < this.contentTypes.length; i++) {
				if (this.contentTypes[i].name == name) {
					return this.contentTypes[i];
				}
			}
		},

		/**
		 * Get swapping block indexes. (private)
		 */
		getSwappingBlockIndexes: function() {

			// Init variables
			var primary, secondary;

			// Get primary and secondary indexes based on action
			if (this.action == 'moveDownBlock') {
				primary = this.activeIndex;
				secondary = this.activeIndex + 1;
			}
			else {
				primary = this.activeIndex - 1;
				secondary = this.activeIndex;
			}

			// return value
			return [primary, secondary];
		},

		/**
		 * Block is bounced down. (private)
		 * @param element object
		 */
		isElementInViewport: function(element) {
			var bound = element.getBoundingClientRect();
			if (bound.top >= 0 && bound.left >= 0 && bound.right <= (window.innerWidth || document.documentElement.clientWidth) && bound.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
				return true;
			}
			return false;
		},

		/**
		* Set focus. (private)
		* @param element object
		*/
		setFocus: function(element) {

			// Init variables
			var scrollTop = document.documentElement.scrollTop;

			// Set focus
			element.focus();
			
			// Scroll back
			window.scrollTo({
				top: scrollTop
			});
		},

		/**
		* Find block menu by given button element. (private)
		* @param elem object
		*/
		findBlockMenuByButtonElem: function(elem) {

			// Init variables
			var blockMenu;
			
			// Find block menu
			for (var i = 0; i < this.blocks.items.length; i++) {
				for (var j = 0; j < this.blocks.items[i].menus.items.length; j++) {
					blockMenu = this.blocks.items[i].menus.items[j];
					if (blockMenu.buttonElement == elem) {
						return {
							blockMenu: blockMenu,
							blockIndex: i,
							menuIndex: j
						};
					}
				}
			}
		},

		/**
		* Find block type by given button element. (private)
		* @param elem object
		*/
		findBlockTypeByButtonElem: function(elem) {

			// Init variables
			var blockType;
			
			// Find block menu
			for (var i = 0; i < this.blocks.blockTypes.items.length; i++) {
				blockType = this.blocks.blockTypes.items[i];
				if (blockType.buttonElement == elem) {
					return {
						blockType: blockType,
						index: i
					};
				}
			}
		},

		/**
		 * Handle events (private)
		 * @param event object
		 */
		handleEvents: function(event) {

			// Init variables
			var data;

			// Event type is click
			if (event.type == 'click') {

				// Enable scroll
				this.isScrollEnabled = true;

				// Close block types
				data = this.blocks.blockTypes;
				if (data.triggerElement !== event.target) {
					if (!data.element.contains(event.target)) {
						editor.closeBlockTypes.call(this, data);
					}
				}

				// Block menu is clicked
				data = editor.findBlockMenuByButtonElem.call(this, event.target);
				if (typeof data !== 'undefined') {

					if (data.blockMenu.action == 'moveUp') {
						editor.moveUpBlock.call(this, data.blockIndex);
					}
					else if (data.blockMenu.action == 'moveDown') {
						editor.moveDownBlock.call(this, data.blockIndex);
					}
					else if (data.blockMenu.action == 'remove') {
						editor.removeBlock.call(this, data.blockIndex);
					}
				}

				// Block type trigger is clicked
				if (this.blocks.blockTypes.triggerElement == event.target) {
					if (this.contentTypes.length > 1) {
						editor.toggleBlockTypes.call(this, this.blocks.blockTypes);
					}
					else {
						editor.createBlock.call(this, {
							type: this.contentTypes[0].name,
							data: {}
						});
					}
				}

				// Block type is clicked
				data = editor.findBlockTypeByButtonElem.call(this, event.target);
				if (typeof data !== 'undefined') {
					editor.createBlock.call(this, {
						type: data.blockType.type,
						data: {}
					});
				}
			}

			// Event type is animationend
			else if (event.type == 'animationend') {

				// Check active index is set
				if (this.activeIndex === null) return;

				// Get active block
				data = this.blocks.items[this.activeIndex].element;

				// Active block is the target element
				if (data !== event.target) return;

				// Run method based on action
				if (this.action == 'moveUpBlock') {
					editor.areBlocksSwapped.call(this);
				}
				else if (this.action == 'moveDownBlock') {
					editor.areBlocksSwapped.call(this);
				}
				else if (this.action == 'bounceUpBlock') {
					editor.isBlockBouncedUp.call(this);
				}
				else if (this.action == 'bounceDownBlock') {
					editor.isBlockBouncedDown.call(this);
				}
				else if (this.action == 'removeBlock') {
					editor.isBlockRemoved.call(this);
				}
				else if (this.action == 'createBlock') {
					editor.isBlockCreated.call(this);
				}

				// Disable scroll
				this.isScrollEnabled = false;
			}

			// Event is keydown
			else if (event.type == 'keydown') {

				// Esc key is pressed
				if (event.keyCode == 27) {
					editor.closeBlockTypes.call(this, this.blocks.blockTypes);
				}
			}
		},

		/**
		 * Destroy editor. (public)
		 */
		destroy: function() {

			// Prevent destroy if not initialized
			if (!this.isInitialized) return;

			// Init variables
			var blockElem, blockTypesElem, blockTypeTriggerElem;

			// Remove event listeners from blocks
			for (var i = 0; i < this.blocks.items.length; i++) {
				blockElem = this.blocks.items[i].element;
				blockElem.removeEventListener('animationend', this);
			}

			// Remove event listeners from document
			document.removeEventListener('keydown', this);
			document.removeEventListener('click', this);

			// Remove blocks element
			blockElem = this.blocks.element;
			blockElem.parentNode.removeChild(blockElem);

			// Remove block types element
			blockTypesElem = this.blocks.blockTypes.element;
			blockTypesElem.parentNode.removeChild(blockTypesElem);

			// Remove block type trigger element
			blockTypeTriggerElem = this.blocks.blockTypes.triggerElement;
			blockTypeTriggerElem.parentNode.removeChild(blockTypeTriggerElem);

			// Reset blocks object
			this.blocks = {
				element: null,
				blockTypes: {
					element: null,
					triggerElement: null,
					isOpened: false,
					items: []
				},
				items: []
			};

			// Finish destroy
			this.isInitialized = false;
			if (this.destroyCallback) this.destroyCallback.call(this);
		},

		/**
		 * Get value of "isInitialized" to be able to check editor is initialized or not. (public)
		 */
		getIsInitialized: function() {
			return this.isInitialized;
		},
	};

	return {
		init: editor.init,
		createBlock: editor.createBlock,
		moveUpBlock: editor.moveUpBlock,
		moveDownBlock: editor.moveDownBlock,
		removeBlock: editor.removeBlock,
		getContents: editor.getContents,
		destroy: editor.destroy,
		getIsInitialized: editor.getIsInitialized
	};
}();
