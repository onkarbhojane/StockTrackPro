import requests
from bs4 import BeautifulSoup
import matplotlib.pyplot as plt

# Example: Using the ticker symbol for INFY
ticker = "IREDA"
exchange="NSE"
url = f'https://www.google.com/finance/quote/{ticker}:{exchange}'

for i in range(100):
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    # Example: Find the price of the stock (depending on the HTML structure)
    stock_price = soup.find('div', {'class': 'YMlKec fxKbKc'}).text
    print("Stock Price:", stock_price)
    