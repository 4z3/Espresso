// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
// Creator:   Sebastian
// Date:      28.10.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

M.STATE_UNDEFINED = 'state_undefined';
M.STATE_NEW = 'state_new';
M.STATE_INSYNCPOS = 'state_insyncpos';
M.STATE_INSYNCNEG = 'state_insyncneg';
M.STATE_LOCALCHANGED = 'state_localchange';
M.STATE_VALID = 'state_valid';
M.STATE_INVALID = 'state_invalid';

//m_require('data_provider.js');
m_require('core/foundation/model_registry.js');

/**
 * @class
 *
 * The root class for every model.
 *
 */
M.Model = M.Object.extend({

    /**
     * The type of this object.
     *
     * @property {String}
     */
    type: 'M.Model',

    /**
     * The name of the model.
     *
     * @property {String}
     */
    name: '',

    /**
     * Unique identifier for the model record.
     *
     * Note: Unique doesn't mean that this id is a global unique ID, it is just unique
     * for records of this type of model.
     *
     * @property {Number}
     */
    id: null,

    /**
     * The model's record defines the properties that are semantically bound to this model:
     * e.g. a person's record is in simplest case: firstname, lastname, age.
     *
     * @property {Object} record
     */
    record: null,

    /**
     * Object containing all meta information for the object's properties
     * @property {Object}
     */
    __meta: {},

    /**
     * A constant defining the model's state. Important e.g. for syncing storage
     * @property {String}
     */
    state: M.STATE_UNDEFINED,


    /**
     * determines whether model shall be validated before saving to storage or not.
     * @property {Boolean}
     */
    usesValidation: YES,

    /**
     * The model's data provider.
     *
     * Needs a refactoring, also in connection with storageEngine.
     *
     * @property {Object}
     */
    dataProvider: null,

    /**
     * Defines the storage engine to use.
     *
     * Needs a refactoring, also in connection with dataProvider.
     *
     * @property {String}
     */
    storageEngine: M.WebStorage,

    /**
     * Creates a new record of the model, means an instance of the model based on the blueprint.
     * You pass the object's specific attributes to it as an object.
     *
     * @param {Object} obj The specific attributes as an object, e.g. {firstname: 'peter', lastname ='fox'}
     */
    createRecord: function(obj) {
        var modelRecord = this.extend({
            id: obj.id ? obj.id : M.Application.modelRegistry.getNextId(this.name),
            record: obj
        });
        modelRecord.state = M.STATE_NEW;
        return modelRecord;
    },

    /**
     * Create defines a new model blueprint. It is passed an object with the model's attributes and the model's business logic
     * and then the type of data provider to use.
     *
     * @param {Object} obj An object defining the model's  
     * @param {Object} dp The data provider to use, e. g. M.LocalStorageProvider
     */
    create: function(obj, dp) {
        var model = this.extend({
            name: obj.__name__,
            dataProvider: dp,
            usesValidation: obj.usesValidation === null || obj.usesValidation === undefined ? this.usesValidation : obj.usesValidation
        });
        delete obj.__name__;

        for(var prop in obj) {
            if (prop === 'usesValidation') {
                break;
            }
            if(typeof(obj[prop]) === 'function') {
                model[prop] = obj[prop];
            } else if(obj[prop].type !== 'M.ModelAttribute') {
                model.__meta[prop] = obj[prop];    
            }

        }
        M.Application.modelRegistry.register(model.name);

        /* Re-set the just registered model's id, if there is a value stored */
        /* Model Registry stores the current id of a model type into localStorage */
        var id = localStorage.getItem(model.name);
        if(id) {
            M.Application.modelRegistry.setId(model.name, parseInt(id));
        }

        return model;
    },

    /**
     * Returns a M.ModelAttribute object to map an attribute in our model.
     *
     * @param type type of the attribute
     * @param opts options for the attribute, like required flag or
     */
    attr: function(type, opts) {
        return M.ModelAttribute.attr(type, opts); 
    },

    /*
     * get and set methods for encapsulated attribute access
     */

    /**
     * Get attribute attrName from model
     * @param {String} attrName the name of the attribute which value to be returned
     * @return {Object|String} value of attribute
     */
    get: function(attrName) {
        return this.record[attrName];
    },

    /**
     * Set attribute attrName of model with value val
     * @param {String} attrName the name of the attribute which value to be returned
     * @param {String|Object} val the new value
     */
    set: function(attrName, val) {
        this.record[attrName] = val;
    },

    /**
     * Validates the model, means calling validate for each property.
     */
    validate: function() {
        var isValid = YES;
        var validationErrorOccured = NO;
        /* clear validation error buffer before validation */
        M.Validator.clearErrorBuffer();

        for (var i in this.__meta) {
            var prop = this.__meta[i];
            var obj = {
                value: this.record[i],
                modelId: this.name + '_' + this.id,
                property: i
            };
            if (!prop.validate(obj)) {
                isValid = NO;
            }
        }
        /* set state of model */
        if(!isValid) {
            this.state = M.STATE_INVALID;
        } else {
            this.state = M.STATE_VALID;   
        }
        return isValid;
    },

    /* CRUD Methods below */

    /**
     * Calls the corresponding data provider to fetch data based on the passed query.
     *
     * @param {String} query The query string.
     */
    find: function(id){
        //this.dataProvider.find(this.name, query);
        return this.dataProvider.find(this.name, id);
    },

    /**
     * Returns all models.
     */
    findAll: function(){
        return this.dataProvider.findAll(this.name);
    },

    /**
     * Create or update a record in storage if it is valid (first check this).
     */
    save: function() {
        if(!this.id) {
            return;
        }

        var isValid = YES;

        if(this.usesValidation) {
            isValid = this.validate();
        }

        if(isValid) {
            this.dataProvider.save(this);
            return YES;
        }
        return NO;
    },

    /**
     * Delete a record in storage.
     */
    del: function() {
        if(!this.id) {
            return;
        }

        this.dataProvider.del(this);
    }

});