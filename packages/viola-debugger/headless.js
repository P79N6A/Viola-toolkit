const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhoneX = devices['iPhone X'];

(async () => {
  let browser
  try {
    browser = await puppeteer.launch({
      args: ['--remote-debugging-port=9222'],
      defaultViewport: {
        width: 1000,
        height: 800,
        isMobile: true,
        hasTouch: true
      }
   });
  } catch (e) {
    console.error(e)
  }
  // console.log("browser", browser)
  const page = await browser.newPage();
  // console.log("page", page)
  console.log(browser.wsEndpoint())
  // await page.emulate(iPhoneX);
  await page.goto('https://baidu.com');

  console.log(browser.wsEndpoint())
  console.log(page.target())
})();