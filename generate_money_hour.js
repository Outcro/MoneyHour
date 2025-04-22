// generate_money_hour.js
import { fetchCofl, fetchNeu, fetchBazaar, combineData } from './prices.js';
import * as MathFns from './Math.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest())
})

async function handleRequest() {
  // 1) fetch all APIs in parallel
  const [cofl, neu, bazaar] = await Promise.all([
    fetchCofl(),
    fetchNeu(),
    fetchBazaar()
  ])

  // 2) combine into one `prices` object
  const prices = combineData(cofl, neu, bazaar)

  // 3) discover & call every exported calculateXYZ function
  const output = {}
  for (const key of Object.keys(MathFns)) {
    if (key.startsWith('calculate') && typeof MathFns[key] === 'function') {
      try {
        output[key] = MathFns[key](prices)
      } catch (e) {
        output[key] = `ERROR: ${e.message}`
      }
    }
  }

  // 4) reply with JSON
  return new Response(JSON.stringify(output, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}
