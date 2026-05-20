import { useEffect, useState } from 'react';
import { portfolioApi } from '../api';
import { usePortfolio } from '../context/AppContext';

import ParticlesCanvas from '../components/ParticlesCanvas';
import LoadingScreen   from '../components/LoadingScreen';
import Navbar          from '../components/Navbar';
import Footer          from '../components/Footer';
import Hero            from '../components/sections/Hero';
import About           from '../components/sections/About';
import Experience      from '../components/sections/Experience';
import Skills          from '../components/sections/Skills';
import Projects        from '../components/sections/Projects';
import Education       from '../components/sections/Education';
import Contact         from '../components/sections/Contact';

export default function Portfolio() {
  const { data, setData, loading, setLoading } = usePortfolio();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    portfolioApi.get()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setData, setLoading]);

  if (!appReady) {
    return (
      <>
        <ParticlesCanvas />
        <LoadingScreen
          name={data?.personalInfo?.name || 'Portfolio'}
          onDone={() => setAppReady(true)}
        />
      </>
    );
  }

  const pi = data?.personalInfo || {};

  return (
    <>
      <ParticlesCanvas />
      <Navbar name={pi.name} />

      <main id="main-content" className="portfolio-main">
        <Hero       data={pi} />
        <About      data={data?.about} personalInfo={pi} />
        <Experience experiences={data?.experiences} />
        <Skills     skills={data?.skills} />
        <Projects   projects={data?.projects} />
        <Education  education={data?.education} />
        <Contact    personalInfo={pi} />
      </main>

      <Footer name={pi.name} kofi={pi.kofi} />
    </>
  );
}
