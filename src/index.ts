import * as core from '@actions/core'
import * as github from '@actions/github'

function collectData() {
  const webhookUrl = core.getInput('webhook_url', { required: true, trimWhitespace: true })
  const payload = github.context.payload.release

  return {
    webhookUrl,
    releaseBody: payload.body,
    releaseUrl: payload.html_url,
    downloadLink: payload.assets?.[0]?.browser_download_url
  }
}

function createEmbed(body: string, url: string, downloadLink: string) {
  return [
    {
      description: body,
      url: url,
      fields: downloadLink && downloadLink.length ? [
        {
          name: 'Download',
          value: `[Download this version](${downloadLink})`
        }
      ] : []
    }
  ]
}

function sendWebhook(url: string, body: string) {
  fetch(`${url}?wait=true`, {
    method: 'post',
    body,
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.text())
    .then(data => core.info(data))
    .catch(err => core.error(err))
}

async function main() {
  const { webhookUrl, releaseBody, releaseUrl, downloadLink } = collectData()
  const embeds = createEmbed(releaseBody, releaseUrl, downloadLink)
  return sendWebhook(webhookUrl, JSON.stringify({ embeds }))
}

main()
  .then(() => core.info('Action completed successfully'))
  .catch(error => core.setFailed(error.message))
