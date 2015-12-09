var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: path.resolve(__dirname, 'entry.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module:{
        loaders: [{
            test: /\.js$/,
            loader: "babel",
            query: {
              presets: ['es2015']
            },
            //include: path.resolve(__dirname),
            exclude: /node_modules/
        }]
    },


}