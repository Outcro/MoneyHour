addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  /**
   * Respond to the request with a plain‑text Hello World.
   * @param {Request} request
   */
  async function handleRequest(request) {
    return new Response(calculateVanquishedGlowstoneGauntlet(data), {
      status: 200,
      headers: { "Content-Type": "text/plain;charset=UTF-8" }
    })
  }
  