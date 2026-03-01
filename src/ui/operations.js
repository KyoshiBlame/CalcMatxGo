export const operations = [
  { key: 'determinant', label: 'Определитель' },
  { key: 'transpose', label: 'Транспонировать' },
  { key: 'rank', label: 'Ранг' },
  { key: 'trace', label: 'След' },
  { key: 'power', label: 'Возвести в степень', needs: 'power' },
  { key: 'scalar', label: 'Умножить на число', needs: 'scalar' },
  { key: 'inverse', label: 'Обратная' },
  { key: 'triangular', label: 'Треугольный вид' },
  { key: 'echelon', label: 'Ступенчатый вид' },
  { key: 'lu', label: 'LU разложение' },
  { key: 'elementary', label: 'Элементарные преобразования', needs: 'elementary' },
  { key: 'expression', label: 'Вычислить выражение', needs: 'expression' },
];
