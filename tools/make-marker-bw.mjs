import sharp from 'sharp';

const source='assets/marker/antofagasta-h2-marker.png';
const output='assets/marker/antofagasta-h2-marker-bn.png';
await sharp(source).greyscale().png().toFile(output);
console.log('Marcador para impresión B/N:',output);
