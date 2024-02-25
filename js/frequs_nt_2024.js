/**
 * Created by laurentjegou on 20/12/14.
 */
var img, imgCanvas, imgCtx, drawCanvas, drawCtx, imre, tyd, nbpc, rType = 'CC', cc3d = false, contour = false; axes = 'hsl', cs = 'YUV', bins = Array();
var container, scene, pointLight, camera, renderer, controls, dgui = null;
var init3D = false, typeClick = 1;
var rotation = 0;
var bs = new Array();

var histCtx = new C2S(400, 400);
var histCanvas = histCtx.__canvas;
accuracy = 1;
runtime = document.getElementById('runtime'), plotStyle = "continuous";
plotColors = "flat";
imgSelector = document.getElementById('imgSelector');
img = document.getElementById('myImg');
imgCanvas = document.createElement('canvas');
imgCtx = imgCanvas.getContext('2d', {colorSpace: "srgb", willReadFrequently: true});
imgData = null;
drawCanvas = document.getElementById('myImgCanvas');
drawCtx = drawCanvas.getContext('2d');
svgPNG = document.createElement('svgPNG');
nbpc = parseInt(document.getElementById('nbpc').value);
imre = parseInt(document.getElementById('imre').value);
tyd = parseInt(document.getElementById('tyd').value);
var imgData = null;
var ptClick = Array();
var dx = null;
var dy = null;
var cyld = null;
var conv = null;
var taille = null;
var couleur = null;
var av = 0;
var bv = 0;
var nbbh = 0;
var nbbl = 0;
var lmin = 0;
var lmax = 255;

if (location.search == "?l=fr") { //Si français
    document.title = "Proportions et relations color&eacute;es d'une image - version RGB linéaire";
    document.getElementById("langue").href = "frequs_nt_2024.html";
    document.getElementById("langue").innerHTML = "English version";
    document.getElementById("title").innerHTML = "Proportions et relations color&eacute;es d'une image - version RGB linéaire";
    document.getElementById("subtitle").innerHTML = "Exp&eacute;rience d'analyse et de repr&eacute;sentation synth&eacute;tique";
    document.getElementById("clicktoexpand").innerHTML = "Cliquez pour aggrandir";
    document.getElementById("lp1").innerHTML = "1- Image &agrave; analyser";
    document.getElementById("selectanimage").innerHTML = "S&eacute;lectionnez une image :";
    document.getElementById("multicolormap").innerHTML = "Carte multicolore";
    document.getElementById("dualgradient").innerHTML = "Double gradient";
    document.getElementById("typology").innerHTML = "Typologie";
    document.getElementById("yggradient").innerHTML = "Gradient jaune-vert";
    document.getElementById("complementary").innerHTML = "Symboles de couleurs compl&eacute;mentaires";
    document.getElementById("allrgb").innerHTML = "Couleurs RGB";
    document.getElementById("bluelagoon").innerHTML = "Lagon bleu";
    document.getElementById("cezanne").innerHTML = "C&eacute;zanne, MSV";
    document.getElementById("vangogh").innerHTML = "VanGogh, autoportrait";
    document.getElementById("loadalocalimage").innerHTML = "ou chargez une image locale";
    document.getElementById("lp2").innerHTML = "2- Param&egrave;tres";
    document.getElementById("sampling").innerHTML = "Écart d'&eacute;chantillonnage :";
    document.getElementById("maincolor").innerHTML = "Couleurs ppales à exclure :";
    document.getElementById("lumin").innerHTML = "Luminosit&eacute; min. :";
    document.getElementById("circlecontour").innerHTML = "Contours des cercles :";
    document.getElementById("threshold").innerHTML = "Seuil de diff&eacute;rence :";
    document.getElementById("lp3").innerHTML = "3- Repr&eacute;sentation";
    document.getElementById("symbolsize").innerHTML = "Taille des symboles :";
    document.getElementById("lumax").innerHTML = "Luminosit&eacute; max. :";
    document.getElementById("axislabels").innerHTML = "Libell&eacute;s des axes :";
    document.getElementById("wcolorspace").innerHTML = "Espace de couleurs de travail :";
    document.getElementById("axisorient").innerHTML = "Axes en 2D :";
    document.getElementById("analysistype").innerHTML = "Type d'analyse :";
    document.getElementById("maincolortype").innerHTML = "Couleur du grp :";
    document.getElementById("average").innerHTML = "Moyenne";
    document.getElementById("median").innerHTML = "M&eacute;diane";
    document.getElementById("wholeimage").innerHTML = "Toute l'image";
    document.getElementById("ontheline").innerHTML = "Une ligne<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2 clics)";
    document.getElementById("drawcc").innerHTML = "Cercle color&eacute; (2D)";
    document.getElementById("drawcc3d").innerHTML = "Cylindre color&eacute; (3D)";
    document.getElementById("lp4").innerHTML = "4- Remplacement de couleur";
    document.getElementById("choosecolor").value = "Choix de la couleur";
    document.getElementById("replacecolor").value = "Remplacer la couleur";
    document.getElementById("symbopacity").innerHTML = "Opacit&eacute; :";
    document.getElementById("createPNG").innerHTML = "Cr&eacute;er PNG";
    document.getElementById("createSVG").innerHTML = "Cr&eacute;er SVG";
    document.getElementById("author").innerHTML = "Auteur : ";
    document.getElementById("libraries").innerHTML = "Bibs. : ";
    document.getElementById("licence").innerHTML = "Licence : ";
}

