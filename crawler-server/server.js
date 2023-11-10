import express from 'express'
import { crawlSite } from './crawlSite.js';

const host = 'localhost';
const port = 8000;

const server = express()

server.options('/crawl', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.sendStatus(200)
})

server.post('/crawl', express.json(), async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  const body = req.body

  if(!body.path) {
    res.sendStatus(404)
  } else { 
  try {
    // crawlSite = main js function, that returns array of the links
        // => getHTML = function, which calls the link and returns the html from this link (if error with the HTML, proceed to the next link, mark link as visited)
        // => collectLinksFromHTML = function, which parse html file and collect links from the Html and return collection of the links
            // 
            // checkLinkValidity = function, which checks if link correct
            // modifyNestedLink = function, wich merge nested link with domain
        // loop or recursion, which goes thru the collected links, and checking is all links were visted
      const crawledLinks = await crawlSite(body.path)
      res.send(JSON.stringify(crawledLinks))
  } catch (error) {
    console.log(1, error)
    res.sendStatus(404)
    res.send(JSON.stringify(error))
  }
  }
})

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});