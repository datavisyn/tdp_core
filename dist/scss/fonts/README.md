

Add another font
================

1. Go to https://google-webfonts-helper.herokuapp.com/fonts
and select your target font and weights. 
1. Download the zip and store the files in `phovea_ui/src/assets/fonts`
1. create a new scss file, e.g, `yantramanav.scss` with the font name
1. content: 

```
@import './font';

// define font face (family, style, weight, path, local weight name)
@include font-face(Yantramanav, normal, 400, '../../assets/fonts/yantramanav-v2-latin-regular', regular);
@include font-face(Yantramanav, normal, 500, '../../assets/fonts/yantramanav-v2-latin-500', medium);
@include font-face(Yantramanav, normal, 700, '../../assets/fonts/yantramanav-v2-latin-700', bold);
```

