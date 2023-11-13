import { NOT_VALID_URL_ENDINGS } from "./constants.js"

export const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch (err) {
    console.error(`Invalid url - ${url}`)
    return false
  }
}

export const isUrlNeedToFetch = (url) => {
  let shouldFetch = true

  for (let i = 0; i < NOT_VALID_URL_ENDINGS.length; i++) {
    const ending = NOT_VALID_URL_ENDINGS[i]

    if(url.endsWith(ending) || url.endsWith(ending + '/')) {
      shouldFetch = false
      break
    }
  }

  return shouldFetch
}

export const isCorrectResponseForParsing = (response) => {
  const contentType = response.headers.get('content-type') 
  return !response.ok 
    || !contentType
    || !contentType.includes('text/html') 
    || !contentType.includes('text/plain')
}

export const spliceStartIndex = (array, maxCount) => { 
  return array.length >= maxCount ? array.length - maxCount : 0
}

export const spliceDeleteCount = (array, maxCount) => {
  return array.length >= maxCount ? maxCount : array.length
}

export const formatLinkToValidUrl = (url, link) => {
  const urlObject = new URL(url)

  try {
    if(!link) {
      return urlObject.href
    }

    if(typeof link !== 'string') {
      return urlObject.href
    }

    if (link.startsWith('mailto:')
      || link.startsWith('tel:')
      || link.startsWith('#')
    ) {
      return urlObject.href
    }

    try {
      const normalizedUrl = new URL(link, url)
      if(urlObject.origin !== normalizedUrl.origin) {
        return urlObject.href
      } else {
        return normalizedUrl.href
      }
    } catch(err) {
      console.log(`not possible to normalize ${link}`)
      return urlObject.href
    }
  } catch(err) {
    console.error(`Uncaught error during link formatting ${link} - ${err.message}`)
    return urlObject.href
  }
}
