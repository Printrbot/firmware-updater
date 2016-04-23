define([

],
function(

)
{
    var m = Backbone.Model.extend(
    {
        urlRoot: 'http://mickbalaban.github.io/printrbot-firmware-updater/firmware.json',
        id: null,

        initialize: function()
        {

        },

        defaults: {
          printers: [],
          cnc: []
        }
    })

    return m;
});
