import './App.css'
import { useState } from 'react'
import { useCrawler } from './hooks/useCrawler'

function App() {
  const [crawlInput, setCrawlInput] = useState<string>('')
  const {crawlSite, data, error, isCrawling} = useCrawler()

  return (
    <div className='app'>
      <div className='crawling-bar'>
        <input
          type="text"
          name="crawlInput"
          placeholder="Enter the URL"
          disabled={isCrawling}
          value={crawlInput}
          onChange={(e) => setCrawlInput(e.target.value)}
          onKeyUp={(e) => {
            if(e.key === 'Enter') {
              crawlSite(crawlInput.trim())
            }
          }
        }/>

        <button 
          disabled={!crawlInput.trim() || isCrawling} 
          onClick={() => crawlSite(crawlInput.trim())}
        >
          CRAWL ME!
        </button>
      </div>
      
      <div className='content'>
        {isCrawling && <div className='loader'><span>...loading</span></div>}
        {error && <div className='error'><span>Ooops, error: {error}</span></div>}
        {data && 
          <div className='crawled-items-list'>
            <ul>
              {data.map(el => (
                <li key={el}>
                  <a href={el} target='_blank'>{el}</a>
                </li>
              ))}
            </ul>
          </div>
        }
      </div>
    </div>
  )
}

export default App
