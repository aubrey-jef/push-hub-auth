  export default async function handler(req, res) {
    const { code } = req.query
    if (!code) return res.status(400).json({ error: 'No code' })

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      })
    })

    const data = await response.json()
    if (!data.ok) return res.status(400).json({ error: data.error })

    const token = data.authed_user?.access_token
    const id = data.authed_user?.id

    res.redirect(`http://localhost:7676/callback?token=${token}&id=${id}`)
  }
