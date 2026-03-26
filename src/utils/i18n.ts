import i18n, { Resource, LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources: Resource = {
  en: {
    translation: {
      welcome: 'Welcome to Hinjewadi-Connect',
      login_subtitle: 'Enter your mobile number to continue',
      phone_placeholder: '9999999999',
      continue: 'Continue',
      role_selection_title: 'Who are you?',
      role_selection_subtitle: 'Choose your role to get started',
      resident: 'Resident',
      worker: 'Provider',
      admin: 'Admin',
      service_provider: 'Service Provider',
      job_seeker: 'Job Seeker',
      owner: 'Property Owner',
      tenant: 'Tenant',
      room_finder: 'Room Finder',
      select_category: 'Select Category',
      profile_creation_title: 'Complete Your Profile',
      name: 'Full Name',
      area: 'Work Area',
      save: 'Save & Continue',
      logout: 'Logout',
    },
  },
  hi: {
    translation: {
      welcome: 'हिंजवडी-कनेक्ट में आपका स्वागत है',
      login_subtitle: 'जारी रखने के लिए अपना मोबाइल नंबर दर्ज करें',
      phone_placeholder: '9999999999',
      continue: 'आगे बढ़ें',
      role_selection_title: 'आप कौन हैं?',
      role_selection_subtitle: 'शुरू करने के लिए अपनी भूमिका चुनें',
      resident: 'निवासी',
      worker: 'प्रदाता',
      admin: 'एडमिन',
      service_provider: 'सेवा प्रदाता',
      job_seeker: 'नौकरी चाहने वाला',
      owner: 'संपत्ति का मालिक',
      tenant: 'किरायेदार',
      room_finder: 'कमरा खोजने वाला',
      select_category: 'श्रेणी चुनें',
      profile_creation_title: 'अपना प्रोफ़ाइल पूरा करें',
      name: 'पूरा नाम',
      area: 'कार्य क्षेत्र',
      save: 'सहेजें और जारी रखें',
      logout: 'लॉगआउट',
    },
  },
  mr: {
    translation: {
      welcome: 'हिंजवडी-कनेक्ट मध्ये आपले स्वागत आहे',
      login_subtitle: 'सुरू ठेवण्यासाठी तुमचा मोबाईल नंबर प्रविष्ट करा',
      phone_placeholder: '9999999999',
      continue: 'पुढे चला',
      role_selection_title: 'तुम्ही कोण आहात?',
      role_selection_subtitle: 'सुरू करण्यासाठी तुमची भूमिका निवडा',
      resident: 'रहिवासी',
      worker: 'प्रदाता',
      admin: 'admin',
      service_provider: 'सेवा प्रदाता',
      job_seeker: 'नोकरी शोधणारे',
      owner: 'मालक',
      tenant: 'भाडेकरी',
      room_finder: 'रूम शोधणारे',
      select_category: 'श्रेणी निवडा',
      profile_creation_title: 'तुमचे प्रोफाईल पूर्ण करा',
      name: 'पूर्ण नाव',
      area: 'कार्यक्षेत्र',
      save: 'सेव्ह करा आणि पुढे चला',
      logout: 'लॉगआउट',
    },
  },
};

const LANGUAGE_KEY = 'user-language';

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (lang: string | undefined) => void) => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((savedLanguage) => {
        if (savedLanguage) {
          return callback(savedLanguage);
        }
        return callback(Localization.getLocales()[0].languageCode || 'en');
      })
      .catch((error) => {
        console.log('Error detecting language', error);
        callback('en');
      });
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
