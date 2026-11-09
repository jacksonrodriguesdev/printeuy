// Ícones próprios do PRINTE UY: desenhos de peças de carro (pistão, disco de freio,
// amortecedor, bateria...), no lugar dos ícones genéricos. Mesmo formato dos ícones do
// lucide (24x24, traço na cor do texto), então funcionam em qualquer lugar que use `className`.
import type { ReactNode } from "react";

export type IconeAuto = (props: { className?: string; strokeWidth?: number }) => ReactNode;

const icone =
  (desenho: ReactNode): IconeAuto =>
  ({ className, strokeWidth = 1.8 }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {desenho}
    </svg>
  );

// Pistão com biela
export const IconeMotor = icone(
  <>
    <path d="M6.5 3h11v6.5a5.5 5.5 0 0 1-11 0z" />
    <path d="M6.5 5.8h11M6.5 8h11" />
    <circle cx="12" cy="11" r="1.3" />
    <path d="M12 12.3V19M9 21h6" />
  </>,
);

// Disco de freio com pinça
export const IconeFrenos = icone(
  <>
    <circle cx="10.5" cy="13.5" r="7.5" />
    <circle cx="10.5" cy="13.5" r="2.3" />
    <path d="M10.5 8.3v.01M15.7 13.5h.01M10.5 18.7v.01M5.3 13.5h.01" strokeWidth={2.6} />
    <path d="M15.5 3.6a10 10 0 0 1 5 6.4l-3 .9a7 7 0 0 0-3.4-4.4z" />
  </>,
);

// Amortecedor com mola
export const IconeSuspension = icone(
  <>
    <path d="M12 2v2.5M12 19.5V22" />
    <rect x="9" y="4.5" width="6" height="3" rx="1" />
    <path d="M7.5 9.5 16.5 11M7.5 12.5l9 1.5M7.5 15.5l9 1.5" />
    <rect x="9" y="17.5" width="6" height="2" rx="1" />
  </>,
);

// Bico injetor borrifando
export const IconeInyeccion = icone(
  <>
    <rect x="9.5" y="2" width="5" height="4" rx="1" />
    <path d="M8.5 6h7l-1.2 8h-4.6z" />
    <path d="M11 14h2v3h-2z" />
    <path d="M12 19.5v2.5M9.5 21.5l1-2M14.5 21.5l-1-2" />
  </>,
);

// Grade do câmbio (H)
export const IconeTransmision = icone(
  <>
    <circle cx="5" cy="5" r="1.7" />
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="19" cy="5" r="1.7" />
    <circle cx="5" cy="19" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
    <path d="M5 6.7v10.6M12 6.7v10.6M19 6.7V12H5" />
  </>,
);

// Bateria
export const IconeElectrica = icone(
  <>
    <rect x="2.5" y="7" width="19" height="13" rx="2" />
    <path d="M6.5 7V4.5h3V7M14.5 7V4.5h3V7" />
    <path d="M6 13.5h3.5M7.75 11.75v3.5M14.5 13.5H18" />
  </>,
);

// Disco de embreagem
export const IconeEmbrague = icone(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="m6.6 6.6 1.6 1.6M15.8 15.8l1.6 1.6M17.4 6.6l-1.6 1.6M8.2 15.8l-1.6 1.6" />
  </>,
);

// Volante
export const IconeDireccion = icone(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12.5" r="2.3" />
    <path d="M3.4 10.2c2.8-.9 5.6-1.2 8.6-1.2s5.8.3 8.6 1.2M10.2 14.2 7.5 20M13.8 14.2l2.7 5.8" />
  </>,
);

// Radiador com tampa
export const IconeRefrigeracion = icone(
  <>
    <rect x="3" y="6" width="18" height="14" rx="1.6" />
    <path d="M7 6v14M10.5 6v14M14 6v14M17.5 6v14" />
    <path d="M15.5 6V3h3v3" />
  </>,
);

// Rolamento de esferas
export const IconeRodamientos = icone(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.8" />
    {[0, 60, 120, 180, 240, 300].map((g) => (
      <circle
        key={g}
        cx={12 + 6.4 * Math.cos((g * Math.PI) / 180)}
        cy={12 + 6.4 * Math.sin((g * Math.PI) / 180)}
        r="1.1"
      />
    ))}
  </>,
);

// Coxim (suporte de borracha)
export const IconeGomas = icone(
  <>
    <rect x="4" y="9" width="16" height="6" rx="3" />
    <path d="M8 9V5h8v4M12 15v4M7.5 19h9" />
  </>,
);

// Frente do carro
export const IconeAccesorios = icone(
  <>
    <path d="M3 16v-3l2.2-5.2A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.3L21 13v3" />
    <path d="M3 16h18v2.2a.8.8 0 0 1-.8.8h-2.4a.8.8 0 0 1-.8-.8V17H7v1.2a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8z" />
    <path d="M4.5 12.5h15" />
    <circle cx="7" cy="14.3" r=".6" />
    <circle cx="17" cy="14.3" r=".6" />
  </>,
);

// Moto
export const IconeMotos = icone(
  <>
    <circle cx="5.5" cy="16.5" r="3.5" />
    <circle cx="18.5" cy="16.5" r="3.5" />
    <path d="M5.5 16.5 9 10h5l4.5 6.5M14 10l-1.5-3.5H10M15.5 6.5h3" />
  </>,
);

// Almotolia de óleo
export const IconeLubricacion = icone(
  <>
    <path d="M3 11h9l3-3 6 2-6 1.5-2 6.5H5a2 2 0 0 1-2-2z" />
    <path d="M6 11V8h3v3" />
    <path d="M20.5 16.2c0 .9-.7 1.6-1.5 1.6s-1.5-.7-1.5-1.6c0-.8 1.5-2.4 1.5-2.4s1.5 1.6 1.5 2.4z" />
  </>,
);

// Silencioso do escapamento
export const IconeEscape = icone(
  <>
    <rect x="6" y="7.5" width="11" height="9" rx="4.5" />
    <path d="M2 12h4M17 12h2.5l2.5-2.5" />
  </>,
);

// Escudo
export const IconeSeguridad = icone(
  <>
    <path d="M12 3 4.5 6v6c0 4.4 3.2 7.9 7.5 9 4.3-1.1 7.5-4.6 7.5-9V6z" />
    <path d="m8.8 12 2.3 2.3 4.2-4.6" />
  </>,
);

// Chave de boca
export const IconeHerramientas = icone(
  <>
    <path d="M14.7 6.3a4 4 0 0 0 4.9 4.9L11.7 19a2.1 2.1 0 0 1-3-3z" />
    <path d="m14.7 6.3 2.6-2.6 3 3-2.6 2.6" />
  </>,
);

// Porca sextavada
export const IconeVarios = icone(
  <>
    <path d="M12 2.5 20.2 7.2v9.6L12 21.5l-8.2-4.7V7.2z" />
    <circle cx="12" cy="12" r="3.4" />
  </>,
);

// "Todas las categorías": quatro peças em grade
export const IconeTodas = icone(
  <>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <circle cx="17.25" cy="6.75" r="3.75" />
    <circle cx="6.75" cy="17.25" r="3.75" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </>,
);

// Lista de códigos (pedido rápido)
export const IconeLista = icone(
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h1M8 12h1M8 16h1M12 8h4M12 12h4M12 16h4" />
  </>,
);
