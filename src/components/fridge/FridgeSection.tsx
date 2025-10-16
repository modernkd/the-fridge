import React, { useState } from 'react';
import MagnetText from '../magnets/MagnetText';
import FamilyWhiteboard from './FamilyWhiteboard';
import StickyNotes from './StickyNotes';
import styles from './FridgeSection.module.css';
import { useTranslation } from 'react-i18next';
import { soundMap } from '../../lib/soundMap';

interface FridgeSectionProps {
  isDarkMode: boolean;
  handleNoteTaking: () => void;
  isFormOpen: boolean;
  isFridgeOpen: boolean;
  onFridgeToggle: () => void;
  onThemeChange?: (theme: string) => void;
}

export default function FridgeSection({
  isDarkMode,
  handleNoteTaking,
  isFormOpen,
  isFridgeOpen,
  onFridgeToggle,
  onThemeChange,
}: FridgeSectionProps) {
  const { t } = useTranslation();
  const [clickedItem, setClickedItem] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFridgeOpen) {
      onFridgeToggle();
    }
  };

  const playSound = (emoji: string) => {
    const soundFile = soundMap[emoji] || 'sparkles.mp3';

    // Simple, direct approach - just try to play the sound
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = 0.5;

    audio.play().catch((error) => {
      console.error(`Failed to play ${soundFile} for ${emoji}:`, error);
      // Fallback to sparkles if the specific sound fails
      if (soundFile !== 'sparkles.mp3') {
        const fallbackAudio = new Audio('/sounds/sparkles.mp3');
        fallbackAudio.volume = 0.5;
        fallbackAudio.play().catch((fallbackError) => {
          console.error('Sparkles fallback also failed:', fallbackError);
        });
      }
    });
  };

  const handleItemClick = (emoji: string) => {
    setClickedItem(emoji);
    playSound(emoji);

    // Theme change logic
    if (onThemeChange) {
      switch (emoji) {
        case '🍎':
          onThemeChange('red');
          break;
        case '🥕':
          onThemeChange('orange');
          break;
        case '🫐':
          onThemeChange('blue');
          break;
        case '🍌':
          onThemeChange('yellow');
          break;
        default:
          break;
      }
    }

    setTimeout(() => setClickedItem(null), 300);
  };

  return (
    <section className={styles.fridgeSection}>
      {/* Fridge Interior - stays behind */}
      <div className={`${styles.fridgeInterior} ${isFridgeOpen ? styles.visible : ''}`}>
        {/* Top Shelf */}
        <div className={`${styles.shelf} ${styles.topShelf}`} />
        <div className={`${styles.shelfItems} ${styles.topShelfItems}`}>
          <button
            className={`${styles.fridgeItem} ${styles.apple} ${clickedItem === '🍎' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🍎')}
            role="button"
            aria-label="Apple - click to change theme to red"
          >
            🍎
          </button>
          <button
            className={`${styles.fridgeItem} ${styles.banana} ${clickedItem === '🍌' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🍌')}
            role="button"
            aria-label="Banana - click to change theme to yellow"
          >
            🍌
          </button>
          <button
            className={`${styles.fridgeItem} ${styles.carrot} ${clickedItem === '🥕' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🥕')}
            role="button"
            aria-label="Carrot - click to change theme to orange"
          >
            🥕
          </button>
        </div>

        {/* Middle Shelf */}
        <div className={`${styles.shelf} ${styles.middleShelf}`} />
        <div className={`${styles.shelfItems} ${styles.middleShelfItems}`}>
          <button
            className={`${styles.fridgeItem} ${styles.duffBeer} ${clickedItem === '🍺' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🍺')}
            role="button"
            aria-label="Duff beer - click to play sound"
          >
            🍺
          </button>
          <button
            className={`${styles.fridgeItem} ${styles.orangeJuice} ${clickedItem === '🧃' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🧃')}
            role="button"
            aria-label="Orange juice - click to play sound"
          >
            🧃
          </button>
          <button
            className={`${styles.fridgeItem} ${styles.milk} ${clickedItem === '🥛' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🥛')}
            role="button"
            aria-label="Milk - click to play sound"
          >
            🥛
          </button>
        </div>

        {/* Bottom Shelf */}
        <div className={`${styles.shelf} ${styles.bottomShelf}`} />
        <div className={`${styles.shelfItems} ${styles.bottomShelfItems}`}>
          <button
            className={`${styles.fridgeItem} ${styles.pizza} ${clickedItem === '🍕' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🍕')}
            role="button"
            aria-label="Pizza slice - click to play sound"
          >
            🍕
          </button>
          <button
            className={`${styles.fridgeItem} ${styles.blueberries} ${clickedItem === '🫐' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🫐')}
            role="button"
            aria-label="Blueberries - click to change theme to blue"
          >
            🫐
          </button>
          <button
            className={`${styles.fridgeItem} ${styles.smoothie} ${clickedItem === '🥤' ? styles.clicked : ''}`}
            onClick={() => handleItemClick('🥤')}
            role="button"
            aria-label="Smoothie - click to play sound"
          >
            🥤
          </button>
        </div>
      </div>

      {/* Fridge Door - rotates */}
      <div className={`${styles.fridgeDoor} ${isFridgeOpen ? styles.open : ''}`} onClick={handleClick}>
        <div className={styles.fridgeContent}>
          <div className={styles.fridgeHandleContainer}>
            <div className={styles.fridgeHandle} onClick={() => onFridgeToggle()} />
          </div>
          <div className={styles.magnetTextContainer}>
            <MagnetText text={t('fridgeMainText')} size="medium" />
          </div>
          <StickyNotes isDarkMode={isDarkMode} />
          <div className={`${styles.stickyNoteContainer} ${isFormOpen ? styles.hidden : ''}`}>
            <div onClick={handleNoteTaking} className={styles.stickyNote}>
              <div>{t('stickyNoteText')}</div>
            </div>
          </div>

          {/* Family Whiteboard */}
          <div className={styles.whiteboardContainer}>
            <FamilyWhiteboard isDarkMode={isDarkMode} />
          </div>
          <div className={styles.fridgeHighlightRight} />
        </div>
      </div>
    </section>
  );
}
