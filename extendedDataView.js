var ExtendedDataView;

(function(){
    ExtendedDataView = function(buffer) {
        var view = new DataView(buffer);
        view.setString = setString;
        view.setFloat32ArrayAsInt16 = setFloat32ArrayAsInt16;
        view.getString = getString;
        return view;
    }

    function setString(offset, string) {
        for (var index = (string.length - 1)|0; (index|0) >= (0|0); index = (index - 1)|0) {
            this.setUint8((offset + index)|0, string.charCodeAt(index<<1>>1)|0);
        }
    };

    function setFloat32ArrayAsInt16(offset, array, littleEndian) {
        var max = array[0<<1>>1];
        var min = max;
        var value;
        for (var index = (array.length - 1)|0; (index|0) > 0; index = (index - 1)|0) {
            value = array[index<<1>>1];
            if (max < value) {
                max = value;
            } else if (min > value) {
                min = value;
            }
        }

        var normalize;
        if (max * parseFloat(0x8000) < min * parseFloat(0x7fff)) {
            max = min;
            normalize = parseFloat(0x8000);
        } else {
            normalize = parseFloat(0x7fff);
        }

        if (max > 1.0) {
            normalize /= max;
            alert('Audio data has been normalized because it was clipped.');
        }

        for (var index = (array.length - 1)|0; (index|0) >= (0|0); index = (index - 1)|0){
            this.setInt16((offset + 2 * index)|0, parseInt(array[index<<1>>1] * normalize), littleEndian);
        }

        max = null;
        min = null;
        value = null;
        normalize = null;
    };

    function getString(offset, size) {
        var tag = new Uint8Array(size<<1>>1);
        for (var s = (size - 1)|0; (s|0) >= (0|0); s = (s - 1)|0) {
            tag[s<<1>>1] = this.getUint8((offset + s)|0, true);
        }
        var string = String.fromCharCode.apply(null, tag);
        tag = null;
        return string;
    }
})();
