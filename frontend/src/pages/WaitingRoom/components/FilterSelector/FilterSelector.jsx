/* eslint-disable */
import React, { useState } from 'react';
import styles from './FilterSelector.module.css';
import useVideoEffectsStore from '../../../../stores/videoEffectsStore';
import { VIDEO_FILTERS } from '../../../../utils/videoFilters';

const FilterSelector = () => {
  const { selectedFilter, setSelectedFilter } = useVideoEffectsStore();
  const [showAllFilters, setShowAllFilters] = useState(false);

  // 필터 변경
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    // /* console.log('🎨 필터 변경:', filter.name); */
  };

  return (
    <div className={styles.settingCard}>
      <h3 className={styles.cardTitle}>필터</h3>
      <div className={styles.filtersGrid}>
        {(showAllFilters ? VIDEO_FILTERS : VIDEO_FILTERS.slice(0, 4)).map(
          (filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter)}
              className={`${styles.filterButton} ${selectedFilter?.id === filter.id ? styles.active : ''}`}
            >
              <span className={styles.filterIcon}>{filter.preview}</span>
              <span className={styles.filterName}>{filter.name}</span>
            </button>
          )
        )}
      </div>
      {VIDEO_FILTERS.length > 4 && (
        <div className={styles.moreFilters}>
          {!showAllFilters ? (
            <span
              className={styles.moreText}
              onClick={() => setShowAllFilters(true)}
              style={{ cursor: 'pointer' }}
            >
              +{VIDEO_FILTERS.length - 4}개 더
            </span>
          ) : (
            <span
              className={styles.moreText}
              onClick={() => setShowAllFilters(false)}
              style={{ cursor: 'pointer' }}
            >
              접기 ▲
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSelector;
