const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhoneX = devices['iPhone X'];

(async () => {
  let browser
  try {
    browser = await puppeteer.launch({
      args: ['--remote-debugging-port=9222'],
      // devtools: true,
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
  const page = await browser.newPage();
  await page.emulate(iPhoneX);
  await page.goto('https://baidu.com');
  const client = await page.target().createCDPSession();
  // await client.send('Animation.enable');
  await client.send('DOM.enable')
  await client.send('Inspector.enable')
  await client.send('Overlay.enable');
  await client.send('Overlay.setInspectMode', {
    mode: 'searchForUAShadowDOM',
    highlightConfig: {}
  })
  
  client.on('Overlay.inspectNodeRequested', (e) => {
    console.log('Overlay.inspectNodeRequested', e)
  })

  client.on('Overlay.nodeHighlightRequested', (e) => {
    console.log('Overlay.nodeHighlightRequested', e)
  })
  // client.on('Animation.animationCreated', () => console.log('Animation created!'));
  // const response = await client.send('Animation.getPlaybackRate');
  // console.log('playback rate is ' + response.playbackRate);
  // await client.send('Animation.setPlaybackRate', {
  //   playbackRate: response.playbackRate / 2
  // });
  // await page.screenshot({ path: 'example.png' });

  // await browser.close();
})();