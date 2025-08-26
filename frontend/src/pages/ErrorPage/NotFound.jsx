/* eslint-disable */
const NotFound = () => {
  return (
    <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)',
      textAlign: 'center',
      padding: '20px',
    }}
  >
    <h1
      style={{
        fontSize: '4rem',
        margin: '0',
        color: 'var(--color-primary-darker)',
      }}
    >
      404
    </h1>
    <h2 style={{ color: 'var(--color-text)' }}>페이지를 찾을 수 없습니다</h2>
    <button
      style={{
        backgroundColor: 'var(--color-button-background)',
        color: 'var(--color-button-text)',
        border: 'none',
        padding: '12px 24px',
        borderRadius: 'var(--border-radius-medium)',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px',
      }}
      onClick={() => (window.location.href = '/')}
    >
      홈으로 가기
    </button>
  </div>
  )
};

export default NotFound;