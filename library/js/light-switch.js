;(function( Labs, window, document, undefined ){

    var MakeLinks = function( n, opts, Physics ){
        var links = []
            ,lk
            ,cfg = Physics.util.extend({
                x: 0
                ,y: 0
                ,radius: 10
            }, opts)
            ,cstr = Physics.behavior('verlet-constraints')
            ,last
            ;
        while ( n-- ){
            lk = Physics.body('circle', cfg);
            links.push( lk );
            if ( last ){
                cstr.distanceConstraint( lk, last, 0.1, cfg.radius * 2 );
            } else {
                lk.fixed = true;
            }
            last = lk;
            cfg.x += 9 * Math.random();
            cfg.y += 1.7 * cfg.radius;
        }
        links.push( cstr );
        return links;
    };

    var LightSwitch = function( world, Physics ){

        var renderer = Physics.renderer('dom', {
            width: 300
            ,height: 300
            ,el: 'light-switch-viewport'
        })
        ,links
        ;

        renderer.el.style.position = '';

        world.subscribe('step', function(){
            world.render();
        });

        world.add([
            renderer
            ,Physics.behavior('constant-acceleration')
            ,Physics.behavior('sweep-prune')
            ,Physics.behavior('body-impulse-response')
            ,Physics.behavior('body-collision-detection')
            ,Physics.integrator('verlet', {
                drag: 0.02
            })
        ]);

        world.add( links = MakeLinks( 8, {

            x: 160
            ,y: 10
            ,radius: 7

        }, Physics ));

        world.render();
        links[ 0 ].hidden = true;
        links[ 0 ].view.style.display = 'none';

        Physics.util.ticker.subscribe(function( t ){
            world.step( t );
        }).start();

        // events
        var hold, start, startbody;
        $(renderer.el).on({
            mousedown: function( e ){
                var $this = $(this)
                    ,pos = $this.position()
                    ;

                start = Physics.vector( e.pageX, e.pageY );

                hold = links[ 1 ];

                if ( hold ){
                    startbody = Physics.vector().clone( hold.state.pos );
                    hold.wasfixed = hold.fixed;
                    hold.fixed = true;
                }
            }

            
        });

        $(document).on({
            'mouseup': function(){
                hold.fixed = hold.wasfixed;
                hold = false;
                $('body').removeClass('dark');
            }

            ,mousemove: function( e ){

                var scratch = Physics.scratchpad()
                    ,v
                    ;

                if ( hold ){
                    v = scratch.vector().set( e.pageX, e.pageY ).vsub( start );
                    hold.state.pos.clone( startbody ).vadd( v );
                }

                scratch.done();
            }
        });
    };

    Labs.LightSwitch = LightSwitch;

    // delete me
    // Physics( LightSwitch );
    
})(this.Labs || (this.Labs = {}), this, this.document);
