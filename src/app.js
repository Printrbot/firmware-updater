var jquery = require('jquery')
  , SerialPortModule = require("serialport")
  , SerialPort = SerialPortModule.SerialPort
  , exec = require('child_process').exec
  , fs = require('fs')
  , http = require('http');

define([
  'models/firmware'
],
function(
  FirmwareModel
) {

	Backbone.View.prototype.views = [];

	Backbone.View.prototype.close = function(){

		_.each(this.views, function(v) {
			 v.close();
		});

		if (this.onClose) {
			this.onClose();
		}

		this.undelegateEvents();
		this.$el.removeData().unbind();
		this.unbind();
		this.stopListening();
		this.remove();
		Backbone.View.prototype.remove.call(this);
	}

	Backbone.View.prototype.loadView = function(view, view_id)
	{
		if (typeof this.views[view_id] !== 'undefined') {
			 this.views[view_id].close();
		}
		this.views[view_id] = view;
		return this.views[view_id];
	}

	var app = {};
	app.commandHistory = [];
	app.programLength = 0;

  app.channel = _.extend({}, Backbone.Events);
  app.fm = new FirmwareModel();
  app.fm.on('change', function(e) {
    //app.firmwares = e;
  })
  app.fm.fetch();

  var isFileValid = function(f) {
    var ft = _.last(f.name.split("."));
    if (ft == "hex" || ft == "bin")
      return true;
  }


  document.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });

  var hideAllStartBlocks = function() {
    $('.select-bot').addClass('hidden');
    $('.drop-ok-message').addClass('hidden');
    $('.drop-err-message').addClass('hidden');
  }

  document.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (app.selectedView != "start") return;

    if (isFileValid(e.dataTransfer.files[0])) {
      app.imageFile = e.dataTransfer.files[0];
      if (_.last(app.imageFile.name.split(".")) == "hex") {
        app.selectedView = 'info';
        app.channel.trigger('newpage');
        app.boardType = "printer";
        app.model = "printer";
      }
      else {
        app.selectedView = 'info';
        app.channel.trigger('newpage');
        app.boardType = "cnc";
        app.model = "cnc"
      }
      app.channel.trigger('flash.info')
    }
  });

  app.channel.on('flash.printrboard', function() {
    var _dfu = __dirname + '/resources/dfu-programmer/bin/dfu-programmer';
    if (process.platform == 'win32')
      _dfu = __dirname + 'resources/dfu-programmer/win/dfu-programmer.exe';

    exec('export DYLD_LIBRARY_PATH='+__dirname+'/resources/dfu-programmer/lib; '+_dfu + ' at90usb1286 erase',
    //exec(_dfu + ' at90usb1286 erase',
        function (err, stdout, stderr) {
          if (err !== null) {
            console.log('exec erase error: ' + err);
            var _e = _.last(String(err).split(":"));
            app.channel.trigger("flash.error", _e);
          } else {
            app.channel.trigger("flash.writing");
            exec('export DYLD_LIBRARY_PATH='+__dirname+'/resources/dfu-programmer/lib; '+_dfu + ' at90usb1286 flash "'+app.imageFile.path+'"',
              function(err, stdout, stderr) {
                if (err !== null) {
                  console.log('exec flash error: ' + err);
                  var _e = _.last(String(err).split(":"));
                  app.channel.trigger("flash.error", _e);
                } else {
                  app.channel.trigger("flash.completed");
                }
              }
            );
          }
      }
   );

  });

  app.downloadFile = function(f) {
    // check if file is already downloaded
    try {
      if (fs.statSync(__dirname + "/downloads/" + f)) {
        // delete it
        fs.unlinkSync(__dirname + "/downloads/" + f);
      }
    } catch (err) {

    }
    // if not download it now
    var file = fs.createWriteStream(__dirname + "/downloads/"+f);
    var url = "http://printrbot.github.io/firmware-updater/binaries/"+f;
    var request = http.get(url, function(response) {
      response.pipe(file);
      response.on('end', function () {
        file.end();

        app.imageFile = {
          name: f,
          path: __dirname + "/downloads/" + f
        };
        app.selectedView = 'info';
        app.channel.trigger('flash.info')
      });
    }).on('error', function(err) {
      app.channel.trigger("flash.error", "Unable to download the file. Check your Internet connection.");
    })
  }

  app.channel.on('flash.tinyg', function() {
    // try to find the board, and put it in flashing mode
    // by trying to connect to it at baudrate: 1200

    var _skipBootInit = false;
    SerialPortModule.list(function(err, result) {
      if (err) {
        throw err;
      }
      var detected = null;
      for (var i=0; i<result.length; i++) {
        if (result[i].manufacturer == "Synthetos" && !detected)
          detected = result[i];
      }
      // in case that previous flashing failed and board was left in
      // flashing mode, it will not report as Synthetos manufacturer
      if (!detected) {
        _skipBootInit = true;
        for (var i=0; i<result.length; i++) {
          if (result[i].manufacturer == "" && !detected && result[i].vendorId == "0x03eb")
            detected = result[i];
        }
      }

      if (!detected) {
        console.error('no ports detected')
        app.channel.trigger("flash.error", 'Unable to detect tinyg board!');
        return;
      }

      app.comName = detected.comName;

      exec('stty -f '+app.comName+' 1200', function(err, stdout, stderr) {
        if (err !== null) {
          console.log('exec flash error: ' + err);
          var _e = _.last(String(err).split(":"));
          app.channel.trigger("flash.error", _e);
        } else {
          app.channel.trigger("flash.upload-tinyg");
        }
      });

    });
  });


  app.channel.on('flash.upload-tinyg', function() {
    app.channel.trigger("flash.writing");

    if (process.platform == 'darwin')
      var _bossac = __dirname + '/resources/arduino-flash-tools/tools_darwin/bossac/bin/bossac';
    else if (process.platform == 'win32')
      var _bossac = __dirname + '/resources/arduino-flash-tools/tools_darwin/bossac/bin/bossac.exe';

    console.info(_bossac + ' -e -w -v -i -b -R ' + app.imageFile.path);

    exec(_bossac + '  -e -w -v -i -b -R ' + app.imageFile.path,
      function(err, stdout, stderr) {
        if (err !== null) {
          console.log('exec flash error: ' + err);
          var _e = _.last(String(err).split(":"));
          app.channel.trigger("flash.error", _e);
        } else {
          app.channel.trigger("flash.completed");
        }
      }
    );
  })

  return app;
});
