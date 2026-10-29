/* Catálogo de Amancay Floristería — precios en soles (PEN), IGV incluido */
const IMG = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'rosas', label: 'Rosas' },
  { id: 'lirios', label: 'Lirios' },
  { id: 'arreglos', label: 'Arreglos florales' },
  { id: 'peluches', label: 'Con peluche' },
  { id: 'enamorados', label: 'Enamorados' },
  { id: 'bodas', label: 'Bodas y aniversarios' },
  { id: 'orquideas', label: 'Orquídeas' },
  { id: 'ramos', label: 'Ramos de temporada' }
];

const PRODUCTS = [
  { id: 1, name: 'Ramo Clásico 12 Rosas Rojas', category: 'rosas', price: 129, oldPrice: 149, img: '1562690868-60bbe7293e94', featured: true,
    tagline: 'El gesto que nunca falla',
    description: 'Doce rosas rojas de tallo largo, seleccionadas a mano y envueltas en papel coreano con lazo de satén. Incluye tarjeta dedicatoria.' },
  { id: 2, name: 'Ramo Premium 24 Rosas Rosadas', category: 'rosas', price: 219, img: '1582794543139-8ac9cb0f7b11',
    description: 'Veinticuatro rosas rosadas de calidad exportación con follaje fino. Un ramo abundante para celebrar en grande.' },
  { id: 3, name: 'Rosa Bicolor en Florero', category: 'rosas', price: 49, img: '1597826368522-9f4cb5a6ba48',
    description: 'Una rosa bicolor blanca y rosa en florero de vidrio soplado. Detalle elegante para escritorio o mesa de noche.' },
  { id: 4, name: 'Bouquet Lirios Stargazer', category: 'lirios', price: 119, img: '1502977249166-824b3a8a4d6d', featured: true,
    tagline: 'Aroma intenso, presencia inolvidable',
    description: 'Lirios Stargazer de pétalos fucsia y aroma intenso, combinados con eucalipto. Llegan en botón para durar más días.' },
  { id: 5, name: 'Lirios Rosados Elegance', category: 'lirios', price: 99, img: '1525310072745-f49212b5ac6d',
    description: 'Lirios rosados en florero minimalista. Ideal para felicitar, agradecer o decorar un espacio con estilo.' },
  { id: 6, name: 'Arreglo Primavera Silvestre', category: 'arreglos', price: 149, img: '1533616688419-b7a585564566',
    description: 'Rosas naranjas, tulipanes, boca de dragón y cardo azul en un arreglo de estilo silvestre y colorido.' },
  { id: 7, name: 'Arreglo Melocotón en Florero', category: 'arreglos', price: 189, img: '1572454591674-2739f30d8c40', featured: true,
    tagline: 'Tonos suaves para momentos especiales',
    description: 'Rosas melocotón, claveles y flores de estación en florero de vidrio. Diseño de autor elaborado por nuestras floristas.' },
  { id: 8, name: 'Caja de Rosas Mix', category: 'arreglos', price: 169, img: '1591886960571-74d43a9d4166',
    description: 'Rosas en tonos crema, rosa y fucsia en caja de lujo. Un arreglo compacto y sofisticado.' },
  { id: 9, name: 'Abrazo de Oso — Peluche + Flores', category: 'peluches', price: 159, img: '1559454403-b8fb88521f11', badge: 'Más vendido',
    description: 'Oso de peluche de 40 cm acompañado de un arreglo de rosas y gypsophila en canasta de mimbre.' },
  { id: 10, name: 'Caja Sorpresa con Peluche y Rosas', category: 'peluches', price: 189, img: '1549465220-1a8b9238cd48',
    description: 'Caja de regalo con 9 rosas, oso de peluche pequeño y chocolates artesanales. Perfecta para cumpleaños.' },
  { id: 11, name: 'Corazón de Flores', category: 'enamorados', price: 179, img: '1526047932273-341f2a7631f9', featured: true,
    tagline: 'Dilo con un corazón lleno de flores',
    description: 'Arreglo en forma de corazón con rosas, claveles y crisantemos de colores. El regalo romántico por excelencia.' },
  { id: 12, name: 'Rosa Roja Única Premium', category: 'enamorados', price: 45, img: '1496062031456-07b8f162a322',
    description: 'Una rosa roja de tallo extra largo en caja individual con lazo. Pequeño detalle, gran significado.' },
  { id: 13, name: 'Amor Eterno — 50 Rosas', category: 'enamorados', price: 349, oldPrice: 399, img: '1559563362-c667ba5f5480', badge: 'Edición especial',
    description: 'Cincuenta rosas rojas en un ramo monumental. Para aniversarios, pedidas de mano y declaraciones inolvidables.' },
  { id: 14, name: 'Bouquet de Novia Clásico', category: 'bodas', price: 259, img: '1525258946800-98cfd641d0de', featured: true,
    tagline: 'Para el sí más importante',
    description: 'Bouquet de rosas melocotón, rosas blancas y gypsophila, con mango forrado en cinta de seda. Elaborado a pedido.' },
  { id: 15, name: 'Aniversario en Blanco', category: 'bodas', price: 189, img: '1523694576729-dc99e9c0f9b4',
    description: 'Ramo de rosas blancas, hortensias y follaje verde. Elegancia atemporal para celebrar años juntos.' },
  { id: 16, name: 'Centro de Mesa para Boda', category: 'bodas', price: 89, img: '1519225421980-715cb0215aed',
    description: 'Centro de mesa de flores silvestres en frasco de vidrio. Precio por unidad; consulta descuentos por volumen.' },
  { id: 17, name: 'Orquídea Phalaenopsis Morada', category: 'orquideas', price: 139, img: '1534885320675-b08aa131cc5e',
    description: 'Orquídea en maceta de cerámica, una vara con más de 8 flores. Florece hasta tres meses con cuidados básicos.' },
  { id: 18, name: 'Orquídea Rosada Doble Vara', category: 'orquideas', price: 169, img: '1610397648930-477b8c7f0943',
    description: 'Orquídea Phalaenopsis rosada de dos varas en maceta decorativa. Incluye guía de cuidado.' },
  { id: 19, name: 'Ramo Girasoles Alegría', category: 'ramos', price: 99, img: '1567696153798-9111f9cd3d0d',
    description: 'Girasoles, flores silvestres y follaje en papel kraft. Energía y alegría para cualquier ocasión.' },
  { id: 20, name: 'Tulipanes Holandeses', category: 'ramos', price: 159, img: '1561181286-d3fee7d55364',
    description: 'Diez tulipanes importados de Holanda en tonos rosa y blanco. Disponibles según temporada.' }
];

if (typeof module !== 'undefined') module.exports = { PRODUCTS, CATEGORIES, IMG };
