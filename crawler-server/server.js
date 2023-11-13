import express from 'express'
import { crawlSite } from './crawl.js'
import { isValidURL } from './utils.js'

const host = 'localhost'
const port = 8000

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
    res.status(400).json({error: 'Invalid body'})
    return
  }

  if(!isValidURL(body.path)){
    res.status(400).json({error: 'Invalid URL'})
    return
  }

  try {
    const crawledLinks = await crawlSite(body.path)
    res.status(200).json({data: crawledLinks})
  } catch (error) {
    res.status(500).json({error: `Unhandled error: ${error.message}`})
    return
  }
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
});