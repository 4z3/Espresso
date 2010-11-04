// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   Dominik
// Date:      27.10.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('logger.js');

/**
 * @class
 *
 * Object for dispatching all incoming events.
 *
 */
M.EventDispatcher = M.Object.create({

    /**
     * The type of this object.
     *
     * @property {String}
     */
    type: 'M.EventDispatcher',

    /**
     * This method is called whenever an event is triggered within the app.
     *
     * @param {Object} evt The event.
     */
    eventDidHappen: function(evt) {
        if(evt.type == 'click') {
            this.delegateEvent(evt.currentTarget.id);
        }
    },

    /**
     * This method looks for a corresponding event inside the view manager and
     * delegates the call directly to the responsible controller defined by the
     * target and action properties of the view.
     *
     * @param {String} id The id of the element that triggered the event.
     */
    delegateEvent: function(id) {
        var view = M.ViewManager.getViewById(id);
        if(view && view.target && view.action) {
           eval(view.target)[view.action]();
        }
    }

});

$(document).ready(function() {
    var eventList = 'click';
    $('*[id]').bind(eventList, function(evt) { M.EventDispatcher.eventDidHappen(evt); });
});