  export default async function handler(req, res) {
    const { code } = req.query
    if (!code) return res.status(400).json({ error: 'No code' })

    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      })
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.ok) return res.status(400).json({ error: tokenData.error })

    const userToken = tokenData.authed_user?.access_token
    const identityRes = await fetch('https://slack.com/api/users.identity', {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    const identity = await identityRes.json()
    console.log('identity response:', JSON.stringify(identity))

    if (!identity.ok) return res.status(400).json({ error: identity.error })

    const params = new URLSearchParams({
      name:   identity.user.name,
      email:  identity.user.email,
      avatar: identity.user.image_48,
      id:     identity.user.id,
    })

    res.setHeader('Content-Type', 'text/html')
    res.send(`<html><head><meta http-equiv="refresh" content="0;url=pushhub://auth?${params}"></head>
      <body style="font-family:sans-serif;padding:40px">
        <p>Logger inn i Push Hub...</p>
        <p><a href="pushhub://auth?${params}">Klikk her</a> hvis ingenting skjer.</p>
      </body></html>`)
  }
