import Image from "next/image";
import { ArrowUpRight, PlayCircle } from "@phosphor-icons/react/dist/ssr";

const films = [
  { title: "Har Kadam Govinda", chapter: "Faith", duration: "2:41", image: "har-kadam-govinda", url: "https://youtu.be/utBXsAbkCeI" },
  { title: "Maiya Vakula", chapter: "A mother's love", duration: "2:13", image: "maiya-vakula", url: "https://youtu.be/nZOyr4n91Rw" },
  { title: "Aaj Saje Srinivas", chapter: "Celebration", duration: "2:27", image: "aaj-saje-srinivas", url: "https://youtu.be/wOR2bQqEzFY" },
  { title: "Man Mein Base Balaji", chapter: "Devotion carried home", duration: "2:23", image: "man-mein-base-balaji", url: "https://youtu.be/ajLlrqvX1bE" },
];

export function CreativeExperiment() {
  return (
    <section className="creative-experiment" id="experimentation" aria-labelledby="experiment-heading">
      <div className="experiment-heading section-heading">
        <p className="experiment-label">CREATIVE WORK</p>
        <h2 id="experiment-heading">From experiment<br />to outcome.</h2>
        <p>Bringing language, music, imagery and motion into one coherent experience, connected by faith, family and care.</p>
      </div>

      <div className="experiment-feature">
        <Image className="experiment-art" src="/creative-experiment/album-hero.webp" alt="A grandmother and granddaughter in prayer, beneath the Hindi album title Man Mein Base Balaji." width={1200} height={1200} sizes="(max-width: 760px) 100vw, 42vw" />
        <div className="experiment-copy">
          <p className="experiment-label">THE FINISHED PROOF ARTIFACT</p>
          <h3>Man Mein<br />Base Balaji</h3>
          <p className="experiment-hindi" lang="hi">मन में बसे बालाजी</p>
          <p>Four songs and four cinematic devotional stories, connected by faith, family and care.</p>
          <p>I directed, selected and edited the work, reviewing emotional intent and continuity as it came together.</p>
          <a className="experiment-cta" href="https://www.youtube.com/playlist?list=PLJwmSf3TmX8I" target="_blank" rel="noreferrer">Watch the album <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>

      <div className="experiment-learning">
        <h3>What the experiment made visible</h3>
        <p>The connections between outputs need as much judgment as the outputs themselves. Clear roles, selection and review shaped the finished experience.</p>
        <p className="experiment-boundary">This demonstrates a completed creative workflow. Enterprise use requires its own evaluation of reliability, governance, cost and business value.</p>
      </div>

      <ol className="experiment-films" aria-label="Four album chapters">
        {films.map((film, index) => (
          <li key={film.image}>
            <a href={film.url} target="_blank" rel="noreferrer" aria-label={`Watch chapter ${index + 1}: ${film.title} on YouTube, ${film.duration}`}>
              <Image src={`/creative-experiment/${film.image}.webp`} alt="" width={960} height={540} sizes="(max-width: 760px) 100vw, 23vw" />
              <div className="experiment-film-meta"><span>{String(index + 1).padStart(2, "0")} / {film.chapter}</span><span>{film.duration}</span></div>
              <h4>{film.title}<PlayCircle aria-hidden="true" /></h4>
            </a>
          </li>
        ))}
      </ol>
      <p className="experiment-credit">Presented by Dhiraj Raikantiwar.</p>
    </section>
  );
}
