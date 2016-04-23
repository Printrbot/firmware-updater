define([
    'app',
    'views/topview'
],

function(
    app,
    TopView
)
{
    var AppRouter = Backbone.Router.extend(
    {

        initialize: function()
        {
            var that = this;
            this.topView = new TopView({el: $('#topView')});
        },

        routes:
        {
            '/': 'showStart',
            '*actions':'showStart'
        },

        showStart: function(e)
        {
            app.selectedView = 'start';
            this.topView.render();
        },


    });

    return AppRouter;
});
