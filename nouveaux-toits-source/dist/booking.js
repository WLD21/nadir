import { copy, serviceKeys } from './translations.js';

const words = {
  fr: {
    progress: 'Préparation de votre projet', steps: ['Vos travaux', 'Votre espace', 'Votre brief'],
    scopeTitle: 'Qu’aimeriez-vous transformer ?', scopeBody: 'Sélectionnez les travaux à prévoir. Vous pourrez préciser les détails lors du premier échange.',
    scopeError: 'Choisissez au moins un type de travaux pour continuer.',
    propertyTitle: 'Parlons de votre espace.', propertyBody: 'Ces informations sont facultatives. Une première idée suffit.',
    property: 'Type de bien', propertyOptions: ['À préciser', 'Maison', 'Appartement', 'Autre espace'],
    area: 'Surface concernée', areaPlaceholder: 'Par exemple : cuisine de 20 m²', postcode: 'Code postal ou commune', postcodePlaceholder: 'Lieu du projet',
    timeline: 'Quand souhaitez-vous commencer ?', timelineOptions: ['À définir ensemble', 'Dès que possible', 'Dans les 3 mois', 'Dans les 6 mois', 'Plus tard'],
    contactTitle: 'Un point de départ clair.', contactBody: 'Ajoutez vos coordonnées au brief pour le partager lors de votre premier échange.',
    name: 'Votre nom', email: 'Votre e-mail', notes: 'Votre idée en quelques mots', notesPlaceholder: 'Vos envies, les pièces concernées, les contraintes à anticiper…',
    privacy: 'Vos informations restent dans cette page. Elles servent uniquement à préparer votre document et ne sont pas envoyées.',
    next: 'Continuer', previous: 'Retour', prepare: 'Préparer mon brief', required: 'Champs obligatoires',
    doneTitle: 'Votre projet a son point de départ.', doneBody: 'Votre brief est prêt à télécharger et à partager. Aucun message n’a été envoyé et aucun rendez-vous n’est confirmé.',
    download: 'Télécharger mon brief', edit: 'Modifier mon projet', book: 'Choisir un rendez-vous', summary: 'Votre sélection',
    briefTitle: 'NOUVEAUX TOITS | BRIEF DE RÉNOVATION', briefStatus: 'Document préparatoire. Demande non envoyée, rendez-vous non confirmé.',
    works: 'Travaux envisagés', space: 'Le projet', contact: 'Coordonnées', unspecified: 'À préciser', downloaded: 'Le téléchargement du brief a été lancé.'
  },
  nl: {
    progress: 'Uw project voorbereiden', steps: ['Uw werken', 'Uw ruimte', 'Uw overzicht'],
    scopeTitle: 'Wat wilt u veranderen?', scopeBody: 'Selecteer de geplande werken. De details kunnen tijdens het eerste gesprek worden verfijnd.',
    scopeError: 'Kies minstens één soort werk om verder te gaan.',
    propertyTitle: 'Vertel over uw ruimte.', propertyBody: 'Deze informatie is optioneel. Een eerste idee is voldoende.',
    property: 'Type pand', propertyOptions: ['Nog te bepalen', 'Huis', 'Appartement', 'Andere ruimte'],
    area: 'Betrokken oppervlakte', areaPlaceholder: 'Bijvoorbeeld: keuken van 20 m²', postcode: 'Postcode of gemeente', postcodePlaceholder: 'Locatie van het project',
    timeline: 'Wanneer wilt u starten?', timelineOptions: ['Samen te bepalen', 'Zo snel mogelijk', 'Binnen 3 maanden', 'Binnen 6 maanden', 'Later'],
    contactTitle: 'Een helder vertrekpunt.', contactBody: 'Voeg uw contactgegevens toe om het overzicht bij uw eerste gesprek te delen.',
    name: 'Uw naam', email: 'Uw e-mail', notes: 'Uw idee in enkele woorden', notesPlaceholder: 'Uw wensen, de ruimtes, aandachtspunten…',
    privacy: 'Uw gegevens blijven op deze pagina. Ze worden alleen gebruikt om uw document voor te bereiden en worden niet verstuurd.',
    next: 'Verder', previous: 'Terug', prepare: 'Maak mijn overzicht', required: 'Verplichte velden',
    doneTitle: 'Uw project heeft een vertrekpunt.', doneBody: 'Uw overzicht is klaar om te downloaden en te delen. Er is geen bericht verstuurd en geen afspraak bevestigd.',
    download: 'Download mijn overzicht', edit: 'Wijzig mijn project', book: 'Kies een afspraak', summary: 'Uw selectie',
    briefTitle: 'NOUVEAUX TOITS | RENOVATIEOVERZICHT', briefStatus: 'Voorbereidend document. Aanvraag niet verstuurd, afspraak niet bevestigd.',
    works: 'Geplande werken', space: 'Het project', contact: 'Contactgegevens', unspecified: 'Nog te bepalen', downloaded: 'De download van uw overzicht is gestart.'
  },
  en: {
    progress: 'Prepare your project', steps: ['Your work', 'Your space', 'Your brief'],
    scopeTitle: 'What would you like to change?', scopeBody: 'Choose the work you have in mind. You can work through the details during your first conversation.',
    scopeError: 'Choose at least one type of work to continue.',
    propertyTitle: 'Tell us about your space.', propertyBody: 'These details are optional. A first idea is enough.',
    property: 'Property type', propertyOptions: ['To be discussed', 'House', 'Apartment', 'Another space'],
    area: 'Area involved', areaPlaceholder: 'For example: a 20 m² kitchen', postcode: 'Postcode or town', postcodePlaceholder: 'Project location',
    timeline: 'When would you like to start?', timelineOptions: ['Let’s work it out together', 'As soon as possible', 'Within 3 months', 'Within 6 months', 'Later'],
    contactTitle: 'A clear starting point.', contactBody: 'Add your contact details to the brief so you can share it at your first conversation.',
    name: 'Your name', email: 'Your email', notes: 'Your idea in a few words', notesPlaceholder: 'Your wishes, the rooms involved, anything to keep in mind…',
    privacy: 'Your information stays on this page. It is only used to prepare your document and is not sent anywhere.',
    next: 'Continue', previous: 'Back', prepare: 'Prepare my brief', required: 'Required fields',
    doneTitle: 'Your project has a starting point.', doneBody: 'Your brief is ready to download and share. No message has been sent and no appointment has been confirmed.',
    download: 'Download my brief', edit: 'Edit my project', book: 'Choose an appointment', summary: 'Your selection',
    briefTitle: 'NOUVEAUX TOITS | RENOVATION BRIEF', briefStatus: 'Preparation document. Request not sent, appointment not confirmed.',
    works: 'Work to consider', space: 'The project', contact: 'Contact details', unspecified: 'To be discussed', downloaded: 'Your brief download has started.'
  }
};

