import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ChainId, CurrencyAmount, JSBI, MASTERCHEF_ADDRESS, MASTERCHEF_V2_ADDRESS, Token, ZERO } from '@mistswapdex/sdk'
import { Chef, PairType } from './enum'
import { Disclosure, Transition } from '@headlessui/react'
import React, { useState } from 'react'
import { usePendingSushi, useUserInfo } from './hooks'

import Button from '../../components/Button'
import Dots from '../../components/Dots'
import Input from '../../components/Input'
import { formatCurrencyAmount, formatNumber, formatPercent } from '../../functions'
import { getAddress } from '@ethersproject/address'
import { t } from '@lingui/macro'
import { tryParseAmount } from '../../functions/parse'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import useMasterChef from './useMasterChef'
import usePendingReward from './usePendingReward'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { isMobile } from 'react-device-detect'
import { useRouter } from 'next/router'

const FarmListItem = ({ farm }) => {
  const { i18n } = useLingui()

  const router = useRouter()

  const { account, chainId } = useActiveWeb3React()
  const [pendingTx, setPendingTx] = useState(false)
  const [depositValue, setDepositValue] = useState('')
  const [withdrawValue, setWithdrawValue] = useState('')

  const addTransaction = useTransactionAdder()

  const liquidityToken = new Token(
    chainId,
    getAddress(farm.pair.id),
    farm.pair.type === PairType.KASHI ? Number(farm.pair.asset.decimals) : 18,
    farm.pair.symbol,
    farm.pair.name
  )

  // User liquidity token balance
  const balance = useTokenBalance(account, liquidityToken)

  // TODO: Replace these
  const amount = useUserInfo(farm, liquidityToken)

  const pendingSushi = usePendingSushi(farm)

  const reward = usePendingReward(farm)

  const APPROVAL_ADDRESSES = {
    [Chef.MASTERCHEF]: {
      [ChainId.SMARTBCH]: MASTERCHEF_ADDRESS[ChainId.SMARTBCH],
      [ChainId.SMARTBCH_AMBER]: MASTERCHEF_ADDRESS[ChainId.SMARTBCH_AMBER],
    },
  }

  const typedDepositValue = tryParseAmount(depositValue, liquidityToken)
  const typedWithdrawValue = tryParseAmount(withdrawValue, liquidityToken)

  const [approvalState, approve] = useApproveCallback(typedDepositValue, APPROVAL_ADDRESSES[farm.chef][chainId])

  const { deposit, withdraw, harvest } = useMasterChef(farm.chef)

  const poolFraction = (Number.parseFloat(amount?.toFixed()) / farm.chefBalance) || 0
  const chefPart = (farm.chefBalance / farm.totalSupply) || 0;
  const token0Reserve = farm.pool.reserves ? (farm.pool.reserves.reserve0 as BigNumber).toString() : 0
  let token0Amount = CurrencyAmount.fromRawAmount(farm.pair.token0, JSBI.BigInt(0));
  try {
    token0Amount = CurrencyAmount.fromRawAmount(farm.pair.token0, JSBI.BigInt(token0Reserve)).multiply(Math.round(poolFraction * chefPart * 1e10) || 0).divide(1e10)                                              } catch (e) { console.error(e); }
  const token1Reserve = farm.pool.reserves ? (farm.pool.reserves.reserve1 as BigNumber).toString() : 0
  let token1Amount = CurrencyAmount.fromRawAmount(farm.pair.token0, JSBI.BigInt(0));
  try {
    token1Amount = CurrencyAmount.fromRawAmount(farm.pair.token1, JSBI.BigInt(token1Reserve)).multiply(Math.round(poolFraction * chefPart * 1e10) || 0).divide(1e10)
  } catch (e) { console.error(e); }
  const token0Name = farm.pool.token0 === farm.pair.token0.id ? farm.pair.token0.symbol : farm.pair.token1.symbol
  const token1Name = farm.pool.token1 === farm.pair.token1.id ? farm.pair.token1.symbol : farm.pair.token0.symbol

  return (
    <Transition
      show={true}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Disclosure.Panel className="flex flex-col w-full border-t-0 rounded rounded-t-none bg-dark-800" static>
        <div className="px-4 pt-4 pb-4">
          <Button
            color="gradient"
            onClick={async () => {
              router.push(`/add/${farm.pair.token0.id}/${farm.pair.token1.id}`)
            }}
          >
            {i18n._(t`Get ${farm.pair.token0.symbol}/${farm.pair.token1.symbol} LP tokens for staking`)}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4 pt-0">
          <div className="col-span-2 text-center md:col-span-1">
            {account && (
              <div>
                <div className="pr-4 mb-2 text-sm text-right cursor-pointer text-secondary">
                  {i18n._(t`Wallet Balance`)}: {formatNumber(balance?.toSignificant(6) ?? 0)} {farm.type}
                </div>
                {!isMobile && (<div className="pr-4 mb-2 text-sm text-right cursor-pointer text-secondary">
                  &nbsp;
                </div>)}
              </div>
            )}
            <div className="relative flex items-center w-full mb-4">
              <Input.Numeric
                className="w-full p-3 pr-20 rounded bg-dark-700 focus:ring focus:ring-blue"
                value={depositValue}
                onUserInput={setDepositValue}
              />
              {account && (
                <Button
                  variant="outlined"
                  color="blue"
                  size="xs"
                  onClick={() => {
                    if (!balance.equalTo(ZERO)) {
                      setDepositValue(balance.toFixed(liquidityToken.decimals))
                    }
                  }}
                  className="absolute border-0 right-4 focus:ring focus:ring-blue"
                >
                  {i18n._(t`MAX`)}
                </Button>
              )}
            </div>
            {approvalState !== ApprovalState.APPROVED ? (
              <Button color="blue" disabled={approvalState === ApprovalState.PENDING || approvalState === ApprovalState.UNKNOWN} onClick={approve}>
                {approvalState === ApprovalState.PENDING ? <Dots>Approving </Dots> : 'Approve'}
              </Button>
            ) : (
              <Button
                color="blue"
                disabled={pendingTx || !typedDepositValue || (balance && balance.lessThan(typedDepositValue))}
                onClick={async () => {
                  setPendingTx(true)
                  try {
                    // KMP decimals depend on asset, SLP is always 18
                    const tx = await deposit(farm.id, depositValue.toBigNumber(liquidityToken?.decimals))

                    addTransaction(tx, {
                      summary: `Deposit ${farm.pair.token0.name}/${farm.pair.token1.name}`,
                    })
                  } catch (error) {
                    console.error(error)
                  }
                  setPendingTx(false)
                }}
              >
                {i18n._(t`Stake`)}
              </Button>
            )}
          </div>
          <div className="col-span-2 text-center md:col-span-1">
            {account && (
              <div>
                <div className="pr-4 mb-2 text-sm text-right cursor-pointer text-secondary">
                  {i18n._(t`Your Staked`)}: {formatNumber(amount?.toSignificant(6)) ?? 0} {farm.type}
                  {amount && farm.pool ? `(${formatPercent(Math.min(Number.parseFloat(amount?.toFixed()) / farm.chefBalance * 100, 100)).toString()} ` + i18n._(t`of pool`) + `)` : ''}
                </div>
                <div className="pr-4 mb-2 text-sm text-right cursor-pointer text-secondary">
                  {token0Amount.toFixed(token0Amount.currency.decimals > 2 ? 2 : undefined)} {token0Name} + {token1Amount.toFixed(token1Amount.currency.decimals > 2 ? 2 : undefined)} {token1Name} ({formatNumber(poolFraction * farm.tvl, true)})
                </div>
              </div>
            )}
            <div className="relative flex items-center w-full mb-4">
              <Input.Numeric
                className="w-full p-3 pr-20 rounded bg-dark-700 focus:ring focus:ring-pink"
                value={withdrawValue}
                onUserInput={(value) => {
                  setWithdrawValue(value)
                }}
              />
              {account && (
                <Button
                  variant="outlined"
                  color="pink"
                  size="xs"
                  onClick={() => {
                    if (!amount.equalTo(ZERO)) {
                      setWithdrawValue(amount.toFixed(liquidityToken.decimals))
                    }
                  }}
                  className="absolute border-0 right-4 focus:ring focus:ring-pink"
                >
                  {i18n._(t`MAX`)}
                </Button>
              )}
            </div>
            <Button
              color="pink"
              className="border-0"
              disabled={pendingTx || !typedWithdrawValue || (amount && (amount.lessThan(typedWithdrawValue) || amount.equalTo(0)))}
              onClick={async () => {
                setPendingTx(true)
                try {
                  // KMP decimals depend on asset, SLP is always 18
                  const tx = await withdraw(farm.id, withdrawValue.toBigNumber(liquidityToken?.decimals))
                  addTransaction(tx, {
                    summary: `Withdraw ${farm.pair.token0.name}/${farm.pair.token1.name}`,
                  })
                } catch (error) {
                  console.error(error)
                }

                setPendingTx(false)
              }}
            >
              {i18n._(t`Unstake`)}
            </Button>
          </div>
        </div>
        {pendingSushi && pendingSushi.greaterThan(ZERO) && (
          <div className="px-4 pb-4">
            <Button
              color="gradient"
              onClick={async () => {
                setPendingTx(true)
                try {
                  const tx = await harvest(farm.id)
                  addTransaction(tx, {
                    summary: i18n._(t`Harvest`) + ` ${farm.pair.token0.name}/${farm.pair.token1.name}`,
                  })
                } catch (error) {
                  console.error(error)
                }
                setPendingTx(false)
              }}
            >
              {i18n._(t`Harvest`) + ` ${formatNumber(pendingSushi.toFixed(18))} MIST ${
                farm.rewards.length > 1 ? `& ${formatNumber(reward)} ${farm.rewards[1].token}` : ''
              }`}
            </Button>
          </div>
        )}
      </Disclosure.Panel>
    </Transition>
  )
}

export default FarmListItem
