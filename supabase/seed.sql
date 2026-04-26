-- Revelo 큐레이션 문장 초기 데이터
-- Supabase SQL Editor에서 schema.sql 실행 후 이 파일을 실행하세요.

insert into sentences (content, language, is_curated, source_title, source_author, translation) values

-- ─── 영어 필사 (en) ───────────────────────────────
(
  'We accept the love we think we deserve.',
  'en', true,
  'The Perks of Being a Wallflower',
  'Stephen Chbosky',
  '우리는 우리가 받을 자격이 있다고 생각하는 사랑을 받아들인다.'
),
(
  'So we beat on, boats against the current, borne back ceaselessly into the past.',
  'en', true,
  'The Great Gatsby',
  'F. Scott Fitzgerald',
  '그렇게 우리는 물결을 거슬러 나아가는 배처럼, 쉼 없이 과거 속으로 떠밀려 가면서도 계속 앞으로 나아간다.'
),
(
  'Not all those who wander are lost.',
  'en', true,
  'The Fellowship of the Ring',
  'J.R.R. Tolkien',
  '방랑하는 자가 모두 길을 잃은 것은 아니다.'
),
(
  'The only way out of the labyrinth of suffering is to forgive.',
  'en', true,
  'Looking for Alaska',
  'John Green',
  '고통의 미로에서 빠져나오는 유일한 방법은 용서하는 것이다.'
),
(
  'I am not afraid of storms, for I am learning how to sail my ship.',
  'en', true,
  'Little Women',
  'Louisa May Alcott',
  '나는 폭풍이 두렵지 않아요. 내 배를 어떻게 조종하는지 배우고 있으니까요.'
),
(
  'To love at all is to be vulnerable.',
  'en', true,
  'The Four Loves',
  'C.S. Lewis',
  '사랑한다는 것은 곧 상처받을 수 있다는 것이다.'
),
(
  'It does not do to dwell on dreams and forget to live.',
  'en', true,
  'Harry Potter and the Philosopher''s Stone',
  'J.K. Rowling',
  '꿈에만 빠져 살아가는 것을 잊는 건 좋지 않단다.'
),
(
  'There is no friend as loyal as a book.',
  'en', true,
  'A Farewell to Arms',
  'Ernest Hemingway',
  '책만큼 충실한 친구는 없다.'
),
(
  'You have to be odd to be number one.',
  'en', true,
  'Seuss-isms',
  'Dr. Seuss',
  '일등이 되려면 남달라야 한다.'
),
(
  'It is never too late to be what you might have been.',
  'en', true,
  'Middlemarch',
  'George Eliot',
  '당신이 될 수도 있었던 존재가 되기에 결코 늦지 않았다.'
),
(
  'In the middle of difficulty lies opportunity.',
  'en', true,
  'Essays',
  'Albert Einstein',
  '어려움 속에 기회가 있다.'
),
(
  'We are all of us stars, and we deserve to twinkle.',
  'en', true,
  'Insignificance',
  'Marilyn Monroe',
  '우리는 모두 별이고, 반짝일 자격이 있다.'
),

-- ─── 한국어 독서 필사 (ko) ──────────────────────────
(
  '시간은 우리가 생각하는 것보다 훨씬 빠르게 흐른다.',
  'ko', true,
  '아몬드',
  '손원평',
  null
),
(
  '행복은 강도가 아니라 빈도다.',
  'ko', true,
  '프레임',
  '최인철',
  null
),
(
  '슬픔도 힘이 된다는 것을.',
  'ko', true,
  '그 많던 싱아는 누가 다 먹었을까',
  '박완서',
  null
),
(
  '사람은 누구나 자기만의 이야기가 있다.',
  'ko', true,
  '시선으로부터,',
  '정세랑',
  null
),
(
  '읽는다는 것은 또 하나의 삶을 사는 일이다.',
  'ko', true,
  '책읽기의 즐거움',
  '정진홍',
  null
),
(
  '우리가 사랑이라고 부르는 것은 실은 기억이다.',
  'ko', true,
  '82년생 김지영',
  '조남주',
  null
),
(
  '삶이 아름다운 것은 끝이 있기 때문이다.',
  'ko', true,
  '도가니',
  '공지영',
  null
),
(
  '모든 경계에는 꽃이 핀다.',
  'ko', true,
  '모든 경계에는 꽃이 핀다',
  '함민복',
  null
),
(
  '나는 내가 만든 사람이 아니다. 나를 만든 건 내가 읽은 책들이다.',
  'ko', true,
  '책이라는 세계',
  '이권우',
  null
),
(
  '어떤 상처는 흔적을 남기지 않는다. 그러나 그것이 없었던 일이 되지는 않는다.',
  'ko', true,
  '채식주의자',
  '한강',
  null
),
(
  '인생은 가까이서 보면 비극이고 멀리서 보면 희극이다.',
  'ko', true,
  '상실의 시대',
  '무라카미 하루키',
  null
),
(
  '좋은 문장을 만나는 일은 좋은 사람을 만나는 일과 같다.',
  'ko', true,
  '글쓰기의 최전선',
  '은유',
  null
);
