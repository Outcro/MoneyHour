addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  /**
   * Respond to the request with a plain‑text Hello World.
   * @param {Request} request
   */
  async function handleRequest(request) {
    return new Response("👋 Hello, Outcro!", {
      status: 200,
      headers: { "Content-Type": "text/plain;charset=UTF-8" }
    })
  }
  