# Color Tool #

_An analysis and synthetic representation experiment about color relations and proportions in images_

An online tool to analyse color proportions and relations in raster images:

* Web-based, but the analysis is computed locally by JavaScript code.
* taking into account color perception by using colorspaces as YUV or CIE L*u*v*
* Using a pseudo-cartographical representation based on the color circle and proportionnal colored circles, in 2D or 3D.

## Operating principles
* A sampling of the image pixels is done, following the sampling rate provided.
* A K-means segmentation is calculated, on means or medians of the color-corrected values.
* A cartographic representation is drawn, in 2D or 3D.
* Results can be exported as images (png or svg) or as values (csv text file)

## [Online interactive demo](http://www.geotests.net/couleurs/v2/)
## [Python version also available](https://github.com/ljegou/PyColorTool)

## Ressources used
* [Three.js](http://threejs.org/)
* [DAT-GUI](https://code.google.com/p/dat-gui/)
* [JSColor picker](http://jscolor.com/)
* [Canvg](http://code.google.com/p/canvg/)
* [RGBColor](http://www.phpied.com/rgb-color-parser-in-javascript/)

## Author and licence
* L. Jégou, Université Toulouse-2 Jean Jaurès, Dépt. de Géographie, UMR LISST

Licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/deed.en)
Version 23/12/14