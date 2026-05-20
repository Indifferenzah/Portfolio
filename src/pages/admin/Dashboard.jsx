import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioApi, authApi, clearSession, getUsername, isAuthenticated } from '../../api';
import { hashPassword, generateSalt } from '../../utils/crypto';
import { useToast } from '../../context/AppContext';
import Modal from '../../components/Modal';

// ── Helpers ──────────────────────────────────────────────────
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

/** Move item from `from` to `to` index (inclusive bounds). */
function moveItemAt(arr, from, to) {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = [...arr];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sidebar sections ─────────────────────────────────────────
const SECTIONS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: 'fa-gauge' },
  { id: 'personal',    label: 'Personal Info', icon: 'fa-id-card' },
  { id: 'about',       label: 'About',         icon: 'fa-user' },
  { id: 'experiences', label: 'Experiences',   icon: 'fa-briefcase' },
  { id: 'skills',      label: 'Skills',        icon: 'fa-code' },
  { id: 'projects',    label: 'Projects',      icon: 'fa-folder-open' },
  { id: 'education',   label: 'Education',     icon: 'fa-graduation-cap' },
  { id: 'settings',    label: 'Settings',      icon: 'fa-gear' },
];

// ── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const username     = getUsername();

  const [data,    setData]    = useState(null);
  const [section, setSection] = useState('dashboard');
  const [sidebar, setSidebar] = useState(false);
  const [modal,   setModal]   = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/admin/login'); return; }
    portfolioApi.get().then(setData).catch(() => addToast('Failed to load data', 'error'));
  }, [navigate, addToast]);

  const saveData = useCallback(async (newData) => {
    try {
      await portfolioApi.update(newData);
      setData(newData);
      addToast('Saved!', 'success');
    } catch {
      addToast('Failed to save', 'error');
    }
  }, [addToast]);

  async function logout() {
    await authApi.logout().catch(() => {});
    clearSession();
    navigate('/admin/login');
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner--lg" />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {sidebar && (
        <div className="sidebar-overlay is-visible" onClick={() => setSidebar(false)} />
      )}

      <aside className={`sidebar${sidebar ? ' is-open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo"><i className="fas fa-code" /></div>
          <div>
            <div className="sidebar__title">Portfolio</div>
            <div className="sidebar__subtitle">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <span className="sidebar__section-label">Navigation</span>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`sidebar__link${section === s.id ? ' is-active' : ''}`}
              onClick={() => { setSection(s.id); setSidebar(false); }}
            >
              <i className={`fas ${s.icon}`} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <a href="/" className="sidebar__external-link" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-external-link-alt" />
            View Portfolio
          </a>
          <button className="sidebar__logout" onClick={logout}>
            <i className="fas fa-right-from-bracket" />
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <button
            className="topbar__toggle"
            onClick={() => setSidebar(o => !o)}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars" />
          </button>
          <h1 className="topbar__title">
            {SECTIONS.find(s => s.id === section)?.label || 'Dashboard'}
          </h1>
          <div className="topbar__user">
            <div className="topbar__avatar">{username?.[0]?.toUpperCase() || 'A'}</div>
            <span className="topbar__username">{username}</span>
          </div>
        </header>

        <div className="admin-content">
          {section === 'dashboard'   && <SectionDashboard data={data} setSection={setSection} />}
          {section === 'personal'    && <SectionPersonal  data={data} onSave={saveData} />}
          {section === 'about'       && <SectionAbout     data={data} onSave={saveData} />}
          {section === 'experiences' && (
            <SectionList
              title="Experiences" icon="fa-briefcase"
              items={data.experiences}
              onSave={items => saveData({ ...data, experiences: items })}
              modal={modal} setModal={setModal}
              renderForm={ExperienceForm}
            />
          )}
          {section === 'skills' && (
            <SectionList
              title="Skills" icon="fa-code"
              items={data.skills}
              onSave={items => saveData({ ...data, skills: items })}
              modal={modal} setModal={setModal}
              renderForm={SkillForm}
              renderItem={SkillItemRow}
            />
          )}
          {section === 'projects' && (
            <SectionList
              title="Projects" icon="fa-folder-open"
              items={data.projects}
              onSave={items => saveData({ ...data, projects: items })}
              modal={modal} setModal={setModal}
              renderForm={ProjectForm}
            />
          )}
          {section === 'education' && (
            <SectionList
              title="Education" icon="fa-graduation-cap"
              items={data.education}
              onSave={items => saveData({ ...data, education: items })}
              modal={modal} setModal={setModal}
              renderForm={EducationForm}
            />
          )}
          {section === 'settings' && (
            <SectionSettings data={data} onSave={saveData} addToast={addToast} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard overview ───────────────────────────────────────
function SectionDashboard({ data, setSection }) {
  const stats = [
    { label: 'Experiences', value: data.experiences?.length || 0, icon: 'fa-briefcase',     section: 'experiences' },
    { label: 'Skills',      value: data.skills?.length      || 0, icon: 'fa-code',          section: 'skills' },
    { label: 'Projects',    value: data.projects?.length    || 0, icon: 'fa-folder-open',   section: 'projects' },
    { label: 'Education',   value: data.education?.length   || 0, icon: 'fa-graduation-cap', section: 'education' },
  ];
  return (
    <>
      <div className="dashboard__stats">
        {stats.map(s => (
          <div
            key={s.label}
            className="dashboard-stat"
            onClick={() => setSection(s.section)}
          >
            <div className="dashboard-stat__icon"><i className={`fas ${s.icon}`} /></div>
            <div>
              <div className="dashboard-stat__value">{s.value}</div>
              <div className="dashboard-stat__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard__welcome">
        <h2>Welcome back!</h2>
        <p>Use the sidebar to manage your portfolio content.</p>
        <ul>
          {[
            'Edit personal info & about text',
            'Add, remove, or reorder experiences, skills, projects & education',
            'Update your skills & levels',
          ].map(t => (
            <li key={t}><i className="fas fa-circle-check" />{t}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ── Personal info ────────────────────────────────────────────
function SectionPersonal({ data, onSave }) {
  const [form, setForm] = useState(data.personalInfo);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title"><i className="fas fa-id-card" />Personal Info</h2>
      </div>
      <form className="admin-form" onSubmit={e => { e.preventDefault(); onSave({ ...data, personalInfo: form }); }}>
        <div className="form-row">
          <Field label="Name"  value={form.name}  onChange={v => set('name', v)} />
          <Field label="Title" value={form.title} onChange={v => set('title', v)} />
        </div>
        <Field label="Description" value={form.description} onChange={v => set('description', v)} textarea />
        <div className="form-row">
          <Field label="Email"   value={form.email}   onChange={v => set('email', v)}   type="email" />
          <Field label="Discord" value={form.discord} onChange={v => set('discord', v)} />
        </div>
        <div className="form-row">
          <Field label="GitHub" value={form.github} onChange={v => set('github', v)} />
          <Field label="Ko-fi"  value={form.kofi}   onChange={v => set('kofi', v)} />
        </div>
        <div className="form-row">
          <Field label="Years Experience"   value={form.yearsExperience}   onChange={v => set('yearsExperience', v)} />
          <Field label="Projects Completed" value={form.projectsCompleted} onChange={v => set('projectsCompleted', v)} />
        </div>
        <button type="submit" className="btn btn--primary">
          <i className="fas fa-floppy-disk" />Save Changes
        </button>
      </form>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────
function SectionAbout({ data, onSave }) {
  const [form, setForm] = useState(data.about);
  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title"><i className="fas fa-user" />About</h2>
      </div>
      <form className="admin-form" onSubmit={e => { e.preventDefault(); onSave({ ...data, about: form }); }}>
        <Field label="Paragraph 1" value={form.text1} onChange={v => setForm(f => ({ ...f, text1: v }))} textarea rows={4} />
        <Field label="Paragraph 2" value={form.text2} onChange={v => setForm(f => ({ ...f, text2: v }))} textarea rows={4} />
        <button type="submit" className="btn btn--primary">
          <i className="fas fa-floppy-disk" />Save Changes
        </button>
      </form>
    </div>
  );
}

// ── Generic CRUD list ────────────────────────────────────────
function ReorderButtons({ index, total, onMoveUp, onMoveDown }) {
  return (
    <div className="item-card__reorder" role="group" aria-label="Reorder">
      <button
        type="button"
        className="btn btn--ghost btn--icon"
        disabled={index <= 0}
        onClick={onMoveUp}
        aria-label="Move up"
      >
        <i className="fas fa-chevron-up" />
      </button>
      <button
        type="button"
        className="btn btn--ghost btn--icon"
        disabled={index >= total - 1}
        onClick={onMoveDown}
        aria-label="Move down"
      >
        <i className="fas fa-chevron-down" />
      </button>
    </div>
  );
}

function SectionList({ title, icon, items, onSave, modal, setModal, renderForm: RenderForm, renderItem: RenderItem }) {
  function openAdd()    { setModal({ type: 'add',  item: null }); }
  function openEdit(it) { setModal({ type: 'edit', item: it }); }
  function openDel(it)  { setModal({ type: 'del',  item: it }); }
  function closeModal() { setModal(null); }

  function handleMoveUp(index) {
    if (index <= 0) return;
    onSave(moveItemAt(items, index, index - 1));
  }

  function handleMoveDown(index) {
    if (index >= items.length - 1) return;
    onSave(moveItemAt(items, index, index + 1));
  }

  function handleSave(newItem) {
    const updated = modal.type === 'add'
      ? [...items, { ...newItem, id: nextId(items) }]
      : items.map(i => i.id === newItem.id ? newItem : i);
    onSave(updated);
    closeModal();
  }

  function handleDelete() {
    onSave(items.filter(i => i.id !== modal.item.id));
    closeModal();
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title"><i className={`fas ${icon}`} />{title}</h2>
          <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}>
            <i className="fas fa-plus" />Add New
          </button>
        </div>
        <div className="items-list">
          {items.length === 0
            ? <div className="empty-state">
                <i className={`fas ${icon}`} />
                <p>No {title.toLowerCase()} yet.</p>
              </div>
            : items.map((it, index) =>
                RenderItem
                  ? (
                      <RenderItem
                        key={it.id}
                        item={it}
                        index={index}
                        total={items.length}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
                        onEdit={() => openEdit(it)}
                        onDelete={() => openDel(it)}
                      />
                    )
                  : (
                      <DefaultItemRow
                        key={it.id}
                        item={it}
                        index={index}
                        total={items.length}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
                        onEdit={() => openEdit(it)}
                        onDelete={() => openDel(it)}
                      />
                    )
              )
          }
        </div>
      </div>

      {modal?.type === 'add' && (
        <Modal title={`Add ${title.replace(/s$/, '')}`} onClose={closeModal}>
          <RenderForm item={null} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title={`Edit ${title.replace(/s$/, '')}`} onClose={closeModal}>
          <RenderForm item={modal.item} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'del' && (
        <Modal title="Confirm Delete" onClose={closeModal}>
          <p style={{ marginBottom: 'var(--s6)', color: 'var(--text-2)' }}>
            Delete <strong style={{ color: 'var(--text)' }}>{modal.item.title || modal.item.name}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end' }}>
            <button className="btn btn--ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn--danger" onClick={handleDelete}>
              <i className="fas fa-trash" />Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Item rows ────────────────────────────────────────────────
function DefaultItemRow({ item, index, total, onMoveUp, onMoveDown, onEdit, onDelete }) {
  return (
    <div className="item-card">
      <ReorderButtons index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
      <div className="item-card__info">
        {item.title      && <div className="item-card__title">{item.title}</div>}
        {item.period     && <div className="item-card__meta">{item.period}</div>}
        {item.description && <div className="item-card__desc">{item.description}</div>}
        {item.link       && <div className="item-card__link">{item.link}</div>}
      </div>
      <div className="item-card__actions">
        <button type="button" className="btn btn--ghost btn--icon" onClick={onEdit} aria-label="Edit">
          <i className="fas fa-pen" />
        </button>
        <button type="button" className="btn btn--danger btn--icon" onClick={onDelete} aria-label="Delete">
          <i className="fas fa-trash" />
        </button>
      </div>
    </div>
  );
}

function SkillItemRow({ item, index, total, onMoveUp, onMoveDown, onEdit, onDelete }) {
  return (
    <div className="item-card">
      <ReorderButtons index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
      <div className="item-card__info" style={{ flex: 1 }}>
        <div className="item-card__title">{item.name}</div>
        <div className="progress-bar" style={{ marginTop: 'var(--s2)' }}>
          <div className="progress-bar__fill" style={{ width: `${item.level}%`, transition: 'none' }} />
        </div>
        <div className="item-card__meta" style={{ marginTop: 'var(--s1)' }}>{item.level}%</div>
      </div>
      <div className="item-card__actions">
        <button type="button" className="btn btn--ghost btn--icon" onClick={onEdit} aria-label="Edit">
          <i className="fas fa-pen" />
        </button>
        <button type="button" className="btn btn--danger btn--icon" onClick={onDelete} aria-label="Delete">
          <i className="fas fa-trash" />
        </button>
      </div>
    </div>
  );
}

// ── Forms ────────────────────────────────────────────────────
function ExperienceForm({ item, onSave, onCancel }) {
  const [f, setF] = useState(item || { title: '', period: '', description: '' });
  return (
    <form className="admin-form" onSubmit={e => { e.preventDefault(); onSave(f); }}>
      <Field label="Title"       value={f.title}       onChange={v => setF(p => ({ ...p, title: v }))}       required />
      <Field label="Period"      value={f.period}      onChange={v => setF(p => ({ ...p, period: v }))}      placeholder="e.g. 2022 - Present" />
      <Field label="Description" value={f.description} onChange={v => setF(p => ({ ...p, description: v }))} textarea />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function SkillForm({ item, onSave, onCancel }) {
  const [f, setF] = useState(item || { name: '', level: 80 });
  return (
    <form className="admin-form" onSubmit={e => { e.preventDefault(); onSave(f); }}>
      <Field label="Skill Name" value={f.name} onChange={v => setF(p => ({ ...p, name: v }))} required />
      <div className="form-group">
        <label className="form-label">Level: {f.level}%</label>
        <input
          type="range"
          min={0} max={100} step={5}
          value={f.level}
          onChange={e => setF(p => ({ ...p, level: +e.target.value }))}
          style={{ width: '100%', accentColor: 'var(--lime)' }}
        />
        <div className="progress-bar" style={{ marginTop: 'var(--s2)' }}>
          <div className="progress-bar__fill" style={{ width: `${f.level}%`, transition: 'none' }} />
        </div>
      </div>
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function ProjectForm({ item, onSave, onCancel }) {
  const [f, setF]           = useState(item || { title: '', description: '', link: '', technologies: [] });
  const [techInput, setTechInput] = useState('');

  function addTech() {
    const t = techInput.trim();
    if (t && !f.technologies.includes(t)) setF(p => ({ ...p, technologies: [...p.technologies, t] }));
    setTechInput('');
  }

  function removeTech(t) {
    setF(p => ({ ...p, technologies: p.technologies.filter(x => x !== t) }));
  }

  return (
    <form className="admin-form" onSubmit={e => { e.preventDefault(); onSave(f); }}>
      <Field label="Title"       value={f.title}       onChange={v => setF(p => ({ ...p, title: v }))}       required />
      <Field label="Description" value={f.description} onChange={v => setF(p => ({ ...p, description: v }))} textarea />
      <Field label="GitHub Link" value={f.link}        onChange={v => setF(p => ({ ...p, link: v }))}        type="url" placeholder="https://github.com/..." />
      <div className="form-group">
        <label className="form-label">Technologies</label>
        <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s2)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. React"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
          />
          <button type="button" className="btn btn--outline btn--sm" onClick={addTech}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
          {f.technologies.map(t => (
            <span key={t} className="tech-tag" style={{ cursor: 'pointer' }} onClick={() => removeTech(t)}>
              {t} <i className="fas fa-xmark" style={{ marginLeft: 4 }} />
            </span>
          ))}
        </div>
      </div>
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function EducationForm({ item, onSave, onCancel }) {
  const [f, setF] = useState(item || { title: '', period: '', description: '' });
  return (
    <form className="admin-form" onSubmit={e => { e.preventDefault(); onSave(f); }}>
      <Field label="Title"       value={f.title}       onChange={v => setF(p => ({ ...p, title: v }))}       required />
      <Field label="Period"      value={f.period}      onChange={v => setF(p => ({ ...p, period: v }))} />
      <Field label="Description" value={f.description} onChange={v => setF(p => ({ ...p, description: v }))} textarea />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

// ── Settings ─────────────────────────────────────────────────
function SectionSettings({ data, onSave, addToast }) {
  const [uForm, setUForm] = useState({ newUsername: '', currentPassword: '' });
  const [pForm, setPForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [uLoading, setULoading] = useState(false);
  const [pLoading, setPLoading] = useState(false);

  async function changeUsername(e) {
    e.preventDefault();
    setULoading(true);
    try {
      const { salt }    = await authApi.status();
      const currentHash = await hashPassword(uForm.currentPassword, salt);
      await authApi.changeUsername({ newUsername: uForm.newUsername, currentHash });
      sessionStorage.setItem('portfolio_user', uForm.newUsername);
      addToast('Username changed!', 'success');
      setUForm({ newUsername: '', currentPassword: '' });
    } catch (err) {
      addToast(err.message || 'Failed to change username', 'error');
    } finally {
      setULoading(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pForm.newPassword !== pForm.confirmPassword) { addToast('Passwords do not match', 'error'); return; }
    setPLoading(true);
    try {
      const { salt }    = await authApi.status();
      const currentHash = await hashPassword(pForm.currentPassword, salt);
      const newSalt     = generateSalt();
      const newHash     = await hashPassword(pForm.newPassword, newSalt);
      await authApi.changePassword({ currentHash, newHash, newSalt });
      addToast('Password changed!', 'success');
      setPForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setPLoading(false);
    }
  }

  function exportData() {
    downloadJson(data, 'portfolio-backup.json');
    addToast('Data exported!', 'success');
  }

  function importData() {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          onSave(imported);
          addToast('Data imported!', 'success');
        } catch {
          addToast('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title"><i className="fas fa-gear" />Settings</h2>
      </div>

      <div className="settings-section">
        <h3>Change Username</h3>
        <form className="admin-form" onSubmit={changeUsername}>
          <Field label="New Username"     value={uForm.newUsername}     onChange={v => setUForm(f => ({ ...f, newUsername: v }))}     required />
          <Field label="Current Password" value={uForm.currentPassword} onChange={v => setUForm(f => ({ ...f, currentPassword: v }))} type="password" required />
          <button type="submit" className="btn btn--primary btn--sm" disabled={uLoading}>
            {uLoading
              ? <><i className="fas fa-spinner fa-spin" />Saving…</>
              : <><i className="fas fa-user-pen" />Change Username</>
            }
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Change Password</h3>
        <form className="admin-form" onSubmit={changePassword}>
          <Field label="Current Password" value={pForm.currentPassword} onChange={v => setPForm(f => ({ ...f, currentPassword: v }))} type="password" required />
          <Field label="New Password"     value={pForm.newPassword}     onChange={v => setPForm(f => ({ ...f, newPassword: v }))}     type="password" required />
          <Field label="Confirm Password" value={pForm.confirmPassword} onChange={v => setPForm(f => ({ ...f, confirmPassword: v }))} type="password" required />
          <button type="submit" className="btn btn--primary btn--sm" disabled={pLoading}>
            {pLoading
              ? <><i className="fas fa-spinner fa-spin" />Saving…</>
              : <><i className="fas fa-lock" />Change Password</>
            }
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="settings-actions">
          <button className="btn btn--outline btn--sm" onClick={exportData}>
            <i className="fas fa-download" />Export Data
          </button>
          <button className="btn btn--ghost btn--sm" onClick={importData}>
            <i className="fas fa-upload" />Import Data
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared form field ────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', textarea, rows = 3, placeholder, required }) {
  const props = {
    className:   textarea ? 'form-textarea' : 'form-input',
    value:       value || '',
    onChange:    e => onChange(e.target.value),
    placeholder,
    required,
    rows,
  };
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {textarea ? <textarea {...props} /> : <input type={type} {...props} />}
    </div>
  );
}

function FormActions({ onCancel }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end', marginTop: 'var(--s4)' }}>
      <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn btn--primary">
        <i className="fas fa-floppy-disk" />Save
      </button>
    </div>
  );
}