if (!drawCtx.setLineDash) {
    drawCtx.setLineDash = function () {}
}

var plusN = function(bid, f) {
    var ClT = document.getElementById(bid.id.substring(1,5));
    ClT.value = parseFloat(ClT.value) + f;
};

var moinsN = function(bid, f) {
    var ClT = document.getElementById(bid.id.substring(1,5));
    ClT.value = parseFloat(ClT.value) - f;
};

var majNH = function(bid) {
    var ClT = document.getElementById(bid.id.substring(1,5));
    ClT.value = nbbh;
};

var majNSL = function(bid) {
    var ClT = document.getElementById(bid.id.substring(1,5));
    ClT.value = nbbl;
};

var animate = function()
{
    if (renderer) {
        requestAnimationFrame( animate );
        render();
        update();
    }
};

var update = function(){
    if (controls) {
        controls.update();
    }
};

var render = function(){
    if (renderer) {
        renderer.render( scene, camera )
    }
};

var loadImage = function(ev){
    img.className = '';
    img.src = ev.target.src;
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    drawCanvas.width = img.width;
    drawCanvas.height = img.height;
    imgCtx.drawImage(img, 0, 0);
    imgData = imgCtx.getImageData(0, 0, img.width, img.height, {colorSpace: "srgb"}).data;
    img.className = 'thumb';
    updateHist(rType);
};

var handleFileSelect = function(evt) {
    var files = evt.target.files; // FileList object
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
        // Only process image files.
        if (!f.type.match('image*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                var im = new Image();
                im.onload = loadImage;
                im.src = e.target.result;
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
};

var preparePaletteCSV = function(blob){
    var textFileAsBlob = new Blob([blob], {type:'text/plain'});
    var downloadLink = document.getElementById("svgPaletteLink");
    downloadLink.download = "palette.csv";
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
};

var chomp = function(raw_text) {
    return raw_text.replace(/(\n|\r)+$/, '');
};

var draw3D = function(){
    var contour = document.getElementById('cb').checked;
    var SD = document.getElementById("svg");
    SD.hidden = true;
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setSize(400,400);
    container = document.getElementById( 'ThreeJS' );
    container.hidden = false;
    if (container.childElementCount > 0) {
        container.lastChild.remove();
    }
    container.appendChild( renderer.domElement );
    if (dgui !== null) {dgui.destroy(); dgui = null;}
    var so = parseFloat(document.getElementById('so').value);

    // background
    renderer.setClearColor( 0xffffff, 1 );

    // camera
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20000);
    camera.position.set(0,0,-1500);

    // controls
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.4;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.2;

    // scene
    scene = new THREE.Scene();

    // sphere
    for (var i=0; i<cyld.length; i++) {
        var c = couleur[i];
        var materiau = new THREE.MeshPhongMaterial( { color: c , opacity : so, transparent : true } );
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(taille[i], 20, 20), materiau);
        sphere.position.set(cyld[i][0], cyld[i][1],cyld[i][2]);
        scene.add(sphere);
    }

    // light
    var alight = new THREE.AmbientLight(0x111111); // soft white light
    scene.add(alight);
    hLight = new THREE.HemisphereLight(0xdddddd, 0xdddddd, 1.0);
    scene.add(hLight);

    function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat;

        if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
        var axis = new THREE.Line( geom, mat, THREE.LinePieces );
        return axis;
    }

    function buildAxes( length ) {
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z
        return axes;
    }

    var ld = document.getElementById('ld').checked;
    if (ld == true) {scene.add(buildAxes(200));}

    // Cercle limite
    var resolution = 100;
    var amplitude = 400;
    var size = 360 / resolution;
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1.0} );
    for(var i = 0; i <= resolution; i++) {
        var segment = ( i * size ) * Math.PI / 180;
        geometry.vertices.push( new THREE.Vector3( Math.cos( segment ) * amplitude, 0, Math.sin( segment ) * amplitude ) );
    }

    var cercleB = new THREE.Line( geometry, material );
    cercleB.position.z = 400;
    cercleB.rotation.x = (Math.PI / 2);
    scene.add(cercleB);

    var cercleM = new THREE.Line( geometry, material );
    cercleM.rotation.x = (Math.PI / 2);
    scene.add(cercleM);

    var cercleH = new THREE.Line( geometry, material );
    cercleH.position.z = - 400;
    cercleH.rotation.x = (Math.PI / 2);
    scene.add(cercleH);

    camera.lookAt(scene.position);
    animate();

    dgui = new dat.GUI();
    var p100 = Math.PI * 100;
    var b1 = { reset:function(){  }};
    var b2 = { reset:function(){  }};
    dgui.add(scene.position, 'x',-600,600,10).listen().name("pos x").onChange( function( value ){ scene.position.x = value; } );
    dgui.add(scene.position, 'y',-600,600,10).listen().name("pos y").onChange( function( value ){ scene.position.y = value; } );
    dgui.add(scene.position, 'z',-1600,1600,100).listen().name("pos z").onChange( function( value ){ scene.position.z = value; } );
    dgui.add(scene.rotation, 'x',-p100,p100).listen().name("rot x").onChange( function( value ){ scene.rotation.x = value / 100; } );
    dgui.add(scene.rotation, 'y',-p100,p100).listen().name("rot y").onChange( function( value ){ scene.rotation.y = value / 100; } );
    dgui.add(scene.rotation, 'z',-p100,p100, 0.02).listen().name("rot z").onChange( function( value ){ scene.rotation.z = value / 100; } );
    dgui.add(b1, 'reset').name('Reset scene').onChange( function( value ) {
        scene.position.x = 0;
        scene.position.y = 0;
        scene.position.z = 0;
        scene.rotation.x = 0;
        scene.rotation.y = 0;
        scene.rotation.z = 0;
    } );
    dgui.add(b2, 'reset').name('Reset camera').onChange( function( value ) {
        controls.reset();
    } );
};

