import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ContactForm.module.css';
import { supabase } from '../../lib/supabase';

interface ContactFormProps {
  isVisible: boolean;
  onClose: () => void;
}

const QUEUED_SUBMISSIONS_KEY = 'queuedContactSubmissions';

export default function ContactForm({ isVisible, onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    title: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const { t } = useTranslation();

  const processQueuedSubmissions = useCallback(async () => {
    const queued = JSON.parse(localStorage.getItem(QUEUED_SUBMISSIONS_KEY) || '[]');
    if (queued.length === 0) return;

    const remaining = [];
    for (const submission of queued) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission),
        });

        if (response.ok) {
          // Success, don't add to remaining
        } else {
          remaining.push(submission);
        }
      } catch (error) {
        console.error('Failed to send queued submission:', error);
        remaining.push(submission);
      }
    }

    localStorage.setItem(QUEUED_SUBMISSIONS_KEY, JSON.stringify(remaining));
    if (remaining.length === 0) {
      alert(t('contactQueuedSentMessage'));
    }
  }, [t]);

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('notes').select('id').limit(1);
        setIsSupabaseConnected(!error);
      } catch {
        setIsSupabaseConnected(false);
      }
    };
    checkConnection();
  }, []);

  // Process queued submissions when coming online
  useEffect(() => {
    if (isOnline && isSupabaseConnected) {
      processQueuedSubmissions();
    }
  }, [isOnline, isSupabaseConnected, processQueuedSubmissions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      title: formData.title || 'No Title',
    };

    try {
      // Submit note to Supabase
      const { error } = await supabase.from('notes').insert([submissionData]);

      if (error) {
        throw error;
      }

      alert(t('contactSuccessMessage'));
      setFormData({ name: '', email: '', message: '', title: '' });
      onClose();
    } catch (error) {
      console.error('Note submission error:', error);

      // Queue for later when offline or server unavailable
      if (!isOnline || !isSupabaseConnected) {
        const queued = JSON.parse(localStorage.getItem(QUEUED_SUBMISSIONS_KEY) || '[]');
        queued.push(submissionData);
        localStorage.setItem(QUEUED_SUBMISSIONS_KEY, JSON.stringify(queued));

        alert(t('contactQueuedMessage'));
      } else {
        alert(t('contactErrorMessage'));
      }

      setFormData({ name: '', email: '', message: '', title: '' });
      onClose();
    }

    setIsSubmitting(false);
  };

  if (!isVisible) return null;

  const handleFormClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <aside className={styles.contactForm} onClick={handleFormClick}>
      <h3 className={styles.contactTitle}>{t('contactTitle')}</h3>
      <form onSubmit={handleSubmit} className={styles.contactFormElement}>
        <input
          type="text"
          name="name"
          placeholder={t('contactNamePlaceholder')}
          value={formData.name}
          onChange={handleInputChange}
          required
          className={styles.formInput}
        />
        <input
          name="title"
          placeholder={t('contactTitlePlaceholder')}
          value={formData.title}
          onChange={handleInputChange}
          required
          className={styles.formInput}
        />
        <input
          type="email"
          name="email"
          placeholder={t('contactEmailPlaceholder')}
          value={formData.email}
          onChange={handleInputChange}
          required
          className={styles.formInput}
        />
        <textarea
          name="message"
          placeholder={t('contactMessagePlaceholder')}
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={4}
          className={styles.formTextarea}
        />
        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? t('contactSendingButton') : t('contactSendButton')}
        </button>
      </form>
    </aside>
  );
}
