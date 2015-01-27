var app = app || {};

app.Item = Backbone.Model.extend({
    defaults: {
       department: '',
       description: '',
       modified: '',
       created: '',
       id: '',
       date: '',
       status: '',
       statusText: '',
       category: 'SITREP',
       title: ''
    }
});
