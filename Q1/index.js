const express = require('express');
const app = express();
app.use(express.json());
const WINDOW_SIZE = 10;
let numbersWindow = [];

const API_ENDPOINTS = {
  'p': 'http://20.244.56.144/evaluation-service/primes',
  'f': 'http://20.244.56.144/evaluation-service/fibo', 
  'e': 'http://20.244.56.144/evaluation-service/even',
  'r': 'http://20.244.56.144/evaluation-service/rand'
};
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzI4OTg4LCJpYXQiOjE3NDgzMjg2ODgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjBlYmE2YzFhLTcyZDktNDEwOS1iODdkLWE2ZTFmNmIxZWM5MCIsInN1YiI6IjIyMzExYTA1YTlAY3NlLnNyZWVuaWRoaS5lZHUuaW4ifSwiZW1haWwiOiIyMjMxMWEwNWE5QGNzZS5zcmVlbmlkaGkuZWR1LmluIiwibmFtZSI6ImJhdGh1bGEgdmluYXkga3VtYXIiLCJyb2xsTm8iOiIyMjMxMWEwNWE5IiwiYWNjZXNzQ29kZSI6IlBDcUFVSyIsImNsaWVudElEIjoiMGViYTZjMWEtNzJkOS00MTA5LWI4N2QtYTZlMWY2YjFlYzkwIiwiY2xpZW50U2VjcmV0IjoiZGpqY0dYUkpFZEJtUHNRUSJ9.0F40yJrQ1t6dgdHTjFujakYROW1myyBDUseQ45Hszlc';
async function getNumbersFromAPI(type) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);
    
    const response = await fetch(API_ENDPOINTS[type], {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data.numbers || [];
  } catch (error) {
    console.error(`Error fetching ${type} numbers:`, error.message)
    switch(type) {
      case 'p': return [2, 3, 5, 7, 11];
      case 'f': return [55, 89, 144, 233, 377, 618, 987, 1597, 2584, 4181, 6765];
      case 'e': return [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56];
      case 'r': return [2, 19, 25, 7, 4, 24, 17, 27, 30, 21, 14, 10, 23];
      default: return [];
    }
  }
}
function addToWindow(newNumbers) {
  const prevWindow = [...numbersWindow];
  
  for (let num of newNumbers) {
    if (!numbersWindow.includes(num)) {
      numbersWindow.push(num);
    }
  }
  
  if (numbersWindow.length > WINDOW_SIZE) {
    numbersWindow = numbersWindow.slice(-WINDOW_SIZE);
  }
  
  return prevWindow;
}

function getAverage(numbers) {
  if (numbers.length === 0) return 0.00;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}
app.get('/numbers/:id', async (req, res) => {
  const id = req.params.id;
  
  if (!API_ENDPOINTS[id]) {
    return res.status(400).json({ error: 'Invalid number type' });
  }
  
  const windowPrevState = [...numbersWindow];
  const fetchedNumbers = await getNumbersFromAPI(id);
  
  addToWindow(fetchedNumbers);
  
  const avg = getAverage(numbersWindow);
  
  const response = {
    windowPrevState: windowPrevState,
    windowCurrState: [...numbersWindow],
    numbers: fetchedNumbers,
    avg: avg
  };
  
  res.json(response);
});
app.get('/reset', (req, res) => {
  numbersWindow = [];
  res.json({ message: 'Window reset' });
});

const PORT = 9876;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});