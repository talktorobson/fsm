const { chromium } = require('playwright');

async function testLogin() {
  console.log('Starting login test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    console.log('\n1. Navigating to http://135.181.96.93/...');
    await page.goto('http://135.181.96.93/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   Current URL:', page.url());
    console.log('   Page title:', await page.title());
    
    await page.screenshot({ path: '/tmp/1-initial-page.png' });
    console.log('   Screenshot saved: /tmp/1-initial-page.png');
    
    console.log('\n2. Checking page content...');
    
    // Check if there's a "Use Email & Password" button to click first
    try {
      const emailPasswordLink = page.getByText('Use Email & Password');
      if (await emailPasswordLink.count() > 0) {
        console.log('   Found "Use Email & Password" link, clicking...');
        await emailPasswordLink.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/tmp/2-after-click.png' });
        console.log('   Screenshot saved: /tmp/2-after-click.png');
      }
    } catch (e) {
      console.log('   No email/password toggle found:', e.message);
    }
    
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log('   Email input found:', !!emailInput);
    console.log('   Password input found:', !!passwordInput);
    console.log('   Submit button found:', !!submitButton);
    
    if (emailInput && passwordInput) {
      console.log('\n3. Attempting login...');
      await emailInput.fill('admin@yellowgrid.com');
      await passwordInput.fill('admin123');
      
      await page.screenshot({ path: '/tmp/2-filled-form.png' });
      console.log('   Screenshot saved: /tmp/2-filled-form.png');
      
      if (submitButton) {
        const responsePromise = page.waitForResponse(
          resp => resp.url().includes('/api/') && resp.request().method() === 'POST', 
          { timeout: 10000 }
        ).catch(() => null);
        
        await submitButton.click();
        const response = await responsePromise;
        
        if (response) {
          console.log('   Login API response:');
          console.log('     URL:', response.url());
          console.log('     Status:', response.status());
          const body = await response.json().catch(() => 'not JSON');
          console.log('     Body:', JSON.stringify(body, null, 2).substring(0, 800));
        } else {
          console.log('   No API response captured');
        }
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/tmp/3-after-login.png' });
        console.log('   URL after login:', page.url());
      }
    } else {
      const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 1000));
      console.log('   Page text:', bodyText);
    }
    
    console.log('\n4. Checking for visible errors...');
    const errors = await page.$$eval('.error, [role="alert"], .text-red-500', els => 
      els.map(e => e.textContent?.trim()).filter(Boolean)
    );
    errors.forEach(e => console.log('   Error:', e));
    
  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
  
  console.log('\nTest complete!');
}

testLogin().catch(console.error);
