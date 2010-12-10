// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   Sebastian
// Date:      02.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

/**
 * @class
 *
 * M.PageView is the prototype of any page. It is the seconds 'highest' view, right after
 * M.Application. A page is the container view for all other views.
 *
 * @extends M.View
 */
M.PageView = M.View.extend(
/** @scope M.PageView.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.PageView',

    /**
     * States whether a page is loaded the first time or not. It is automatically set to NO
     * once the page was first loaded.
     *
     * @type Boolean
     */
    isFirstLoad: YES,

    /**
     * This property can be used to set the page's beforeLoad action.
     *
     * @type Object
     */
    beforeLoad: null,

    /**
     * This property can be used to set the page's onLoad action.
     *
     * @type Object
     */
    onLoad: null,

    /**
     * This property can be used to set the page's beforeHide action.
     *
     * @type Object
     */
    beforeHide: null,

    /**
     * This property can be used to set the page's onHide action.
     *
     * @type Object
     */
    onHide: null,

    /**
     * Indicates whether the page has a tab bar or not.
     *
     * @type Boolean
     */
    hasTabBarView: NO,

    /**
     * The page's tab bar.
     *
     * @type M.TabBarView
     */
    tabBarView: null,

    /**
     * Renders in three steps:
     * 1. Rendering Opening div tag with corresponding data-role
     * 2. Triggering render process of child views
     * 3. Rendering closing tag
     *
     * @private
     * @returns {String} The page view's html representation.
     */
    render: function() {
        this.html += '<div id="' + this.id + '" data-role="page"' + this.style() + '>';

        this.renderChildViews();

        this.html += '</div>';

        this.writeToDOM();
        this.theme();
    },

    /**
     * This method writes the view's html string into the DOM. M.Page is the only view that does
     * that. All other views just deliver their html representation to a page view.
     */
    writeToDOM: function() {
        document.write(this.html);
    },

    /**
     * This method is called right before the page is loaded. If a beforeLoad-action is defined
     * for the page, it is now called.
     */
    pageWillLoad: function() {
        if(this.beforeLoad) {
            this.beforeLoad.target[this.beforeLoad.action](this.isFirstLoad);
        }
    },

    /**
     * This method is called right after the page was loaded. If a onLoad-action is defined
     * for the page, it is now called.
     */
    pageDidLoad: function() {
        if(this.onLoad) {
            this.onLoad.target[this.onLoad.action](this.isFirstLoad);            
        }

        /* if there is a list on the page, reset it: deactivate possible active list items */
        $('#' + this.id).find('.ui-btn-active').each(function() {
            if(M.ViewManager.getViewById($(this).attr('id')) && M.ViewManager.getViewById($(this).attr('id')).type === 'M.ListItemView') {
                var listItem = M.ViewManager.getViewById($(this).attr('id'));
                listItem.removeCssClass('ui-btn-active');
            }
        });

        /* WORKAROUND for being able to use more than two tab items within a tab bar */
        /* TODO: Get rid of this workaround with a future version of jquery mobile */
        if(this.isFirstLoad && this.childViews) {
            var childViews = $.trim(this.childViews).split(' ');
            for(var i in childViews) {
                var view = this[childViews[i]];
                if(view.type === 'M.TabBarView' && view.anchorLocation === M.BOTTOM) {
                    $('[data-id="' + view.name + '"]:not(:last-child)').each(function() {
                        if(!$(this).hasClass('ui-footer-duplicate')) {
                            /* first empty the tabbar and then hide it, since jQuery's remove() doesn't work */
                            $(this).empty();
                            $(this).hide();
                        }
                    });
                }
            }
        }

        this.isFirstLoad = NO;
    },

    /**
     * This method is called right before the page is hidden. If a beforeHide-action is defined
     * for the page, it is now called.
     */
    pageWillHide: function() {
        if(this.beforeHide) {
            this.beforeHide.target[this.beforeHide.action]();
        }
    },

    /**
     * This method is called right after the page was hidden. If a onHide-action is defined
     * for the page, it is now called.
     */
    pageDidHide: function() {
        if(this.onHide) {
            this.onHide.target[this.onHide.action]();
        }
    },

    /**
     * This method is called if the device's orientation changed.
     */
    orientationDidChange: function(orientation) {
        if(this.onOrientationChange) {
            this.onOrientationChange.target[this.onOrientationChange.action](orientation);
        }
    },

    /**
     * Triggers the rendering engine, jQuery mobile, to style the page and call the theme() of
     * its child views.
     *
     * @private
     */
    theme: function() {
        $('#' + this.id).page();
        this.themeChildViews();
    },

    /**
     * Applies some style-attributes to the page.
     *
     * @private
     * @returns {String} The page's styling as html representation.
     */
    style: function() {
        var html = '';
        if(this.cssClass) {
            if(!html) {
                html += ' class="';
            }
            html += this.cssClass;
        }
        if(html) {
            html += '"';
        }
        return html;
    }
    
});