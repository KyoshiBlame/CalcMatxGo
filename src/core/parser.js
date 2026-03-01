import { MatrixError, add, multiply, subtract } from './matrix.js';

export function parseMatrix(text, name = 'Матрица') {
  const rows = text
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).map(Number));

  if (rows.length === 0) {
    throw new MatrixError(`${name} не задана`);
  }

  const cols = rows[0].length;
  if (cols === 0) {
    throw new MatrixError(`${name}: нет столбцов`);
  }

  rows.forEach((row, index) => {
    if (row.length !== cols) {
      throw new MatrixError(`${name}: строка ${index + 1} имеет другую длину`);
    }
    row.forEach((value) => {
      if (!Number.isFinite(value)) {
        throw new MatrixError(`${name}: неверный формат числа`);
      }
    });
  });

  return rows;
}

export function stringifyMatrix(matrix, formatter) {
  return matrix.map((row) => row.map((value) => formatter(value)).join('\t')).join('\n');
}

const PRECEDENCE = { '+': 1, '-': 1, '*': 2 };

function tokenize(expr) {
  const tokens = expr.match(/[A-Z]+|[()+\-*]/g);
  if (!tokens) {
    throw new MatrixError('Выражение пустое или содержит недопустимые символы');
  }
  return tokens;
}

function toRpn(tokens) {
  const output = [];
  const operators = [];

  tokens.forEach((token) => {
    if (/^[A-Z]+$/.test(token)) {
      output.push(token);
      return;
    }

    if (token in PRECEDENCE) {
      while (
        operators.length &&
        operators[operators.length - 1] in PRECEDENCE &&
        PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[token]
      ) {
        output.push(operators.pop());
      }
      operators.push(token);
      return;
    }

    if (token === '(') {
      operators.push(token);
      return;
    }

    if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        output.push(operators.pop());
      }
      if (!operators.length) {
        throw new MatrixError('Несогласованные скобки в выражении');
      }
      operators.pop();
    }
  });

  while (operators.length) {
    const op = operators.pop();
    if (op === '(') {
      throw new MatrixError('Несогласованные скобки в выражении');
    }
    output.push(op);
  }

  return output;
}

export function evaluateExpression(expression, matrices) {
  const tokens = tokenize(expression.replace(/\s+/g, ''));
  const rpn = toRpn(tokens);
  const stack = [];

  rpn.forEach((token) => {
    if (/^[A-Z]+$/.test(token)) {
      if (!matrices[token]) {
        throw new MatrixError(`Матрица ${token} не задана`);
      }
      stack.push(matrices[token]);
      return;
    }

    const b = stack.pop();
    const a = stack.pop();
    if (!a || !b) {
      throw new MatrixError('Некорректное выражение');
    }

    switch (token) {
      case '+':
        stack.push(add(a, b));
        break;
      case '-':
        stack.push(subtract(a, b));
        break;
      case '*':
        stack.push(multiply(a, b));
        break;
      default:
        throw new MatrixError(`Неизвестный оператор ${token}`);
    }
  });

  if (stack.length !== 1) {
    throw new MatrixError('Некорректное выражение');
  }

  return stack[0];
}
