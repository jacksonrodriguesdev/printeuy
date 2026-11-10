import { createFileRoute, Link } from "@tanstack/react-router";
import { EMAIL_CONTATO, PaginaLegal } from "@/components/PaginaLegal";
import { PHONE_DISPLAY, whatsappContactUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";

// Instruções de exclusão de dados (campo "Exclusão de dados do usuário" do app na Meta).
export const Route = createFileRoute("/eliminar-datos")({
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/eliminar-datos` }],
    meta: [
      { title: "Eliminación de datos | PRINTE UY" },
      {
        name: "description",
        content: "Cómo pedir que PRINTE UY elimine tu cuenta y tus datos personales.",
      },
    ],
  }),
  component: EliminarDatos,
});

function EliminarDatos() {
  const assunto = encodeURIComponent("Eliminar mis datos");
  return (
    <PaginaLegal titulo="Eliminación de datos" atualizado="10 de noviembre de 2026">
      <p>
        Podés pedir en cualquier momento que eliminemos tu cuenta y los datos personales que tenemos
        sobre vos, incluidos los que recibimos al iniciar sesión con Google, Facebook o Instagram.
      </p>

      <h2>Cómo pedirlo</h2>
      <ul>
        <li>
          Mandá un e-mail a{" "}
          <a href={`mailto:${EMAIL_CONTATO}?subject=${assunto}`}>{EMAIL_CONTATO}</a> con el asunto
          «Eliminar mis datos», desde el e-mail de tu cuenta.
        </li>
        <li>
          O escribinos por WhatsApp al{" "}
          <a
            href={whatsappContactUrl("Hola, quiero que eliminen mis datos de PRINTE UY.")}
            target="_blank"
            rel="noreferrer noopener"
          >
            {PHONE_DISPLAY}
          </a>
          .
        </li>
      </ul>

      <h2>Qué pasa después</h2>
      <ul>
        <li>Confirmamos que sos el titular de la cuenta.</li>
        <li>
          En un plazo de hasta 30 días eliminamos tu cuenta, tus datos de contacto, cotizaciones y
          el historial de navegación asociado, y te avisamos cuando esté hecho.
        </li>
        <li>
          Solo conservamos lo que la ley nos obliga a guardar (por ejemplo, comprobantes de compras
          ya facturadas).
        </li>
      </ul>

      <p>
        Más información en nuestra <Link to={"/privacidad" as never}>Política de privacidad</Link>.
      </p>
    </PaginaLegal>
  );
}
