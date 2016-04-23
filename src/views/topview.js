var remote = require('remote');

define([
  'app',
  'views/startview',
  'views/detectview',
  'views/infoview'
],

function(
  app,
  StartView,
  DetectView,
  InfoView
)
{

    var v = Backbone.View.extend(
    {
        id: 'topView',

        className: 'index-view container-fluid',

        initialize: function()
        {
          var that = this;
          this.listenTo(app.channel, 'newpage', function(e)
          {
            that.render();
          });
        },

        events: {

        },


        render: function()
        {

          if (app.selectedView == 'start') {
              var v = this.loadView(new StartView(), 'start');
              this.$el.html(v.render());
          }

          if (app.selectedView == 'detect') {
              var v = this.loadView(new DetectView(), 'detect');
              this.$el.html(v.render());
          }

          if (app.selectedView == 'info') {
              var v = this.loadView(new InfoView(), 'info');
              this.$el.html(v.render());
          }


          return this.$el;
        }
    });

    return v;

});
