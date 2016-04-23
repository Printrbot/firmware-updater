requirejs.config(
{
  deps: ["main"],

  paths: {
    underscore: '../lib/underscore/underscore',
    backbone: '../lib/backbone/backbone',
    jquery: '../lib/jquery/dist/jquery',
    bootstrap: '../lib/bootstrap/dist/js/bootstrap'
  },

  shim: {
    "backbone": {
        deps: ["underscore", "jquery"],
        exports: "Backbone"
    },
    "underscore": {
        exports: "_"
    },
    "jquery": {
        exports: "$"
    },
    "bootstrap": {
        deps: ["jquery"],
        exports: 'bootstrap'
    },
    "main": ["backbone"],
  }

});
