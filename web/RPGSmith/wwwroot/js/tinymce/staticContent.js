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

tinymce.PluginManager.add('rpgsstaticcontent', function(editor) {

    // Called externally
    this.updateStyles = function(styles) {
        var node = $(innerNode());

        styles.content.classes = node.attr('class');
        styles.content.styles = rpgsmith.styles2Obj(node.attr('style'));
    };

    var _old_apply = null;

    function innerNode() {
        var node = editor.dom.select('p')[0];

        if (node) {
            while (node.children.length > 0)
                node = node.children[0];
        }

        return node;
    }

    function selectNode() {
        var node = innerNode();
        editor.focus();
        editor.selection.select(node);
        return node;
    }

    var valignButtons = ['valigntop', 'valignmiddle', 'valignbottom'];

    function lock(yesNo) {
        editor.getBody().setAttribute('contenteditable', !yesNo);
    }

    function beforeCommand() {
        lock(false);
        selectNode();
    };

    function afterCommand() {
        editor.selection.collapse();
        lock(true);
    }

    function valign(command) {

        beforeCommand();

        valignButtons.forEach(function(f) {
            if (f !== command)
                editor.formatter.remove(f);
        });

        editor.formatter.toggle(command, undefined);
        editor.nodeChanged();

        afterCommand();
    }
    
    editor.on('PreInit', function(ed) {

        _old_apply = editor.formatter.apply;

        editor.formatter.apply = function apply(name, vars, node) {
            editor.fire('BeforeExecCommand', { command: name });
            _old_apply.call(arguments);
            editor.fire('ExecCommand', { command: name });
        };

        editor.formatter.unregister('bold');
        editor.formatter.unregister('italic');
        editor.formatter.unregister('underline');

        editor.formatter.unregister('alignleft');
        editor.formatter.unregister('aligncenter');
        editor.formatter.unregister('alignright');

        // Text format
        editor.formatter.register('bold', {
            inline: 'span', styles: { 'font-weight': 'bold' }
        });
        editor.formatter.register('italic', {
            inline: 'span', styles: { 'font-style': 'italic' }
        });
        editor.formatter.register('underline', {
            inline: 'span', styles: { 'text-decoration': 'underline' }
        });

        // Horizontal Alignment
        editor.formatter.register('alignleft', {
            inline: 'span', classes: 'tile-content-left'
        });
        editor.formatter.register('aligncenter', {
            inline: 'span', classes: 'tile-content-center'
        });
        editor.formatter.register('alignright', {
            inline: 'span', classes: 'tile-content-right'
        });

        // Vertical Alignment
        editor.formatter.register('valigntop', {
            inline: 'span', classes: 'tile-content-top'
        });
        editor.formatter.register('valignmiddle', {
            inline: 'span', classes: 'tile-content-middle'
        });
        editor.formatter.register('valignbottom', {
            inline: 'span', classes: 'tile-content-bottom'
        });

        window.setTimeout(function() {
            lock(true);
            selectNode();
            editor.selection.collapse();
        }, 5);
    });

    editor.on('BeforeExecCommand', function(e) {

        console.log('BeforeExecCommand');

        switch (e.command) {
            case 'mceInsertContent':
                return false;
            default:
                selectNode();
                lock(false);
                break;
        }
    });

    editor.on('ExecCommand', function(e) {
        if (e.command !== 'selectAll') {
            lock(true);
            editor.selection.collapse();
        }
    });

    editor.addButton('valigntop', {
        text: 'T',
        tooltip: 'Align top',
        icon: false,
        onclick: function() {
            valign('valigntop');            
        },
        onpostrender: function() {
            var btn = this;
            editor.on('init', function() {
                editor.formatter.formatChanged('valigntop', function(state) {
                    btn.active(state);
                });
            });
        }
    });

    editor.addButton('valignmiddle', {
        text: 'M',
        tooltip: 'Align middle',
        icon: false,
        onclick: function() {
            valign('valignmiddle');            
        },
        onpostrender: function() {
            var btn = this;
            editor.on('init', function() {
                editor.formatter.formatChanged('valignmiddle', function(state) {
                    btn.active(state);
                });
            });
        }
    });

    editor.addButton('valignbottom', {
        text: 'B',
        tooltip: 'Align bottom',
        icon: false,
        onclick: function() {
            valign('valignbottom');            
        },
        onpostrender: function() {
            var btn = this;
            editor.on('init', function() {
                editor.formatter.formatChanged('valignbottom', function(state) {
                    btn.active(state);
                });
            });
        }
    });
    
});