/** Work in progress */
/** @param {NS} ns **/
export async function main(ns, pct = ns.args[0]) {
  ns.disableLog("ALL");
  let money = ns.getServerMoneyAvailable('home');
  let allowance = money * (pct / 100);
  let stocks = ns.stock.getSymbols();

  for (let i = 0; i < stocks.length; i++) {
    let sym = stocks[i];
    
  }

  await ns.stock.nextUpdate();
}

/**
 * Usefull functions:
 * - buyShort(sym, shares)
 * - buyStock(sym, shares)
 * - sellShort(sym, shares)
 * - sellStock(sym, shares)
 * - placeOrder(sym, shares, price, type, pos)
 * - cancelOrder(sym, shares, price, type, pos)
 * 
 * - has4SData()
 * - has4SDataTIXAPI()
 * - hasTIXAPIAccess()
 * - hasWSEAccount()
 * - purchase4SMarketData()
 * - purchase4SMarketDataTIXAPI()
 * - purchaseTIXAPI()
 * - purchaseWseAccount()
 * 
 * - getSymbols()
 * - nextUpdate()
 * - getVolatility(sym)
 * - getSaleGain(sym, shares, posType)
 * - getPurchaseCost(sym, shares, posType)
 * - getPrice(sym)
 * - getPosition(sym)
 * - getMaxShares(sym)
 * - getForecast(sym)
 * - getConstants()
 * - getBonusTime()
 * - getBidPrice(sym)
 * - getAskPrice(sym)
 */

/**
 * Methods
Method	Description
buyShort(sym, shares)	Short stocks.
buyStock(sym, shares)	Buy stocks.
cancelOrder(sym, shares, price, type, pos)	Cancel order for stocks.
getAskPrice(sym)	Returns the ask price of that stock.
getBidPrice(sym)	Returns the bid price of that stock.
getBonusTime()	Get Stock Market bonus time.
getConstants()	Get game constants for the stock market mechanic.
getForecast(sym)	Returns the probability that the specified stock’s price will increase (as opposed to decrease) during the next tick.
getMaxShares(sym)	Returns the maximum number of shares of a stock.
getOrders()	Returns your order book for the stock market.
getOrganization(sym)	Returns the organization associated with a stock symbol.
getPosition(sym)	Returns the player’s position in a stock.
getPrice(sym)	Returns the price of a stock.
getPurchaseCost(sym, shares, posType)	Calculates cost of buying stocks.
getSaleGain(sym, shares, posType)	Calculate profit of selling stocks.
getSymbols()	Returns an array of the symbols of the tradable stocks
getVolatility(sym)	Returns the volatility of the specified stock.
has4SData()	Returns true if the player has access to the 4S Data
has4SDataTIXAPI()	Returns true if the player has access to the 4SData TIX API
hasTIXAPIAccess()	Returns true if the player has access to the TIX API
hasWSEAccount()	Returns true if the player has access to a WSE Account
nextUpdate()	Sleep until the next Stock Market price update has happened.
placeOrder(sym, shares, price, type, pos)	Place order for stocks.
purchase4SMarketData()	Purchase 4S Market Data Access.
purchase4SMarketDataTixApi()	Purchase 4S Market Data TIX API Access.
purchaseTixApi()	Purchase TIX API Access
purchaseWseAccount()	Purchase WSE Account.
sellShort(sym, shares)	Sell short stock.
sellStock(sym, shares)	Sell stocks.
 */