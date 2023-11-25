// scrape.js
const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('sleep-promise');

async function scrapeData(url, cssSelector) {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            // Use the provided CSS selector to find the desired elements
            const selectedElements = $(cssSelector);

            // Extract and print the text content of the selected elements
            selectedElements.each((index, element) => {
                console.log($(element).text().trim());
            });
        } else {
            console.log(`Failed to fetch data from ${url}`);
        }
    } catch (error) {
        console.error(`An error occurred while fetching data from ${url}: ${error.message}`);
    }
}

// Original code to extract links
const baseUrl = "https://geizhals.de/?cat=gra16_512&v=e&hloc=at&hloc=de&t=v&sort=p&bl1_id=30";

async function main() {
    try {
        const response = await axios.get(baseUrl);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            const linkElements = $('tr.xf_tr:nth-child(4) > td:nth-child(3) a');
            const extractedLinks = linkElements
                .filter((index, element) => !element.attribs.href.includes("NVIDIA+alt")
                    && !element.attribs.href.includes("AMD+alt")
                    && !element.attribs.href.includes("Professional")
                    && !element.attribs.href.includes("Matrox")
                    && !element.attribs.href.includes("Intel"))
                .map((index, element) => element.attribs.href.slice(2))
                .get();

            // CSS selector to extract data
            const cssSelector = "#product0 > div:nth-child(8) > span:nth-child(1) > span:nth-child(1)";

            // Loop through each URL and scrape data with a 5-second delay
            for (const urlFragment of extractedLinks) {
                const fullUrl = `https://geizhals.de/${urlFragment}`;
                console.log(`Scraping data from: ${fullUrl}`);
                
                await scrapeData(fullUrl, cssSelector);

                // Add a 5-second delay
                await sleep(5000);

                console.log("\n".padEnd(50, "=") + "\n");
            }
        } else {
            console.log(`Failed to retrieve the page. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

// Call the main function
main();
