import _ from 'lodash';
import Sequelize from 'sequelize';

import new_config from './new_base_settings.json';
import old_config from './old_base_settings.json';

var new_scheme = loadScheme(new_config, 'new_sequelize_scheme')
var old_scheme = loadScheme(old_config, 'old_sequelize_scheme')

function loadScheme(config, folder) {
    var URI = 'mysql://' + config.user + ':' + config.password + '@' + config.host + ':' + config.port + '/' + config.database,
        options = {logging: config.logging, define: config.define}

    var db = {
        Sequelize,
        sequelize: new Sequelize(URI, options)
    };
    require(`./${folder}/models_and_relations`)(db);
    return db;
}

var new_models = _.keys(new_scheme.sequelize.models);
var old_models = _.keys(old_scheme.sequelize.models);

var removed_models = _.difference(old_models, new_models);
var added_models = _.difference(new_models, old_models);

var report =
    `
==============================================
            Database Upate report
==============================================

`;


if (removed_models.length) {

    report +=
        `
REMOVED MODELS:

${removed_models.join('\n')}

`;

}

if (added_models.length) {

    report +=
        `
ADDED MODELS:

${added_models.join('\n')}

`;

}

_.each(new_scheme.sequelize.models, checkChanges);

console.log(report);

function checkChanges(model, name) {

    report +=
        `
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Model ${name} changes:
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

`;


    var old_model = old_scheme.sequelize.models[name];
    if (!old_model) return;

    checkAssociations(model, old_model, name)

    let new_fields = _.keys(model.attributes);
    let old_fields = _.keys(old_model.attributes);

    let removed_fields = _.difference(old_fields, new_fields);
    let added_fields = _.difference(new_fields, old_fields);

    if (removed_fields.length) {
        report +=
            `
REMOVED FIELDS:

${removed_fields.join('\n')}
`
    }

    if (added_fields.length) {
        report +=
            `
ADDED FIELDS:

${added_fields.join('\n')}
`
    }

    _.each(model.attributes, _.bind(checkFields, {old_fields: old_model.attributes, model_name: name}));

}

function checkAssociations(model, old_model, name) {
    var new_model_associations_names = _.keys(model.associations);
    var old_model_associations_names = _.keys(old_model.associations);

    let removed_associations = _.difference(old_model_associations_names, new_model_associations_names);
    let added_associations = _.difference(new_model_associations_names, old_model_associations_names);

    if (removed_associations.length) {
        report +=
            `
REMOVED ASSOCIATIONS:

${removed_associations.join('\n')}
`
    }

    if (added_associations.length) {
        report +=
            `
ADDED ASSOCIATIONS:

${added_associations.join('\n')}
`
    }


    _.each(model.associations, (association, key)=> {
        var old_association = old_model.associations[key];
        if (!old_association) return;

        if (association.associationType !== old_association.associationType) {
            report +=
                `
TYPE OF ASSOCIATION ${key} WAS CHANGED:
old: ${old_association.associationType}
new: ${association.associationType}
            
`;
        }

        if (association.targetKey !== old_association.targetKey) {
            report +=
                `
FIELD "targetKey" OF ASSOCIATION ${key} WAS CHANGED:
old: ${old_association.targetKey}
new: ${association.targetKey}
            
`;
        }

        if (association.as !== old_association.as) {
            report +=
                `
FIELD "AS" OF ASSOCIATION ${key} WAS CHANGED:
old: ${old_association.as}
new: ${association.as}
            
`;
        }

        if (association.foreignKey !== old_association.foreignKey) {
            report +=
                `
FOREGIN KEY OF ASSOCIATION ${key} WAS CHANGED:
old: ${old_association.foreignKey}
new: ${association.foreignKey}
            
`;
        }
    });
}


function checkFields(field, name) {
    var old_field = this.old_fields[name];
    if (!old_field) return;

    if (field.type.constructor.key !== old_field.type.constructor.key) {
        report +=
            `
FIELD ${name} WAS CHANGED:
old: ${old_field.type.constructor.key}
new: ${field.type.constructor.key}
            
`;
    }

    if (field.type.constructor.key === 'STRING' && (field.type._length !== old_field.type._length)) {
        report +=
            `
LENGTH OF FIELD ${name} WAS CHANGED:
old: ${old_field.type._length}
new: ${field.type._length}
            
`;
    }

    if (field.allowNull !== old_field.allowNull) {
        report +=
            `
ATTRIBUTE "allowNull" OF FIELD ${name} WAS CHANGED:
old: ${old_field.allowNull}
new: ${field.allowNull}
            
`;
    }

    if (field.primaryKey !== old_field.primaryKey) {
        report +=
            `
ATTRIBUTE "primaryKey" OF FIELD ${name} WAS CHANGED:
old: ${old_field.primaryKey}
new: ${field.primaryKey}
            
`;
    }

    if (field.autoIncrement !== old_field.autoIncrement) {
        report +=
            `
ATTRIBUTE "autoIncrement" OF FIELD ${name} WAS CHANGED:
old: ${old_field.autoIncrement}
new: ${field.autoIncrement}
            
`;
    }

}


