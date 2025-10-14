import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { useCookieState } from '../hooks/useCookieState';
import { MetaTags } from '../hooks/useMetaTags';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import styles from './Home.module.css';

export default function Portfolio() {
  const { t } = useTranslation();
  const [locale, setLocale] = useLocale();
  const [isDarkMode, setIsDarkMode] = useCookieState<boolean>('darkMode', false);

  // Update theme attribute on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <MetaTags
        title="Home"
        description="A creative portfolio website with interactive elements, built with React and TypeScript. Includes a real-time collaborative sound board app powered by PartyKit."
        image="/home-screenshot.webp"
        url="/"
      />
      <Header
        showDarkModeToggle={true}
        isDarkMode={isDarkMode}
        onDarkModeToggle={toggleDarkMode}
        locale={locale}
        showBackLink={false}
      />
      <main>
        <div className={styles.container}>
          <div className="markdown">
            <div className={styles.introSection}>
              <img
                src="/profile.webp"
                width="500"
                height="700"
                alt="kd holding some freshly acquired baguettes in Dublin"
                className={styles.profileImage}
              />
            </div>
            <h1 className="title">{t('homeTitle')}</h1>
            <div>
              <p className={styles.intro}>{t('homeIntro')}</p>
              <p className={styles.fridgeLink}>
                <a href="/fridge">{t('homeFridgeLink')}</a>
              </p>
              <div className={styles.section}>
                <h2>{t('homeDeveloperJourneyTitle')}</h2>
                <p>{t('homeDeveloperJourneyText')}</p>

                <pre className={styles.codeBlock}>
                  <code>
                    {`// The Developer's Loop
async function developerLife() {
  try {
    while (true) {
      // Phase 1: Problem Discovery
      const problems = await identifyBugs();
      const features = await gatherRequirements();

      // Phase 2: Fuel Acquisition
      const fuel = await getCaffeine();
      if (fuel < 50) {
        await drink(coffee || energyDrink);
      }

      // Phase 3: The Magic Happens
      await writeCode(problems, features);
      await refactorForReadability();
      await addComprehensiveTests();

      // Phase 4: Quality Assurance
      const testsPass = await runTestSuite();
      if (!testsPass) {
        console.log("🔧 Fixing bugs...");
        continue; // Back to coding!
      }

      // Phase 5: Deployment & Celebration
      await deployToProduction();
      await celebrateSuccess();

      // Phase 6: Reflection & Growth
      await learnFromExperience();
      await planNextIteration();

      // Brief pause before the next cycle
      await sleep(8 * 60 * 60 * 1000); // 8 hours in ms
    }
  } catch (error) {
    if (error.name === 'BurnoutError') {
      await takeBreak();
      await rechargeBatteries();
    } else {
      console.error('Unexpected error:', error);
      await debugAndFix(error);
    }
    return developerLife(); // Recursion saves the day!
  }
}

// Start the endless cycle
developerLife();`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} onLocaleChange={setLocale} />
    </>
  );
}
