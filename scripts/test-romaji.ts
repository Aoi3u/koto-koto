import { checkRomaji } from '../src/lib/romaji';

const testCases = [
  { name: 'Basic Match', target: 'あ', input: 'a', expected: 'Match' },
  { name: 'Flexible Shi (shi)', target: 'し', input: 'shi', expected: 'Match' },
  { name: 'Flexible Shi (si)', target: 'し', input: 'si', expected: 'Match' },
  {
    name: 'Small Tsu (double con)',
    target: 'った',
    input: 't',
    expected: 'Match (creates double t)',
  },
  {
    name: 'Small Tsu (direct)',
    target: 'った',
    input: 'xtu',
    expected: 'Match',
  },
  {
    name: 'N Auto-commit (consonant)',
    target: 'んか',
    input: 'n',
    expected: 'Match',
  },
  {
    name: 'N Wait (vowel)',
    target: 'んあ',
    input: 'n',
    expected: 'No Match (Waiting)',
  },
  { name: 'N Double', target: 'ん', input: 'nn', expected: 'Match' },
];

console.log('Running Romaji Logic Tests...');
let failed = 0;

testCases.forEach(({ name, target, input, expected }) => {
  const result = checkRomaji(target, input);

  // Custom check for double consonant detail
  let pass = false;
  if (expected === 'Match') pass = !!result;
  else if (expected === 'No Match (Waiting)') pass = !result;
  else if (expected.includes('double t')) {
    pass = !!result && result.consumedTarget === 'っ';
  }

  if (pass) {
    console.log(`[PASS] ${name}: ${input} -> ${target}`);
  } else {
    console.log(`[FAIL] ${name}: ${input} -> ${target}. Got: ${JSON.stringify(result)}`);
    failed++;
  }
});

if (failed === 0) console.log('All tests passed!');
else console.log(`${failed} tests failed.`);
