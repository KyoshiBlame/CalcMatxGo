const EPS = 1e-10;

export class MatrixError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MatrixError';
  }
}

export function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

export function validateMatrix(matrix, name = 'Матрица') {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new MatrixError(`${name}: пустая матрица`);
  }
  const cols = matrix[0]?.length;
  if (!cols) {
    throw new MatrixError(`${name}: нет столбцов`);
  }
  matrix.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new MatrixError(`${name}: строка ${i + 1} имеет неверную длину`);
    }
    row.forEach((value) => {
      if (!Number.isFinite(value)) {
        throw new MatrixError(`${name}: содержит нечисловые значения`);
      }
    });
  });
  return true;
}

export function shape(matrix) {
  return [matrix.length, matrix[0].length];
}

export function isSquare(matrix) {
  const [rows, cols] = shape(matrix);
  return rows === cols;
}

export function add(a, b) {
  validateMatrix(a, 'A');
  validateMatrix(b, 'B');
  const [ra, ca] = shape(a);
  const [rb, cb] = shape(b);
  if (ra !== rb || ca !== cb) {
    throw new MatrixError('Сложение: размеры матриц должны совпадать');
  }
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

export function subtract(a, b) {
  validateMatrix(a, 'A');
  validateMatrix(b, 'B');
  const [ra, ca] = shape(a);
  const [rb, cb] = shape(b);
  if (ra !== rb || ca !== cb) {
    throw new MatrixError('Вычитание: размеры матриц должны совпадать');
  }
  return a.map((row, i) => row.map((value, j) => value - b[i][j]));
}

export function multiply(a, b) {
  validateMatrix(a, 'A');
  validateMatrix(b, 'B');
  const [ra, ca] = shape(a);
  const [rb, cb] = shape(b);
  if (ca !== rb) {
    throw new MatrixError('Умножение: число столбцов A должно равняться числу строк B');
  }
  const result = Array.from({ length: ra }, () => Array(cb).fill(0));
  for (let i = 0; i < ra; i += 1) {
    for (let k = 0; k < ca; k += 1) {
      const aik = a[i][k];
      for (let j = 0; j < cb; j += 1) {
        result[i][j] += aik * b[k][j];
      }
    }
  }
  return result;
}

export function scalarMultiply(matrix, scalar) {
  validateMatrix(matrix);
  if (!Number.isFinite(scalar)) {
    throw new MatrixError('Коэффициент должен быть числом');
  }
  return matrix.map((row) => row.map((value) => value * scalar));
}

export function transpose(matrix) {
  validateMatrix(matrix);
  const [rows, cols] = shape(matrix);
  return Array.from({ length: cols }, (_, j) =>
    Array.from({ length: rows }, (_, i) => matrix[i][j]),
  );
}

export function trace(matrix) {
  validateMatrix(matrix);
  if (!isSquare(matrix)) {
    throw new MatrixError('След определён только для квадратной матрицы');
  }
  return matrix.reduce((sum, row, i) => sum + row[i], 0);
}

function pivotize(matrix, startRow, column) {
  let pivotRow = startRow;
  let max = Math.abs(matrix[startRow][column]);
  for (let i = startRow + 1; i < matrix.length; i += 1) {
    const value = Math.abs(matrix[i][column]);
    if (value > max) {
      max = value;
      pivotRow = i;
    }
  }
  return pivotRow;
}

export function determinant(matrix) {
  validateMatrix(matrix);
  if (!isSquare(matrix)) {
    throw new MatrixError('Определитель определён только для квадратной матрицы');
  }
  const n = matrix.length;
  const m = cloneMatrix(matrix);
  let det = 1;
  let sign = 1;

  for (let col = 0; col < n; col += 1) {
    const pivotRow = pivotize(m, col, col);
    if (Math.abs(m[pivotRow][col]) < EPS) {
      return 0;
    }
    if (pivotRow !== col) {
      [m[pivotRow], m[col]] = [m[col], m[pivotRow]];
      sign *= -1;
    }
    const pivot = m[col][col];
    det *= pivot;

    for (let row = col + 1; row < n; row += 1) {
      const factor = m[row][col] / pivot;
      for (let j = col; j < n; j += 1) {
        m[row][j] -= factor * m[col][j];
      }
    }
  }

  return det * sign;
}

export function rank(matrix) {
  validateMatrix(matrix);
  const m = cloneMatrix(matrix);
  const rows = m.length;
  const cols = m[0].length;
  let rankValue = 0;
  let row = 0;

  for (let col = 0; col < cols && row < rows; col += 1) {
    let pivot = row;
    for (let i = row + 1; i < rows; i += 1) {
      if (Math.abs(m[i][col]) > Math.abs(m[pivot][col])) {
        pivot = i;
      }
    }

    if (Math.abs(m[pivot][col]) < EPS) {
      continue;
    }

    if (pivot !== row) {
      [m[pivot], m[row]] = [m[row], m[pivot]];
    }

    const pivotVal = m[row][col];
    for (let j = col; j < cols; j += 1) {
      m[row][j] /= pivotVal;
    }

    for (let i = 0; i < rows; i += 1) {
      if (i === row) continue;
      const factor = m[i][col];
      for (let j = col; j < cols; j += 1) {
        m[i][j] -= factor * m[row][j];
      }
    }

    row += 1;
    rankValue += 1;
  }

  return rankValue;
}

export function rowEchelon(matrix) {
  validateMatrix(matrix);
  const m = cloneMatrix(matrix);
  const rows = m.length;
  const cols = m[0].length;
  let lead = 0;

  for (let r = 0; r < rows; r += 1) {
    if (lead >= cols) {
      break;
    }
    let i = r;
    while (Math.abs(m[i][lead]) < EPS) {
      i += 1;
      if (i === rows) {
        i = r;
        lead += 1;
        if (lead === cols) {
          return m;
        }
      }
    }

    [m[i], m[r]] = [m[r], m[i]];
    const divisor = m[r][lead];
    if (Math.abs(divisor) > EPS) {
      for (let j = 0; j < cols; j += 1) {
        m[r][j] /= divisor;
      }
    }

    for (let k = r + 1; k < rows; k += 1) {
      const factor = m[k][lead];
      for (let j = 0; j < cols; j += 1) {
        m[k][j] -= factor * m[r][j];
      }
    }
    lead += 1;
  }

  return m;
}

export function triangular(matrix) {
  validateMatrix(matrix);
  if (!isSquare(matrix)) {
    throw new MatrixError('Треугольный вид доступен только для квадратной матрицы');
  }
  const m = cloneMatrix(matrix);
  const n = m.length;

  for (let col = 0; col < n; col += 1) {
    const pivotRow = pivotize(m, col, col);
    if (Math.abs(m[pivotRow][col]) < EPS) continue;
    if (pivotRow !== col) {
      [m[pivotRow], m[col]] = [m[col], m[pivotRow]];
    }

    for (let row = col + 1; row < n; row += 1) {
      const factor = m[row][col] / m[col][col];
      for (let j = col; j < n; j += 1) {
        m[row][j] -= factor * m[col][j];
      }
    }
  }

  return m;
}

export function inverse(matrix) {
  validateMatrix(matrix);
  if (!isSquare(matrix)) {
    throw new MatrixError('Обратная матрица существует только для квадратной матрицы');
  }
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col += 1) {
    const pivotRow = pivotize(augmented, col, col);
    if (Math.abs(augmented[pivotRow][col]) < EPS) {
      throw new MatrixError('Матрица вырождена, обратной не существует');
    }
    if (pivotRow !== col) {
      [augmented[pivotRow], augmented[col]] = [augmented[col], augmented[pivotRow]];
    }

    const pivot = augmented[col][col];
    for (let j = 0; j < 2 * n; j += 1) {
      augmented[col][j] /= pivot;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = 0; j < 2 * n; j += 1) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  return augmented.map((row) => row.slice(n));
}

export function power(matrix, exponent) {
  validateMatrix(matrix);
  if (!isSquare(matrix)) {
    throw new MatrixError('Возведение в степень доступно только для квадратной матрицы');
  }
  if (!Number.isInteger(exponent)) {
    throw new MatrixError('Степень должна быть целым числом');
  }

  if (exponent === 0) {
    return identity(matrix.length);
  }

  if (exponent < 0) {
    return power(inverse(matrix), -exponent);
  }

  let result = identity(matrix.length);
  let base = cloneMatrix(matrix);
  let exp = exponent;

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = multiply(result, base);
    }
    base = multiply(base, base);
    exp = Math.floor(exp / 2);
  }

  return result;
}

