// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
        StatusBar.hide();
      }
    });
  })





.controller('dashBoard', function($scope, $cordovaGeolocation, $ionicPlatform, $cordovaDeviceOrientation, $interval, $timeout, $ionicLoading, $rootScope) {
  /////Variable dependencies
  $scope.speedSum = 0;
  $scope.mileage = 0;
  $scope.engineStarted;
  $scope.elpT; //time since take off moment js
  $scope.userSpeeds = [];
  //System timer
  $scope.counter = 0;
  $scope.runClock = null;


  ///Time
  setInterval(function() {
    var curTime = moment().format('LTS'); ///Dispalay system time
    $scope.time = curTime;
  }, 1000);



  var watchOptions = {
    timeout: 100,
    maximumAge: 50,
    enableHighAccuracy: true
  }; // may cause errors if true
  var watch = $cordovaGeolocation.watchPosition(watchOptions).then(null, function(err) {},
    function(position) {
      speed = position.coords.speed * 3.6
      $scope.Rspeed = Math.round(speed)
      $scope.userSpeeds.push($scope.Rspeed); ///store user speed average into an array

      //Sum of our userspeeds into an average
      setInterval(function() {
        for (var i = $scope.userSpeeds.length; !!i--;) {
          $scope.speedSum += $scope.userSpeeds[i] / 1000; // avg speed every 1s
        }
        console.log("Avg sp: " + $scope.speedSum);
      }, 1000);


      if ($scope.Rspeed < 1) {
        gauge.set(0); //set guage speed
        $scope.speed = 0; //Replace -4 with a 0
        console.log("Engine halt: " + $scope.Rspeed);
      } else {
        gauge.set($scope.Rspeed); //set guage speed
        $scope.speed = $scope.Rspeed;
        console.log("Engine cruise: " + $scope.Rspeed);
      }

      if ($scope.Rspeed < 5) { ///Timer auto pause
        $scope.endWorkout();
      } else {
        $scope.startMyworkout();
      }
    });



////Timer
  function displayTime() {
    $scope.timer = "+" + moment().hour(0).minute(0).second($scope.counter++).format('HH : mm : ss');
    $scope.EngineTime = $scope.counter++;
    $scope.ourTime = moment.duration($scope.EngineTime).asSeconds();
  }




////Mileage function
  $scope.calMileage = function() {
    $scope.cnt = 0;
    $scope.rMileage = 0;
    $scope.EngineTime = $scope.cnt++; //mileage trip-cnt
    $scope.ourTime = moment.duration($scope.EngineTime).asSeconds(); //trip converter

    setInterval(function() {
      var count = 0;
      $scope.mCont = [];
      $scope.avgSp = $scope.speedSum / 3.6; //mileage speed to m/s
      $scope.currentM = $scope.avgSp * $scope.ourTime;
      $scope.rMileage = Math.round($scope.currentM) * 3.6; // "*" by 3.6 to conver to km
      $scope.mCont.push($scope.rMileage);//inject mileage
      for (var i = $scope.mCont.length; !!i--;) {
        count += $scope.mCont[i];
      }

      //Spit data
        $scope.dst = $scope.mCont + " km"; ///Give current milage
        console.log("M++ " + $scope.currentM * 3.6 + " km " + " TT:" + $scope.ourTime);
    }, 1000);

  }


  ///Start btn
  $scope.startMyworkout = function() {
    console.log("Workout Started");
    $scope.calMileage();
    if ($scope.runClock == null) {
      $scope.runClock = $interval(displayTime, 1000);
    }
  }

  ///End timer
  $scope.endWorkout = function() {
    $interval.cancel($scope.runClock);
    $scope.runClock = null;
    console.log("Workout Stoped");
  }

  ///Reset user timer
  $scope.resetTimer = function() {
    $scope.counter = 0;
    displayTime();
    $scope.timer = ""; //Empty timer
  }



  ////Speed guage reading
  var guage;
  var opts = {
    lines: 12, // The number of lines to draw
    angle: 0.36, // The length of each line
    lineWidth: 0.0128, // The line thickness
    pointer: { length: 0.9, strokeWidth: 0.035, color: '#000000' },
    limitMax: 'true', // If true, the pointer will not go past the end of the gauge
    colorStart: '#FF0000', // Colors
    colorStop: '#FF0000', // just experiment with them
    strokeColor: '#000000', // to see which ones work best for you
    generateGradient: true
  };
  var target = document.getElementById('foo'); // your canvas element
  var gauge = new Donut(target).setOptions(opts); // create sexy gauge!
  gauge.maxValue = 125; // set max gauge value
  gauge.animationSpeed = 11; // set animation speed (32 is default value)


  ////////////////////////////////////////////////////////////////
  //////// TOUCH...EVENTS
  ////////////////////////////////////////////////////////////////
  $scope.checkWeather = function() { //Check weather
    $scope.weather = "22°C"
  }
  $scope.dashHold = function() { //On hold
  }
  $scope.dashRelease = function() { //On release
  }
    ////////////////////////////////////////////////////////////////






  $interval(watchCompass, 1000); ///Callback every second
  ////The compass function
  function watchCompass() {
    var comOptions = {
        frequency: 1000,
        filter: true
      } // if frequency is set, filter is ignored
    var compass = $cordovaDeviceOrientation.watchHeading(comOptions).then(null, function(error) {},
      function(result) { // updates constantly (depending on frequency value)
        var magneticHeading = result.magneticHeading;
        var trueHeading = result.trueHeading;
        var accuracy = result.headingAccuracy;
        var timeStamp = result.timestamp;
        var degDirecton = Math.round(magneticHeading);
        ///log all info to the console for debuging purposes
        console.log(magneticHeading, trueHeading, accuracy, timeStamp);
        switch (true) { ///if the device is facing one or the oter direction, display directon faced
          case (degDirecton >= 0 && degDirecton <= 28):
            $scope.charN = "N";
            break;
          case (degDirecton >= 28 && degDirecton <= 62):
            $scope.charN = "NE";
            break;
          case (degDirecton >= 62 && degDirecton <= 120):
            $scope.charN = "E";
            break;
          case (degDirecton >= 120 && degDirecton <= 150):
            $scope.charN = "SE";
            break;
          case (degDirecton >= 150 && degDirecton <= 210):
            $scope.charN = "S";
            break;
          case (degDirecton >= 210 && degDirecton <= 240):
            $scope.charN = "SW";
            break;
          case (degDirecton >= 240 && degDirecton <= 300):
            $scope.charN = "W";
            break;
          case (degDirecton >= 300 && degDirecton <= 330):
            $scope.charN = "NW";
            break;
          case (degDirecton >= 330 && degDirecton <= 360):
            $scope.charN = "N";
        }
        $scope.heading = degDirecton + "°"; ///Display direction headeded
      });
  }

  watchCompass(); //watch compass
})
