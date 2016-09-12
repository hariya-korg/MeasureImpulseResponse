
(function(){
    window.audioCtx = window.AudioContext || window.webkitAudioContext;

    navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
})();
