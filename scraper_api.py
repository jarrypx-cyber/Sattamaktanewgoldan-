import re
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes so your React app can fetch data directly
CORS(app)

TARGET_MARKETS = {
    "KALYAN": "KALYAN",
    "TIME BAZAR": "TIME BAZAR",
    "MILAN DAY": "MILAN DAY"
}

def scrape_dpboss():
    url = "https://dpboss.net/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1"
    }

    results = {}
    # Initialize dictionary with placeholder structure
    for key in TARGET_MARKETS:
        results[key] = {
            "name": TARGET_MARKETS[key],
            "openPana": "???",
            "openSingle": "?",
            "closeSingle": "?",
            "closePana": "???",
            "full_result": "???-??-???"
        }

    try:
        # Fetch the webpage
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return results, False

        soup = BeautifulSoup(response.text, "html.parser")

        # DPBoss results are typically in styled cards/divs with titles inside <h4>, <h5> or similar,
        # or inside a parent container with class containing "set" or "satta-result".
        # Let's search all divs to locate our target markets.
        # Often they are inside containers like <div class="satta-result"> or tables.
        
        # Method 1: Find all elements containing text or headers matching the target markets
        all_blocks = soup.find_all(["div", "h4", "h5", "h3", "p", "span"])
        
        for element in all_blocks:
            text = element.get_text().upper().strip()
            # If we find a heading or container with a target market name
            for market_key, market_name in TARGET_MARKETS.items():
                if market_name in text:
                    # Look at parent or sibling elements to extract the result pattern like "123-45-678" or "123-45"
                    parent = element.parent
                    parent_text = parent.get_text() if parent else ""
                    
                    # Regex to find Satta-style patterns: 3 digits, hyphen, 1-2 digits, hyphen, 3 digits
                    # Example: 145-05-230 or 234-59-990
                    match = re.search(r"(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{3})", parent_text)
                    if not match:
                        # Try broader search on siblings
                        sibling_text = ""
                        if element.next_sibling:
                            sibling_text += str(element.next_sibling)
                        if element.find_next():
                            sibling_text += element.find_next().get_text()
                        match = re.search(r"(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{3})", sibling_text)
                    
                    if match:
                        open_pana = match.group(1)
                        jodi = match.group(2)
                        close_pana = match.group(3)
                        
                        results[market_key] = {
                            "name": market_name,
                            "openPana": open_pana,
                            "openSingle": jodi[0] if len(jodi) > 0 else "?",
                            "closeSingle": jodi[1] if len(jodi) > 1 else "?",
                            "closePana": close_pana,
                            "full_result": f"{open_pana}-{jodi}-{close_pana}"
                        }
        
        # Verify if we extracted at least some valid results. If not, parse with common fallback selectors
        success = any(res["openPana"] != "???" for res in results.values())
        
        # Method 2 fallback: Check if there's table rows containing results
        if not success:
            for row in soup.find_all("tr"):
                row_text = row.get_text().upper()
                for market_key, market_name in TARGET_MARKETS.items():
                    if market_name in row_text:
                        match = re.search(r"(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{3})", row_text)
                        if match:
                            open_pana = match.group(1)
                            jodi = match.group(2)
                            close_pana = match.group(3)
                            results[market_key] = {
                                "name": market_name,
                                "openPana": open_pana,
                                "openSingle": jodi[0] if len(jodi) > 0 else "?",
                                "closeSingle": jodi[1] if len(jodi) > 1 else "?",
                                "closePana": close_pana,
                                "full_result": f"{open_pana}-{jodi}-{close_pana}"
                            }
            success = any(res["openPana"] != "???" for res in results.values())

        return results, success

    except Exception as e:
        print(f"Scraping exception occurred: {str(e)}")
        return results, False

@app.route("/api/results", methods=["GET"])
def get_scraped_results():
    scraped_data, success = scrape_dpboss()
    
    # Elegant fallback values if scraping was blocked (e.g., Cloudflare) or if layout changed
    if not success:
        # Provide clean mock values formatted realistically so your frontend never crashes
        fallback_data = {
            "KALYAN": {
                "name": "KALYAN",
                "openPana": "234",
                "openSingle": "5",
                "closeSingle": "9",
                "closePana": "990",
                "full_result": "234-59-990"
            },
            "TIME BAZAR": {
                "name": "TIME BAZAR",
                "openPana": "235",
                "openSingle": "0",
                "closeSingle": "9",
                "closePana": "388",
                "full_result": "235-09-388"
            },
            "MILAN DAY": {
                "name": "MILAN DAY",
                "openPana": "349",
                "openSingle": "6",
                "closeSingle": "1",
                "closePana": "128",
                "full_result": "349-61-128"
            }
        }
        return jsonify({
            "status": "fallback",
            "source": "DPBoss (Protected/Simulated)",
            "data": fallback_data
        })

    return jsonify({
        "status": "success",
        "source": "DPBoss Live Scraper",
        "data": scraped_data
    })

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "DPBoss Live Scraper API is running!",
        "endpoints": {
            "/api/results": "Get live scraped results for Kalyan, Time Bazar, and Milan Day"
        }
    })

if __name__ == "__main__":
    # Standard Flask runner
    app.run(host="0.0.0.0", port=5000, debug=True)
