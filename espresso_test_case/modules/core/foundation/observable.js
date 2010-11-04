// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   Dominik
// Date:      29.10.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('logger.js');

/**
 * @class
 *
 * The observable knows all observers, mainly views, and pushes updates if necessary.
 *
 */
M.Observable = M.Object.extend({

    /**
     * The type of this object.
     *
     * @property {String}
     */
    type: 'M.Observable',

    /**
     * List that contains pairs of an observer with an observable. An observer is tightened to one
     * observable, but one observable can have multiple observers.
     *
     */
    bindingList: [],

    /**
     * Attach an observer to an observable.
     *
     * @param {String} observer The observer.
     * @param {String} observable The observable.
     */
    attach: function(observer, observable) {
        this.bindingList.push({
            observer: observer,
            observable: observable
        });
    },

    /**
     * Detach an observer from an observable.
     *
     * @param {String} observer The observer.
     */
    detach: function(observer) {
        /* grep is a jQuery function that finds
         * elements in an array that satisfy a certain criteria.
         * It works on a copy so we have to assign the "cleaned"
         * array to our bindingList.
         */
        this.bindlingList = $.grep(this.bindlingList, function(value, index) {
                return value.observer !== observer;
        });
    }

});