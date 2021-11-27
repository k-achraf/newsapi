const express = require('express')
const axios = require('axios')
const convert = require('xml-js')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

const services = [
    {
        name: "BBC",
        link: "http://feeds.bbci.co.uk/news/rss.xml"
    },
    {
        name: "CNN",
        link: "http://rss.cnn.com/rss/edition.rss"
    },
    {
        name: "Guardian",
        link: "https://www.theguardian.com/world/rss"
    },
    {
        name: "The new york times",
        link: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
    },
    {
        name: "SMH",
        link: "https://www.smh.com.au/rss/feed.xml"
    },
    {
        name: "The sun daily",
        link: "https://www.thesundaily.my/rss/home"
    },
    {
        name: "United nation",
        link: "https://news.un.org/feed/subscribe/en/news/all/rss.xml"
    },
    {
        name: "Sky news",
        link: "https://feeds.skynews.com/feeds/rss/home.xml"
    }
]

const news = []

services.forEach((service) => {
    axios.get(service.link)
        .then((response) => {
            const data = convert.xml2js(response.data, {compact: true})
            const items = data.rss.channel.item

            items.forEach((item) => {

                if(item.description != null && item.pubDate != null){
                    news.push({
                        title: item.title._cdata || item.title._text,
                        description: item.description._cdata || item.description._text,
                        link: item.link._text,
                        date: item.pubDate._text,
                        service: service.name
                    })
                }
            })
        })
})

app.get('/news',async (req, res) => {
    res.json(news)
})

app.get('/news/service/:serviceId', async (req, res) => {
    const serviceId = req.params.serviceId

    if(serviceId < 0 || serviceId > services.length - 1){
        res.json("Now service by this id")
    }
    else{
        const service = services[serviceId]

        const response = await axios.get(service.link)

        const data = convert.xml2js(response.data, {compact: true})
        const items = data.rss.channel.item

        const serviceNews = []
        items.forEach((item) => {

            if(item.description != null && item.pubDate != null){
                serviceNews.push({
                    title: item.title._cdata || item.title._text,
                    description: item.description._cdata || item.description._text,
                    link: item.link._text,
                    date: item.pubDate._text,
                    service: service.name
                })
            }
        })

        res.json(serviceNews)
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
