;(function( Labs, window, document, undefined ){
    
    var $frames = $('#horse img')
        ,frames = []
        ,w = 100
        ,v = 0
        ,o = 1
        ,dfd = $.Deferred()
        ;

    $frames.each(function( i ){
        var $this = $(this)
            ,pos = {
                left: w * i,
                top: 0
            }
            ;

        $this.css({
            position: 'absolute',
            left: w * i,
            top: 0
        });
        frames.push({
            el: this,
            pos: pos
        })
    });

    function step( t ){
        var f;
        var vis;
        v += (v < w) ? 0.5 : 0;
        for ( var i = 0, l = frames.length; i < l; ++i ){
            
            f = frames[ i ];
            f.el.style.left = (f.pos.left -= v) + 'px';
            f.pos.left += (f.pos.left <= -100) ? 1400 : 0;

            if ( v >= w ){
                o = (o > 0) ? o - 0.002 : 0;
                f.el.style.opacity = (Math.abs(f.pos.left - 350) < 50) ? (vis = f.el, '1') : o;
            }
        }

        if (!o){
            dfd.resolve( vis );
        }
    }

    // Physics.util.ticker.subscribe( step ).start();
    Labs.Horse = function(){

        $frames.each(function( i ){
            var $this = $(this);
            setTimeout(function(){
                $this.toggleClass('on');
            }, 100 * i);
        });

        setTimeout(function(){
            $('#msg').hide();
            setInterval( step, 1000/30 ); 
        }, $frames.length * 100);

        return dfd.promise();
    };

})(this.Labs || (this.Labs = {}), this, this.document);