var imgLoaded = function () {
    img.className = '';
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    drawCanvas.width = img.width;
    drawCanvas.height = img.height;
    imgCtx.drawImage(img, 0, 0);
    if (img.width > 0) {
        imgData = imgCtx.getImageData(0, 0, img.width, img.height, {colorSpace: "srgb"}).data
    } else {
        imgData = "";
    }
    img.className = 'thumb';
    drawCanvas.className = 'thumb';
    drawCanvas.style.top = img.top;
    drawCanvas.style.left = img.left - 400;
    updateHist(rType);
};

var calcBuckets = function(thres, type) {
    var val = Array();
    var step = 4;
    var n = imgData.length;
    var typeAnalyse;
    if (document.getElementById('antypewi').checked == true) {
        typeAnalyse = "wholeImage";
    } else {
        typeAnalyse = "line";
    }
    cs = document.getElementById("colorspaceselect").value;
    var a = document.getElementById("proBar");

    // Remplissage tableau de couleurs
    switch (typeAnalyse) {
        case "wholeImage" :
            for (var i = 0; i < n; i+= ~~(step * (imre * step))) {
                var ps = i * 100 / n;
                var ct = new Object();
                ct.r = imgData[i];
                ct.g = imgData[i+1];
                ct.b = imgData[i+2];
                switch (cs) {
                    case "YUV" :
                        var cy = rgb2yuv(ct);
                        break;
                    case "HSL" :
                        var cy = argb2hsv(ct);
                        break;
                    case "CIELAB" :
                        var cy = rgb2cielab(ct);
                        break;
                    case "CIELUV" :
                        var cy = rgb2cieluv(ct);
                        break;
					case 'LRGB':
						var cy = srgb2lrgb(ct);
						break;
                }
                val.push(cy);
            }
            break;
        case "line" :
            if (ptClick.length == 2) {
                //Equation of the line
                var a = (ptClick[1].y - ptClick[0].y) / (ptClick[1].x - ptClick[0].x);
                var b = -(a * ptClick[0].x - ptClick[0].y);
                var minx = Math.min(ptClick[0].x, ptClick[1].x);
                var maxx = Math.max(ptClick[0].x, ptClick[1].x);
                //Horizontally
                for (var x = minx; x <= maxx; x += 1) {
                    var y = ~~(a * x + b);
                    var d = (x + (imgCanvas.width * y)) * step;
                    var ct = new Object();
                    ct.r = imgData[d];
                    ct.g = imgData[d+1];
                    ct.b = imgData[d+2];
                    switch (cs) {
                        case "YUV" :
                            var cy = rgb2yuv(ct);
                            break;
                        case "HSL" :
                            var cy = argb2hsv(ct);
                            break;
                        case "CIELAB" :
                            var cy = rgb2cielab(ct);
                            break;
                        case "CIELUV" :
                            var cy = rgb2cieluv(ct);
                            break;
						case 'LRGB':
							var cy = srgb2lrgb(ct);
							break;
                    }
                    val.push(cy);
                }
                var miny = Math.min(ptClick[0].y, ptClick[1].y);
                var maxy = Math.max(ptClick[0].y, ptClick[1].y);
                //Vertically
                for (var y = miny; y <= maxy; y += 1) {
                    var x = ~~((y - b) / a);
                    var d = (x + (imgCanvas.width * y)) * step;
                    var ct = new Object();
                    ct.r = imgData[d];
                    ct.g = imgData[d+1];
                    ct.b = imgData[d+2];
                    switch (cs) {
                        case "YUV" :
                            var cy = rgb2yuv(ct);
                            break;
                        case "HSL" :
                            var cy = argb2hsv(ct);
                            break;
                        case "CIELAB" :
                            var cy = rgb2cielab(ct);
                            break;
                        case "CIELUV" :
                            var cy = rgb2cieluv(ct);
                            break;
						case 'LRGB':
							var cy = srgb2lrgb(ct);
							break;
                    }
                    val.push(cy);
                }
                drawCtx.beginPath();
                drawCtx.strokeStyle = "#222222";
                drawCtx.setLineDash([4,2]);
                drawCtx.lineWidth = "2";
                drawCtx.moveTo(ptClick[0].x, ptClick[0].y);
                drawCtx.lineTo(ptClick[1].x, ptClick[1].y);
                drawCtx.stroke();
            }
            break;
    }

    // Tri des valeurs
    switch (cs) {
        case "YUV" :
            val.sort(function (a,b) {return (a.y, b.y)});
            break;
        case "HSL" :
            val.sort(function (a,b) {return (a.h, b.h)});
            break;
        case "CIELAB" :
            val.sort(function (a,b) {return (a.l, b.l)});
            break;
        case "CIELUV" :
            val.sort(function (a,b) {return (a.l, b.l)});
            break;
		case 'LRGB':
			val.sort(function (a,b) {return (a.r, b.r)});
			break;
    }
    // Calcul des buckets de valeur
    var nc = val.length;
    var nb = 1; //Num du dernier bucket;
    bins = Array();
    bins[1] = Array();
    //Type de valeur de référence du bucket;
    var typeCRf = null;
    if (document.getElementById('mgcavg').checked == true) {
        typeCRf = 0;
    } else {
        typeCRf = 1;
    }
    for (var i = 0; i < nc; i++) {
        if (bins[1].length == 0) {
            bins[1].push(val[i]);
        } else {
            var bt = Array();
            var t = false;
            for (var j = 1; j <= nb; j++) {
                switch (typeCRf) {
                    case 0:
                        var d = colorDifference(val[i], meanColor(bins[j]));
                        break;
                    case 1:
                        var d = colorDifference(val[i], medColor(bins[j]));
                        break;
                }
                if (d < thres) {
                    bt[j] = d;
                    t = true;
                }
            }
            if (t == true) { //Adding to an existing bucket
                var fk = firstKey(bt);
                bins[fk].push(val[i]);
            } else { //Creating a new bucket
                nb += 1;
                bins[nb] = new Array();
                bins[nb].push(val[i]);
            }
        }
    }
    bs = classeBins2(bins);
    histCtx.clearRect(0, 0, histCtx.width, histCtx.height);
    switch (type) {
        case "CC":
            drawCC2(type, bins);
            break;
        case "CC3D":
            drawCC3D2(type, bins);
            break;
    }
};

