/***************************!!!!! TEST 용 !!!!*******************************************
    !!!!! TEST 용 !!!! UMD (Universal Module Definition) Pattern !!!!! TEST 용 !!!!
 ****************************************************************************************/

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(typeof self !== 'undefined' ? self : window, function() {

    debugger;

    var oAPP = {};

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.

    oAPP.setTest = function() {

        debugger;

        var oThis = this;




    };

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return oAPP;

}));