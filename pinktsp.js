
var createPinkTsp, computeImpulseResponseFromPinkTsp;

(function(){
    createPinkTsp = function(length, ratio) {
        /* preprocess */
        length = parseInt(length)|0;
        if (ratio < 0.0) {
            ratio = 0.0;
        } else if (ratio > 1.0) {
            ratio = 1.0;
        }

        var nyquist = (length >> 1)|0;
        var effective = Math.round(nyquist * ratio * 0.5) * 2.0;        /* effective length */
        var a = -Math.PI * effective / (nyquist * Math.log(nyquist));   /* a constant for phase */

        var real = new Float32Array(length<<1>>1);
        var imag = new Float32Array(length<<1>>1);

        /* design Pink TSP in frequency domain */
        var mag, phase, cos, sin;
        real[0<<1>>1] = 1.0;
        imag[0<<1>>1] = 0.0;
        for (var k = (nyquist - 1)|0; (k|0) > (0|0); k = (k - 1)|0){
            mag     = Math.sqrt(1.0 / k);
            phase   = a * k * Math.log(k);
            cos     = mag * Math.cos(phase);
            sin     = mag * Math.sin(phase);

            real[k<<1>>1]           =  cos;
            imag[k<<1>>1]           =  sin;
            real[(length - k)|0]    =  cos;
            imag[(length - k)|0]    = -sin;
        }
        mag     = Math.sqrt(1.0 / nyquist);
        phase   = a * nyquist * Math.log(nyquist);
        real[nyquist<<1>>1] = mag * Math.cos(phase);
        imag[nyquist<<1>>1] = mag * Math.sin(phase);

        /* create signal in time domain */
        var fft = new FFTNayukis(length<<1>>1);
        fft.ifft(real, imag);

        /* calculate shift */
        var min = parseInt(Math.round(effective * (1.0 + (1.0 / Math.log(nyquist))) - length));
        var shift = -1|0;
        while ((real[(length + shift - 1)|0] < real[(length + shift)|0]) && ((shift|0) > (min|0))) {
            shift = (shift - 1)|0;
        }
        if ((shift|0) === (min|0)) {
            shift = 0|0;
            imag = real;
        } else {
            /* shift the signal */
            for (var index = shift|0; (index|0) < (0|0); index = (index + 1)|0){
                imag[(index - shift)|0] = real[(index + length)|0];
            }
            for (var index = (length + shift - 1)|0; (index|0) >= (0|0); index = (index - 1)|0){
                imag[(index - shift)|0] = real[index<<1>>1];
            }
        }
        imag.shift = -shift;
        imag.a = -a;

        /* adjust the signal */
        var offset = -0.5 * (imag[0<<1>>1] + imag[(length - 1)|0]);
        normalize(imag, offset);

        nyquist = null;
        effective = null;
        a = null;
        real = null;

        mag = null;
        phase = null;
        cos = null;
        sin = null;

        fft = null;
        min = null;
        shift = null;
        offset = null;

        return imag;
    }

    computeImpulseResponseFromPinkTsp = function(pinktsp, response) {
        var length = response.length|0;
        var nyquist = (length >> 1)|0;
        var shift = pinktsp.shift;
        var a = pinktsp.a;

        var real = new Float32Array(length<<1>>1);
        var imag = new Float32Array(length<<1>>1);

        /* convolve response with the inverse PinkTSP in frequency domain */
        var fft = new FFTNayukis(length<<1>>1);
        for (var index = (length - 1); (index|0) >= (0|0); index =(index - 1)|0) {
            real[index<<1>>1] = response[index<<1>>1];
        }
        fft.fft(real, imag);

        var mag, phase, cos, sin, r, i;
        for (var k = (nyquist - 1)|0; (k|0) > (0|0); k = (k - 1)|0){
            mag     = Math.sqrt(k);
            phase   = a * k * Math.log(k);
            cos     = mag * Math.cos(phase);
            sin     = mag * Math.sin(phase);
            r       = real[k<<1>>1] * cos - imag[k<<1>>1] * sin;
            i       = real[k<<1>>1] * sin + imag[k<<1>>1] * cos;
            real[k<<1>>1]           =  r;
            imag[k<<1>>1]           =  i;
            real[(length - k)|0]    =  r;
            imag[(length - k)|0]    = -i;
        }
        mag     = Math.sqrt(nyquist);
        phase   = a * nyquist * Math.log(nyquist);
        cos     = mag * Math.cos(phase);
        sin     = mag * Math.sin(phase);
        r       = real[nyquist<<1>>1] * cos - imag[nyquist<<1>>1] * sin;
        i       = real[nyquist<<1>>1] * sin + imag[nyquist<<1>>1] * cos;
        real[nyquist<<1>>1] = r;
        imag[nyquist<<1>>1] = i;
        fft.ifft(real, imag);

        if (shift|0) {
            /* shift the signal */
            for (var index = shift|0; (index|0) > (0|0); index = (index - 1)|0){
                imag[(length - index)|0] = real[(shift - index)|0];
            }
            for (var index = (length - shift - 1)|0; (index|0) >= (0|0); index = (index - 1)|0){
                imag[index<<1>>1] = real[(index + shift)|0];
            }
        } else {
            imag = real;
        }
        normalize(imag);

        length = null;
        nyquist = null;
        shift = null;
        a = null;

        real = null;
        fft = null;

        mag = null;
        phase = null;
        cos = null;
        sin = null;
        r = null;
        i = null;

        return imag;
    }

    function normalize(array, offset){
        if (!offset) {
            offset = 0.0;
        }

        var temp = array.slice(0);
        temp.sort();
        var max = temp[(temp.length - 1)|0] + offset;
        var min = -(temp[0<<1>>1] + offset);
        if (max < min) {
            max = min;
        }

        var normalize = 1.0 / max;
        for (var index = (array.length - 1)|0; (index|0) >= (0|0); index = (index - 1)|0){
            array[index<<1>>1] = (array[index<<1>>1] + offset) * normalize;
        }
        array.offset = -offset * normalize;

        temp = null;
        max = null;
        min = null;
        normalize = null;
    }
})();
