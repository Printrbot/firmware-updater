define([
  'app',
  'text!templates/detect.html'
],

function(
  app,
  Tpl
)
{
  var v = Backbone.View.extend(
  {
    initialize: function(o) {
      this.tpl = _.template(Tpl);
      app.channel.trigger('flash.prepare');
    },

    events: {
      'click button.backbtn': 'goBack'
    },

    goBack: function(e) {
      app.selectedView = 'start';
      app.channel.trigger('newpage');
    },


    render: function()
    {
      this.$el.html(this.tpl({app:app}));
      return this.$el;
    }
  });

  return v;
});
