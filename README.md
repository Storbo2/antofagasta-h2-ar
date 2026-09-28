# Antofagasta H₂ AR

Prototipo WebAR estático para la presentación de Tecnologías Disruptivas (INSW221). Muestra una maqueta didáctica de **energía solar → electricidad → electrólisis del agua → H₂ verde → almacenamiento → hidrogenera → transporte pesado**. El hidrógeno se produce en el electrolizador; no es un subproducto de la planta solar.

## Ejecutar

1. Instala Node.js 20 o posterior.
2. En esta carpeta, ejecuta `npm install` y `npm start`.
3. Abre `http://localhost:4173` en el computador. `viewer.html` funciona sin cámara.
4. Para probar AR en un teléfono, publica el sitio con **HTTPS**. El `localhost` del computador no es el `localhost` del teléfono.
5. Abre `marker.html` en un computador o tablet y muestra la imagen en esa pantalla, o imprímela en A4 horizontal al 100 %. También puedes descargar `assets/marker/antofagasta-h2-marker.png`. Evita reflejos; apunta con el teléfono a la imagen completa. **El marcador es una imagen física; no aparece al recorrer la habitación con la cámara.** Si solo dispones del teléfono, usa `viewer.html`.

Para pruebas automáticas en Chrome local: `npm test` y `node tests/ar-camera.mjs`. La segunda prueba usa una cámara simulada que muestra el marcador y verifica reconocimiento real en MindAR; no reemplaza una prueba con un teléfono físico. También se verificó el modo AR publicado con `node tests/ar-camera.mjs https://storbo2.github.io/antofagasta-h2-ar/ar.html`.

## Publicar gratis

Este proyecto no requiere compilación ni backend. En GitHub Pages, crea un repositorio público, sube los archivos de esta carpeta **sin `node_modules/` ni `work/`**, abre **Settings → Pages**, elige **Deploy from a branch** y selecciona `main / (root)`. Usa la URL `https://USUARIO.github.io/REPOSITORIO/`. También puedes desplegar la carpeta en Netlify o Vercel como sitio estático sin comando de build. Comprueba el modo AR en el teléfono con esa URL HTTPS antes de la presentación.

Sitio publicado: **https://storbo2.github.io/antofagasta-h2-ar/**. El QR en `assets/qr/qr-publicado.png` apunta a esa URL. Para regenerarlo después de cambiar el dominio: `node tools/make-qr.mjs https://NUEVA-URL/`.

## Uso en la presentación

1. Escanea el QR y abre la página.
2. Muestra el marcador impreso o en otra pantalla y pulsa **Iniciar experiencia AR**. Marcador público: **https://storbo2.github.io/antofagasta-h2-ar/marker.html**.
3. Explica la secuencia tocando la maqueta: solar, red, electrolizador, almacenamiento, estación y camión.
4. Cambia a **Excedente solar**: 12 MW de generación, 8 MW de demanda y 4 MW disponibles para H₂. El sol crece, el electrolizador se ilumina, las partículas fluyen hacia el almacenamiento y sube el nivel visual del tanque.
5. Cambia a **Uso del H₂**: el sol se reduce, la producción pasa a 0 kg/h, el flujo va del tanque a la hidrogenera, el primer camión sale y un segundo llega a cargar. La línea de estado narra la fase actual.
6. Si la cámara o el seguimiento fallan, abre **Ver modelo 3D sin RA**. Arrastra para girar y pellizca o usa la rueda para acercar.

Las cifras de pantalla son **simuladas con fines demostrativos** y representan instantáneas de cada escenario; las animaciones ilustran el flujo, sin recalcular esas cifras cuadro a cuadro. La regla conceptual de gestión es producir H₂ si hay generación solar superior a la demanda más un margen, y abastecer si existe reserva suficiente y demanda de transporte. No se implementa IA real ni se modela una planta construida. El agua para electrólisis en Antofagasta exigiría una fuente y tratamiento apropiados; estudiar agua desalinizada o tratada sería una siguiente etapa.

## Decisiones y dificultades

- **Seguimiento de imagen:** se creó un marcador original de alto contraste y se compiló a `.mind` con MindAR. El target es la imagen PNG exacta que se imprime.
- **Estabilidad:** la planta es una sola escena 3D de geometría simple compartida por AR y el visor. No hay modelos de terceros ni texturas pesadas. Los modelos se construyen en `js/model.js`; el marcador es original y está generado por `tools/make-marker.mjs`. No se requieren licencias de modelos externos.
- **Permiso de cámara:** AR se inicia tras un toque explícito, con guía visible y enlace inmediato al modo 3D. El navegador exige HTTPS o localhost.
- **Video de cámara oculto:** MindAR situaba el video con `z-index` negativo; el fondo de la página lo tapaba aunque el seguimiento sí funcionaba. Se aisló el contenedor AR como contexto de apilamiento y se añadió una prueba móvil que comprueba el video visible detrás de la maqueta.
- **Visor 3D:** la primera prueba mostró la cámara apuntando fuera de la maqueta; se corrigió la orientación del control orbital. `npm test` verifica que la escena se dibuja, los escenarios cambian y no hay errores JavaScript.
- **Reconocimiento:** `tests/ar-camera.mjs` verifica que MindAR reconoce el marcador con una cámara simulada. Aún hay que probar el montaje físico en Android o iPhone antes de exponer.
- **Escenarios animados:** `npm test` comprueba el aumento del sol, el flujo hacia el tanque, la salida del primer camión, la llegada del segundo y el texto de estado.

## Tecnología y atribuciones

- [A-Frame 1.5.0](https://aframe.io/) y [MindAR 1.2.5](https://github.com/hiukim/mind-ar-js) distribuidos en `vendor/` bajo licencia MIT. Avisos completos en `THIRD_PARTY_NOTICES.md`.
- Maqueta 3D, marcador, interfaz y lógica originales de este proyecto. No se usan modelos externos.
- Google Fonts (`DM Sans`, `Space Grotesk`) se cargan en línea; si no hay conexión, se usan fuentes del sistema. Las bibliotecas JS principales están guardadas localmente.

## Archivos clave

`index.html`: entrada; `ar.html`: cámara y seguimiento; `viewer.html`: respaldo 3D; `js/model.js`: maqueta y animación; `js/app.js`: escenarios y tarjetas; `assets/marker/`: PNG, SVG y target `.mind`; `marker.html`: página de impresión; `tools/`: generadores; `tests/`: pruebas.
