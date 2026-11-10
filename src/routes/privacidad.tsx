import { createFileRoute, Link } from "@tanstack/react-router";
import { EMAIL_CONTATO, PaginaLegal } from "@/components/PaginaLegal";
import { PHONE_DISPLAY, whatsappContactUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";

// Política de privacidade (também é o "URL da Política de Privacidade" do app na Meta).
export const Route = createFileRoute("/privacidad")({
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/privacidad` }],
    meta: [
      { title: "Política de privacidad | PRINTE UY" },
      {
        name: "description",
        content:
          "Qué datos recopila PRINTE UY, para qué los usa, con quién los comparte y cómo pedir que se eliminen.",
      },
    ],
  }),
  component: Privacidad,
});

function Privacidad() {
  return (
    <PaginaLegal titulo="Política de privacidad" atualizado="10 de noviembre de 2026">
      <p>
        En PRINTE UY (printecuy.com), imprenta online, cuidamos tus datos. Esta política explica qué
        información recopilamos, para qué la usamos y qué derechos tenés sobre ella.
      </p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li>
          <b>Datos de tu cuenta:</b> nombre, e-mail, teléfono y, si los cargás, dirección y ciudad
          de entrega. Si entrás con Google, recibimos tu nombre, e-mail y foto de perfil.
        </li>
        <li>
          <b>Pedidos y cotizaciones:</b> los productos, opciones y archivos que nos enviás para
          imprimir.
        </li>
        <li>
          <b>Navegación:</b> páginas visitadas, ciudad aproximada, de dónde llegaste (Google,
          Instagram, etc.) y tipo de dispositivo. No guardamos tu dirección IP.
        </li>
        <li>
          <b>Cookies:</b> una cookie de sesión para mantenerte conectado y, si las aceptás,
          herramientas de medición (Google Analytics y Meta Pixel).
        </li>
      </ul>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Preparar cotizaciones, producir y entregar tus pedidos.</li>
        <li>Responderte por WhatsApp o e-mail.</li>
        <li>Enviarte novedades y promociones, solo si no te diste de baja.</li>
        <li>Mejorar el sitio y medir nuestras campañas.</li>
      </ul>

      <h2>Con quién los compartimos</h2>
      <p>
        No vendemos tus datos. Solo los compartimos con los servicios que necesitamos para operar:
        alojamiento del sitio (Hostinger), envío de e-mails (Resend), almacenamiento de imágenes
        (Cloudflare), inicio de sesión con Google, Meta (Instagram y Facebook) para publicar nuestro
        contenido y medir anuncios, y la empresa de transporte que entrega tu pedido.
      </p>

      <h2>Instagram y Facebook</h2>
      <p>
        Nuestra aplicación de Meta se usa únicamente para administrar la cuenta de Instagram de
        PRINTE UY (publicar contenido y responder mensajes). No accede a datos de otras cuentas más
        allá de los mensajes que nos envían directamente.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Mientras tengas una cuenta o mientras sea necesario por obligaciones legales y contables.
        Podés pedir que eliminemos tus datos en cualquier momento.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés acceder, corregir o eliminar tus datos, y darte de baja de los e-mails con el enlace
        que aparece al final de cada uno. Para eliminar tus datos, seguí los pasos de{" "}
        <Link to={"/eliminar-datos" as never}>Eliminación de datos</Link>.
      </p>

      <h2>Contacto</h2>
      <p>
        E-mail: <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a> · WhatsApp:{" "}
        <a href={whatsappContactUrl()} target="_blank" rel="noreferrer noopener">
          {PHONE_DISPLAY}
        </a>
      </p>
    </PaginaLegal>
  );
}