var firstKey = function(obj) {
    var tuples = [];
    for (var key in obj) {
        tuples.push([key, obj[key]]);
    }
    tuples.sort(
        function(a, b) {
            return a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0
        }
    );
    return tuples[0][0];
}

var sortByReverseValue = function(keyArray, valueMap) {
    return keyArray.sort(function(a,b){return valueMap[b]-valueMap[a];});
}

var meanColor = function(bin) {
    var bl = bin.length;
    var ca = 0;
    var cb = 0;
    var cc = 0;
    var j = 0;
    switch (cs) {
        case "YUV" :
            for (j = 0; j < bl; j++) {
                ca += bin[j].y;
                cb += bin[j].u;
                cc += bin[j].v;
            }
            break;
        case "HSL" :
            for (j = 0; j < bl; j++) {
                ca += bin[j].h;
                cb += bin[j].s;
                cc += bin[j].v;
            }
            break;
        case "CIELAB" :
            for (j = 0; j < bl; j++) {
                ca += bin[j].l;
                cb += bin[j].a;
                cc += bin[j].b;
            }
            break;
        case "CIELUV" :
           for (j = 0; j < bl; j++) {
                ca += bin[j].l;
                cb += bin[j].u;
                cc += bin[j].v;
            }
            break;
        case "LRGB" :
            for (j = 0; j < bl; j++) {
                ca += bin[j].r;
                cb += bin[j].g;
                cc += bin[j].b;
            }
            break;
    }
    var mc = null;
    switch (cs) {
        case "YUV" :
            mc = new cyuv(~~(ca / bl), ~~(cb / bl), ~~(cc / bl));
            break;
        case "HSL" :
            mc = new chsv(~~(ca / bl), ~~(cb / bl), ~~(cc / bl));
            break;
        case "CIELAB" :
            mc = new ccielab(~~(ca / bl), ~~(cb / bl), ~~(cc / bl));
            break;
        case "CIELUV" :
            mc = new ccieluv(~~(ca / bl), ~~(cb / bl), ~~(cc / bl));
            break;
        case "LRGB" :
            mc = new crgb(~~(ca / bl), ~~(cb / bl), ~~(cc / bl));
            break;
    }
    return mc;
}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) {return b.value - a.value;});
    return arr;
}

var arrayCount = function(a) {
    if (!a) {return;}
    result = {};
    switch (cs) {
        case "YUV" :
            for(var i = 0; i < a.length; i++) {
                var c = a[i].y+'|'+a[i].u+'|'+a[i].v;
            }
            break;
        case "HSL" :
            for(var i = 0; i < a.length; i++) {
                var c = a[i].h+'|'+a[i].s+'|'+a[i].v;
            }
            break;
        case "CIELAB" :
            for(var i = 0; i < a.length; i++) {
                var c = a[i].l+'|'+a[i].a+'|'+a[i].b;
            }
            break;
        case "CIELUV" :
            for(var i = 0; i < a.length; i++) {
                var c = a[i].l+'|'+a[i].u+'|'+a[i].v;
            }
            break;
        case "LRGB" :
            for(var i = 0; i < a.length; i++) {
                var c = a[i].r+'|'+a[i].g+'|'+a[i].b;
            }
            break;
    }
    result[c] = result[c] ? result[c] + 1 : 1;
    return result;
};

var medColor = function(bin) {
    var ac = arrayCount(bin);
    var liste = sortObject(ac);
    if(liste[0]) {
        var mc = liste[0].key.split("|");
        var c1 = parseInt(mc[0]);
        var c2 = parseInt(mc[1]);
        var c3 = parseInt(mc[2]);
        switch (cs) {
            case "YUV" :
                return new cyuv(c1, c2, c3);
                break;
            case "HSL" :
                return new chsv(c1, c2, c3);
                break;
            case "CIELAB" :
                return new ccielab(c1, c2, c3);
                break;
            case "CIELUV" :
                return new ccieluv(c1, c2, c3);
                break;
            case "LRGB" :
                return new crgb(c1, c2, c3);
                break;
        }
    } else {
        return null;
    }
};

