/**
 * Config options at: http://requirejs.org/docs/api.html#config
 */
require.config({

    config: {
        // module specific configuration
    },
    
    shim: {
        // Add shims for things here
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'bbls': {
            deps: ['backbone']
        }
    },

    paths: {
        //
        //  This is where you can add paths to any plugins or vendor scripts.
        //

        // Plugins
        'text': 'plugins/text',
        'json': 'plugins/json',
        'tpl' : 'plugins/tpl',
        'async' : 'plugins/async',

        // Templating
        'dot' : 'vendor/doT',

        // MVC
        'stapes': 'vendor/stapes',
        'moddef': 'util/module',

        'underscore': 'vendor/lodash',
        'backbone': 'vendor/backbone',
        'bbls': 'vendor/backbone.localStorage-min',
        'sandbox-console': 'vendor/sandbox-console',
        
        // jQuery
        'jquery': 'vendor/jquery'
    },

    packages: [
        { name: 'when', location: 'vendor/when', main: 'when' }
    ],

    map: {
        
        '*' : {
            // 'jquery': 'modules/adapters/jquery', // jQuery noconflict adapter
            'site-config': 'config/site-config.json'
        }//,

        // 'modules/adapters/jquery': {
        //     'jquery': 'jquery'
        // }
    }
});
