import { useState } from "react"

export const useCrawler = () => {
  const [isCrawling, setIsCrawling] = useState(false)
  const [data, setData] = useState<null | string[]>(null)
  const [error, setError] = useState<null | string>(null)

  let catchedError: Error

  const crawlSite = async (url: string) => {
    try {
      setIsCrawling(true)
      setData(null)
      setError(null)

      const body = JSON.stringify({path: url})

      const response = await fetch(
        'http://localhost:8000/crawl',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body
        }).then(resp => resp.json())

        if(response.error) {
          setError(response.error)
        }
  
        if(response.data) {
          setData(response.data)
        }
    } catch (e) {
      catchedError = e as Error
    } finally {
      if(catchedError) {
        setError(catchedError.toString())
      }
      setIsCrawling(false)
    }
  }

  return {isCrawling, data, error, crawlSite}
}