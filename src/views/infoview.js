define([
  'app',
  'text!templates/info.html'
],

function(
  app,
  Tpl
)
{
  var v = Backbone.View.extend(
  {
    className: 'info-view page',

    initialize: function(o) {
      this.tpl = _.template(Tpl);
      this.listenTo(app.channel, 'flash.writing', function() {
        $('.s').addClass('hidden');
        $('.progress p').html("Writing new firmware...")
        $('.progress').removeClass('hidden');
      });
      this.listenTo(app.channel, 'flash.error', function(e) {
        $('.s').addClass('hidden');
        $('.error .details').html(e)
        $('.error').removeClass('hidden');
      });
      this.listenTo(app.channel, 'flash.completed', function() {
        $('.s').addClass('hidden');
        $('.success').removeClass('hidden');
      });
      this.listenTo(app.channel, 'flash.downloading', function() {
        $('.s').addClass('hidden');
        $('.download').removeClass('hidden');
      });
      this.listenTo(app.channel, 'flash.info', function() {
        $('.s').addClass('hidden');
        $('.step1').removeClass('hidden');
      });
    },

    events: {
      'click button.button-primary': 'changePage'
    },

    changePage: function(e) {
      var idx = $(e.currentTarget).attr('idx');
      if (idx == 1) {
        $('.step1').addClass('hidden');
        $('.step2').removeClass('hidden');
      }
      else if (app.mtype == "p" && idx == 2) {
        $('.step2').addClass('hidden');
        $('.step3').removeClass('hidden');
      }
      else {
        $('.step2').addClass('hidden');
        $('.step3').addClass('hidden');
        $('.progress').removeClass('hidden');
        if (app.mtype == "p")
          app.channel.trigger('flash.printrboard');
        else {
          app.channel.trigger('flash.tinyg');
        }
      }
    },

    render: function()
    {
      this.$el.html(this.tpl({
        app:app,
        icon: this.icon,
        text: this.text,
        title: this.title
      }));
      if (this.error)
        this.$el.addClass('error');
      return this.$el;
    }
  });

  return v;
});
