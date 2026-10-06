import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { webauthnOK, passkeyLogin, passkeyRegister, api, BIO } from '../lib/api.js'
import { hasData } from '../store/useStore.js'
import { DEMO, REPO } from '../lib/demo.js'
import { useState, useRef, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { Button } from '../components/ui.jsx'

const COPY = {
  enterName: 'Introduce un nombre',
  inviteRequired: 'Se requiere un código de invitación',
  profileCreated: 'Perfil creado — los datos de este dispositivo se han movido a él',
  welcome: name => `Bienvenido, ${name}`,
  registrationFailed: 'Registro fallido',
  createProfile: 'Crea tu perfil',
  createProfileHint: method => `Elige un nombre y confirma con ${method}. La passkey se guarda en tu dispositivo — sin contraseñas.`,
  yourName: 'Tu nombre',
  inviteCode: 'Código de invitación',
  inviteOnly: 'Esta app es solo por invitación: introduce el código que te dieron.',
  createPasskey: 'Crear passkey',
  welcomeBack: name => `Bienvenido de nuevo, ${name}`,
  signInFailed: 'Inicio de sesión fallido',
  liveDemo: 'Demo en vivo — todo permanece en este navegador.',
  startDemo: 'Iniciar demo',
  demoHint: 'Esta demo funciona completamente en tu navegador con datos de ejemplo; no se envía nada. El inicio de sesión con passkey y la sincronización entre dispositivos están disponibles al alojar openGym en tu propio servidor.',
  selfHost: 'Alojalo en un minuto →',
  tagline: 'Tus entrenamientos. Tus pesos. Tu perfil.',
  signIn: 'Iniciar sesión con passkey',
  newProfile: 'Crear perfil nuevo',
  unsupported: 'Este navegador no admite passkeys — aun así puedes usar openGym localmente en este dispositivo.',
  continueWithoutAccount: 'Continuar sin cuenta',
  passkeyHint: method => `Las passkeys usan ${method} — sin contraseñas.`,
  profileHint: 'Cada perfil guarda su propio plan, entrenamientos y peso corporal.'
}

function NikaCredit() {
  return (
    <a
      href="https://nikastudio.co/"
      target="_blank"
      rel="noopener"
      aria-label="Nika Studio"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none' }}
    >
      <img src="nika-studio.svg" alt="" width="55" height="32" style={{ display: 'block', height: 32, width: 'auto' }} />
      <span>Desarrollado por Nika Studio</span>
    </a>
  )
}

function RegisterSheet({ close }) {
  const { setUser, pushState, pullState } = useStore()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [inviteOnly, setInviteOnly] = useState(false)
  const ref = useRef(null)
  useEffect(() => { setTimeout(() => ref.current?.focus(), 250) }, [])
  useEffect(() => { api('/api/config').then(c => setInviteOnly(!!c.invite_only)).catch(() => {}) }, [])
  const go = async () => {
    const n = name.trim()
    if (!n) { useUI.getState().toast(COPY.enterName); return }
    if (inviteOnly && !code.trim()) { useUI.getState().toast(COPY.inviteRequired); return }
    try {
      const u = await passkeyRegister(n, code.trim())
      setUser(u); close()
      if (hasData(useStore.getState().S)) { await pushState(); useUI.getState().toast(COPY.profileCreated) }
      else { await pullState(); useUI.getState().toast(COPY.welcome(u.name)) }
    } catch (e) { if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') useUI.getState().toast(e.message || COPY.registrationFailed) }
  }
  return <>
    <h3>{COPY.createProfile}</h3>
    <div className="muted small" style={{ marginBottom: 14 }}>{COPY.createProfileHint(BIO)}</div>
    <input ref={ref} className="input" placeholder={COPY.yourName} maxLength={40} value={name} onChange={e => setName(e.target.value)} />
    {inviteOnly && <>
      <div style={{ height: 10 }} />
      <input className="input" placeholder={COPY.inviteCode} maxLength={40} value={code}
        onChange={e => setCode(e.target.value.toUpperCase())} style={{ letterSpacing: '.14em', fontWeight: 600, textAlign: 'center' }} />
      <div className="dim small" style={{ marginTop: 6 }}>{COPY.inviteOnly}</div>
    </>}
    <div style={{ height: 12 }} />
    <Button variant="primary" onClick={go}>{COPY.createPasskey}</Button>
  </>
}

export default function Login() {
  const { setUser, pullState, setGuest } = useStore()
  const signIn = async () => {
    try { const u = await passkeyLogin(); setUser(u); await pullState(); useUI.getState().toast(COPY.welcomeBack(u.name)) }
    catch (e) { if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') useUI.getState().toast(e.message || COPY.signInFailed) }
  }
  const head = <>
    <div style={{ fontSize: 54, display: 'flex', justifyContent: 'center', color: 'var(--acc)' }}><Icon name="dumbbell" /></div>
    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.028em', margin: '10px 0 4px' }}>openGym</h1>
  </>
  const wrap = { display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '78vh', textAlign: 'center' }

  // Demo build: no backend to sign in against — the only way in is the local guest profile.
  if (DEMO) return (
    <div className="narrow" style={wrap}>
      {head}
      <div className="muted" style={{ marginBottom: 30 }}>{COPY.liveDemo}</div>
      <Button variant="primary" icon="sparkles" onClick={() => setGuest(true)}>{COPY.startDemo}</Button>
      <div className="card small muted" style={{ textAlign: 'left', marginTop: 16 }}>
        {COPY.demoHint}
      </div>
      <div className="dim small" style={{ marginTop: 22, lineHeight: 1.6 }}>
        <a href={REPO} target="_blank" rel="noopener">{COPY.selfHost}</a>
      </div>
      <div className="dim small" style={{ marginTop: 28 }}><NikaCredit /></div>
    </div>
  )

  return (
    <div className="narrow" style={wrap}>
      {head}
      <div className="muted" style={{ marginBottom: 34 }}>{COPY.tagline}</div>
      {webauthnOK() ? <>
        <Button variant="primary" icon="person" onClick={signIn}>{COPY.signIn}</Button>
        <div style={{ height: 10 }} />
        <Button icon="sparkles" onClick={() => useUI.getState().openSheet(close => <RegisterSheet close={close} />)}>{COPY.newProfile}</Button>
        <div style={{ height: 10 }} />
      </> : <div className="card small muted" style={{ textAlign: 'left' }}>{COPY.unsupported}</div>}
      <Button variant="ghost" className="dim" onClick={() => setGuest(true)}>{COPY.continueWithoutAccount}</Button>
      <div className="dim small" style={{ marginTop: 26, lineHeight: 1.5 }}>{COPY.passkeyHint(BIO)}<br />{COPY.profileHint}</div>
      <div className="dim small" style={{ marginTop: 28 }}><NikaCredit /></div>
    </div>
  )
}
