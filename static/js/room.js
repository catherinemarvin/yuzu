// Socket IO
var socket = io.connect("http://localhost:3000");
socket.on("news", function (data) {
  console.log(data);
  socket.emit("my other event", { my: "data"} );
});

// Cross browser compatibility
navigator.getUserMedia = (navigator.getUserMedia || 
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

// Webcam capture

MediaStreamTrack.getSources(function (sourceInfos) {
  var videoSource = null;

  for (var i = 0; i < sourceInfos.length; i++) {
    var sourceInfo = sourceInfos[i];
    if (sourceInfo.kind === "video") {
      console.log(sourceInfo.id, sourceInfo.label || "camera");
      videoSource = sourceInfo.id;
    }
  }

  var constraints = {
    video: {
      optional: [{sourceId: videoSource}]
    }
  };

  window.navigator.getUserMedia(constraints, function (localMediaStream) {
    console.log("yes");
    var video = document.querySelector("video");
    video.src = window.URL.createObjectURL(localMediaStream);
  }, function (e) {
    console.log("Error :(", e );
  });
});
