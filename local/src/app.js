'use strict';

var remote = require('electron').remote;

var process = remote.process;

var config = remote.getGlobal('config');
//remote.getCurrentWindow().closeDevTools();

var obtains = [
  'µ/components/graph.js',
  'µ/Arduino'
];

obtain(obtains, ({Graph}, { Arduino })=> {

  exports.app = {};

  exports.app.start = ()=> {

    console.log('started');

    var mouse = {x:0, y:0};

    var fps = 50;

    /////////////////////////////////////////
    // Mouse Tracking

    var track = µ('#trackXY');

    track.traceColor = '#f00';

    track.setMaxPoints(1000); // only store the last 1000 points

    track.params.x.divs = 4;
    track.params.y.divs = 4;

    track.fade = true;

    setInterval(()=>{
      track.addPoint({x: mouse.x, y: mouse.y});
      track.clear();
      track.draw();
    }, 1000/fps);

    track.addEventListener('mousemove', function(evt) {
      var rect = track.getBoundingClientRect();
      mouse.x = (evt.clientX - rect.left)/rect.width;
      mouse.y = (evt.clientY - rect.top)/rect.height;
    }, false);

    /////////////////////////////////////////////
    // X position vs time

    var xtime = µ('#xTime');

    xtime.traceColor = '#00f';

    xtime.params.y.flip = true;

    xtime.params.x.divs = 4;
    xtime.params.y.divs = 20;

    setInterval(()=>{
      xtime.addPoint({x: mouse.x, y: Date.now()});
      xtime.clear();
      xtime.setRanges({y:{
        min: Date.now()-20000,
        max: Date.now(),
      }});
      xtime.draw();
    }, 1000/fps);

///////////////////////////////////////////////////
// Y position vs. Time

    var ytime = µ('#yTime');

    ytime.traceColor = '#070';

    ytime.params.x.flip = true;

    ytime.params.y.divs = 4;
    ytime.params.x.divs = 20;

    setInterval(()=>{
      ytime.addPoint({x: Date.now(), y: mouse.y});
      ytime.clear();

      //This actually makes the time progress backwards, min is simply
      // set to 20 seconds before the current time
      ytime.setRanges({x:{
        min: Date.now()-2000,
        max: Date.now(),
      }});
      ytime.draw();
    }, 1000/fps);

///////////////////////////////////////////////////
// Arduino Tracking vs Time

    var ardtime = µ('#ardTime');

    var arduino = new Arduino(config.io);

    arduino.onready = ()=>{
      console.log('ready!');
      arduino.digitalWrite(14,0);
      arduino.digitalWrite(13,0);
      arduino.digitalWrite(16,1);

      ardtime.setRanges({y: {
        min: 0,
        max: 1024,
      }})

      arduino.analogReport(1, (val)=>{
        ardtime.addPoint({x: Date.now(), y: val})
        ardtime.clear();
        ardtime.setRanges({x:{
          min: Date.now()-20000,
          max: Date.now(),
        }});
        ardtime.draw();
      }, 50);
    }

    document.onkeypress = (e)=> {

    };
  };

  provide(exports);
});
