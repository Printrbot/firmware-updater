define([
  'app',
  'text!templates/start.html'
],

function(
  app,
  Tpl
)
{
  var v = Backbone.View.extend(
  {
    className: 'start-view',

    initialize: function(o) {
      this.tpl = _.template(Tpl);
      this.listenTo(app.fm, 'change', function(e) {
        this.render();
      })
    },

    events: {
      'click button': 'onSelect'
    },

    onSelect: function(e) {
      var _sel = $('select.bot option:selected');
      if (!_sel.val()) {
        $('select.bot').removeClass('animated bounceIn');
        $('select.bot').addClass('animated shake');
        $('select.bot').one('webkitAnimationEnd', function(e) {
          $(this).removeClass('animated shake');
        })
        return;
      }
      
      app.model = _sel.html();
      app.mtype = _sel.attr("t");

      app.selectedView = 'info';
      app.channel.trigger('newpage');

      app.downloadFile(_sel.val());

      app.channel.trigger('flash.downloading');

    },

    render: function()
    {
      this.$el.html(this.tpl({app:app}));
      return this.$el;
    }
  });

  return v;
});
