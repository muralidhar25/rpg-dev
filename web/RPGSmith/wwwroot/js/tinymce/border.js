// Note: This is a modification of the textcolor picker modified for body background

/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */
/*eslint consistent-this:0 */

tinymce.PluginManager.add('rpgsborder', function(editor) {

    // Called externally
    this.updateStyles = function(styles) {

        var el = editor.getContentAreaContainer();

        styles.tile.styles['border'] = el.style.border;
        styles.tile.styles['border-radius'] = el.style.borderRadius;
        
        styles.tile.styles['box-shadow'] = el.style.boxShadow || null;
    };

    function makeValues() {
        var arr = [];
        for (var i = 1; i <= 10; i++)
            arr.push({ text: i + 'px', value: i + 'px' });
        return arr;
    }

    function createColorPickAction() {
        var colorPickerCallback = editor.settings.color_picker_callback;

        if (colorPickerCallback) {
            return function() {
                var self = this;

                colorPickerCallback.call(
                    editor,
                    function(value) {
                        self.value(value).fire('change');
                    },
                    self.value()
                );
            };
        }
    };

    editor.on('Init', function(ed) {

        var dst = editor.getContentAreaContainer(),
            src = editor.getParam('tileStyle').tile;

        // The editor or something puts in a 1px border inline. This will remove it.
        dst.style.borderWidth = null;

        // our styles
        dst.style.backgroundColor = src.styles['background-color'];
        dst.style.border = src.styles['border'];
        dst.style.borderRadius = src.styles['border-radius'];

        dst.style.boxShadow = src.styles['box-shadow'];
    });

    editor.on('ExecCommand', function(e) {
        if (e.command === 'RemoveFormat') {
            // Do we do anything?
        }
    });

    editor.addButton('rpgsborder', {
        type: 'button',
        tooltip: 'Tile border',
        onclick: function() {

            var style = editor.getContentAreaContainer().style;
            
            editor.windowManager.open({
                title: 'Edit border',
                body: [
                    {
                        type: 'listbox',
                        name: 'style',
                        label: 'Style',
                        values: [
                            { text: 'Use default', value: 'inherit' },
                            { text: 'None', value: 'none' },
                            { text: 'Dotted', value: 'dotted' },
                            { text: 'Double', value: 'double' },
                            { text: 'Dashed', value: 'dashed' },
                            { text: 'Groove', value: 'groove' },
                            { text: 'Inset', value: 'inset' },
                            { text: 'Outset', value: 'outset' },
                            { text: 'Ridge', value: 'ridge' },
                            { text: 'Solid', value: 'solid' }
                        ],
                        value: style.borderStyle
                    },
                    {
                        type: 'colorbox',
                        name: 'color',
                        label: 'Color',
                        onaction: createColorPickAction(),
                        value: style.borderColor
                    },
                    {
                        type: 'combobox',
                        name: 'width',
                        label: 'Width',
                        values: makeValues(),
                        value: style.borderWidth
                    },
                    {
                        type: 'combobox',
                        name: 'radius',
                        label: 'Radius',
                        values: makeValues(),
                        value: style.borderRadius
                    },
                    {
                        type: 'listbox',
                        name: 'shadow',
                        label: 'Shadow',
                        values: [
                            { text: 'Use default', value: 'inherit' },
                            { text: 'Yes', value: 'yes' },
                            { text: 'No', value: 'no' }
                        ],
                        value: (function() {
                            return style.boxShadow === 'none' ? 'no' : 'yes'
                        })()
                    }
                ],
                onsubmit: function(e) {
                    
                    editor.undoManager.transact(function() {
                        
                        switch (e.data.style) {
                            case '':
                            case 'inherit':
                                style.border = null;
                                break;
                            case 'none':
                                style.border = 'none';
                                break;
                            default:
                                style.border = e.data.width + ' ' + e.data.style + ' ' + e.data.color;
                                break;
                        }

                        switch (e.data.shadow) {
                            case '':
                            case 'inherit':
                            case 'yes':
                                style.boxShadow = null;
                                break;
                            case 'no':
                                style.boxShadow = 'none';
                                break;
                            default:
                        }

                        if (e.data.radius === 'inherit' || e.data.radius === '')
                            style.borderRadius = null;
                        else
                            style.borderRadius = e.data.radius;

                    });

                    editor.focus();
                }
            });
        }
    });
});