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
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
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
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
      { title: "FlightPath — Prepárate para una línea aérea y vuela." },
      { name: "description", content: "Prepárate para el examen CIAAC y la convocatoria de línea aérea: banco propio de 2,800+ preguntas con explicación, simulador de 310 preguntas, las 12 materias y tutor IA 24/7." },
      { name: "author", content: "FlightPath" },
      { property: "og:title", content: "FlightPath — Prepárate para una línea aérea y vuela." },
      { property: "og:description", content: "Banco propio de 2,800+ preguntas con explicación, simulador de 310 preguntas, las 12 materias del CIAAC y tutor IA 24/7." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FlightPath — Prepárate para una línea aérea y vuela." },
      { name: "twitter:description", content: "Banco propio de 2,800+ preguntas con explicación, simulador de 310 preguntas, las 12 materias del CIAAC y tutor IA 24/7." },
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
