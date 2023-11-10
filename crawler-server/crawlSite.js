import * as cheerio from 'cheerio'

export const crawlSite = async (entryUrl) => {
  console.log('crawlSite', entryUrl)

  const visitedLinks = new Set();
  const linksToVisit = [entryUrl];
  // TODO add link validation
  // TODO add logic to combine cutted link with its origin
  while (linksToVisit.length > 0) {
  console.log('crawlSite', 'while', linksToVisit.length)
    const currentUrl = linksToVisit.pop();
    // TODO add logic with timeout and server rejects
    try {
      const htmlToParse = await crawlPage(currentUrl)
      visitedLinks.add(currentUrl);

      if(htmlToParse && typeof htmlToParse === 'string') {
        const $ = cheerio.load(htmlToParse)

        $('a').each((i, el) => {
          const link = $(el).attr('href')
          if (link && !visitedLinks.has(link) && link.includes(currentUrl)) {
            //TODO add validation of cutted link, or mail/phone links, #
            linksToVisit.push(link)
          }
        })
      }
    } catch (error) {
      console.error(`Wrong HTML response at ${currentUrl}: ${error.message} : ${error}`);
    }
  }

  console.log('All links visisted', visitedLinks.size);
  return [...visitedLinks]
}

const crawlPage = async (url) => {
  console.log('crawlPage', url)
  try {
    const response = await fetch(url, {method: "GET", redirect: "follow", headers: {"Content-Type": "text/html"}})
      .then((res) => {
        if(!res.ok || !res.headers.get('content-type') || !res.headers.get('content-type').includes('text/html')) {
          console.log(`HTML parse error at url - ${url} - ${res.status} - ${res.statusText}`)
          throw new Error(`HTML parse error at url - ${url} - ${res.status} - ${res.statusText}`)
        }
        return res.text()
      })
      return response
  } catch (error) {
    console.error('crawlPage', error.message)
  }
}