var classeBins2 = function(bins) {
    var tb = Array();
    var c = null;
    for (var i = 1; i < bins.length; i++) {
        if (document.getElementById('mgcavg').checked == true) {
            c = meanColor(bins[i]);
        } else {
            c = medColor(bins[i]);
        }
        var l = bins[i].length;
        tb.push({index:i, couleur:c, compte:l});
    }
    tb.sort(function(a,b) {return b.compte-a.compte;});
    return tb;
};

var nr = function(bs) {
    for (var i = 0; i < bs.length; i++) {
        if (bs[i].compte == 1) {
            return i;
        }
    }
    return bs.length;
};

var drawCC2 = function (type, bins) {
    container = document.getElementById( 'ThreeJS' );
    container.hidden = true;
    if (dgui !== null) {dgui.destroy(); dgui = null;}
    var SD = document.getElementById("svg");
    SD.hidden = false;
    var pi = Math.PI;
    var ro = pi / 2;
    histCtx = new C2S(400, 400);
    histCanvas = histCtx.__canvas;
    histCtx.rotate(-pi/4.0);
    var bc = Math.sqrt(bs[0].compte); // Taille du plus gros cercle
    var nbnr = nr(bs);
    var ctxStyle = 'fillStyle';
    var step = parseInt(accuracy);
    var sw = histCtx.width / 10; // Largeur max : 1/10
    var mw = ~~(histCtx.width/2);
    var mh = ~~(histCtx.height/2);
    var l = ~~(sw * 4.6);
    var zcc = parseFloat(document.getElementById('zcc').value) / 100;
    var so = parseFloat(document.getElementById('so').value);
    var blob = "";
    if (document.getElementById('circletypehsl').checked == true) {
        axes = "hsl";
    } else {
        axes = "hls";
    }
    contour = document.getElementById('cb').checked;
    var ld = document.getElementById('ld').checked;
    if (ld == true) { //Legend
        histCtx.fillStyle = "#222222";
        histCtx.font = "10px sans-serif";
        histCtx.rotate(pi/4.0);
        histCtx.fillText("<- Hue ->", mw * 1.28, -mh * 0.94);
        histCtx.rotate(-pi/4.0);
        histCtx.rotate(pi/2.0);
        switch (axes) {
            case 'hsl':
                histCtx.fillText("<- Sat. ->", -mw/1.5, mh-4);
                break;
            case 'hls':
                histCtx.fillText("<- Lum. ->", -mw/1.5, mh-4);
                break;
        }
        histCtx.rotate(-pi/2.0);
    } else {
        histCtx.rotate(pi/4.0);
    }
    histCtx.beginPath();
    histCtx.strokeStyle = "#222222";
    histCtx.arc(mw, mh, l, 0, pi*2, false);
    histCtx.stroke();
    histCtx.moveTo(mw, 0);
    histCtx.lineTo(mw, mh*2);
    histCtx.stroke();
    histCtx.moveTo(0, mh);
    histCtx.lineTo(mw*2, mh);
    histCtx.stroke();
    for (var i = nbpc; i < nbnr; i++) {
        if (bs[i] == undefined || bs[i].compte == 1) {continue;}
        switch (cs) {
            case "YUV" :
                var ce = yuv2rgb(bs[i].couleur);
                var sk = rgb2hsv(ce.r, ce.g, ce.b);
                break;
            case "HSL" :
                var ce = ahsv2rgb(bs[i].couleur);
                var sk = new Array(bs[i].couleur.h, bs[i].couleur.s, bs[i].couleur.v);
                break;
            case "CIELAB" :
                var ce = cielab2rgb(bs[i].couleur);
                var sk = rgb2hsv(ce.r, ce.g, ce.b);
                break;
            case "CIELUV" :
                var ce = cieluv2rgb(bs[i].couleur);
                var sk = rgb2hsv(ce.r, ce.g, ce.b);
                break;
            case "LRGB" :
                var ce = bs[i].couleur; //lrgb2srgb(bs[i].couleur);
				var cea = lrgb2srgb(bs[i].couleur);
                var sk = rgb2hsv(ce.r, ce.g, ce.b);
                break;
        }
        switch (axes) {
            case 'hsl':
                var h = sk[0];
                var s = sk[1] * 0.7;
                var v = sk[2];
                break;
            case 'hls':
                var h = sk[0];
                var v = sk[1];
                var s = sk[2]  * 0.7;
                break;
        }
        if (v < lmin || v > lmax) {continue;}
        var ht = ((pi * 2) * h / 255) - ro;
        var va = bs[i].compte * zcc;
        var ra = ~~(Math.sqrt(va) * sw / bc);
        var x = ~~(s * Math.cos(ht));
        var y = ~~(s * Math.sin(ht));
        histCtx.beginPath();
        if (cs != 'LRGB') {
			histCtx[ctxStyle] = "rgba(" + ce.r + "," + ce.g + "," + ce.b + "," + so + ")";
		} else {
				histCtx[ctxStyle] = "rgba(" + cea.r + "," + cea.g + "," + cea.b + "," + so + ")";
		}
        var hv = rgb2hsv(ce.r, ce.g, ce.b)[2];
        var cci = (hv < 164) ? "rgba(255,255,255," + so + ")" : "rgba(24,24,24," + so + ")";
        contour == true ? histCtx.strokeStyle = cci : histCtx.strokeStyle = histCtx[ctxStyle];
        histCtx.clickableArc(mw + x, mh + y, ra, 0, pi*2, false, "detectColor(event);");
        histCtx.fill();
        histCtx.stroke();
    }
    var vh = document.getElementById("vhist");
    if (vh.hasChildNodes())
    {
        while (vh.childNodes.length >= 1)
        {
            vh.removeChild(vh.firstChild);
        }
    }
    var l = Math.min(bs.length, (nbpc + 20));
    for (var i = nbpc; i < bs.length; i++) {
        if (bs[i].couleur == undefined || bs[i].compte == 1) {continue;}
        switch (cs) {
            case "YUV" :
                var ce = yuv2rgb(bs[i].couleur);
                break;
            case "HSL" :
                var ce = ahsv2rgb(bs[i].couleur);
                break;
            case "CIELAB" :
                var ce = cielab2rgb(bs[i].couleur);
                break;
            case "CIELUV" :
                var ce = cieluv2rgb(bs[i].couleur);
                break;
            case "LRGB" :
                var ce = bs[i].couleur; //lrgb2srgb(bs[i].couleur);
                break;
        }
        var ci = document.createElement('div');
        var cc = "#" + ((1 << 24) + (ce.r << 16) + (ce.g << 8) + ce.b).toString(16).slice(1);
        var hv = rgb2hsv(ce.r, ce.g, ce.b)[2];
        var cci = (hv < 128) ? "#FFFFFF" : "#222222";
        ci.setAttribute('style', 'background-color:'+cc+'; color:'+cci);
        var cit = "["+ce.r+":"+ce.g+":"+ce.b+"]";
        if (i < l) {
            ci.innerHTML = "&nbsp;" + cit + " : "+bs[i].compte;
            vh.appendChild(ci);
        }
        blob = blob + cs + " " + JSON.stringify(bs[i].couleur) + "; RVB : " + cit + "; nbpixels : "+bs[i].compte + "; hex :" + cc + "\n";
    }
    var svg = document.getElementById("svg");
    if(svg.children.length>0) {
        svg.removeChild(svg.children[0]);
    }
    svg.appendChild(histCtx.getSvg());
    preparePaletteCSV(blob);
}

