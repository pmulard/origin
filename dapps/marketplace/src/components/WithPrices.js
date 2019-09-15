import withCurrencyBalances from 'hoc/withCurrencyBalances'
import get from 'lodash/get'
import floor from 'lodash/floor'

// web3.utils.toWei only accepts up to 18 decimal places
function removeExtraDecimals(numStr) {
  return numStr.replace(/^([0-9]+\.[0-9]{18}).*/, '$1')
}

const WithPrices = ({
  target,
  targets = [],
  currencies,
  proxyCurrencies,
  price: { currency, amount } = {},
  children,
  ...props
}) => {
  proxyCurrencies = proxyCurrencies.length ? proxyCurrencies : currencies

  let hasBalance = false,
    hasAllowance = false,
    needsAllowance,
    needsBalance

  const isLoadingData = Object.keys(props).some(
    key => key.endsWith('Loading') && props[key]
  )

  // loading: true if wallet or anything else is loading
  if (isLoadingData)
    return children({ prices: {}, tokenStatus: { loading: true } })

  // If there is no wallet after it has loaded, return loading: false
  if (!props.wallet)
    return children({ prices: {}, tokenStatus: { loading: false } })

  if (!currency) return children({ prices: {}, tokenStatus: { loading: true } })
  const foundCurrency = currencies.find(c => c.id === currency.id)
  if (!foundCurrency || !targets) {
    return children({ prices: {}, tokenStatus: { loading: true } })
  }

  const results = targets.reduce((memo, target) => {
    const targetCurrency = currencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = floor(amountUSD / targetCurrency.priceInUSD, 16)

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  const proxyResults = targets.reduce((memo, target) => {
    const targetCurrency = proxyCurrencies.find(c => c.id === target)
    if (!targetCurrency) return memo

    const amountUSD = amount * foundCurrency.priceInUSD
    const targetAmount = floor(amountUSD / targetCurrency.priceInUSD, 16)

    memo[target] = { amount: String(targetAmount), currency: targetCurrency }
    return memo
  }, {})

  const ethBalance = web3.utils.toBN(
    get(results, `token-ETH.currency.balance`) || '0'
  )
  const targetWei = removeExtraDecimals(get(results, `${target}.amount`) || '0')
  const targetValue = web3.utils.toBN(web3.utils.toWei(targetWei, 'ether'))
  const ethInWei = removeExtraDecimals(get(results, `token-ETH.amount`) || '0')
  const targetValueEth = web3.utils.toBN(web3.utils.toWei(ethInWei, 'ether'))
  const hasEthBalance = ethBalance.gte(targetValueEth)

  if (target === 'token-ETH') {
    hasBalance = hasEthBalance
    hasAllowance = true
  } else if (target) {
    const availableBalance = web3.utils.toBN(
      get(results, `${target}.currency.balance`) || '0'
    )
    const availableAllowance = web3.utils.toBN(
      get(proxyResults, `${target}.currency.allowance`) || '0'
    )

    hasBalance = availableBalance.gte(targetValue)
    needsBalance = hasBalance ? 0 : targetValue.sub(availableBalance).toString()

    hasAllowance = availableAllowance.gte(targetValue)
    needsAllowance = hasAllowance
      ? 0
      : targetValue.sub(availableAllowance).toString()
  }

  const tokenStatus = {
    hasBalance,
    hasAllowance,
    hasEthBalance,
    needsAllowance,
    needsBalance
  }

  return children({ prices: results, tokenStatus })
}

export default withCurrencyBalances(WithPrices)
