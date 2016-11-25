# schemes-inspectore

# Deploy:

1. npm install

2. Set db configurations in files
    new_base_settings.json
    old_base_settings.json

3. Set db models in folders
    new_sequelize_scheme/models
    old_sequelize_scheme/models

4. Import models and set associations in files(see comments):
    new_sequelize_scheme/models_and_relations.js
    old_sequelize_scheme/models_and_relations.js

5. npm start