var drawCC3D2 = function (type, bins) {
    var bc = Math.sqrt(bs[0].compte);
    var sk;
    var nbnr = nr(bs);
    var ctxStyle = 'fillStyle';
    var step = parseInt(accuracy);
    var sw = histCtx.width / 8;
    var pi = Math.PI;
    var ro = pi / 2;
    var mw = ~~(histCtx.width / 2);
    var mh = ~~(histCtx.height / 2);
    var blob = "";
    var zcc = parseFloat(document.getElementById('zcc').value) / 100;
    if (document.getElementById('circletypehsl').checked == true) {
        axes = "hsl";
    } else {
        axes = "hls";
    }
    cyld = Array();
    taille = Array();
    couleur = Array();
    for (var i = nbpc; i < bs.length; i++) {
        if (bs[i] == undefined) {continue;}
        switch (cs) {
            case "YUV" :
                var ce = yuv2rgb(bs[i].couleur);
                break;
            case "HSL" :
                var ce = ahsv2rgb(bs[i].couleur);
                break;
            case "CIELAB" :
                var ce = cielab2rgb(bs[i].couleur);
                break;
            case "CIELUV" :
                var ce = cieluv2rgb(bs[i].couleur);
                break;
            case "LRGB" :
                var ce = bs[i].couleur;
				var cea = lrgb2srgb(bs[i].couleur);
                break;
        }
        sk = rgb2hsv(ce.r, ce.g, ce.b);
        switch (axes) {
            case 'hsl':
                var h = sk[0];
                var s = sk[1] * 1.6;
                var v = sk[2];
                break;
            case 'hls':
                var h = sk[0];
                var v = sk[1];
                var s = sk[2] * 1.6;
                break;
        }
        if (v < lmin || v > lmax) {continue;}
        var ht = ((pi * 2) * h / 255) + ro;
        var va = bs[i].compte * zcc;
        var ra = ~~(Math.sqrt(va) * sw / bc) * 2;
        var x = ~~(s * Math.cos(ht));
        var y = ~~(s * Math.sin(ht));
        v = (-v * 3.125) + 400;
        cyld.push(Array(x, y, v));
        taille.push(ra);
        if (cs != 'LRGB') {
			couleur.push("#" + ((1 << 24) + (ce.r << 16) + (ce.g << 8) + ce.b).toString(16).slice(1));
		} else {
			couleur.push("#" + ((1 << 24) + (cea.r << 16) + (cea.g << 8) + cea.b).toString(16).slice(1));
		}

    }
    conv = Array(3);
    conv[0] = Array(1,0);
    conv[1] = Array(0,1);
    conv[2] = Array(0,0);
    switch (type) {
        case 'CC3D':
            draw3D();
            break;
    }

    var vh = document.getElementById("vhist");
    if (vh.hasChildNodes())
    {
        while (vh.childNodes.length >= 1)
        {
            vh.removeChild(vh.firstChild);
        }
    }
    var l = Math.min(bs.length, (nbpc + 20));
    for (var i = nbpc; i < bs.length; i++) {
        if (bs[i].couleur == undefined) {continue;}
        switch (cs) {
            case "YUV" :
                var ce = yuv2rgb(bs[i].couleur);
                break;
            case "HSL" :
                var ce = ahsv2rgb(bs[i].couleur);
                break;
            case "CIELAB" :
                var ce = cielab2rgb(bs[i].couleur);
                break;
            case "CIELUV" :
                var ce = cieluv2rgb(bs[i].couleur);
                break;
            case "LRGB" :
                var ce = bs[i].couleur;
				var cea = lrgb2srgb(bs[i].couleur);
                break;
        }
        var ci = document.createElement('div');
        var cc = "#" + ((1 << 24) + (ce.r << 16) + (ce.g << 8) + ce.b).toString(16).slice(1);
        var cci = "#DDDDDD";
        if (cs != 'LRGB') {
	        var cit = "["+ce.r+":"+ce.g+":"+ce.b+"]";
	        if (i < l) {
	            ci.setAttribute('style', 'background-color:'+cc+'; color:'+cci);
	            ci.innerHTML = "&nbsp;"+" ["+ce.r+":"+ce.g+":"+ce.b+"] : "+bs[i].compte;
	            vh.appendChild(ci);
	        }
		} else {
	        var cit = "["+cea.r+":"+cea.g+":"+cea.b+"]";
	        if (i < l) {
	            ci.setAttribute('style', 'background-color:'+cc+'; color:'+cci);
	            ci.innerHTML = "&nbsp;"+" ["+cea.r+":"+cea.g+":"+cea.b+"] : "+bs[i].compte;
	            vh.appendChild(ci);
	        }
		}
        blob = blob + cs + " " + JSON.stringify(bs[i].couleur) + "; RVB : " + cit + "; nbpixels : "+bs[i].compte + "; hex :" + cc + "\n";
    }
    var svg = document.getElementById("svg");
    if(svg.children.length>0) {
        svg.removeChild(svg.children[0]);
    }
    svg.appendChild(histCtx.getSvg());
    preparePaletteCSV(blob);
};

