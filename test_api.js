
async function testAPI() {
  try {
    const res = await fetch('http://localhost:3000/api/jobs/fetch', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Fetch Status:', res.status);
    const data = await res.json().catch(() => ({}));
    console.log('Fetch Data:', data);

    const res2 = await fetch('http://localhost:3000/api/jobs?tab=feed&q=test');
    console.log('Jobs Status:', res2.status);
    const data2 = await res2.json().catch(() => ({}));
    console.log('Jobs Data Keys:', Object.keys(data2));
  } catch (e) {
    console.error('Test failed:', e);
  }
}

testAPI();
