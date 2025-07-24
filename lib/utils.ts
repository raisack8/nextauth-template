// アメリカンな名前生成用の配列
const firstNames = [
  'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Hunter',
  'Jamie', 'Kelly', 'Logan', 'Morgan', 'Nico', 'Parker', 'Quinn', 'River',
  'Sage', 'Taylor', 'Avery', 'Bailey', 'Cameron', 'Dakota', 'Eden', 'Frankie',
  'Haven', 'Indigo', 'Jordan', 'Kendall', 'Lane', 'Mason', 'Nova', 'Ocean'
]

const lastNames = [
  'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Martinez',
  'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams'
]

export function generateRandomUsername(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const number = Math.floor(Math.random() * 999) + 1 // 1-999の範囲
  return `${firstName}${lastName}${number}`
} 