var clickOnVisu = function(event) {
    typeClick = 1;
    histCanvas.style.cursor = "crosshair";
};

var detectColor = function(event) {
    if (typeClick != 1) {return;}
    document.body.style.cursor = "default";
    //Clicked color value search
    var rect = document.getElementById("svg").getBoundingClientRect();
    var x = ~~(event.pageX - rect.left) * 2;
    var y = ~~(event.pageY - window.scrollY - rect.top) * 2;
    var clco = "";
    clco = event.srcElement.outerHTML.toString();
    var crxp = "";
    //If color is #RRGGBB
    crxp = new RegExp("#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})");
    var ca = crxp.exec(clco);
    var ct = new Object();
    if (ca !== null) {
        //If color is RGB(RRR,GGG,BBB)
        ct.r = hex2r(ca[0]);
        ct.g = hex2g(ca[0]);
        ct.b = hex2b(ca[0]);
    } else {
        crxp = new RegExp("rgb\\((\\d{1,3}),(\\d{1,3}),(\\d{1,3})\\)");
        ca = crxp.exec(clco);
        ct.r = ca[1];
        ct.g = ca[2];
        ct.b = ca[3];
    }
    event.preventDefault();
    switch (cs) {
        case "YUV" :
            var cy = rgb2yuv(ct);
            break;
        case "HSL" :
            var cy = argb2hsv(ct);
            break;
        case "CIELAB" :
            var cy = rgb2cielab(ct);
            break;
        case "CIELUV" :
            var cy = rgb2cieluv(ct);
            break;
        case "LRGB" :
            var cy = srgb2lrgb(ct);
            break;
    }
    var vh = document.getElementById("vhist");
    var ci = document.createElement('div');
    var cc = "#" + ((1 << 24) + (ct.r << 16) + (ct.g << 8) + ct.b).toString(16).slice(1);
    ci.setAttribute('style', 'background-color:'+cc+'; color:#DDDDDD');
    ci.innerHTML = "&nbsp;Click "+" ["+ct.r+":"+ct.g+":"+ct.b+"]";
    vh.appendChild(ci);

    //Color bin of the clicked color
    var d = 10000;
    var tb = null;
    for (b = 1; b < bs.length; b++) {
        var d = colorDifference(cy, bs[b].couleur);
        if (d <= 1.4) {tb = bs[b].index; break;}
    }
    if (!tb) {return;};
    clickedBin = tb;
    typeClick = 2;
    return false;
};

var replaceColor = function() {
    //Clicked position component values search
    typeClick = 2;
    var rect = document.getElementById("svg").getBoundingClientRect();
    var largeur = imgCanvas.width;
    var hauteur = imgCanvas.height;
    var tb = clickedBin;
    var cc = meanColor(bins[clickedBin]);
    var nc1 = document.getElementById("colorpick").color.rgb;
    var nc = new crgb(~~(nc1[0] * 255), ~~(nc1[1] * 255), ~~(nc1[2]*255));

    //Replacement of color
    var step = 4;
    var n = imgData.length;
    var canvas2 = document.getElementById('canvas2');
    canvas2.width = largeur;
    canvas2.height = hauteur;
    var ctx2 = canvas2.getContext('2d');
    var id = ctx2.createImageData(largeur, hauteur);
    var nImgData = id.data;
    var ce = Array();
    for (var j = 1; j < bins[tb].length; j++) { //Loop into the color bin colors
        switch (cs) {
            case "YUV" :
                ce[j] = yuv2rgb(bins[tb][j]);
                break;
            case "HSL" :
                ce[j] = ahsv2rgb(bins[tb][j]);
                break;
            case "CIELAB" :
                ce[j] = cielab2rgb(bins[tb][j]);
                break;
            case "CIELUV" :
                ce[j] = cieluv2rgb(bins[tb][j]);
                break;
            case "LRGB" :
                ce[j] = bins[tb][j]; //lrgb2srgb(bins[tb][j]);
                break;
        }
    }
    for (var i = 0; i < n; i+= step) { //Loop into pixels of the source image
        var ct = new crgb();
        ct.r = imgData[i];
        ct.g = imgData[i+1];
        ct.b = imgData[i+2];
        var trouve = false;
        for (var j = 1; j < bins[tb].length; j++) { //Loop into the color bin colors
            if (RGBDifference(ct, ce[j]) < 4) { //If color found, draw the pixel on spatial image
                nImgData[i] = nc.r;
                nImgData[i+1] = nc.g;
                nImgData[i+2] = nc.b;
                nImgData[i+3] = 255;
                trouve = true;
                break;
            }
        }
        if (trouve == false) {
            nImgData[i] = ct.r;
            nImgData[i+1] = ct.g;
            nImgData[i+2] = ct.b;
            nImgData[i+3] = 255;
        }
    }
    ctx2.putImageData(id, 0, 0);
};

