// 상수
const TOTAL_QUESTIONS = 114;
const QUESTIONS_PER_SESSION = 10;
const QUESTIONS_PATH = './questions/';
const ANSWERS_PATH = './answers/';

// 상태
let currentQuestionNumber = null;
let isShowingAnswer = false;
let questionQueue = []; // 현재 세션의 문제 번호 목록
let currentQuestionIndex = 0; // 현재 문제의 인덱스 (0부터 시작)

// DOM 요소
const quizImage = document.getElementById('quizImage');
const loadingState = document.getElementById('loadingState');
const errorMessage = document.getElementById('errorMessage');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const questionNumberDisplay = document.getElementById('questionNumber');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');

/**
 * 랜덤 문제 번호 생성 (1~114)
 */
function getRandomQuestionNumber() {
  return Math.floor(Math.random() * TOTAL_QUESTIONS) + 1;
}

/**
 * 중복 없는 랜덤 문제 목록 생성
 */
function generateQuestionQueue() {
  const queue = [];
  const used = new Set();
  
  while (queue.length < QUESTIONS_PER_SESSION) {
    const num = getRandomQuestionNumber();
    if (!used.has(num)) {
      used.add(num);
      queue.push(num);
    }
  }
  
  return queue;
}

/**
 * 이미지 경로 생성 (cache buster 포함)
 */
function getImagePath(folder, number) {
  const timestamp = Date.now();
  return `${folder}${number}.png?v=${timestamp}`;
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('error--hidden');
}

/**
 * 에러 메시지 숨김
 */
function hideError() {
  errorMessage.classList.add('error--hidden');
  errorMessage.textContent = '';
}

/**
 * 로딩 상태 표시
 */
function showLoading() {
  loadingState.classList.remove('loading-state--hidden');
  quizImage.style.display = 'none';
  showAnswerBtn.disabled = true;
}

/**
 * 로딩 상태 숨김
 */
function hideLoading() {
  loadingState.classList.add('loading-state--hidden');
  quizImage.style.display = 'block';
  showAnswerBtn.disabled = false;
}

/**
 * 문제 번호 표시 업데이트
 */
function updateQuestionNumberDisplay() {
  const currentNum = currentQuestionIndex + 1;
  questionNumberDisplay.textContent = `${currentNum} of ${QUESTIONS_PER_SESSION}`;
}

/**
 * 다음 문제 버튼 업데이트
 */
function updateNextButton() {
  const isLastQuestion = currentQuestionIndex >= QUESTIONS_PER_SESSION - 1;
  
  if (isLastQuestion) {
    nextQuestionBtn.textContent = '홈으로 돌아가기';
    nextQuestionBtn.className = 'btn btn--secondary';
  } else {
    nextQuestionBtn.textContent = '다음 문제';
    nextQuestionBtn.className = 'btn btn--primary';
  }
}

/**
 * 이미지 로드 (Promise 기반)
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`이미지 로딩 실패: ${src}`));
    img.src = src;
  });
}

/**
 * 문제 이미지 로드 및 표시
 */
async function loadQuestion(questionNumber) {
  try {
    showLoading();
    hideError();
    
    const imagePath = getImagePath(QUESTIONS_PATH, questionNumber);
    
    // 이미지 미리 로드
    await loadImage(imagePath);
    
    // 성공 시 이미지 표시
    quizImage.src = imagePath;
    quizImage.alt = `문제 ${questionNumber}`;
    currentQuestionNumber = questionNumber;
    isShowingAnswer = false;
    
    updateQuestionNumberDisplay();
    updateNextButton();
    hideLoading();
    
  } catch (error) {
    hideLoading();
    showError(`문제 이미지를 불러올 수 없습니다.\n경로: ${QUESTIONS_PATH}${questionNumber}.png\n\n파일이 존재하는지 확인해주세요.`);
    console.error('Question load error:', error);
  }
}

/**
 * 정답 이미지로 교체
 */
async function showAnswer() {
  if (!currentQuestionNumber || isShowingAnswer) {
    return;
  }
  
  try {
    showAnswerBtn.disabled = true;
    hideError();
    
    const answerPath = getImagePath(ANSWERS_PATH, currentQuestionNumber);
    
    // 정답 이미지 미리 로드
    await loadImage(answerPath);
    
    // 성공 시 이미지 교체
    quizImage.src = answerPath;
    quizImage.alt = `정답 ${currentQuestionNumber}`;
    isShowingAnswer = true;
    
    // 버튼 텍스트 변경
    showAnswerBtn.textContent = '정답 표시 중';
    showAnswerBtn.disabled = false;
    
  } catch (error) {
    showError(`정답 이미지를 불러올 수 없습니다.\n경로: ${ANSWERS_PATH}${currentQuestionNumber}.png\n\n파일이 존재하는지 확인해주세요.`);
    showAnswerBtn.disabled = false;
    console.error('Answer load error:', error);
  }
}

/**
 * 다음 문제로 이동 또는 홈으로 이동
 */
function nextQuestion() {
  // 마지막 문제인 경우 홈으로 이동
  if (currentQuestionIndex >= QUESTIONS_PER_SESSION - 1) {
    goHome();
    return;
  }
  
  // 버튼 텍스트 초기화
  showAnswerBtn.textContent = '정답 보기';
  
  // 다음 문제 인덱스로 이동
  currentQuestionIndex++;
  
  // 큐에서 다음 문제 번호 가져오기
  const nextQuestionNumber = questionQueue[currentQuestionIndex];
  loadQuestion(nextQuestionNumber);
}

/**
 * 홈으로 이동
 */
function goHome() {
  window.location.href = 'index.html';
}

/**
 * 페이지 초기화
 */
function init() {
  // 문제 큐 생성
  questionQueue = generateQuestionQueue();
  currentQuestionIndex = 0;
  
  // 첫 문제 로드
  const firstQuestion = questionQueue[currentQuestionIndex];
  loadQuestion(firstQuestion);
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}