let host = null;
let lang = 'fr';
let step = 0;
let complete = false;
const selected = new Set();
const values = { property: '0', area: '', postcode: '', timeline: '0', name: '', email: '', notes: '' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chosen = () => serviceKeys.filter(key => selected.has(key));
const emit = () => document.dispatchEvent(new CustomEvent('nt:services', { detail: chosen() }));

function capture() {
  if (!host) return;
  for (const input of host.querySelectorAll('[name]')) {
    if (Object.hasOwn(values, input.name)) values[input.name] = input.value;
  }
}

function headingFocus() {
  const heading = host?.querySelector('.booking-step-title');
  heading?.focus({ preventScroll: true });
}

function bookingDestination() {
  const destination = window.NT_CONFIG?.bookingUrl;
  if (!destination) return null;
  try {
    const url = new URL(destination);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function options(items, value) {
  return items.map((label, index) => `<option value="${index}"${String(index) === value ? ' selected' : ''}>${esc(label)}</option>`).join('');
}

function progress(t) {
  return `<ol class="booking-progress" aria-label="${esc(t.progress)}">${t.steps.map((label, index) => `<li${index === step ? ' aria-current="step"' : ''} class="${index <= step ? 'is-reached' : ''}"><span class="booking-step-number" aria-hidden="true">${index + 1}</span><span>${esc(label)}</span></li>`).join('')}</ol>`;
}

function scope(t) {
  return `<h3 class="booking-step-title" tabindex="-1">${esc(t.scopeTitle)}</h3><p class="booking-step-body">${esc(t.scopeBody)}</p><div class="booking-options" role="group" aria-label="${esc(t.works)}">${serviceKeys.map(key => `<button type="button" class="booking-option${selected.has(key) ? ' is-selected' : ''}" data-booking-service="${key}" aria-pressed="${selected.has(key)}"><span>${esc(copy[lang].services[key].name)}</span><span class="booking-option-mark" aria-hidden="true">${selected.has(key) ? '✓' : '+'}</span></button>`).join('')}</div><p class="booking-error" id="booking-error" role="alert" hidden></p>`;
}

function property(t) {
  return `<h3 class="booking-step-title" tabindex="-1">${esc(t.propertyTitle)}</h3><p class="booking-step-body">${esc(t.propertyBody)}</p><div class="booking-fields"><label class="booking-field"><span>${esc(t.property)}</span><select name="property">${options(t.propertyOptions, values.property)}</select></label><label class="booking-field"><span>${esc(t.area)}</span><input name="area" maxlength="100" value="${esc(values.area)}" placeholder="${esc(t.areaPlaceholder)}"></label><label class="booking-field"><span>${esc(t.postcode)}</span><input name="postcode" autocomplete="postal-code" maxlength="100" value="${esc(values.postcode)}" placeholder="${esc(t.postcodePlaceholder)}"></label><label class="booking-field"><span>${esc(t.timeline)}</span><select name="timeline">${options(t.timelineOptions, values.timeline)}</select></label></div>`;
}

function contact(t) {
  return `<h3 class="booking-step-title" tabindex="-1">${esc(t.contactTitle)}</h3><p class="booking-step-body">${esc(t.contactBody)}</p><div class="booking-fields"><label class="booking-field"><span>${esc(t.name)} *</span><input name="name" autocomplete="name" required maxlength="120" value="${esc(values.name)}"></label><label class="booking-field"><span>${esc(t.email)} *</span><input name="email" type="email" inputmode="email" autocomplete="email" required maxlength="180" value="${esc(values.email)}"></label><label class="booking-field booking-field-wide"><span>${esc(t.notes)}</span><textarea name="notes" rows="3" maxlength="2500" placeholder="${esc(t.notesPlaceholder)}">${esc(values.notes)}</textarea></label></div><p class="booking-privacy">${esc(t.privacy)}</p><p class="booking-required">* ${esc(t.required)}</p>`;
}

function finished(t) {
  const destination = bookingDestination();
  return `<div class="booking-complete"><div class="booking-complete-mark" aria-hidden="true">✓</div><h3 class="booking-step-title" tabindex="-1">${esc(t.doneTitle)}</h3><p class="booking-step-body">${esc(t.doneBody)}</p><div class="booking-summary"><p>${esc(t.summary)}</p><ul>${chosen().map(key => `<li>${esc(copy[lang].services[key].name)}</li>`).join('')}</ul></div><div class="booking-actions"><button class="button booking-primary" type="button" data-booking-action="download">${esc(t.download)}<span aria-hidden="true">↗</span></button>${destination ? `<a class="button booking-primary" href="${esc(destination)}" target="_blank" rel="noopener noreferrer">${esc(t.book)}<span aria-hidden="true">↗</span></a>` : ''}<button class="booking-back" type="button" data-booking-action="edit">${esc(t.edit)}</button></div><p class="booking-download-status" role="status" aria-live="polite"></p></div>`;
}

function render(focus = false) {
  if (!host) return;
  const t = words[lang];
  host.setAttribute('lang', lang);
  host.innerHTML = complete ? finished(t) : `${progress(t)}<form class="booking-form" method="post" action="#project">${[scope, property, contact][step](t)}<div class="booking-actions">${step ? `<button class="booking-back" type="button" data-booking-action="back">← ${esc(t.previous)}</button>` : '<span aria-hidden="true"></span>'}<button class="button booking-primary" type="submit">${esc(step === 2 ? t.prepare : t.next)}<span aria-hidden="true">→</span></button></div></form>`;
  if (focus) headingFocus();
}

function briefText() {
  const t = words[lang];
  const val = key => values[key].trim() || t.unspecified;
  return [t.briefTitle, '', t.briefStatus, '', t.works.toUpperCase(), ...chosen().map(key => `• ${copy[lang].services[key].name}`), '', t.space.toUpperCase(), `${t.property}: ${t.propertyOptions[Number(values.property)] || t.unspecified}`, `${t.area}: ${val('area')}`, `${t.postcode}: ${val('postcode')}`, `${t.timeline}: ${t.timelineOptions[Number(values.timeline)] || t.unspecified}`, '', t.contact.toUpperCase(), `${t.name}: ${val('name')}`, `${t.email}: ${val('email')}`, '', t.notes.toUpperCase(), val('notes'), '', 'Nouveaux Toits'].join('\n');
}

function download() {
  const blob = new Blob(['\uFEFF', briefText()], { type: 'text/plain;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `nouveaux-toits-projet-${lang}.txt`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  const status = host.querySelector('.booking-download-status');
  if (status) status.textContent = words[lang].downloaded;
}

function click(event) {
  const service = event.target.closest('[data-booking-service]');
  if (service) {
    const key = service.dataset.bookingService;
    toggleService(key);
    host.querySelector(`[data-booking-service="${key}"]`)?.focus({ preventScroll: true });
    return;
  }
  const action = event.target.closest('[data-booking-action]')?.dataset.bookingAction;
  if (!action) return;
  capture();
  if (action === 'back') { step = Math.max(0, step - 1); render(true); }
  if (action === 'edit') { complete = false; step = 0; render(true); }
  if (action === 'download') download();
}

function submit(event) {
  event.preventDefault();
  capture();
  if (selected.size === 0) {
    if (step !== 0) { step = 0; render(); }
    const error = host.querySelector('.booking-error');
    error.textContent = words[lang].scopeError;
    error.hidden = false;
    host.querySelector('[data-booking-service]')?.focus({ preventScroll: true });
    return;
  }
  if (step === 2) {
    const nameInput = host.querySelector('[name="name"]');
    nameInput.setCustomValidity(values.name.trim() ? '' : words[lang].name);
    if (!event.target.reportValidity()) return;
    complete = true;
  } else step += 1;
  render(true);
}

function toggleService(key) {
  if (!serviceKeys.includes(key)) return;
  capture();
  selected.has(key) ? selected.delete(key) : selected.add(key);
  if (complete) { complete = false; step = 0; }
  render();
  emit();
}

function setLanguage(language) {
  if (!Object.hasOwn(words, language)) return;
  capture();
  lang = language;
  render();
  emit();
}

function input(event) {
  if (event.target.name === 'name') event.target.setCustomValidity('');
}

function init(rootElement) {
  const nextHost = typeof rootElement === 'string' ? document.querySelector(rootElement) : rootElement;
  if (!nextHost) return;
  if (host) {
    host.removeEventListener('click', click);
    host.removeEventListener('submit', submit);
    host.removeEventListener('input', input);
  }
  host = nextHost;
  host.addEventListener('click', click);
  host.addEventListener('submit', submit);
  host.addEventListener('input', input);
  render();
  emit();
}

window.NTBooking = { init, setLanguage, toggleService, getSelected: chosen };
export { init, setLanguage, toggleService, chosen as getSelected };