var updateHist = function (type) {
    document.body.style.cursor = 'wait';
    var timeStart = (new Date()).getTime();
    rType = type;
    nbpc = parseInt(document.getElementById('nbpc').value);
    imre = parseInt(document.getElementById('imre').value);
    tyd = parseInt(document.getElementById('tyd').value);
    lmin = parseInt(document.getElementById('lmin').value);
    lmax = parseInt(document.getElementById('lmax').value);
    var cs = document.getElementById('colorspaceselect').value;
    runtime.innerHTML = 'Working...';

    var vh = document.getElementById("vhist");
    if (vh.hasChildNodes())
    {
        while (vh.childNodes.length >= 1)
        {
            vh.removeChild(vh.firstChild);
        }
    }
    var lcc = document.getElementById("lcc");
    var n = imgData.length;
    var typeAnalyse;
    if (document.getElementById('antypewi').checked == true) {
        typeAnalyse = "wholeImage";
    } else {
        typeAnalyse = "line";
    }
    if ((n/(imre*4)) > 100000 && typeAnalyse == "wholeImage"){
        alert("Grande image, calcul long à prévoir.");
    }
    calcBuckets(tyd, type);
    document.body.style.cursor = 'default';
    var timeEnd = (new Date()).getTime();
    if (location.search == "?l=fr") { //Si français
        runtime.innerHTML = 'Durée du calcul : ' + (timeEnd - timeStart) / 1000 + 's.';
    } else {
        runtime.innerHTML = 'Computation time: ' + (timeEnd - timeStart) / 1000 + 's.';
    }
    svgSVG();
};

var thumbClick = function (ev) {
    ev.preventDefault();
    if (this.className === 'thumb') {
        this.className = '';
    } else {
        this.className = 'thumb';
    }
};

var canvasClick = function (event) {
    var typeAnalyse;
    if (document.getElementById('antypewi').checked == true) {
        typeAnalyse = "wholeImage";
    } else {
        typeAnalyse = "line";
    }
    switch (typeAnalyse) {
        case "wholeImage" :
            if (img.className === 'thumb') {
                img.className = '';
                drawCanvas.className = '';
            } else {
                img.className = 'thumb';
                drawCanvas.className = 'thumb';
            }
            break;
        case "line" :
            if (event == undefined) {return;}
            if (ptClick.length == 2) {ptClick = Array(); drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);}
            var ptec = ptClick.length;
            var rect = drawCanvas.getBoundingClientRect();
            var coef = Math.max((imgCanvas.width / 400), (imgCanvas.height / 400));
            var xc = Math.ceil((event.pageX - rect.left) * coef);
            var yc = Math.ceil((event.pageY - window.scrollY - rect.top) * coef);""
            ptClick.push({x: xc, y: yc});
            if (ptClick.length == 2) {
                updateHist(rType);
            }
            break;
    }
};

var svgImg = function() {
    switch (cc3d) {
        case false:
            var SVGHTML = histCtx.__root.outerHTML;
            var cI = document.getElementById("canvasImg");
            canvg(cI, SVGHTML)
            var dataURL = cI.toDataURL("image/png")
            break;
        case true:
            var dataURL = renderer.domElement.toDataURL("image/png");
            var p5 = document.getElementById("p5");
            var cI = document.createElement("img");
            cI.setAttribute("src", dataURL);
            cI.setAttribute("alt", "3D Representation");
            p5.appendChild(cI);
            break;
    }
};

var svgSVG = function() {
    switch (cc3d) {
        case false:
            document.getElementById('svgSVG').hidden = false;
            var SVGdata = histCtx.__root.outerHTML;
            //Encode the SVG
            var imgData = 'data:image/svg+xml;base64,' + btoa(SVGdata);
            //Use the download attribute (or a shim) to provide a link
            var ds = document.getElementById("svgSVG");
            ds.href = imgData;
            ds.download = "download";
            break;
        case true:
            document.getElementById('svgSVG').hidden = true;
            break;
    }
};

document.getElementById('files').addEventListener('change', handleFileSelect, false);
img.addEventListener('load', imgLoaded, false);
img.addEventListener('click', thumbClick, false);
drawCanvas.addEventListener('mousedown', canvasClick, false);
//svgPNG.addEventListener('click', svgImg, false);

imgSelector.addEventListener('change', function () {
    img.src = this.value;
}, false);

imgLoaded();