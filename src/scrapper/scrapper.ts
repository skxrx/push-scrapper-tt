const { chromium } = require('playwright')
const fs = require('fs')
const { Command } = require('nest-commander')

@Command({ name: 'Scrape', options: { isDefault: true } })
export class Scrapper {
  async scrape() {
    const context = await chromium.launchPersistentContext('./data', {
      headless: false,
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-background-networking',
      ],
      permissions: ['notifications'],
    })

    const page = await context.pages()[0]

    await page.bringToFront()

    await page.goto('https://gauntface.github.io/simple-push-demo/', {
      waitUntil: 'networkidle',
    })

    await page.waitForSelector(
      'body > div > div > main > div.push-switch-container.js-push-switch-container > label'
    )
    await page.waitForTimeout(1500)
    await page.evaluate(() => {
      const subscribeBtn: HTMLElement = document.querySelector(
        'div.push-switch-container.js-push-switch-container > label'
      ) as HTMLElement

      if (subscribeBtn.className.includes('is-checked')) return
      if (subscribeBtn) subscribeBtn.click()
      else throw new Error("Can't click on subscribe btn")
    })

    await page.waitForSelector(
      'div.content-overlap-wrapper > div.send-push-options.js-send-push-options > p.center.js-xhr-button-container > button > span'
    )
    await page.waitForTimeout(3000)

    const data = await page.evaluate(async () => {
      const sendBtn: HTMLElement = document.querySelector(
        'div.content-overlap-wrapper > div.send-push-options.js-send-push-options > p.center.js-xhr-button-container > button > span'
      ) as HTMLElement
      if (sendBtn) sendBtn.click()
      else throw new Error("Can't click on send btn")

      await new Promise((resolve) => setTimeout(resolve, 15000))

      const notifications = await navigator.serviceWorker.ready.then((reg) =>
        reg.getNotifications().then((not) => not)
      )

      const notification = notifications[notifications.length - 1]
      console.log(notification)

      return {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        dir: notification.dir,
        icon: notification.icon,
        lang: notification.lang,
        tag: notification.tag,
      }
    })

    console.log(data)

    fs.writeFile('notifications.json', JSON.stringify(data), (err) => {
      if (err) console.log(err)
      else {
        console.log('File written successfully\n')
        console.log('The written has the following contents:')
        console.log(fs.readFileSync('notifications.json', 'utf8'))
      }
    })
  }
}
