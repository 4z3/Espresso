// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   Dominik
// Date:      03.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('ui/button.js');

/**
 * @class
 *
 * The root object for ListItemViews.
 *
 */
M.ListItemView = M.View.extend({

    type: 'M.ListItemView',

    inEditMode: NO,

    deleteButton: M.ButtonView.design({
        icon: 'delete',
        renderToDOM: NO,
        useOnClick: YES,
        target: null,
        action: '',
        value: ''
    }),

    render: function() {
        this.html = '<li id="' + this.id + '">';

        if(this.inEditMode) {
            this.html += '<a href="#">';
            this.renderChildViews();
            this.html += '</a>';
            
            this.html += this.deleteButton.render();
        } else {
            this.html += '<a href="#">';
            this.renderChildViews();
            this.html += '</a>';
        }

        this.html += '</li>';
        
        return this.html;
    },

    renderUpdate: function() {

    },

    /**
     * Triggers render() on all children and returns their render result.
     */
    renderChildViews: function() {
        var childViews = $.trim(this.childViews).split(' ');
        for(var i in childViews) {
            this.html += this[childViews[i]].render();
        }
        return this.html;
    }

});