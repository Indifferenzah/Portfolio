import { useEffect, useRef } from 'react';

function SkillItem({ skill }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-animated');
          el.style.setProperty('--skill-level', `${skill.level}%`);
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [skill.level]);

  return (
    <div className="skill-item" ref={ref}>
      <div className="skill-item__header">
        <span className="skill-item__name">{skill.name}</span>
        <span className="skill-item__level">{skill.level}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar__fill" />
      </div>
    </div>
  );
}

export default function Skills({ skills = [] }) {
  return (
    <section id="skills" className="section">
      <div className="container">
        <h2 className="section-title">Skills</h2>
        <div className="skills__grid">
          {skills.map(skill => (
            <SkillItem key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
}
