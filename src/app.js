import {
  MatrixError,
  determinant,
  elementary,
  formatNumber,
  inverse,
  luDecomposition,
  power,
  rank,
  rowEchelon,
  scalarMultiply,
  trace,
  transpose,
  triangular,
} from './core/matrix.js';
import { evaluateExpression, parseMatrix, stringifyMatrix } from './core/parser.js';
import { operations } from './ui/operations.js';

const menu = document.querySelector('#operation-menu');
const controls = document.querySelector('#dynamic-controls');
const matrixAInput = document.querySelector('#matrix-a');
const matrixBInput = document.querySelector('#matrix-b');
const runButton = document.querySelector('#run-operation');
const resultArea = document.querySelector('#result');
const errorArea = document.querySelector('#error');

let selectedOperation = operations[0].key;

function createMenu() {
  operations.forEach((operation, index) => {
    const button = document.createElement('button');
    button.className = 'menu-item';
    button.textContent = operation.label;
    button.dataset.operation = operation.key;
    if (index === 0) button.classList.add('active');

    button.addEventListener('click', () => {
      selectedOperation = operation.key;
      document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderControls(operation.needs);
      clearMessages();
    });

    menu.appendChild(button);
  });
}

function renderControls(type) {
  controls.innerHTML = '';

  if (type === 'power') {
    controls.innerHTML = `
      <label>Степень
        <input id="power-input" type="number" step="1" value="2" />
      </label>
    `;
  }

  if (type === 'scalar') {
    controls.innerHTML = `
      <label>Коэффициент
        <input id="scalar-input" type="number" step="any" value="2" />
      </label>
    `;
  }

  if (type === 'elementary') {
    controls.innerHTML = `
      <label>Тип преобразования
        <select id="elementary-type">
          <option value="swap">Поменять местами строки i и j</option>
          <option value="scale">Умножить строку i на k</option>
          <option value="add">Прибавить к строке i строку j * k</option>
        </select>
      </label>
      <label>i (номер строки, начиная с 1)
        <input id="row-i" type="number" min="1" value="1" />
      </label>
      <label>j (для swap/add)
        <input id="row-j" type="number" min="1" value="2" />
      </label>
      <label>k (для scale/add)
        <input id="factor" type="number" step="any" value="1" />
      </label>
    `;
  }

  if (type === 'expression') {
    controls.innerHTML = `
      <label>Выражение (матрицы A и B, операторы + - *)
        <input id="expression-input" type="text" value="A*B + A" />
      </label>
    `;
  }
}

function clearMessages() {
  errorArea.textContent = '';
  resultArea.textContent = '';
}

function setError(message) {
  errorArea.textContent = message;
  resultArea.textContent = '';
}

function setResult(value) {
  resultArea.textContent = value;
  errorArea.textContent = '';
}

function matrixFromInput(input, name) {
  return parseMatrix(input.value, name);
}

function runOperation() {
  clearMessages();

  try {
    const A = matrixFromInput(matrixAInput, 'Матрица A');
    let output;

    switch (selectedOperation) {
      case 'determinant':
        output = `det(A) = ${formatNumber(determinant(A))}`;
        break;
      case 'transpose':
        output = stringifyMatrix(transpose(A), formatNumber);
        break;
      case 'rank':
        output = `rank(A) = ${rank(A)}`;
        break;
      case 'trace':
        output = `tr(A) = ${formatNumber(trace(A))}`;
        break;
      case 'power': {
        const exponent = Number(document.querySelector('#power-input')?.value);
        output = stringifyMatrix(power(A, exponent), formatNumber);
        break;
      }
      case 'scalar': {
        const scalar = Number(document.querySelector('#scalar-input')?.value);
        output = stringifyMatrix(scalarMultiply(A, scalar), formatNumber);
        break;
      }
      case 'inverse':
        output = stringifyMatrix(inverse(A), formatNumber);
        break;
      case 'triangular':
        output = stringifyMatrix(triangular(A), formatNumber);
        break;
      case 'echelon':
        output = stringifyMatrix(rowEchelon(A), formatNumber);
        break;
      case 'lu': {
        const { L, U } = luDecomposition(A);
        output = `L:\n${stringifyMatrix(L, formatNumber)}\n\nU:\n${stringifyMatrix(U, formatNumber)}`;
        break;
      }
      case 'elementary': {
        const op = document.querySelector('#elementary-type')?.value;
        const i = Number(document.querySelector('#row-i')?.value) - 1;
        const j = Number(document.querySelector('#row-j')?.value) - 1;
        const factor = Number(document.querySelector('#factor')?.value);
        if (i < 0 || i >= A.length || j < 0 || j >= A.length) {
          throw new MatrixError('Индексы строк выходят за границы матрицы');
        }
        output = stringifyMatrix(elementary(A, op, { i, j, factor }), formatNumber);
        break;
      }
      case 'expression': {
        const B = matrixFromInput(matrixBInput, 'Матрица B');
        const expression = document.querySelector('#expression-input')?.value || '';
        const result = evaluateExpression(expression, { A, B });
        output = stringifyMatrix(result, formatNumber);
        break;
      }
      default:
        throw new MatrixError('Операция не поддерживается');
    }

    setResult(output);
  } catch (error) {
    if (error instanceof MatrixError) {
      setError(error.message);
    } else {
      setError('Неожиданная ошибка. Проверьте формат входных данных.');
    }
  }
}

createMenu();
renderControls();
runButton.addEventListener('click', runOperation);
