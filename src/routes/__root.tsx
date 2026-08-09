import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { initAppStore, useSessionUser } from "@/lib/store";
import { usePresence } from "@/hooks/use-presence";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { installClientErrorReporter, reportClientError } from "@/lib/client-error-reporter";
import { useApplyPrefs } from "@/hooks/use-apply-prefs";
import { GOOGLE_ADS_ID, isAdsConfigured } from "@/lib/ads";
import { FlashOfferWatch } from "@/components/shared/FlashOfferWatch";


import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Esta página no existe</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La ruta que buscas no existe o cambió de lugar. Quizá te sirva alguna de estas:
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al inicio
          </Link>
          <a
            href="/respuestas"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Centro de respuestas
          </a>
          <a
            href="/ciaac"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Examen CIAAC
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportClientError(error, "route-error-boundary");
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no cargó
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo falló de nuestro lado. Intenta recargar o vuelve al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FlightPath — Estudia aviación en México: CIAAC, línea aérea e inglés" },
      { name: "description", content: "La plataforma de México para estudiar aviación: banco CIAAC de 2,800+ preguntas con explicación, simulador de 310, entrevista RTARI en inglés por voz, aptitudes tipo COMPASS y manuales. Empieza gratis." },
      { name: "author", content: "FlightPath" },
      { property: "og:title", content: "FlightPath — Estudia aviación en México: CIAAC, línea aérea e inglés" },
      { property: "og:description", content: "Banco CIAAC de 2,800+ preguntas con explicación, simulador de 310, inglés RTARI por voz, aptitudes tipo COMPASS y manuales. Empieza gratis." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FlightPath — Estudia aviación en México: CIAAC, línea aérea e inglés" },
      { name: "twitter:description", content: "Banco CIAAC de 2,800+ preguntas con explicación, simulador de 310, inglés RTARI por voz, aptitudes tipo COMPASS y manuales." },
      // Imagen OG propia (Pathy + CIAAC), generada en public/og-image.png — 1200×630.
      { property: "og:image", content: "https://flightpath.mx/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "FlightPath — Prepárate para el CIAAC" },
      { name: "twitter:image", content: "https://flightpath.mx/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Manrope:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "FlightPath",
              url: "https://flightpath.mx",
              logo: "https://flightpath.mx/assets/flightpath-logo.png",
              email: "contacto@flightpath.mx",
              // Descripción canónica de la entidad — misma en /sobre-flightpath y llms.txt.
              description:
                "FlightPath es la plataforma mexicana e independiente de preparación para el examen CIAAC (Piloto Aviador Comercial, AFAC) y para el examen teórico de convocatorias de línea aérea: banco propio de más de 2,800 preguntas con explicación, simulador de 310 preguntas y tutores con inteligencia artificial.",
              foundingDate: "2026",
              slogan: "Aprende, Domina y Vuela",
              knowsAbout: [
                "Examen CIAAC",
                "Piloto Aviador Comercial (México)",
                "Convocatorias de línea aérea",
                "Preparación de exámenes teóricos aeronáuticos",
              ],
            },
            {
              "@type": "WebSite",
              name: "FlightPath",
              url: "https://flightpath.mx",
              inLanguage: "es-MX",
            },
          ],
        }),
      },
      // Etiqueta global de Google Ads: sólo se inyecta cuando hay ID configurado.
      ...(isAdsConfigured()
        ? [
            { src: `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`, async: true },
            {
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`,
            },
          ]
        : []),
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const PREFS_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('fp_display_prefs')||'{}');var t=p.theme;var resolved=t==='oscuro'?'oscuro':t==='sistema'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro'):'claro';var r=document.documentElement;r.dataset.theme=resolved;if(resolved==='oscuro')r.classList.add('dark');var s={Normal:'16px',Grande:'17.5px','Muy grande':'19px'};r.style.fontSize=s[p.textSize]||'16px';r.dataset.motion=p.motion==='reduced'?'reduced':'full';}catch(e){}})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <FlashOfferWatch />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initAppStore();
    installClientErrorReporter();
  }, []);

  useApplyPrefs();
  // Presencia en vivo (canal efímero): alimenta "Usuarios activos" del panel admin.
  const sessionUser = useSessionUser();
  usePresence(sessionUser);
  // Activity Ratio: bounce rate y recorrido real de cada visita.
  useActivityTracker(sessionUser);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
