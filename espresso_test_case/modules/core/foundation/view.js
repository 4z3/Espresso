// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: �2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   Dominik
// Date:      26.10.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('model.js');

/**
 * @class
 *
 * The root of all views.
 *
 */
M.View = M.Object.extend({

    /**
     * The type of this object.
     *
     * @property {String}
     */
    type: 'M.View',

    /**
     * Generic attribute for views. Some subclasses have a property that is more readable to its context than 'value'.
     * Internally these properties are mapped to 'value'.
     * e.g. in LabelView: value:this.text
     */
    value: null,

    contentBinding: null,

    childViews: null,
    
    /**
     * The id of the View used for the HTML attribute ID.
     */
    id: null,

    /**
     * This method encapsulates the 'extend' method of M.Object for better reading of code syntax.
     * It triggers the content binding for this view,
     * gets an ID from and registers itself at the ViewManager.
     *
     * @param {Object} obj The mixed in object for the extend call.
     */
    design: function(obj) {
        var extendedView = this.extend(obj);
        if(extendedView.contentBinding) {
            extendedView.attachToObservable(extendedView.contentBinding);
        }
        extendedView.id = M.ViewManager.getNextId();
        M.ViewManager.register(extendedView);
        return extendedView;
    },

     /**
     * Interface method.
     * Renders itself to HTML.
     * Render implementation is done by the special child obj of View (LabelView etc.).
     */
    render: function() {

    },

    /**
     * Interface method.
     * Updates itself in DOM.
     * Render implementation is done by the special child obj of View (LabelView etc.).
     */
    renderUpdate: function() {

    },

    /**
     * Triggers render() on all children.
     */
    renderChildViews: function() {
        var arr = this.childViews[0].split(' ');
        for(var i in arr) {
            this[arr[i]].render();
        }
    },

    /**
     * contentDidChange is called by the observable when observable's state did change.
     * It updates the view's value property.
     */
    contentDidChange: function(){
        var bindingPath = this.contentBinding.split('.');
        if(bindingPath && bindingPath.length === 3) {
            this.value = eval(bindingPath[0])[bindingPath[1]][bindingPath[2]];
            this.renderUpdate();
        } else {
            M.Logger.log('bindingPath not valid', M.WARN);
        }
    },

    /**
     * This method attaches itself to an observable.
     *
     * @param {String} contentBinding The path to the observable property.
     */
    attachToObservable: function(contentBinding) {
        var bindingPath = contentBinding.split('.');
        if(bindingPath && bindingPath.length === 3) {
            eval(bindingPath[0])[bindingPath[1]].observable.attach(this, bindingPath[2]);
            this.isObserver = YES;
        } else {
            M.Logger.log('bindingPath not valid', M.WARN);
        }
    }

});