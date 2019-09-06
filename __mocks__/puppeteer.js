const puppeteer = jest.genMockFromModule('puppeteer');

class Page {
  // async click(selector, options = {}) {
  //   console.log(`Clicked '${selector}' with options`, options);
  //   return Promise.resolve(
  //     `Clicked '${selector}' with options '${JSON.stringify(options)}'`
  //   );
  // }
}

class Browser {
  async newPage() {
    return new Page();
  }

  async close() {
    // console.log('Browser closed');
  }
}

puppeteer.launch.mockResolvedValue(new Browser());

module.exports = puppeteer;
