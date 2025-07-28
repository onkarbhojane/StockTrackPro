url1="https://www.google.com/finance/quote/INFY:NSE"
url2="https://www.google.com/finance/quote/500209:BOM"

import requests
from bs4 import BeautifulSoup
import matplotlib.pyplot as plt


url=f'https://www.google.com/finance/quote/{ticker}:NSE'
page=requests.get(url)

soup=BeautifulSoup(page.content,'html.parser')
print(soup)
# class