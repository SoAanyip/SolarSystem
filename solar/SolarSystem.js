
/*场景，渲染器，镜头，背景星星，帧率器，第一人称控制*/
let scene, renderer, camera, particleSystem, stat, control;

let Sun,
    Mercury,  //水星
    Venus,  //金星
    Earth,
    Mars,
    Jupiter, //木星
    Saturn, //土星
    Uranus, //天王
    Neptune, //海王
    stars = [];

const cameraFar = 3000;  //镜头视距

let starNames = {};  //指向显示的星星名字对象
let displayName;  //当前显示名字

let clock = new THREE.Clock(); //第一人称控制需要

const canvas = document.getElementById('main');

let raycaster = new THREE.Raycaster();  //指向镭射
let mouse = new THREE.Vector2();  //鼠标屏幕向量

module.exports = {
    /*初始化*/
    init(){
        /*stats帧率统计*/
        stat = new Stats();
        stat.domElement.style.position = 'absolute';
        stat.domElement.style.right = '0px';
        stat.domElement.style.top = '0px';
        document.body.appendChild(stat.domElement);

        /*画布大小*/
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        /*renderer*/
        renderer = new THREE.WebGLRenderer({ canvas });
        renderer.shadowMap.enabled = true; //辅助线
        renderer.shadowMapSoft = true; //柔和阴影
        renderer.setClearColor(0xffffff, 0);

        /*scene*/
        scene = new THREE.Scene();

        /*camera*/
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1 ,cameraFar);
        camera.position.set(-200,50,0);
        camera.lookAt(new THREE.Vector3(0,0,0));
        scene.add(camera);

        /*sun skin pic*/
        let sunSkinPic = THREE.ImageUtils.loadTexture('../resource/img/sunCore.jpg', {}, () => {
            renderer.render(scene, camera);
        });

        /*sun*/
        Sun = new THREE.Mesh( new THREE.SphereGeometry( 12 ,16 ,16 ),
            new THREE.MeshLambertMaterial({
                /*color: 0xffff00,*/
                emissive: 0xdd4422,
                map: sunSkinPic
            }) 
        );
        Sun.name='Sun';
        Sun.castShadow = true;
        Sun.receiveShadow = true;
        scene.add(Sun);

        /*opacity sun*/
        let opSun = new THREE.Mesh( new THREE.SphereGeometry( 14 ,16 ,16 ),
            new THREE.MeshLambertMaterial({
                color: 0xff0000,
                /*emissive: 0xdd4422,*/
                transparent:true,
                opacity: .35
            }) 
        );

        opSun.name = 'Sun';
        scene.add(opSun);

        /*planets*/
        Mercury = this.initPlanet('Mercury',0.02,0,'rgb(124,131,203)',20,2);
        stars.push(Mercury);

        Venus = this.initPlanet('Venus',0.012,0,'rgb(190,138,44)',30,4);
        stars.push(Venus);

        Earth = this.initPlanet('Earth',0.010,0,'rgb(46,69,119)',40,5);
        stars.push(Earth);

        Mars = this.initPlanet('Mars',0.008,0,'rgb(210,81,16)',50,4);
        stars.push(Mars);

        Jupiter = this.initPlanet('Jupiter',0.006,0,'rgb(254,208,101)',70,9);
        stars.push(Jupiter);

        Saturn = this.initPlanet('Saturn',0.005,0,'rgb(210,140,39)',100,7,{
            color:'rgb(136,75,30)',
            innerRedius:9,
            outerRadius:11
        });
        stars.push(Saturn);

        Uranus = this.initPlanet('Uranus',0.003,0,'rgb(49,168,218)',120,4);
        stars.push(Uranus);

        Neptune = this.initPlanet('Neptune',0.002,0,'rgb(84,125,204)',150,3);
        stars.push(Neptune);

        //环境光
        let ambient = new THREE.AmbientLight(0x999999);
        scene.add(ambient);

        /*太阳光*/
        let sunLight = new THREE.PointLight(0xddddaa,1.5,500);
        scene.add(sunLight);


        /*背景星星*/
        const particles = 20000;  //星星数量
        /*buffer做星星*/
        let bufferGeometry = new THREE.BufferGeometry();

        let positions = new Float32Array( particles * 3 );
        let colors = new Float32Array( particles * 3 );

        let color = new THREE.Color();

        const gap = 1000; // 定义星星的最近出现位置

        for ( let i = 0; i < positions.length; i += 3 ) {

            // positions

            /*-2gap < x < 2gap */
            let x = ( Math.random() * gap *2 )* (Math.random()<.5? -1 : 1);
            let y = ( Math.random() * gap *2 )* (Math.random()<.5? -1 : 1);
            let z = ( Math.random() * gap *2 )* (Math.random()<.5? -1 : 1);

            /*找出x,y,z中绝对值最大的一个数*/
            let biggest = Math.abs(x) > Math.abs(y) ? Math.abs(x) > Math.abs(z) ?　'x' : 'z' : 
                Math.abs(y) > Math.abs(z) ? 'y' : 'z';

            let pos = { x, y, z};

            /*如果最大值比n要小（因为要在一个距离之外才出现星星）则赋值为n（-n）*/
            if(Math.abs(pos[biggest]) < gap) pos[biggest] = pos[biggest] < 0 ? -gap : gap;

            x = pos['x'];
            y = pos['y'];
            z = pos['z'];

            positions[ i ]     = x;
            positions[ i + 1 ] = y;
            positions[ i + 2 ] = z;

            // colors

            /*70%星星有颜色*/
            let hasColor = Math.random() > 0.3;
            let vx, vy, vz;

            if(hasColor){
                vx = (Math.random()+1) / 2 ;
                vy = (Math.random()+1) / 2 ;
                vz = (Math.random()+1) / 2 ;
            }else{
                vx = 1 ;
                vy = 1 ;
                vz = 1 ;
            }

            /*let vx = ( Math.abs(x) / n*2 ) ;
            var vy = ( Math.abs(y) / n*2 ) ;
            var vz = ( Math.abs(z) / n*2 ) ;*/

            color.setRGB( vx, vy, vz );

            colors[ i ]     = color.r;
            colors[ i + 1 ] = color.g;
            colors[ i + 2 ] = color.b;
        }

        bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        bufferGeometry.computeBoundingSphere();

        /*星星的material*/
        let material = new THREE.PointsMaterial( { size: 6, vertexColors: THREE.VertexColors } );
        particleSystem = new THREE.Points( bufferGeometry, material );
        scene.add( particleSystem );


        /*镜头控制*/
        control = new THREE.FirstPersonControls( camera , canvas);
        control.movementSpeed = 100;
        control.lookSpeed = 0.125;
        control.lookVertical = true;

        camera.lookAt(new THREE.Vector3(0,0,0));
        window.addEventListener( 'mousemove', this.onMouseMove, false );

        /*初始化指向显示名字*/
        this.displayPlanetName();

        renderer.render(scene,camera);
        requestAnimationFrame(()=>this.move());
    },

    /*鼠标指针指向响应*/
    onMouseMove( event ) { 
        // calculate mouse position in normalized device coordinates 
        // (-1 to +1) for both components 
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1; 
    },

    /**
     * 初始化行星
     * @param  {[type]} speed    [description]
     * @param  {[type]} angle    [description]
     * @param  {[type]} color    [description]
     * @param  {[type]} distance [description]
     * @param  {[type]} volume   [description]
     * @param  {[type]} ringMsg  [description]
     * @return {[type]}          [description]
     */
    initPlanet(name,speed,angle,color,distance,volume,ringMsg){
        let mesh = new THREE.Mesh( new THREE.SphereGeometry( volume, 16,16 ),
            new THREE.MeshLambertMaterial( { color } ) 
        );
        mesh.position.x = distance;
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        mesh.name = name;

        /*轨道*/
        let track = new THREE.Mesh( new THREE.RingGeometry (distance-0.2, distance+0.2, 64,1),
            new THREE.MeshBasicMaterial( { color: 0x888888, side: THREE.DoubleSide } )
        );
        track.rotation.x = - Math.PI / 2;
        scene.add(track);

        let star = {
            name,
            speed,
            angle,
            distance,
            volume,
            Mesh : mesh
        }

        /*如果有碎星带*/
        if(ringMsg){
            let ring = new THREE.Mesh( new THREE.RingGeometry(ringMsg.innerRedius, ringMsg.outerRadius, 32, 6),
            new THREE.MeshBasicMaterial( { color: ringMsg.color, side: THREE.DoubleSide, opacity:.7, transparent:true } )
            );

            ring.name = `Ring of ${name}`;
            ring.rotation.x = - Math.PI / 3;
            ring.rotation.y = - Math.PI / 4;
            scene.add(ring);

            star.ring = ring;
        }

        
        scene.add(mesh);

        return star;
    },

    /*初始化指向显示星星名字*/
    displayPlanetName(){
        stars.forEach(star=>
            nameConstructor(star.name,stars.volume);
        )
        nameConstructor('Sun', 12);

        /*根据行星名字和体积构造显示名字*/
        function nameConstructor(name,volume){
            let planetName = new THREE.Mesh( 
                new THREE.TextGeometry( name, {
                    size: 4,
                    height: 4
                }),
                new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} )
            );
            planetName.volume = volume;
            planetName.visible = false;
            starNames[name] = planetName;
            scene.add(planetName);
        }
    },

    /*行星移动*/
    move(){

        /*行星公转*/   
        stars.forEach(star=>
             this.moveEachStar(star);
        )

        /*太阳自转*/
        Sun.rotation.y = (Sun.rotation.y == 2*Math.PI ? 0.0008*Math.PI : Sun.rotation.y+0.0008*Math.PI);

        /*鼠标视角控制*/
        control.update( clock.getDelta() );

        /*限制相机在xyz正负400以内*/
        camera.position.x = THREE.Math.clamp( camera.position.x, -400, 400 );
        camera.position.y = THREE.Math.clamp( camera.position.y, -400, 400 );
        camera.position.z = THREE.Math.clamp( camera.position.z, -400, 400 );

        /*鼠标指向行星显示名字*/
        raycaster.setFromCamera( mouse, camera ); 
        /*交汇点对像*/
        let intersects = raycaster.intersectObjects( scene.children ); 
        if( intersects.length > 0 ){
            /*取第一个交汇对像（最接近相机）*/
            let obj = intersects[ 0 ].object;

            let name = obj.name;
            /*把上一个显示隐藏*/
            displayName && (displayName.visible = false);

            /*如果是有设定名字的东西*/
            if( starNames[name] ){
                starNames[name].visible = true;
                displayName = starNames[name];
                /*复制行星位置*/
                displayName.position.copy(obj.position);
                /*文字居中*/
                displayName.geometry.center();
                /*显示在行星的上方（y轴）*/
                displayName.position.y = starNames[name].volume + 4;
                /*面向相机*/
                displayName.lookAt(camera.position);
            }

        }else{
            displayName && displayName.visible && ( displayName.visible = false )
        }

        renderer.render(scene,camera);
        requestAnimationFrame(()=>this.move());

        stat.update();
    },

    /*每一颗行星的公转*/
    moveEachStar(star){

        star.angle+=star.speed;
        (star.angle > Math.PI * star.distance) && star.angle -= Math.PI * star.distance;

        star.Mesh.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));

        /*碎星带*/
        if(star.ring){
            star.ring.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
        }
    }
}
