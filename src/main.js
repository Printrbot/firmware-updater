requirejs([
	'app',
  'router'
],
    function(app, Router)
    {
        this.router = new Router();
        Backbone.history.start();
    }
);
