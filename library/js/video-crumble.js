;(function( Labs, $, window, document, undefined ){

    var accel
        ,newt
        ;

    // physics init
    function init( world ){
        var renderer = Physics.renderer('dom', {
            el: 'screen',
            width: 1280,
            height: 500
        });
        renderer.el.style.position = '';

        world.subscribe('step', function(){
            world.render();
        });

        world.add([
            renderer
            ,accel = Physics.behavior('constant-acceleration')
            ,newt = Physics.behavior('newtonian', {strength: 0})
            ,Physics.behavior('sweep-prune')
            ,Physics.behavior('body-impulse-response')
            ,Physics.behavior('body-collision-detection')
            ,Physics.integrator('verlet', {
                drag: 0.00
            })
            ,Physics.behavior('edge-collision-detection', {
                aabb: Physics.aabb(0, 0, 1680, 460)
            })
        ]);
    }

    // fake play
    function PlayVideo(){
        var $bulk = $('#video .bulk div')
            ,$border = $('#video .border div')
            ,offset = $('#screen').offset()
            ,borderBodies
            ,bulkBodies
            ,borderShape = [
                { x:0, y:0 }
                ,{ x:0, y:25 }
                ,{ x:1, y:25 }
                ,{ x:1, y:0 }
            ]
            ,$horse = $('#horse')
            ,horseBody
            ,constraints = Physics.behavior('verlet-constraints')
            ;

        // light border
        borderBodies = $border.map(function(){

            var $this = $(this)
                ,pos = $this.offset()
                ,body
                ;

            body = Physics.body('convex-polygon', {
                vertices: borderShape
                ,x: pos.left - offset.left
                ,y: pos.top + 25/2 - offset.top
                ,restitution: 0.4
                ,mass: 0.01
                ,fixed: true
            });

            $this.css({
                top: 0
                ,left: 0
                ,marginTop: -25/2
                ,right: 'auto'
            });

            body.view = this;
            return body;
        });

        // controls
        bulkBodies = $bulk.map(function(){

            var $this = $(this)
                ,pos = $this.offset()
                ,body
                ,w = $this.width()
                ,h = $this.height()
                ,shape = [
                    { x:0, y:0 }
                    ,{ x:w, y:0 }
                    ,{ x:w, y:h }
                    ,{ x:0, y:h }
                ]
                ;

            body = Physics.body('convex-polygon', {
                vertices: shape
                ,x: pos.left - offset.left + Math.floor(w/2)
                ,y: pos.top - offset.top + Math.floor(h/2)
                ,restitution: 0.8
                ,mass: 0.1
                ,fixed: true
            });

            $this.css({
                top:0
                ,left:0
                ,marginLeft: -w/2
                ,marginTop: -h/2
                ,transition: 'none'
            });

            body.view = this;
            return body;
        });

        for ( var i = 14, l = bulkBodies.length; i < l; ++i ){
            
            constraints.distanceConstraint( bulkBodies[ i ], bulkBodies[ i - 1 ], 1 );
            // bulkBodies[ i ].fixed = false;
        }

        $horse.css({
            top: $horse.offset().top - offset.top
            ,left: $horse.offset().left - offset.left
        });

        Physics([ init, function( world ){

            world.add( borderBodies );
            world.add( bulkBodies );
            world.add( constraints );

            Labs.chain.detach();
            world.add( Labs.chain );

            world.subscribe('collisions:detected', function( data ){
                var cols = data.collisions
                    ,c
                    ;
                for ( var i = 0, l = cols.length; i < l; ++i ){
                    
                    c = cols[ i ]
                    if ( c.bodyA === Labs.chain[0] || c.bodyB === Labs.chain[0] ){
                        Labs.chain[0].fixed = false;
                        world.remove( Labs.chain.pop().drop() );
                        world.unsubscribe( data.topic, data.handle );
                    }
                }
            }, 100);

            Physics.util.ticker.subscribe(function( t ){
                world.step( t );
            }).start();

            $('#real-video').css({
                width: 222
                ,height: 66
                ,top: $('#real-video').offset().top - offset.top
                ,left: $('#real-video').offset().left - offset.left
            });
            $('#video').css('position', 'static');

            Labs.Horse().then(function( el ){

                var $el = $(el)
                    ,pos = $el.position()
                    ,offset = $horse.position()
                    ,x = pos.left + offset.left - 25
                    ,y = pos.top + offset.top + 37
                    ;

                horseBody = Physics.body('convex-polygon', {
                    x: x
                    ,y: y
                    ,vertices: [
                        { x:0, y:0 }
                        ,{ x:100, y:0 }
                        ,{ x:100, y:75 }
                        ,{ x:0, y:75 }
                    ]
                    ,mass: 10000
                    ,vx: 0.2
                });

                $horse.css({
                    top: -pos.top - 37
                    ,left: -pos.left + 25
                });

                horseBody.view = $horse[0];

                world.add( horseBody );
                // keep horse at same y
                world.subscribe('integrate:positions', function( data ){
                    horseBody.state.pos._[1] = y;
                    horseBody.state.vel._[0] = 0.2;
                    horseBody.state.angular.pos = 0;

                    if (horseBody.state.pos._[0] > 1400){
                        world.remove(horseBody);
                        world.unsubscribe( data.topic, data.handle );
                    }
                });

                // loosen wall when horse hits it
                world.subscribe('collisions:detected', function( data ){
                    var cols = data.collisions;
                    for ( var i = 0, l = cols.length; i < l; ++i ){
                        
                        if ( cols[ i ].bodyA === horseBody || cols[ i ].bodyB === horseBody ){

                            for ( var i = 0, l = borderBodies.length; i < l; ++i ){
                                
                                if (borderBodies[ i ].state.pos._[0] > 500){
                                    borderBodies[ i ].fixed = false;
                                }
                            }

                            for ( var i = 15, l = bulkBodies.length; i < l; ++i ){
                                bulkBodies[ i ].fixed = false;
                            }

                            setTimeout(function(){
                                constraints.drop();
                            }, 500);

                            setTimeout(function(){
                                for ( var i = 0, l = bulkBodies.length; i < l; ++i ){
                                    bulkBodies[ i ].fixed = false;
                                }
                                for ( var i = 0, l = borderBodies.length; i < l; ++i ){
                                    
                                    borderBodies[ i ].fixed = false;
                                }
                            }, 1000);

                            world.unsubscribe( data.topic, data.handle );
                        }
                    }
                }, 100);

            });
        }]);
    }

    $(function(){
        $('#video')
            .prepend( '<div class="bulk">' + nTimes('<div></div>', 25) + '</div>' )
            .append( '<div class="border">' + nTimes('<div></div>', 24) + '</div>' )
            ;

        $('#real-video').fadeOut('slow');
    });

    Labs.Video = {
      assemble: function(){
        $('#video').removeClass('broken');
        setTimeout(function(){
            $('#real-video').fadeIn('fast').on('click', function(){
                this.play();
                PlayVideo();
            });

        }, 1500);
      }
    };

    Labs.Interactive = function(){
        var gui = new dat.GUI({ autoPlace: false });

        var customContainer = document.getElementById('controls');
        customContainer.appendChild(gui.domElement);

        var controls = {
            gravity: {
                active: true
                ,x: 0
                ,y: 0.0001    
            }
            ,newton: {
                active: false
                ,strength: 0
            }
        };

        function updateGrav(){
            if ( controls.gravity.active ){
                accel.setAcceleration(Physics.vector().clone(controls.gravity));
            } else {
                accel.setAcceleration(Physics.vector.zero);
            }
        }

        function updateNewton(){
            if ( controls.newton.active ){
                newt.strength = controls.newton.strength;
            } else {
                newt.strength = 0;
            }
        }

        var f1 = gui.addFolder('Earth Gravity');

        f1.add(controls.gravity, 'active').onChange( updateGrav );
        f1.add(controls.gravity, 'x', -0.001, 0.001).onChange( updateGrav );
        f1.add(controls.gravity, 'y', -0.001, 0.001).onChange( updateGrav );
        f1.open();

        var f2 = gui.addFolder('N-Body Gravity');

        f2.add(controls.newton, 'active').onChange( updateNewton );
        f2.add(controls.newton, 'strength', -5, 5).onChange( updateNewton );
        f2.open();
    };

})(this.Labs || (this.Labs = {}), jQuery, this, this.document);