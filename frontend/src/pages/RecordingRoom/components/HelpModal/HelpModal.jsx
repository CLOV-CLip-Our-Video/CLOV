/* eslint-disable */
import Modal from '../../../../components/common/Modal/Modal';
import Button from '../../../../components/common/Button/Button';
import AlienIcon from '../../../../assets/SVG/alien-face-icon.svg';
import styles from './HelpModal.module.css';
import useViewport from '../../../../hooks/useViewport';

const HelpModal = ({ isOpen, onClose }) => {
  const { isMobile } = useViewport();

  const mobileControls = [
    { action: '터치 드래그', description: '캔버스에서 자신의 캠 위치 이동' },
    { action: '슬라이더 조작', description: '하단 패널에서 투명도, 크기, 회전 정밀 조절' },
  ];

  const interfaceGuide = [
    { action: '사진 버튼', description: '현재 화면을 사진으로 촬영' },
    { action: '영상 버튼', description: '영상 녹화 시작/중지' },
    { action: '필터 메뉴', description: '배경 효과 및 필터 선택' },
    { action: '참가자 목록', description: '위로 드래그하여 참가자 목록 확인' },
  ];

  const desktopControls = [
    { action: '마우스 드래그', description: '캔버스에서 자신의 캠 위치 이동' },
    { action: '우하단 핸들', description: '캠 크기 조절 (Shift + 드래그로 회전)' },
    { action: '슬라이더 조작', description: '오른쪽 패널에서 투명도, 크기, 회전 정밀 조절' },
  ];

  const keyboardShortcuts = [
    { keys: 'H / ←', description: '캠을 왼쪽으로 이동' },
    { keys: 'L / →', description: '캠을 오른쪽으로 이동' },
    { keys: 'K / ↑', description: '캠을 위로 이동' },
    { keys: 'J / ↓', description: '캠을 아래로 이동' },
    { keys: 'Q', description: '캠 크기 축소' },
    { keys: 'W', description: '캠 크기 확대' },
    { keys: 'E', description: '캠을 반시계방향으로 회전' },
    { keys: 'R', description: '캠을 시계방향으로 회전' },
    { keys: 'D', description: '투명도 감소' },
    { keys: 'F', description: '투명도 증가' },
  ];

  const renderMobileContent = () => (
    <>
      {/* 터치 조작 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <img src={AlienIcon} alt="Alien Icon" className={styles.alienIcon} />
          터치 조작
        </h3>
        <div className={styles.shortcutList}>
          {mobileControls.map((control, index) => (
            <div key={index} className={styles.shortcutItem}>
              <div className={styles.keys}>
                {control.action}
              </div>
              <div className={styles.description}>
                {control.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 인터페이스 가이드 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <img src={AlienIcon} alt="Alien Icon" className={styles.alienIcon} />
          버튼 가이드
        </h3>
        <div className={styles.shortcutList}>
          {interfaceGuide.map((guide, index) => (
            <div key={index} className={styles.shortcutItem}>
              <div className={styles.keys}>
                {guide.action}
              </div>
              <div className={styles.description}>
                {guide.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 팁 섹션 */}
      <section className={styles.section}>
        <div className={styles.tipBox}>
          <h4 className={styles.tipTitle}>팁</h4>
          <p className={styles.tipText}>
            캔버스에서 자신의 캠을 터치하여 선택한 후 드래그나 제스처로 조작할 수 있습니다.
            <br />
            하단 패널의 슬라이더로 더 정밀한 조정이 가능하며, 참가자 목록을 위로 드래그하면 더 많은 정보를 볼 수 있습니다.
          </p>
        </div>
      </section>
    </>
  );

  const renderDesktopContent = () => (
    <>
      {/* 마우스 조작 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <img src={AlienIcon} alt="Alien Icon" className={styles.alienIcon} />
          마우스 조작
        </h3>
        <div className={styles.shortcutList}>
          {desktopControls.map((control, index) => (
            <div key={index} className={styles.shortcutItem}>
              <div className={styles.keys}>
                {control.action}
              </div>
              <div className={styles.description}>
                {control.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 키보드 단축키 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <img src={AlienIcon} alt="Alien Icon" className={styles.alienIcon} />
          키보드 단축키
        </h3>
        <div className={styles.shortcutList}>
          {keyboardShortcuts.map((shortcut, index) => (
            <div key={index} className={styles.shortcutItem}>
              <div className={styles.keys}>
                {shortcut.keys}
              </div>
              <div className={styles.description}>
                {shortcut.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 인터페이스 가이드 섹션 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <img src={AlienIcon} alt="Alien Icon" className={styles.alienIcon} />
          버튼 가이드
        </h3>
        <div className={styles.shortcutList}>
          {interfaceGuide.map((guide, index) => (
            <div key={index} className={styles.shortcutItem}>
              <div className={styles.keys}>
                {guide.action}
              </div>
              <div className={styles.description}>
                {guide.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 팁 섹션 */}
      <section className={styles.section}>
        <div className={styles.tipBox}>
          <h4 className={styles.tipTitle}>팁</h4>
          <p className={styles.tipText}>
            캔버스에서 자신의 캠을 클릭하여 선택한 후 드래그로 이동할 수 있습니다.
            <br />
            우하단 모서리를 드래그하여 크기를 조절하고, Shift 키를 누른 채로 드래그하면 회전할 수 있습니다.
            <br />
            키보드 단축키를 사용하면 더 빠르고 정밀한 조작이 가능합니다.
          </p>
        </div>
      </section>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMobile ? "모바일 사용법 안내" : "데스크톱 사용법 안내"}
      size="large"
      className={styles.helpModal}
    >
      <div className={styles.content}>
        {isMobile ? renderMobileContent() : renderDesktopContent()}
      </div>

      {/* 하단 버튼 */}
      <div className={styles.footer}>
        <Button
          variant={Button.Variants.PRIMARY}
          size={Button.Sizes.MEDIUM}
          onClick={onClose}
          className={styles.closeButton}
        >
          확인
        </Button>
      </div>
    </Modal>
  );
};

export default HelpModal;
