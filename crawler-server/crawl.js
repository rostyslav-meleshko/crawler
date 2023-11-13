import * as cheerio from 'cheerio'
import {
  spliceDeleteCount,
  spliceStartIndex,
  formatLinkToValidUrl,
  isUrlNeedToFetch,
  isCorrectResponseForParsing
} from './utils.js'
import {
  DEFAULT_REQUEST_TIMEOUT,
  MAX_REQUESTS_QUANTITY,
  REJECTED,
  FULFILLED
} from "./constants.js"

export const crawlSite = async (entryUrl) => {
  let visitedUrlsSet = new Set([])
  let notVisitedUrlsSet = new Set([entryUrl])
  let siteTimeout = 0

  while (notVisitedUrlsSet.size > 0) {
    const stackOfUrlsSet = [...notVisitedUrlsSet]
    console.log(`Alredy crawled ${visitedUrlsSet.size} urls`)
    console.log('Links remained to crawl ...', stackOfUrlsSet.length)

    const fetchingUrls = stackOfUrlsSet.splice(
      spliceStartIndex(stackOfUrlsSet, MAX_REQUESTS_QUANTITY),
      spliceDeleteCount(stackOfUrlsSet, MAX_REQUESTS_QUANTITY)
    )

    try {
      const fetchedUrlsResults = await Promise.allSettled(
        fetchingUrls.map((pageUrl, i) => crawlPage(pageUrl, visitedUrlsSet, i))
      )

      const rejectedRequests = fetchedUrlsResults.filter(el => el.status === REJECTED)
      const fulfilledRequests = fetchedUrlsResults.filter(el => el.status === FULFILLED)

      rejectedRequests.forEach(el => { 
        console.log('rejectedPromise reason', rejectedRequests.reason)
        console.log('rejectedPromise el', el)
      })

      fulfilledRequests.forEach(request => {
        if(request.value.timeout) {
          siteTimeout +=request.value.timeout
        } else {
          visitedUrlsSet.add(request.value.url)
          notVisitedUrlsSet = new Set([...notVisitedUrlsSet, ...request.value.newUrls])
          notVisitedUrlsSet.delete(request.value.url)
        }
      })

      if(siteTimeout) {
        console.warn(`Timeout = ${siteTimeout}, totalTime = ${siteTimeout / 1000} sec`)
        let timeoutId
        const pauseResult = await pauseCrawling(siteTimeout, timeoutId);
        clearTimeout(timeoutId);
        siteTimeout = 0
      }
    } catch (error) {
      console.error(`Unhandled error: ${error.message} : ${error}`)
    }
  }

  console.log(`Total ${visitedUrlsSet.size} urls crawled`)
  return [...visitedUrlsSet]
}

const crawlPage = async (url, visitedUrlsSet, index) => {
  console.log('crawling ...', index, url)
  const emptySet = new Set([])

  try {
    const res = await fetch(url, {headers: {'Cache-Control': 'no-cache, no-store'}})

    if(res.status === 429) {
      const retryTimeout = res.headers.get('Retry-After')
      console.error(429, index, 'retryTimeout', retryTimeout)
      return { url: url, newUrls: emptySet, timeout : retryTimeout ? Number(retryTimeout) : DEFAULT_REQUEST_TIMEOUT }
    }

    if(!isCorrectResponseForParsing(res)) {
      console.error(`HTML parse error at url - ${url} - ${res.status} - ${res.statusText}`)

      return {url: url, newUrls: emptySet}
    }

    const htmlBody = await res.text()

    if (htmlBody && typeof htmlBody === 'string') {
      const newUrlsSet = getUrlsFromHtml(htmlBody, url, visitedUrlsSet)
      return { url: url, newUrls: newUrlsSet }
    }

    return {url: url, newUrls: emptySet}
  } catch (error) {
    console.error('crawlPage', error.message)
  }
}

const getUrlsFromHtml = (html, currentUrl, visitedUrlsSet) => {
  const newUrlsSet = new Set([])

  const $ = cheerio.load(html)
  $('a').each((i, el) => {
    const parsedLink = $(el).attr('href')
    const newUrl = formatLinkToValidUrl(currentUrl, parsedLink)
    if(isUrlNeedToFetch(newUrl) && !visitedUrlsSet.has(newUrl)) {
      newUrlsSet.add(newUrl)
    } else {
      visitedUrlsSet.add(newUrl)
    }
  })

  return newUrlsSet
}

const pauseCrawling = (waitingTime, timeoutId) => {
  return new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      console.log(`Timeout is over. Continue...`);
      resolve();
    }, waitingTime);
  });
};
