/**
 * Translations
 * 
 * English and Norwegian translations for the app.
 */

export type Language = 'en' | 'no';

export const translations = {
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
    },

    // Demo Screen
    demo: {
      title: 'Starter Kit Demo',
      subtitle: 'All your components are working! Explore what\'s available below.',
      typography: 'Typography',
      heading4: 'Heading 4',
      bodyLarge: 'Body Large Text',
      bodySecondary: 'Body text in secondary color',
      captionText: 'Caption text',
      buttons: 'Buttons',
      primaryButton: 'Primary Button',
      secondaryButton: 'Secondary Button',
      outlineButton: 'Outline Button',
      ghostButton: 'Ghost Button',
      inputFields: 'Input Fields',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      helperText: 'This is a helper text',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      tooShort: 'Too short',
      interactiveFeatures: 'Interactive Features',
      openModal: 'Open Modal',
      showLoader: 'Show Loader (2s)',
      toggleEmpty: 'Toggle Empty State',
      globalState: 'Global State',
      theme: 'Theme',
      active: 'Active',
      uiLoading: 'UI Loading',
      checkConsole: 'Check console for logs and analytics events!',
      modalTitle: 'Modal Demo',
      modalContent: 'This is a modal component. It supports different sizes (sm, md, lg, full) and can contain any content.',
      closeModal: 'Close Modal',
      emptyTitle: 'No Items Found',
      emptyDescription: 'This is an empty state component. Perfect for when there\'s no data to display.',
      dismiss: 'Dismiss',
      buttonClicked: 'button clicked!',
      language: 'Language',
      switchLanguage: 'Switch to Norwegian',
    },

    // Auth
    auth: {
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      noAccount: 'Don\'t have an account?',
      haveAccount: 'Already have an account?',
    },
  },

  no: {
    // Common
    common: {
      loading: 'Laster...',
      error: 'Feil',
      success: 'Suksess',
      cancel: 'Avbryt',
      save: 'Lagre',
      delete: 'Slett',
      edit: 'Rediger',
      close: 'Lukk',
      ok: 'OK',
      yes: 'Ja',
      no: 'Nei',
    },

    // Demo Screen
    demo: {
      title: 'Starter Kit Demo',
      subtitle: 'Alle komponentene dine fungerer! Utforsk hva som er tilgjengelig nedenfor.',
      typography: 'Typografi',
      heading4: 'Overskrift 4',
      bodyLarge: 'Stor brødtekst',
      bodySecondary: 'Brødtekst i sekundær farge',
      captionText: 'Bildetekst',
      buttons: 'Knapper',
      primaryButton: 'Primær knapp',
      secondaryButton: 'Sekundær knapp',
      outlineButton: 'Omriss knapp',
      ghostButton: 'Ghost knapp',
      inputFields: 'Inntastingsfelt',
      email: 'E-post',
      emailPlaceholder: 'din@epost.no',
      helperText: 'Dette er en hjelpetekst',
      password: 'Passord',
      passwordPlaceholder: 'Skriv inn passord',
      tooShort: 'For kort',
      interactiveFeatures: 'Interaktive funksjoner',
      openModal: 'Åpne modal',
      showLoader: 'Vis laster (2s)',
      toggleEmpty: 'Veksle tom tilstand',
      globalState: 'Global tilstand',
      theme: 'Tema',
      active: 'Aktiv',
      uiLoading: 'UI laster',
      checkConsole: 'Sjekk konsollen for logger og analysehendelser!',
      modalTitle: 'Modal demo',
      modalContent: 'Dette er en modalkomponent. Den støtter forskjellige størrelser (sm, md, lg, full) og kan inneholde hvilket som helst innhold.',
      closeModal: 'Lukk modal',
      emptyTitle: 'Ingen elementer funnet',
      emptyDescription: 'Dette er en tom tilstandskomponent. Perfekt for når det ikke er noen data å vise.',
      dismiss: 'Avvis',
      buttonClicked: 'knapp klikket!',
      language: 'Språk',
      switchLanguage: 'Bytt til engelsk',
    },

    // Auth
    auth: {
      login: 'Logg inn',
      register: 'Registrer deg',
      logout: 'Logg ut',
      email: 'E-post',
      password: 'Passord',
      forgotPassword: 'Glemt passord?',
      noAccount: 'Har du ikke en konto?',
      haveAccount: 'Har du allerede en konto?',
    },
  },
} as const;

export type TranslationKeys = typeof translations.en;
