import { useEffect, useRef, useState, type ReactNode } from "react";
import { Nav } from "./shared";
import { mountReferenceMotion } from "./reference-motion";
import "./reference-home.css";

/** Authored layout from the supplied FlightPath HTML; real application demos remain React components. */
export function ReferenceHome({
  showcase,
  pathy,
  yaris,
  pricing,
}: {
  showcase: ReactNode;
  pathy: ReactNode;
  yaris: ReactNode;
  pricing: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [seconds, setSeconds] = useState(13337);
  const timer = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  useEffect(() => {
    const clock = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(clock);
  }, []);
  useEffect(() => {
    if (root.current) return mountReferenceMotion(root.current);
  }, []);
  return (
    <div ref={root} className="flightpath-redesign">
      <Nav />
      <main>
        <section className="rd-hero rd-1">
          <div className="rd-2"></div>
          <div className="rd-hero-copy rd-3" id="top">
            <div className="soft-in rd-4">
              <span className="rd-5"></span>
              <span>{"La mejor plataforma de México para estudiar aviación"}</span>
              <span className="rd-5"></span>
            </div>
            <h1 className="soft-in-2 rd-6">
              {"Todo lo que estudia un piloto. "}
              <span className="rd-7">{"En un solo lugar."}</span>
            </h1>
            <p className="soft-in-3 rd-8">
              {
                "Banco CIAAC, fuentes de línea aérea (ATP, PHAK, Jeppesen), aptitudes tipo COMPASS, entrevista RTARI en inglés — con un copiloto IA que aprende cómo estudias y construye tu ruta."
              }
            </p>
            <div className="soft-in-3 rd-9">
              <a className="btn btn-gold rd-10" href="/register">
                {"Comenzar gratis\n"}
                <svg
                  className="rd-11"
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                  aria-hidden="true"
                >
                  <g fill="currentColor">
                    <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                    <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                  </g>
                </svg>
              </a>
              <a className="btn rd-12" href="#como-funciona">
                {"Ver cómo funciona"}
              </a>
            </div>
          </div>
          <div className="rd-globe-wrap rd-13">
            <div className="rd-globe-poster" aria-hidden="true"></div>
            <canvas className="rd-14" aria-hidden="true" data-motion="globe"></canvas>
            <canvas className="rd-15" aria-hidden="true" data-motion="globe-fx"></canvas>
            <div className="rd-16"></div>
          </div>
          <div className="rd-stats rd-17">
            <div className="rd-18">
              <span className="rd-19">{"2,800+"}</span>
              <span className="rd-20">{"preguntas con explicación"}</span>
            </div>
            <div className="rd-18">
              <span className="rd-19">{"310"}</span>
              <span className="rd-20">{"preguntas por simulacro"}</span>
            </div>
            <div className="rd-18">
              <span className="rd-19">{"5"}</span>
              <span className="rd-20">{"fuentes de línea aérea"}</span>
            </div>
            <div className="rd-18">
              <span className="rd-19">{"6"}</span>
              <span className="rd-20">{"ejercicios de aptitud"}</span>
            </div>
            <div className="rd-18">
              <span className="rd-19">{"RTARI"}</span>
              <span className="rd-20">{"entrevista por voz"}</span>
            </div>
            <div className="rd-21">
              <span className="rd-19">{"24/7"}</span>
              <span className="rd-20">{"tutor IA"}</span>
            </div>
          </div>
        </section>

        <div className="rd-22">
          <div className="marquee rd-23">
            <span>{"PREPARACIÓN CIAAC"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"ENTREVISTA RTARI"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PILOT APTITUDE TRAINER"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"LÍNEA AÉREA · 5 FUENTES"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"BIBLIOTECA + ANÁLISIS"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PREPARACIÓN CIAAC"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"ENTREVISTA RTARI"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PILOT APTITUDE TRAINER"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"LÍNEA AÉREA · 5 FUENTES"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"BIBLIOTECA + ANÁLISIS"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PREPARACIÓN CIAAC"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"ENTREVISTA RTARI"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PILOT APTITUDE TRAINER"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"LÍNEA AÉREA · 5 FUENTES"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"BIBLIOTECA + ANÁLISIS"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PREPARACIÓN CIAAC"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"ENTREVISTA RTARI"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"PILOT APTITUDE TRAINER"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"LÍNEA AÉREA · 5 FUENTES"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
            <span>{"BIBLIOTECA + ANÁLISIS"}</span>
            <span className="rd-24">
              <svg
                className="rd-25"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path
                    d="m209 81l-33 31l32 88l-24 24l-48-72l-24 24v24l-24 24l-16-40l-40-16l24-24h24l24-24l-72-48l24-24l88 32l31-33a24 24 0 0 1 34 34"
                    fill="#FFFFFF"
                    opacity=".18"
                  ></path>
                  <path d="m185.33 114.21l29.14-27.43l.17-.16a32 32 0 0 0-45.26-45.26l-.16.17l-27.43 29.14l-83-30.2a8 8 0 0 0-8.39 1.86l-24 24a8 8 0 0 0 1.22 12.31l63.89 42.59L76.69 136H56a8 8 0 0 0-5.65 2.34l-24 24A8 8 0 0 0 29 175.42l36.82 14.73l14.7 36.75l.06.16a8 8 0 0 0 13.18 2.47l23.87-23.88A8 8 0 0 0 120 200v-20.69l14.76-14.76l42.59 63.89a8 8 0 0 0 12.31 1.22l24-24a8 8 0 0 0 1.86-8.39Zm-.07 97.23l-42.59-63.89a8 8 0 0 0-5.87-3.55a7 7 0 0 0-.79 0a8 8 0 0 0-5.66 2.34l-24 24A8 8 0 0 0 104 176v20.69l-13.07 13.07L79.43 181a8 8 0 0 0-4.43-4.43l-28.74-11.5L59.32 152H80a8 8 0 0 0 5.66-2.34l24-24a8 8 0 0 0-1.22-12.32l-63.88-42.6l13.5-13.49l83.22 30.26a8 8 0 0 0 8.56-2l30.94-32.88a16 16 0 0 1 22.62 22.59l-32.87 30.94a8 8 0 0 0-2 8.56l30.26 83.22Z"></path>
                </g>
              </svg>
            </span>
          </div>
        </div>

        <section className="rd-26" id="ruta">
          <div className="rd-27" data-motion="parallax">
            <img
              className="rd-28"
              data-depth="0.5"
              loading="lazy"
              decoding="async"
              src="/redesign/e262e5c0cc1ebd63.jpg"
              alt=""
            />
            <div className="rd-29"></div>
            <img
              className="rd-30"
              data-depth="0.34"
              loading="lazy"
              decoding="async"
              src="/redesign/d570a146527c74e6.webp"
              alt=""
            />
            <div className="rd-31" data-depth="0.2">
              <div className="rd-4">
                <span className="rd-5"></span>
                <span>{"La ruta completa"}</span>
                <span className="rd-5"></span>
              </div>
              <h2 className="rd-32">
                {"Una carrera tiene etapas. "}
                <span className="rd-7">{"Aquí se estudian todas."}</span>
              </h2>
            </div>
            <img
              className="rd-33"
              data-depth="0.06"
              loading="lazy"
              decoding="async"
              src="/redesign/6d490e09a9343478.webp"
              alt=""
            />
            <div className="rd-34"></div>
          </div>
          <canvas
            className="rd-35"
            aria-hidden="true"
            data-tone="light"
            data-motion="planes"
          ></canvas>
          <div className="rd-36">
            <p className="rd-37">
              {
                "La mejor plataforma de México para estudiar aviación: del examen teórico de tu licencia a los manuales de tu aeronave, pasando por el inglés y las pruebas de selección — todo en una sola cuenta."
              }
            </p>
            <div className="rd-38" data-motion="stages">
              <div className="rd-39" data-stage-panel="">
                <img
                  className="rd-40"
                  data-stage-img="0"
                  loading="lazy"
                  decoding="async"
                  src="/redesign/64b895fbc7418153.jpg"
                  alt="Estudiante de piloto estudiando con cartas aeronáuticas y un computador de vuelo"
                />
                <img
                  className="rd-41"
                  data-stage-img="1"
                  loading="lazy"
                  decoding="async"
                  src="/redesign/cc77eeb602c602dd.jpg"
                  alt="Piloto con auriculares de aviación hablando por radio en cabina"
                />
                <img
                  className="rd-41"
                  data-stage-img="2"
                  loading="lazy"
                  decoding="async"
                  src="/redesign/d683ed79d8eb51eb.jpg"
                  alt="Aspirante resolviendo una prueba de aptitud con joystick y acelerador"
                />
                <img
                  className="rd-41"
                  data-stage-img="3"
                  loading="lazy"
                  decoding="async"
                  src="/redesign/a79f863e1813a98f.jpg"
                  alt="Jet regional despegando al anochecer con las luces de pista encendidas"
                />
                <img
                  className="rd-41"
                  data-stage-img="4"
                  loading="lazy"
                  decoding="async"
                  src="/redesign/4bbe0ae2e413c22b.jpg"
                  alt="Manuales de aviación apilados junto a una tableta con análisis de avance"
                />
                <div className="rd-42"></div>
                <div className="rd-43">
                  <div className="rd-44">
                    <span className="rd-25">{"ETAPA"}</span>
                    <span className="rd-45">
                      <span className="rd-46" data-stage-num="0">
                        {"01"}
                      </span>
                      <span className="rd-47" data-stage-num="1">
                        {"02"}
                      </span>
                      <span className="rd-47" data-stage-num="2">
                        {"03"}
                      </span>
                      <span className="rd-47" data-stage-num="3">
                        {"04"}
                      </span>
                      <span className="rd-47" data-stage-num="4">
                        {"05"}
                      </span>
                    </span>
                    <span className="rd-48">{"/ 05"}</span>
                  </div>
                  <div className="rd-49">
                    <span className="rd-50" data-stage-seg="0"></span>
                    <span className="rd-51" data-stage-seg="1"></span>
                    <span className="rd-51" data-stage-seg="2"></span>
                    <span className="rd-51" data-stage-seg="3"></span>
                    <span className="rd-51" data-stage-seg="4"></span>
                  </div>
                </div>
              </div>
              <div className="rd-52">
                <article className="rd-53" data-stage-item="0">
                  <div className="rd-54">
                    <span className="rd-55">
                      <svg
                        className="rd-25"
                        width="24"
                        height="24"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                      >
                        <g fill="currentColor">
                          <path
                            d="M224 56v160l-32-16l-32 16l-32-16l-32 16l-32-16l-32 16V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8"
                            fill="#FFFFFF"
                            opacity=".18"
                          ></path>
                          <path d="M216 40H40a16 16 0 0 0-16 16v160a8 8 0 0 0 11.58 7.16L64 208.94l28.42 14.22a8 8 0 0 0 7.16 0L128 208.94l28.42 14.22a8 8 0 0 0 7.16 0L192 208.94l28.42 14.22A8 8 0 0 0 232 216V56a16 16 0 0 0-16-16m0 163.06l-20.42-10.22a8 8 0 0 0-7.16 0L160 207.06l-28.42-14.22a8 8 0 0 0-7.16 0L96 207.06l-28.42-14.22a8 8 0 0 0-7.16 0L40 203.06V56h176Zm-155.58-35.9a8 8 0 0 0 10.74-3.58L76.94 152h38.12l5.78 11.58a8 8 0 1 0 14.32-7.16l-32-64a8 8 0 0 0-14.32 0l-32 64a8 8 0 0 0 3.58 10.74M96 113.89L107.06 136H84.94ZM136 128a8 8 0 0 1 8-8h16v-16a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1-8-8"></path>
                        </g>
                      </svg>
                    </span>
                    <span className="rd-56">{"ETAPA 01 · DE 05"}</span>
                  </div>
                  <h3 className="rd-57">{"Examen CIAAC"}</h3>
                  <p className="rd-58">
                    {
                      "El filtro teórico de tu licencia comercial: las 12 materias con banco explicado, simulador en formato real y análisis por materia."
                    }
                  </p>
                  <div className="rd-59">
                    <span className="rd-60">{"2,800+ preguntas"}</span>
                    <span className="rd-60">{"Simulador de 310"}</span>
                    <span className="rd-60">{"12 materias"}</span>
                  </div>
                  <a className="card-link rd-61" href="/ciaac">
                    {"Más información "}
                    <svg
                      className="more-arrow rd-25"
                      width="18"
                      height="18"
                      viewBox="0 0 256 256"
                      aria-hidden="true"
                    >
                      <g fill="currentColor">
                        <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                        <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                      </g>
                    </svg>
                  </a>
                </article>
                <article className="rd-62" data-stage-item="1">
                  <div className="rd-54">
                    <span className="rd-55">
                      <svg
                        className="rd-25"
                        width="24"
                        height="24"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                      >
                        <g fill="currentColor">
                          <path
                            d="M80 144v40a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56h32a16 16 0 0 1 16 16m112-16a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h32v-72Z"
                            fill="#FFFFFF"
                            opacity=".18"
                          ></path>
                          <path d="M201.89 54.66A104.08 104.08 0 0 0 24 128v56a24 24 0 0 0 24 24h16a24 24 0 0 0 24-24v-40a24 24 0 0 0-24-24H40.36a88.12 88.12 0 0 1 150.18-54.07A87.4 87.4 0 0 1 215.65 120H192a24 24 0 0 0-24 24v40a24 24 0 0 0 24 24h24a24 24 0 0 1-24 24h-56a8 8 0 0 0 0 16h56a40 40 0 0 0 40-40v-80a103.4 103.4 0 0 0-30.11-73.34M64 136a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-48Zm128 56a8 8 0 0 1-8-8v-40a8 8 0 0 1 8-8h24v56Z"></path>
                        </g>
                      </svg>
                    </span>
                    <span className="rd-56">{"ETAPA 02 · DE 05"}</span>
                  </div>
                  <h3 className="rd-57">{"Inglés OACI · RTARI"}</h3>
                  <p className="rd-58">
                    {
                      "La entrevista en inglés se entrena hablando: un sinodal de voz te pregunta, te repregunta y te evalúa por las seis áreas OACI."
                    }
                  </p>
                  <div className="rd-59">
                    <span className="rd-60">{"Entrevista por voz"}</span>
                    <span className="rd-60">{"Debrief 6 áreas"}</span>
                    <span className="rd-60">{"Nivel 4+"}</span>
                  </div>
                  <a className="card-link rd-61" href="/examen-rtari">
                    {"Más información "}
                    <svg
                      className="more-arrow rd-25"
                      width="18"
                      height="18"
                      viewBox="0 0 256 256"
                      aria-hidden="true"
                    >
                      <g fill="currentColor">
                        <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                        <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                      </g>
                    </svg>
                  </a>
                </article>
                <article className="rd-62" data-stage-item="2">
                  <div className="rd-54">
                    <span className="rd-55">
                      <svg
                        className="rd-25"
                        width="24"
                        height="24"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                      >
                        <g fill="currentColor">
                          <path
                            d="m248 128l-96 24l-24 96l-24-96l-96-24l96-24l24-96l24 96Z"
                            fill="#FFFFFF"
                            opacity=".18"
                          ></path>
                          <path d="m249.94 120.24l-27.05-6.76a95.86 95.86 0 0 0-80.37-80.37l-6.76-27a8 8 0 0 0-15.52 0l-6.76 27.05a95.86 95.86 0 0 0-80.37 80.37l-27 6.76a8 8 0 0 0 0 15.52l27.05 6.76a95.86 95.86 0 0 0 80.37 80.37l6.76 27.05a8 8 0 0 0 15.52 0l6.76-27.05a95.86 95.86 0 0 0 80.37-80.37l27.05-6.76a8 8 0 0 0 0-15.52Zm-95.49 22.9L139.31 128l15.14-15.14L215 128Zm-52.9 0L41 128l60.57-15.14L116.69 128Zm104.22-33.94L158.6 97.4l-11.8-47.17a79.88 79.88 0 0 1 58.97 58.97m-62.63-7.65L128 116.69l-15.14-15.14L128 41ZM109.2 50.23L97.4 97.4l-47.17 11.8a79.88 79.88 0 0 1 58.97-58.97m-59 96.57l47.2 11.8l11.8 47.17a79.88 79.88 0 0 1-58.97-58.97Zm62.63 7.65L128 139.31l15.14 15.14L128 215Zm33.94 51.32l11.8-47.17l47.17-11.8a79.88 79.88 0 0 1-58.94 58.97Z"></path>
                        </g>
                      </svg>
                    </span>
                    <span className="rd-56">{"ETAPA 03 · DE 05"}</span>
                  </div>
                  <h3 className="rd-57">{"Aptitudes tipo COMPASS"}</h3>
                  <p className="rd-58">
                    {
                      "Coordinación, memoria, cálculo mental, orientación y multitarea: los ejercicios de las selecciones, jugables con teclado, mouse o touch."
                    }
                  </p>
                  <div className="rd-59">
                    <span className="rd-60">{"6 ejercicios"}</span>
                    <span className="rd-60">{"5 niveles"}</span>
                    <span className="rd-60">{"Simulacro 20 min"}</span>
                  </div>
                  <a className="card-link rd-61" href="/examen-compass">
                    {"Más información "}
                    <svg
                      className="more-arrow rd-25"
                      width="18"
                      height="18"
                      viewBox="0 0 256 256"
                      aria-hidden="true"
                    >
                      <g fill="currentColor">
                        <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                        <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                      </g>
                    </svg>
                  </a>
                </article>
                <article className="rd-62" data-stage-item="3">
                  <div className="rd-54">
                    <span className="rd-55">
                      <svg
                        className="rd-25"
                        width="24"
                        height="24"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                      >
                        <g fill="currentColor">
                          <path
                            d="m240 91.64l-147.41 88a32 32 0 0 1-38-4.32L18.53 140a8 8 0 0 1 2.32-13.19l3.15-1.54L55.79 136L88 116.51L58.65 88a8 8 0 0 1 2.2-13.3L68 72l57.53 21.17l54.84-32.75a32 32 0 0 1 41 7.32Z"
                            fill="#FFFFFF"
                            opacity=".18"
                          ></path>
                          <path d="M176 216a8 8 0 0 1-8 8H24a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8m71.86-122.85a8 8 0 0 1-3.76 5.39l-147.41 88a40.2 40.2 0 0 1-20.26 5.52a39.78 39.78 0 0 1-27.28-10.87l-.12-.12L13 145.8a16 16 0 0 1 4.49-26.21l3-1.47a8 8 0 0 1 6.08-.4l28.26 9.54L75 115.06L53.17 93.87A16 16 0 0 1 57.7 67.4l.32-.13l7.15-2.71a8 8 0 0 1 5.59 0l53.94 19.82l51.57-30.78a39.82 39.82 0 0 1 51.28 9.12l.12.15l18.64 23.89a8 8 0 0 1 1.55 6.39m-19.74-3.7l-13-16.67a23.88 23.88 0 0 0-30.68-5.42l-54.8 32.72a8.06 8.06 0 0 1-6.87.64L68 80.58l-4 1.53l.21.2l29.36 28.49a8 8 0 0 1-1.43 12.58l-32.21 19.49a8 8 0 0 1-6.7.73l-28.67-9.67l-.19.1l-.37.17a.7.7 0 0 1 .13.12l36 35.26a23.85 23.85 0 0 0 28.42 3.18Z"></path>
                        </g>
                      </svg>
                    </span>
                    <span className="rd-56">{"ETAPA 04 · DE 05"}</span>
                  </div>
                  <h3 className="rd-57">{"Convocatorias de línea aérea"}</h3>
                  <p className="rd-58">
                    {
                      "Las 5 fuentes del examen teórico — ATP, PHAK, Jeppesen, CPAM y Anexo 10 — por capítulos, con explicación en español."
                    }
                  </p>
                  <div className="rd-59">
                    <span className="rd-60">{"5 fuentes"}</span>
                    <span className="rd-60">{"Por capítulos"}</span>
                    <span className="rd-60">{"Simulacros"}</span>
                  </div>
                  <a className="card-link rd-61" href="/linea-aerea">
                    {"Más información "}
                    <svg
                      className="more-arrow rd-25"
                      width="18"
                      height="18"
                      viewBox="0 0 256 256"
                      aria-hidden="true"
                    >
                      <g fill="currentColor">
                        <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                        <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                      </g>
                    </svg>
                  </a>
                </article>
                <article className="rd-62" data-stage-item="4">
                  <div className="rd-54">
                    <span className="rd-55">
                      <svg
                        className="rd-25"
                        width="24"
                        height="24"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                      >
                        <g fill="currentColor">
                          <path
                            d="M48 72h64v112H48Zm142.64-33.61a8 8 0 0 0-9.5-6.21l-46.81 10a8.07 8.07 0 0 0-6.15 9.57L139.79 107l62.46-13.42Z"
                            fill="#FFFFFF"
                            opacity=".18"
                          ></path>
                          <path d="m231.65 194.55l-33.19-157.8a16 16 0 0 0-19-12.39l-46.81 10.06a16.08 16.08 0 0 0-12.3 19l33.19 157.8A16 16 0 0 0 169.16 224a16.3 16.3 0 0 0 3.38-.36l46.81-10.06a16.09 16.09 0 0 0 12.3-19.03M136 50.15v-.09l46.8-10l3.33 15.87L139.33 66Zm6.62 31.47l46.82-10.05l3.34 15.9L146 97.53Zm6.64 31.57l46.82-10.06l13.3 63.24l-46.82 10.06ZM216 197.94l-46.8 10l-3.33-15.87l46.8-10.07l3.33 15.85zM104 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M56 48h48v16H56Zm0 32h48v96H56Zm48 128H56v-16h48z"></path>
                        </g>
                      </svg>
                    </span>
                    <span className="rd-56">{"ETAPA 05 · DE 05"}</span>
                  </div>
                  <h3 className="rd-57">{"Biblioteca y análisis"}</h3>
                  <p className="rd-58">
                    {
                      "100+ manuales de consulta y el análisis que conecta todo: tu avance por materia, tu radar de aptitudes y lo que te toca hoy."
                    }
                  </p>
                  <div className="rd-59">
                    <span className="rd-60">{"100+ manuales"}</span>
                    <span className="rd-60">{"Análisis por materia"}</span>
                    <span className="rd-60">{"Pathy y Yaris"}</span>
                  </div>
                  <a className="card-link rd-61" href="/dashboard/biblioteca">
                    {"Más información "}
                    <svg
                      className="more-arrow rd-25"
                      width="18"
                      height="18"
                      viewBox="0 0 256 256"
                      aria-hidden="true"
                    >
                      <g fill="currentColor">
                        <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                        <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                      </g>
                    </svg>
                  </a>
                </article>
              </div>
            </div>
          </div>
        </section>

        {showcase}

        <section className="rd-63" id="funciones">
          <canvas
            className="rd-64"
            aria-hidden="true"
            data-tone="light"
            data-motion="planes"
          ></canvas>
          <div className="rd-65">
            <div className="rd-66">
              <div className="rd-67">
                <div className="rd-68">
                  <span className="rd-5"></span>
                  <span>{"Herramientas de estudio"}</span>
                </div>
                <h2 className="rd-69">
                  {"Las herramientas que hacen "}
                  <span className="rd-70">{"el trabajo pesado."}</span>
                </h2>
              </div>
              <p className="rd-71">
                {
                  "Las mismas herramientas te acompañan en cada etapa — antes, durante y después de cada sesión de estudio."
                }
              </p>
            </div>
            <div className="rd-72" data-motion="stack">
              <div className="rd-73" data-stack-slot="0">
                <div className="rd-74" data-stack-card="0">
                  <div className="rd-75">
                    <div className="rd-54">
                      <span className="rd-76">
                        <svg
                          className="rd-25"
                          width="28"
                          height="28"
                          viewBox="0 0 256 256"
                          aria-hidden="true"
                        >
                          <g fill="currentColor">
                            <path
                              d="M224 200a24 24 0 1 1-24-24a24 24 0 0 1 24 24"
                              fill="#FFFFFF"
                              opacity=".18"
                            ></path>
                            <path d="M200 168a32.06 32.06 0 0 0-31 24H72a32 32 0 0 1 0-64h96a40 40 0 0 0 0-80H72a8 8 0 0 0 0 16h96a24 24 0 0 1 0 48H72a48 48 0 0 0 0 96h97a32 32 0 1 0 31-40m0 48a16 16 0 1 1 16-16a16 16 0 0 1-16 16"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="rd-77">{"01 / 06"}</span>
                      <span className="rd-78">{"Próximamente"}</span>
                    </div>
                    <h3 className="rd-79">{"Learning Paths"}</h3>
                    <p className="rd-80">
                      {"Aprende cada materia con una ruta clara, paso a paso."}
                    </p>
                  </div>
                  <img
                    className="rd-81"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/bab3f7d3613131e0.jpg"
                    alt="Ruta dorada con waypoints sobre un mapa topográfico azul marino"
                  />
                </div>
              </div>
              <div className="rd-73" data-stack-slot="1">
                <div className="rd-82" data-stack-card="1">
                  <div className="rd-75">
                    <div className="rd-54">
                      <span className="rd-83">
                        <svg
                          className="rd-25"
                          width="28"
                          height="28"
                          viewBox="0 0 256 256"
                          aria-hidden="true"
                        >
                          <g fill="currentColor">
                            <path d="M216 64v128h-88V64Z" fill="#FFFFFF" opacity=".18"></path>
                            <path d="M224 128a8 8 0 0 1-8 8h-88a8 8 0 0 1 0-16h88a8 8 0 0 1 8 8m-96-56h88a8 8 0 0 0 0-16h-88a8 8 0 0 0 0 16m88 112h-88a8 8 0 0 0 0 16h88a8 8 0 0 0 0-16M82.34 42.34L56 68.69L45.66 58.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32m0 64L56 132.69l-10.34-10.35a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32m0 64L56 196.69l-10.34-10.35a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="rd-84">{"02 / 06"}</span>
                    </div>
                    <h3 className="rd-79">{"Cuestionarios"}</h3>
                    <p className="rd-80">
                      {"Practica después de cada tema y recibe retroalimentación inmediata."}
                    </p>
                  </div>
                  <img
                    className="rd-81"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/6c09800564036fbe.jpg"
                    alt="Mano respondiendo un cuestionario de opción múltiple en una tableta"
                  />
                </div>
              </div>
              <div className="rd-73" data-stack-slot="2">
                <div className="rd-85" data-stack-card="2">
                  <div className="rd-75">
                    <div className="rd-54">
                      <span className="rd-86">
                        <svg
                          className="rd-25"
                          width="28"
                          height="28"
                          viewBox="0 0 256 256"
                          aria-hidden="true"
                        >
                          <g fill="currentColor">
                            <path
                              d="M232 152v24a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8v-22.87C24 95.65 70.15 48.2 127.63 48A104 104 0 0 1 232 152"
                              fill="#FFFFFF"
                              opacity=".18"
                            ></path>
                            <path d="M207.06 72.67A111.24 111.24 0 0 0 128 40h-.4C66.07 40.21 16 91 16 153.13V176a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16v-24a111.25 111.25 0 0 0-32.94-79.33M224 176H119.71l54.76-75.3a8 8 0 0 0-12.94-9.42L99.92 176H32v-22.87c0-3.08.15-6.12.43-9.13H56a8 8 0 0 0 0-16H35.27c10.32-38.86 44-68.24 84.73-71.66V80a8 8 0 0 0 16 0V56.33A96.14 96.14 0 0 1 221 128h-21a8 8 0 0 0 0 16h23.67c.21 2.65.33 5.31.33 8Z"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="rd-56">{"03 / 06"}</span>
                    </div>
                    <h3 className="rd-79">{"Simuladores"}</h3>
                    <p className="rd-87">{"Entrena con el mismo formato del examen oficial."}</p>
                  </div>
                  <img
                    className="rd-81"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/feb8a7194679fec4.jpg"
                    alt="Laptop con un simulador de examen cronometrado y un headset de piloto al lado"
                  />
                </div>
              </div>
              <div className="rd-73" data-stack-slot="3">
                <div className="rd-88" data-stack-card="3">
                  <div className="rd-75">
                    <div className="rd-54">
                      <span className="rd-86">
                        <svg
                          className="rd-25"
                          width="28"
                          height="28"
                          viewBox="0 0 256 256"
                          aria-hidden="true"
                        >
                          <g fill="currentColor">
                            <path
                              d="M232 56v144h-72a32 32 0 0 0-32 32V88a32 32 0 0 1 32-32Z"
                              fill="#FFFFFF"
                              opacity=".18"
                            ></path>
                            <path d="M232 48h-72a40 40 0 0 0-32 16a40 40 0 0 0-32-16H24a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h72a24 24 0 0 1 24 24a8 8 0 0 0 16 0a24 24 0 0 1 24-24h72a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8M96 192H32V64h64a24 24 0 0 1 24 24v112a39.8 39.8 0 0 0-24-8m128 0h-64a39.8 39.8 0 0 0-24 8V88a24 24 0 0 1 24-24h64ZM160 88h40a8 8 0 0 1 0 16h-40a8 8 0 0 1 0-16m48 40a8 8 0 0 1-8 8h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="rd-89">{"04 / 06"}</span>
                    </div>
                    <h3 className="rd-79">{"Biblioteca"}</h3>
                    <p className="rd-90">
                      {"Todo el material de consulta organizado en un solo lugar."}
                    </p>
                  </div>
                  <img
                    className="rd-81"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/2825076171976561.jpg"
                    alt="Librero con manuales de aviación azul marino y un avión a escala"
                  />
                </div>
              </div>
              <div className="rd-73" data-stack-slot="4">
                <div className="rd-91" data-stack-card="4">
                  <div className="rd-75">
                    <div className="rd-54">
                      <span className="rd-92">
                        <svg
                          className="rd-93"
                          width="28"
                          height="28"
                          viewBox="0 0 256 256"
                          aria-hidden="true"
                        >
                          <g fill="currentColor">
                            <path
                              d="M216 104v96a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-96a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8"
                              fill="#C7A052"
                              opacity=".7"
                            ></path>
                            <path d="M208 88H48a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-96a16 16 0 0 0-16-16m0 112H48v-96h160zM48 64a8 8 0 0 1 8-8h144a8 8 0 0 1 0 16H56a8 8 0 0 1-8-8m16-32a8 8 0 0 1 8-8h112a8 8 0 0 1 0 16H72a8 8 0 0 1-8-8"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="rd-94">{"05 / 06"}</span>
                      <span className="rd-95">{"Próximamente"}</span>
                    </div>
                    <h3 className="rd-79">{"Flashcards"}</h3>
                    <p className="rd-96">{"Memoriza conceptos con repasos inteligentes."}</p>
                  </div>
                  <img
                    className="rd-81"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/b32e3699d65855e1.jpg"
                    alt="Pila de flashcards azul marino con iconos dorados de instrumentos de vuelo"
                  />
                </div>
              </div>
              <div className="rd-73" data-stack-slot="5">
                <div className="rd-74" data-stack-card="5">
                  <div className="rd-75">
                    <div className="rd-54">
                      <span className="rd-76">
                        <svg
                          className="rd-25"
                          width="28"
                          height="28"
                          viewBox="0 0 256 256"
                          aria-hidden="true"
                        >
                          <g fill="currentColor">
                            <path
                              d="M216 48H40a8 8 0 0 0-8 8v112a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8m-104 96V80l48 32Z"
                              fill="#FFFFFF"
                              opacity=".18"
                            ></path>
                            <path d="m164.44 105.34l-48-32A8 8 0 0 0 104 80v64a8 8 0 0 0 12.44 6.66l48-32a8 8 0 0 0 0-13.32M120 129.05V95l25.58 17ZM216 40H40a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 128H40V56h176zm16 40a8 8 0 0 1-8 8H32a8 8 0 0 1 0-16h192a8 8 0 0 1 8 8"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="rd-77">{"06 / 06"}</span>
                      <span className="rd-78">{"Próximamente"}</span>
                    </div>
                    <h3 className="rd-79">{"Clases grabadas"}</h3>
                    <p className="rd-80">{"Explicaciones claras para estudiar a tu ritmo."}</p>
                  </div>
                  <img
                    className="rd-81"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/05926354bafd00ca.jpg"
                    alt="Laptop reproduciendo una clase grabada de un instructor de vuelo"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rd-97" id="pathy">
          <canvas
            className="rd-64"
            aria-hidden="true"
            data-tone="dark"
            data-motion="planes"
          ></canvas>
          <div className="rd-98">
            <div className="rd-99">
              <div className="rd-4">
                <span className="rd-5"></span>
                <span>{"Pathy · tu copiloto"}</span>
              </div>
              <h2 className="rd-69">
                {"Pathy te cuida. "}
                <span className="rd-7">{"Aunque cierres la app."}</span>
              </h2>
              <p className="rd-100">
                {
                  "Pathy te escribe al teléfono en el momento justo: que es hora de estudiar, que no pierdas tu racha, o tu análisis de la semana. Recordatorios cálidos — nunca presión."
                }
              </p>
              <ul className="rd-101">
                <li className="rd-102">
                  <svg
                    className="rd-103"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"></path>
                    </g>
                  </svg>
                  <span>{"“Es hora de estudiar” a tu hora ideal"}</span>
                </li>
                <li className="rd-102">
                  <svg
                    className="rd-103"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"></path>
                    </g>
                  </svg>
                  <span>{"Te avisa antes de perder la racha"}</span>
                </li>
                <li className="rd-102">
                  <svg
                    className="rd-103"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"></path>
                    </g>
                  </svg>
                  <span>{"Tu análisis semanal, en un mensaje"}</span>
                </li>
                <li className="rd-102">
                  <svg
                    className="rd-103"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"></path>
                    </g>
                  </svg>
                  <span>{"Cuenta regresiva al CIAAC, sin estrés"}</span>
                </li>
              </ul>
              <div className="rd-104">
                <span className="rd-105">
                  {"Pathy evoluciona contigo: cuanto más constante seas, más alto vuela."}
                </span>
                <div className="rd-106">
                  <span className="rd-107">{"Despegando"}</span>
                  <span className="rd-107">{"En progreso"}</span>
                  <span className="rd-107">{"En ruta"}</span>
                  <span className="rd-108">{"Modo piloto · 14–30 días de racha"}</span>
                  <span className="rd-107">{"Piloto élite"}</span>
                </div>
              </div>
              <a className="btn btn-gold rd-109" href="#precios">
                {"Conoce a tu copiloto"}
              </a>
            </div>
            {pathy}
          </div>
        </section>

        {yaris}

        <section className="rd-110" id="simulador">
          <canvas
            className="rd-64"
            aria-hidden="true"
            data-tone="light"
            data-motion="planes"
          ></canvas>
          <div className="rd-111">
            <div className="rd-99">
              <div className="rd-68">
                <span className="rd-5"></span>
                <span>{"Simulador CIAAC"}</span>
              </div>
              <h2 className="rd-69">
                {"Conoce el examen "}
                <span className="rd-70">{"antes de presentarlo."}</span>
              </h2>
              <p className="rd-71">
                {
                  "Familiarízate con el formato, administra tu tiempo y detecta qué materias necesitas reforzar antes del día real."
                }
              </p>
              <div className="rd-112">
                <div className="rd-113">
                  <span className="rd-114">{"310"}</span>
                  <span className="rd-115">{"Preguntas"}</span>
                </div>
                <div className="rd-116">
                  <span className="rd-114">{"5h"}</span>
                  <span className="rd-115">{"Duración"}</span>
                </div>
                <div className="rd-116">
                  <span className="rd-114">{"12"}</span>
                  <span className="rd-115">{"Materias"}</span>
                </div>
              </div>
              <a className="btn btn-navy rd-117" href="/register">
                {"Probar el simulador"}
              </a>
            </div>
            <div className="rd-118">
              <div className="rd-119">
                <span className="rd-25">{"SIM · CIAAC"}</span>
                <span className="rd-120">{"Pregunta 47 / 310"}</span>
                <span className="rd-121">
                  <span className="pulse-dot rd-122"></span>
                  {timer}
                </span>
              </div>
              <div className="rd-123">
                <div className="grow-68 rd-124"></div>
              </div>
              <div className="rd-125">
                <span className="rd-126">{"Reglamento aéreo"}</span>
                <span className="rd-127">
                  {
                    "En vuelo VFR controlado, ¿cuál es la separación vertical mínima sobre obstáculos en zona montañosa?"
                  }
                </span>
                <div className="rd-128">
                  <a className="rd-129" href="/register">
                    <span className="rd-130">{"A"}</span>
                    {"500 ft sobre el obstáculo en un radio de 600 m"}
                  </a>
                  <a className="rd-129" href="/register">
                    <span className="rd-130">{"B"}</span>
                    {"1,000 ft sobre el obstáculo en un radio de 4 NM"}
                  </a>
                  <a className="rd-131" href="/register">
                    <span className="rd-132">{"C"}</span>
                    {"2,000 ft sobre el obstáculo en un radio de 4 NM"}
                  </a>
                  <a className="rd-129" href="/register">
                    <span className="rd-130">{"D"}</span>
                    {"500 ft sobre el terreno"}
                  </a>
                </div>
                <div className="rd-133">
                  <a className="rd-134" href="/register">
                    {"Marcar para revisar"}
                  </a>
                  <a className="btn btn-gold rd-135" href="/register">
                    {"Siguiente"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {pricing}

        <section className="rd-110" id="historias">
          <canvas
            className="rd-64"
            aria-hidden="true"
            data-tone="light"
            data-motion="planes"
          ></canvas>
          <div className="rd-136">
            <div className="rd-137">
              <div className="rd-67">
                <div className="rd-68">
                  <span className="rd-5"></span>
                  <span>{"Historias"}</span>
                </div>
                <h2 className="rd-138">
                  {"Las primeras historias "}
                  <span className="rd-70">{"se están escribiendo."}</span>
                </h2>
              </div>
              <p className="rd-71">
                {
                  "FlightPath despega con la generación CIAAC 2026. Este es el recorrido que sigue cada alumno; muy pronto, sus historias aparecerán aquí con nombre y apellido."
                }
              </p>
            </div>
            <div className="rd-139">
              <div className="rd-140"></div>
              <div className="rd-141">
                <span className="rd-142">
                  <svg
                    className="rd-25"
                    width="22"
                    height="22"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="m240 91.64l-147.41 88a32 32 0 0 1-38-4.32L18.53 140a8 8 0 0 1 2.32-13.19l3.15-1.54L55.79 136L88 116.51L58.65 88a8 8 0 0 1 2.2-13.3L68 72l57.53 21.17l54.84-32.75a32 32 0 0 1 41 7.32Z"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M176 216a8 8 0 0 1-8 8H24a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8m71.86-122.85a8 8 0 0 1-3.76 5.39l-147.41 88a40.2 40.2 0 0 1-20.26 5.52a39.78 39.78 0 0 1-27.28-10.87l-.12-.12L13 145.8a16 16 0 0 1 4.49-26.21l3-1.47a8 8 0 0 1 6.08-.4l28.26 9.54L75 115.06L53.17 93.87A16 16 0 0 1 57.7 67.4l.32-.13l7.15-2.71a8 8 0 0 1 5.59 0l53.94 19.82l51.57-30.78a39.82 39.82 0 0 1 51.28 9.12l.12.15l18.64 23.89a8 8 0 0 1 1.55 6.39m-19.74-3.7l-13-16.67a23.88 23.88 0 0 0-30.68-5.42l-54.8 32.72a8.06 8.06 0 0 1-6.87.64L68 80.58l-4 1.53l.21.2l29.36 28.49a8 8 0 0 1-1.43 12.58l-32.21 19.49a8 8 0 0 1-6.7.73l-28.67-9.67l-.19.1l-.37.17a.7.7 0 0 1 .13.12l36 35.26a23.85 23.85 0 0 0 28.42 3.18Z"></path>
                    </g>
                  </svg>
                </span>
                <span className="rd-143">{"FASE 01 · DESPEGUE"}</span>
                <h3 className="rd-144">{"Tu ruta se traza sola"}</h3>
                <p className="rd-145">
                  {
                    "Cuentas tu meta y tu fecha; FlightPath arma tu plan por materias y detecta desde el día uno dónde estás fuerte y dónde no."
                  }
                </p>
              </div>
              <div className="rd-141">
                <span className="rd-142">
                  <svg
                    className="rd-25"
                    width="22"
                    height="22"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="M240 136v24H61.06a32 32 0 0 1-30.65-22.8L16.34 90.3A8 8 0 0 1 24 80h8l24 24h36.91L80.42 66.53A8 8 0 0 1 88 56h8l48 48h64a32 32 0 0 1 32 32"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M224 216a8 8 0 0 1-8 8H72a8 8 0 1 1 0-16h144a8 8 0 0 1 8 8m24-80v24a8 8 0 0 1-8 8H61.07a39.75 39.75 0 0 1-38.31-28.51L8.69 92.6A16 16 0 0 1 24 72h8a8 8 0 0 1 5.65 2.34L59.32 96h22.49l-9-26.94A16 16 0 0 1 88 48h8a8 8 0 0 1 5.66 2.34L147.32 96H208a40 40 0 0 1 40 40m-16 0a24 24 0 0 0-24-24h-64a8 8 0 0 1-5.65-2.34L92.69 64H88l12.49 37.47A8 8 0 0 1 92.91 112H56a8 8 0 0 1-5.66-2.34L28.69 88H24l14.07 46.9a23.85 23.85 0 0 0 23 17.1H232Z"></path>
                    </g>
                  </svg>
                </span>
                <span className="rd-143">{"FASE 02 · CRUCERO"}</span>
                <h3 className="rd-144">{"La constancia se vuelve racha"}</h3>
                <p className="rd-145">
                  {
                    "Sesiones cortas, cuestionarios que se adaptan y a Pathy recordándote volar un poco cada día. Los temas débiles se repiten hasta caer."
                  }
                </p>
              </div>
              <div className="rd-141">
                <span className="rd-142">
                  <svg
                    className="rd-25"
                    width="22"
                    height="22"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <g fill="currentColor">
                      <path
                        d="M232 148.32V184L55.37 134.54A32 32 0 0 1 32 103.73V48a8 8 0 0 1 10.53-7.59L48 42.24l12 33.22L104 88V48a8 8 0 0 1 10.53-7.59l5.47 1.83l24 57.2l64.56 18A32 32 0 0 1 232 148.32"
                        fill="#FFFFFF"
                        opacity=".18"
                      ></path>
                      <path d="M256 216a8 8 0 0 1-8 8H104a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8m-26.16-24.3L53.21 142.24A40.12 40.12 0 0 1 24 103.72V48a16 16 0 0 1 21.06-15.18l5.47 1.82a8 8 0 0 1 5 4.87l10.6 29.37L96 77.39V48a16 16 0 0 1 21.06-15.18l5.47 1.82a8 8 0 0 1 4.85 4.5l22.5 53.63l60.84 17A40.13 40.13 0 0 1 240 148.32V184a8 8 0 0 1-10.16 7.7M224 148.32a24.09 24.09 0 0 0-17.58-23.13l-64.57-18a8 8 0 0 1-5.23-4.61L114 48.67l-2-.67v40a8 8 0 0 1-10.19 7.7l-44-12.54a8 8 0 0 1-5.33-5L41.79 48.59L40 48v55.72a24.09 24.09 0 0 0 17.53 23.12L224 173.45Z"></path>
                    </g>
                  </svg>
                </span>
                <span className="rd-143">{"FASE 03 · ATERRIZAJE"}</span>
                <h3 className="rd-144">{"El examen deja de ser incógnita"}</h3>
                <p className="rd-145">
                  {
                    "Simulacros cronometrados como el CIAAC real, una preparación medida materia por materia y la seguridad de llegar sabiendo cuánto sabes."
                  }
                </p>
              </div>
            </div>
            <div className="rd-146">
              <div className="rd-147">
                <h3 className="rd-148">{"Tu historia puede ser la primera."}</h3>
                <p className="rd-145">
                  {
                    "Cuando apruebes tu CIAAC con FlightPath, este espacio contará cómo lo hiciste. Mientras tanto, las guías de estudio viven en el blog."
                  }
                </p>
              </div>
              <div className="rd-149">
                <a className="btn btn-navy rd-150" href="/register">
                  {"Empezar mi historia"}
                </a>
                <a className="btn rd-151" href="/blog">
                  {"Ir al blog"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="rd-152">
          <canvas
            className="rd-64"
            aria-hidden="true"
            data-tone="dark"
            data-motion="planes"
          ></canvas>
          <div className="rd-153">
            <div className="rd-99">
              <h2 className="rd-154">
                {"No es suerte. "}
                <span className="rd-7">{"Es preparación."}</span>
              </h2>
              <p className="rd-155">
                {
                  "Si completas tu ruta de estudio y no notas una mejora real en tu preparación y seguridad para el CIAAC, extendemos tu acceso y ajustamos contigo tu plan de estudio."
                }
              </p>
              <a className="btn btn-gold rd-156" href="/register">
                {"Únete a FlightPath "}
                <svg
                  className="rd-11"
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                  aria-hidden="true"
                >
                  <g fill="currentColor">
                    <path d="m216 128l-72 72V56Z" opacity=".28"></path>
                    <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
                  </g>
                </svg>
              </a>
            </div>
            <img
              className="float-y rd-157"
              loading="lazy"
              decoding="async"
              src="/redesign/b079792a862094a0.png"
              alt="Pathy, la nube copiloto de FlightPath"
            />
          </div>
        </section>

        <footer className="rd-158">
          <div className="rd-159">
            <div className="rd-160">
              <div className="rd-161">
                <div className="rd-162">
                  <img
                    className="rd-163"
                    loading="lazy"
                    decoding="async"
                    src="/redesign/3585687c1b6a244a.png"
                    alt="Logo de FlightPath"
                  />
                  <span className="rd-164">{"FlightPath"}</span>
                </div>
                <p className="rd-165">
                  {
                    "La plataforma de preparación para el CIAAC. Hecha en México por pilotos, para pilotos."
                  }
                </p>
                <p className="rd-166">
                  {
                    "FlightPath es una plataforma independiente. No está afiliada a la AFAC ni al CIAAC, ni a ASPA de México, Aeroméxico, Volaris o ninguna otra aerolínea o institución."
                  }
                </p>
                <span className="rd-167">{"EST. CDMX · 2026"}</span>
              </div>
              <div className="rd-168">
                <span className="rd-169">{"Plataforma"}</span>
                <a className="footlink" href="#funciones">
                  {"Funciones"}
                </a>
                <a className="footlink" href="#simulador">
                  {"Simulador"}
                </a>
                <a className="footlink" href="#yaris">
                  {"Tutor IA"}
                </a>
                <a className="footlink" href="#precios">
                  {"Precios"}
                </a>
              </div>
              <div className="rd-168">
                <span className="rd-169">{"Recursos"}</span>
                <div className="rd-170">
                  <a className="footlink" href="/blog">
                    {"Blog"}
                  </a>
                  <a className="footlink" href="/convocatoria-aeromexico">
                    {"Convocatoria Aeroméxico · Embraer 190"}
                  </a>
                  <a className="footlink" href="/faq">
                    {"Preguntas frecuentes"}
                  </a>
                  <a className="footlink" href="/linea-aerea">
                    {"Fuentes del temario — Línea Aérea"}
                  </a>
                  <a className="footlink" href="/respuestas">
                    {"Centro de respuestas CIAAC"}
                  </a>
                  <a className="footlink" href="/examen-rtari">
                    {"Examen RTARI — entrevista en inglés"}
                  </a>
                  <a className="footlink" href="/ciaac">
                    {"Examen CIAAC — Piloto Comercial"}
                  </a>
                  <a className="footlink" href="/examen-compass">
                    {"Examen COMPASS — aptitudes de piloto"}
                  </a>
                  <a className="footlink" href="/convocatoria-ciaac-2026">
                    {"Convocatoria CIAAC 2026"}
                  </a>
                  <a className="footlink" href="/mejor-plataforma-ciaac">
                    {"¿Cómo elegir plataforma?"}
                  </a>
                  <a className="footlink" href="/calculadora-ciaac">
                    {"Calculadora de horas de estudio"}
                  </a>
                  <a className="footlink" href="https://www.gob.mx/afac">
                    {"AFAC (sitio oficial)"}
                  </a>
                </div>
              </div>
              <div className="rd-168">
                <span className="rd-169">{"FlightPath"}</span>
                <a className="footlink" href="/sobre-flightpath">
                  {"Sobre FlightPath"}
                </a>
                <a className="footlink" href="/legal">
                  {"Términos y condiciones"}
                </a>
                <a className="footlink" href="mailto:contacto@flightpath.mx">
                  {"Contacto"}
                </a>
              </div>
            </div>
            <div className="rd-171">
              <span>{"© 2026 FlightPath. Hecho con cuidado en CDMX."}</span>
              <span className="rd-172">{"v1.0.0 · CIAAC 2026"}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
