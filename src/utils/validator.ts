import { RunResult, ValidationResult } from '../types';

export function validateTask(taskId: number, runResult: RunResult, code: string): ValidationResult {
  const { output, error } = runResult;
  const trimmedOutput = output.trim();
  const outputLines = output.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // If there was a Python runtime/syntax error
  if (error) {
    let advice = 'Внимательно посмотри на текст ошибки выше.';

    if (error.includes('IndentationError')) {
      advice = '💡 Ошибка отступа! В начале строки есть лишние пробелы. Сотри пробелы перед словом print или используй кнопку «Убрать отступ».';
    } else if (error.includes('SyntaxError') && (error.includes('Missing parentheses') || code.includes('print "'))) {
      advice = '💡 В Python 3 функции print нужны круглые скобки: print("текст"). Добавь открывающую скобку ( после print и закрывающую ) в конце.';
    } else if (error.includes('SyntaxError') && (code.includes('print(How do you do?)') || !code.includes('"') && !code.includes("'"))) {
      advice = '💡 Текст внутри скобок нужно взять в кавычки! Например: print("How do you do?"). Без кавычек Python думает, что это неизвестная команда.';
    } else if (error.includes('NameError')) {
      if (error.includes("'A'") || code.includes('print(A')) {
        advice = '💡 Переменная называется с маленькой буквы `a`, а в print ты написал большую `A`. Замени `A` на маленькую `a`!';
      } else {
        advice = '💡 Python не знает такое имя переменной. Проверь, как она объявлена выше!';
      }
    }

    return {
      isSuccess: false,
      message: 'Программа завершилась с ошибкой! Но не расстраивайся, ошибки делают нас сильнее 💪',
      kidAdvice: advice,
      actualOutput: error
    };
  }

  // Task-specific checks
  switch (taskId) {
    case 1: {
      const target = 'How do you do?';
      if (trimmedOutput === target) {
        return {
          isSuccess: true,
          message: 'Супер! Ты починил кавычки и поздоровался по-английски! 🌟'
        };
      }
      if (trimmedOutput.toLowerCase() === target.toLowerCase()) {
        return {
          isSuccess: false,
          message: 'Почти получилось! Обрати внимание на регистр букв: "How do you do?"',
          expectedOutput: target,
          actualOutput: trimmedOutput
        };
      }
      return {
        isSuccess: false,
        message: 'Программа сработала, но вывела не тот текст!',
        kidAdvice: 'Нужно напечатать ровно: How do you do?',
        expectedOutput: target,
        actualOutput: trimmedOutput
      };
    }

    case 2: {
      const target = 'Hello, world!';
      if (trimmedOutput === target) {
        return {
          isSuccess: true,
          message: 'Ура! Ты исправил и отступы, и регистр переменной! Настоящий сыщик багов 🕵️‍♂️'
        };
      }
      return {
        isSuccess: false,
        message: 'Программа должна вывести: Hello, world!',
        kidAdvice: 'Проверь, чтобы первая переменная была a, вторая b, и выводилось print(a + b).',
        expectedOutput: target,
        actualOutput: trimmedOutput
      };
    }

    case 3: {
      const expectedLines = ['Hello', 'What is your name?', 'I am Python!'];
      const isMatch =
        outputLines.length === 3 &&
        outputLines[0] === expectedLines[0] &&
        outputLines[1] === expectedLines[1] &&
        outputLines[2] === expectedLines[2];

      if (isMatch) {
        return {
          isSuccess: true,
          message: 'Отлично! Теперь все три функции print работают в современном Python 3! 🚀'
        };
      }
      return {
        isSuccess: false,
        message: 'Нужно, чтобы программа вывела все 3 строчки без ошибок.',
        kidAdvice: 'Оберни каждый текст в круглые скобочки: print("...")',
        expectedOutput: expectedLines.join('\n'),
        actualOutput: trimmedOutput
      };
    }

    case 4: {
      // Dolphin ASCII picture: 13 lines
      if (outputLines.length >= 10 && (output.includes('***') || output.includes('**'))) {
        return {
          isSuccess: true,
          message: 'Невероятно! Ты выровнял все 13 строчек и спас волшебного пиксельного дельфина! 🐬🎉'
        };
      }
      return {
        isSuccess: false,
        message: 'Рисунок ещё не совсем готов.',
        kidAdvice: 'Убедись, что перед каждым словом print убраны все лишние пробелы, а сам рисунок внутри кавычек не изменён.',
        expectedOutput: '13 строк с рисунком дельфина',
        actualOutput: trimmedOutput || '(нет вывода)'
      };
    }

    case 5: {
      const target = 'Hello, world!';
      if (trimmedOutput === target) {
        return {
          isSuccess: true,
          message: 'УРА! Твоя первая настоящая самостоятельная программа! Добро пожаловать в мир IT! 🌍✨'
        };
      }
      if (trimmedOutput.replace(/[!,.]/g, '').toLowerCase() === 'hello world') {
        return {
          isSuccess: false,
          message: 'Очень близко! Не забудь запятую после Hello и восклицательный знак: Hello, world!',
          expectedOutput: target,
          actualOutput: trimmedOutput
        };
      }
      return {
        isSuccess: false,
        message: 'Программа должна напечатать: Hello, world!',
        kidAdvice: 'Напиши строчку: print("Hello, world!")',
        expectedOutput: target,
        actualOutput: trimmedOutput
      };
    }

    case 6: {
      const targetWord = 'Привет!';
      const count = outputLines.filter((l) => l === targetWord).length;

      if (count === 3 && outputLines.length === 3) {
        return {
          isSuccess: true,
          message: 'Привет-привет-привет! Отличная работа, три строки напечатаны идеально! 👋👋👋'
        };
      }

      if (count > 0 && count !== 3) {
        return {
          isSuccess: false,
          message: `Слово "Привет!" напечатано ${count} раз(а), а в задании просили ровно 3 раза!`,
          kidAdvice: 'Напиши ровно три вызова: print("Привет!")',
          expectedOutput: 'Привет!\nПривет!\nПривет!',
          actualOutput: trimmedOutput
        };
      }

      return {
        isSuccess: false,
        message: 'Программа должна вывести "Привет!" три раза, каждую с новой строки.',
        kidAdvice: 'Проверь написание слова и восклицательный знак: print("Привет!")',
        expectedOutput: 'Привет!\nПривет!\nПривет!',
        actualOutput: trimmedOutput
      };
    }

    case 7: {
      const line1 = "That's all.";
      const line2 = "I'll be back!";

      if (outputLines.length >= 2 && outputLines[0] === line1 && outputLines[1] === line2) {
        return {
          isSuccess: true,
          message: 'Блестяще! Ты победил ловушку с апострофами и правильно применил двойные кавычки! 🏆'
        };
      }

      return {
        isSuccess: false,
        message: 'Программа должна вывести 2 строчки: That\'s all. и I\'ll be back!',
        kidAdvice: 'Используй двойные кавычки снаружи: print("That\'s all.") и print("I\'ll be back!")',
        expectedOutput: `${line1}\n${line2}`,
        actualOutput: trimmedOutput
      };
    }

    case 8: {
      if (trimmedOutput.length > 0) {
        return {
          isSuccess: true,
          message: 'Потрясающе! Твоя собственная программа работает и творит чудеса! Ты настоящий программист! 🎨🚀'
        };
      }
      return {
        isSuccess: false,
        message: 'Программа запустилась, но ничего не вывела на экран.',
        kidAdvice: 'Добавь хотя бы одну команду print("..."), чтобы увидеть результат своей работы!',
        expectedOutput: 'Любой напечатанный текст или рисунок',
        actualOutput: '(пусто)'
      };
    }

    default:
      return {
        isSuccess: true,
        message: 'Задание выполнено!'
      };
  }
}