export function luDecomposition(matrix) {
  validateMatrix(matrix);
  if (!isSquare(matrix)) {
    throw new MatrixError('LU-разложение доступно только для квадратной матрицы');
  }
  const n = matrix.length;
  const L = identity(n);
  const U = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i += 1) {
    for (let k = i; k < n; k += 1) {
      let sum = 0;
      for (let j = 0; j < i; j += 1) {
        sum += L[i][j] * U[j][k];
      }
      U[i][k] = matrix[i][k] - sum;
    }

    if (Math.abs(U[i][i]) < EPS) {
      throw new MatrixError('LU-разложение невозможно без перестановок (нулевой ведущий элемент)');
    }

    for (let k = i + 1; k < n; k += 1) {
      let sum = 0;
      for (let j = 0; j < i; j += 1) {
        sum += L[k][j] * U[j][i];
      }
      L[k][i] = (matrix[k][i] - sum) / U[i][i];
    }
  }

  return { L, U };
}

export function elementary(matrix, operation, params) {
  validateMatrix(matrix);
  const m = cloneMatrix(matrix);
  const { i, j, factor } = params;

  switch (operation) {
    case 'swap':
      if (i === j) return m;
      [m[i], m[j]] = [m[j], m[i]];
      return m;
    case 'scale':
      m[i] = m[i].map((value) => value * factor);
      return m;
    case 'add':
      m[i] = m[i].map((value, col) => value + factor * m[j][col]);
      return m;
    default:
      throw new MatrixError('Неизвестное элементарное преобразование');
  }
}

export function identity(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

export function formatNumber(value) {
  if (Math.abs(value) < EPS) return '0';
  const rounded = Number(value.toFixed(8));
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
}
