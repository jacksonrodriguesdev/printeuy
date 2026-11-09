// Guias técnicos (/guias/<slug>): respondem dúvidas que o cliente pesquisa antes de comprar e
// levam para as peças. Conteúdo geral e prático: intervalos variam por modelo, então os textos
// sempre mandam conferir o manual do veículo. O site é só em espanhol (o campo pt repete o texto).
export type TextoBi = { es: string; pt: string };
export type Guia = {
  slug: string;
  titulo: TextoBi;
  resumo: TextoBi;
  secoes: Array<{ titulo: TextoBi; paragrafos: TextoBi[] }>;
  links: Array<{ href: string; texto: TextoBi }>;
  perguntas: Array<{ p: TextoBi; r: TextoBi }>;
};

export const GUIAS: Guia[] = [
  {
    slug: "como-encontrar-el-codigo-de-un-repuesto",
    titulo: {
      es: "Cómo encontrar el código original de un repuesto de tu auto",
      pt: "Cómo encontrar el código original de un repuesto de tu auto",
    },
    resumo: {
      es: "Dónde está grabado el código de la pieza, cómo leerlo y qué hacer si está borrado, para pedir el repuesto correcto sin equivocarte.",
      pt: "Dónde está grabado el código de la pieza, cómo leerlo y qué hacer si está borrado, para pedir el repuesto correcto sin equivocarte.",
    },
    secoes: [
      {
        titulo: {
          es: "Dónde buscar el código",
          pt: "Dónde buscar el código",
        },
        paragrafos: [
          {
            es: "La mayoría de las piezas tiene el número del fabricante grabado o impreso: en el costado de las pastillas de freno, en el cuerpo de amortiguadores y filtros, en la etiqueta de correas y bombas, y en una chapa en alternadores y motores de arranque. Limpiá bien la pieza antes de leerlo.",
            pt: "La mayoría de las piezas tiene el número del fabricante grabado o impreso: en el costado de las pastillas de freno, en el cuerpo de amortiguadores y filtros, en la etiqueta de correas y bombas, y en una chapa en alternadores y motores de arranque. Limpiá bien la pieza antes de leerlo.",
          },
          {
            es: "Si el código está borrado, anotá la marca, el modelo, el año y el motor del vehículo (figuran en la libreta de propiedad y en la etiqueta del marco de la puerta) y sacá fotos de la pieza con una regla al lado.",
            pt: "Si el código está borrado, anotá la marca, el modelo, el año y el motor del vehículo (figuran en la libreta de propiedad y en la etiqueta del marco de la puerta) y sacá fotos de la pieza con una regla al lado.",
          },
        ],
      },
      {
        titulo: {
          es: "Cómo buscarlo en la tienda",
          pt: "Cómo buscarlo en la tienda",
        },
        paragrafos: [
          {
            es: "Escribí el código en el buscador tal como aparece, con o sin guiones: la búsqueda encuentra el original y los equivalentes de otras marcas. También podés elegir tu vehículo (marca, modelo y año) y ver solo las piezas compatibles.",
            pt: "Escribí el código en el buscador tal como aparece, con o sin guiones: la búsqueda encuentra el original y los equivalentes de otras marcas. También podés elegir tu vehículo (marca, modelo y año) y ver solo las piezas compatibles.",
          },
        ],
      },
    ],
    links: [
      {
        href: "/loja",
        texto: {
          es: "Buscar por código",
          pt: "Buscar por código",
        },
      },
      {
        href: "/repuestos/frenos",
        texto: {
          es: "Repuestos de freno",
          pt: "Repuestos de freno",
        },
      },
    ],
    perguntas: [
      {
        p: {
          es: "¿Sirve un repuesto con otro código para mi auto?",
          pt: "¿Sirve un repuesto con otro código para mi auto?",
        },
        r: {
          es: "Puede servir si es un equivalente (misma medida y función, de otra marca). En cada repuesto mostramos los códigos equivalentes y los vehículos donde se aplica; ante la duda, consultanos por WhatsApp.",
          pt: "Puede servir si es un equivalente (misma medida y función, de otra marca). En cada repuesto mostramos los códigos equivalentes y los vehículos donde se aplica; ante la duda, consultanos por WhatsApp.",
        },
      },
    ],
  },
  {
    slug: "cuando-cambiar-las-pastillas-de-freno",
    titulo: {
      es: "Cuándo cambiar las pastillas y los discos de freno",
      pt: "Cuándo cambiar las pastillas y los discos de freno",
    },
    resumo: {
      es: "Señales de desgaste, cada cuántos kilómetros revisar los frenos y por qué conviene cambiar las pastillas de a pares.",
      pt: "Señales de desgaste, cada cuántos kilómetros revisar los frenos y por qué conviene cambiar las pastillas de a pares.",
    },
    secoes: [
      {
        titulo: {
          es: "Señales de que hay que cambiarlas",
          pt: "Señales de que hay que cambiarlas",
        },
        paragrafos: [
          {
            es: "Chirrido metálico al frenar, el auto que tira hacia un lado, el pedal más largo o vibraciones en el volante al frenar son señales de que las pastillas o los discos están gastados.",
            pt: "Chirrido metálico al frenar, el auto que tira hacia un lado, el pedal más largo o vibraciones en el volante al frenar son señales de que las pastillas o los discos están gastados.",
          },
          {
            es: "Como referencia, las pastillas delanteras duran entre 20.000 y 40.000 km según el uso; los discos, el doble. Revisá el manual de tu vehículo para el intervalo exacto.",
            pt: "Como referencia, las pastillas delanteras duran entre 20.000 y 40.000 km según el uso; los discos, el doble. Revisá el manual de tu vehículo para el intervalo exacto.",
          },
        ],
      },
      {
        titulo: {
          es: "Cómo elegir el repuesto",
          pt: "Cómo elegir el repuesto",
        },
        paragrafos: [
          {
            es: "Las pastillas se cambian siempre por eje (las dos ruedas delanteras o las dos traseras). Elegí tu vehículo en el buscador para ver las pastillas y discos compatibles con tu modelo, año y motor.",
            pt: "Las pastillas se cambian siempre por eje (las dos ruedas delanteras o las dos traseras). Elegí tu vehículo en el buscador para ver las pastillas y discos compatibles con tu modelo, año y motor.",
          },
        ],
      },
    ],
    links: [
      {
        href: "/repuestos/pastillas-de-freno",
        texto: {
          es: "Pastillas de freno",
          pt: "Pastillas de freno",
        },
      },
      {
        href: "/repuestos/discos-de-freno",
        texto: {
          es: "Discos de freno",
          pt: "Discos de freno",
        },
      },
    ],
    perguntas: [
      {
        p: {
          es: "¿Tengo que cambiar los discos junto con las pastillas?",
          pt: "¿Tengo que cambiar los discos junto con las pastillas?",
        },
        r: {
          es: "No siempre. Si el disco está por debajo del espesor mínimo grabado en él, tiene rayas profundas o está deformado, sí. Si no, alcanza con cambiar las pastillas.",
          pt: "No siempre. Si el disco está por debajo del espesor mínimo grabado en él, tiene rayas profundas o está deformado, sí. Si no, alcanza con cambiar las pastillas.",
        },
      },
    ],
  },
  {
    slug: "kit-de-distribucion-cuando-cambiarlo",
    titulo: {
      es: "Correa de distribución: cuándo cambiarla y qué incluye el kit",
      pt: "Correa de distribución: cuándo cambiarla y qué incluye el kit",
    },
    resumo: {
      es: "Por qué la correa de distribución es una de las piezas más importantes del motor y qué piezas conviene cambiar junto con ella.",
      pt: "Por qué la correa de distribución es una de las piezas más importantes del motor y qué piezas conviene cambiar junto con ella.",
    },
    secoes: [
      {
        titulo: {
          es: "Por qué es tan importante",
          pt: "Por qué es tan importante",
        },
        paragrafos: [
          {
            es: "La correa de distribución sincroniza el cigüeñal con el árbol de levas. Si se corta, en muchos motores las válvulas chocan con los pistones y la reparación es mucho más cara que el cambio preventivo.",
            pt: "La correa de distribución sincroniza el cigüeñal con el árbol de levas. Si se corta, en muchos motores las válvulas chocan con los pistones y la reparación es mucho más cara que el cambio preventivo.",
          },
          {
            es: "La mayoría de los fabricantes indica cambiarla entre los 40.000 y los 100.000 km, o cada 4 a 5 años. Consultá el manual de tu vehículo.",
            pt: "La mayoría de los fabricantes indica cambiarla entre los 40.000 y los 100.000 km, o cada 4 a 5 años. Consultá el manual de tu vehículo.",
          },
        ],
      },
      {
        titulo: {
          es: "Qué cambiar junto con la correa",
          pt: "Qué cambiar junto con la correa",
        },
        paragrafos: [
          {
            es: "Lo recomendable es cambiar el kit completo: correa, polea tensora y, en muchos motores, la bomba de agua, que trabaja con la misma correa.",
            pt: "Lo recomendable es cambiar el kit completo: correa, polea tensora y, en muchos motores, la bomba de agua, que trabaja con la misma correa.",
          },
        ],
      },
    ],
    links: [
      {
        href: "/repuestos/correas-de-distribucion",
        texto: {
          es: "Correas de distribución",
          pt: "Correas de distribución",
        },
      },
      {
        href: "/repuestos/bombas-de-agua",
        texto: {
          es: "Bombas de agua",
          pt: "Bombas de agua",
        },
      },
    ],
    perguntas: [
      {
        p: {
          es: "¿La correa da aviso antes de cortarse?",
          pt: "¿La correa da aviso antes de cortarse?",
        },
        r: {
          es: "Pocas veces. Por eso se cambia por kilometraje o tiempo, aunque se vea bien.",
          pt: "Pocas veces. Por eso se cambia por kilometraje o tiempo, aunque se vea bien.",
        },
      },
    ],
  },
  {
    slug: "amortiguadores-senales-de-desgaste",
    titulo: {
      es: "Amortiguadores: cómo saber si están gastados",
      pt: "Amortiguadores: cómo saber si están gastados",
    },
    resumo: {
      es: "Las señales de amortiguadores en mal estado y qué revisar en la suspensión antes de cambiarlos.",
      pt: "Las señales de amortiguadores en mal estado y qué revisar en la suspensión antes de cambiarlos.",
    },
    secoes: [
      {
        titulo: {
          es: "Señales de desgaste",
          pt: "Señales de desgaste",
        },
        paragrafos: [
          {
            es: "El auto rebota después de un pozo, se inclina mucho en las curvas, la trompa se hunde al frenar o hay manchas de aceite en el cuerpo del amortiguador. También el desgaste irregular de los neumáticos puede indicar amortiguadores gastados.",
            pt: "El auto rebota después de un pozo, se inclina mucho en las curvas, la trompa se hunde al frenar o hay manchas de aceite en el cuerpo del amortiguador. También el desgaste irregular de los neumáticos puede indicar amortiguadores gastados.",
          },
        ],
      },
      {
        titulo: {
          es: "Qué cambiar junto con ellos",
          pt: "Qué cambiar junto con ellos",
        },
        paragrafos: [
          {
            es: "Siempre de a pares por eje. Revisá también los topes, los guardapolvos y los soportes (kit de amortiguador): si están rotos, el amortiguador nuevo dura menos.",
            pt: "Siempre de a pares por eje. Revisá también los topes, los guardapolvos y los soportes (kit de amortiguador): si están rotos, el amortiguador nuevo dura menos.",
          },
        ],
      },
    ],
    links: [
      {
        href: "/repuestos/amortiguadores",
        texto: {
          es: "Amortiguadores",
          pt: "Amortiguadores",
        },
      },
      {
        href: "/repuestos/suspension",
        texto: {
          es: "Repuestos de suspensión",
          pt: "Repuestos de suspensión",
        },
      },
    ],
    perguntas: [
      {
        p: {
          es: "¿Cada cuánto se cambian los amortiguadores?",
          pt: "¿Cada cuánto se cambian los amortiguadores?",
        },
        r: {
          es: "En general entre 60.000 y 80.000 km, pero depende mucho del estado de las calles y del uso.",
          pt: "En general entre 60.000 y 80.000 km, pero depende mucho del estado de las calles y del uso.",
        },
      },
    ],
  },
];

export const guiaPorSlug = (s: string) => GUIAS.find((g) => g.slug === s) ?? null;
