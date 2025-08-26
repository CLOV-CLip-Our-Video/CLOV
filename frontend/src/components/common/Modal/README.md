# 모달 컴포넌트 사용법

기존 방식 (완전히 호환됨)
```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
   <h2 className="text-lg font-bold mb-2">모달 제목</h2>
   <p>이곳에 내용을 넣으세요.</p>
</Modal>
```

새로운 방식:
```jsx
<Modal 
   isOpen={showModal} 
   onClose={() => setShowModal(false)}
   title="모달 제목"
   size="large"
   footer={<Button onClick={onSave}>저장</Button>}
  >
  <p>이곳에 내용을 넣으세요.</p>
</Modal>
```