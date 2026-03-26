import i18n, { Resource, LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources: Resource = {
  en: {
    translation: {
      welcome: 'Welcome to Hinjewadi-Connect',
      login_subtitle: 'Enter your name to continue',
      name_placeholder: 'John Doe',
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
      profile: 'Profile',
      settings: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      help_support: 'Help & Support',
      account_settings: 'Account Settings',
      mode_role: 'Mode / Role',
      mode_subtitle: 'Choose how you want to use the app',
      seeker: 'Seeker',
      seeker_subtitle: 'Looking for stay/jobs',
      provider: 'Provider',
      provider_subtitle: 'Offering services',
      hiring: 'Hiring',
      hiring_subtitle: 'Post stay/jobs',
      edit: 'Edit',
      cancel: 'Cancel',
      save_changes: 'Save Changes',
      location: 'Location',
      status: 'Status',
      verified: 'Verified',
      ai_insights: 'AI Insights',
      professional_profile: 'Professional Profile',
      post_listing: 'Post New Listing',
      manage_postings: 'Manage My Postings',
      guest: 'Guest',
      namaste: 'Namaste',
      home_subtitle: 'Everything you need in {{area}}',
      rooms: 'Rooms',
      jobs: 'Jobs',
      services: 'Services',
      post: 'Post',
      featured_rooms: 'Featured Rooms',
      see_all: 'See All',
      latest_jobs: 'Latest Jobs',
      success: 'Success',
      error: 'Error',
      profile_updated: 'Profile updated successfully!',
      update_failed: 'Failed to update profile',
    },
  },
  hi: {
    translation: {
      welcome: 'हिंजवडी-कनेक्ट में आपका स्वागत है',
      // ... previous hi translations ...
      manage_postings: 'मेरी पोस्टिंग्स प्रबंधित करें',
      guest: 'अतिथि',
      namaste: 'नमस्ते',
      home_subtitle: '{{area}} में आपकी ज़रूरत की हर चीज़',
      rooms: 'कमरे',
      jobs: 'नौकरियां',
      services: 'सेवाएं',
      post: 'पोस्ट करें',
      featured_rooms: 'विशेष कमरे',
      see_all: 'सभी देखें',
      latest_jobs: 'नवीनतम नौकरियां',
      success: 'सफलता',
      error: 'त्रुटि',
      profile_updated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
      update_failed: 'प्रोफ़ाइल अपडेट करने में विफल',
    },
  },
  mr: {
    translation: {
      welcome: 'हिंजवडी-कनेक्ट मध्ये आपले स्वागत आहे',
      // ... previous mr translations ...
      manage_postings: 'माझ्या पोस्टचे व्यवस्थापन',
      guest: 'पाहुणे',
      namaste: 'नमस्ते',
      home_subtitle: '{{area}} मध्ये तुम्हाला हवे असलेले सर्व काही',
      rooms: 'रुम्स',
      jobs: 'नोकऱ्या',
      services: 'सेवा',
      post: 'पोस्ट',
      featured_rooms: 'निवडक रुम्स',
      see_all: 'सर्व पहा',
      latest_jobs: 'नवीन नोकऱ्या',
      success: 'यश',
      error: 'त्रुटि',
      profile_updated: 'प्रोफाइल यशस्वीरित्या अपडेट केली!',
      update_failed: 'प्रोफाइल अपडेट करण्यात अपयश',
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
  init: () => { },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) { }
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

