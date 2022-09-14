import { Chef, PairType } from '../../features/onsen/enum'
import { useActiveWeb3React, useFuse } from '../../hooks'
import {
  useAverageBlockTime,
  useEthPrice,
  useFarmPairAddresses,
  useFarms,
  useMasterChefV1SushiPerBlock,
  useMasterChefV1TotalAllocPoint,
  useSushiPairs,
  useSushiPrice,
} from '../../services/graph'

import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, WNATIVE, Token, WBCH, MASTERCHEF_ADDRESS } from '@mistswapdex/sdk'
import { MIST, FLEXUSD, LAWUSD, BCUSDT, BCBCH } from '../../config/tokens'
import Container from '../../components/Container'
import FarmList from '../../features/onsen/FarmList'
import Head from 'next/head'
import Image from 'next/image'
import Menu from '../../features/onsen/FarmMenu'
import React, { useEffect } from 'react'
import Search from '../../components/Search'
import { classNames } from '../../functions'
import dynamic from 'next/dynamic'
import { getAddress } from '@ethersproject/address'
import useFarmRewards from '../../hooks/useFarmRewards'
import usePool from '../../hooks/usePool'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePositions, usePendingSushi } from '../../features/onsen/hooks'
import { useRouter } from 'next/router'
import { updateUserFarmFilter } from '../../state/user/actions'
import { getFarmFilter, useUpdateFarmFilter } from '../../state/user/hooks'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function Farm(): JSX.Element {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()
  const router = useRouter()

  const type = router.query.filter as string

  const savedFilter = getFarmFilter()

  if (!type && savedFilter) {
    router.push(`/farm?filter=${savedFilter}`)
  }

  const updateFarmFilter = useUpdateFarmFilter()
  updateFarmFilter(type)

  const hardcodedPairs = {
    [ChainId.SMARTBCH]: {
      "0x674A71E69fe8D5cCff6fdcF9F1Fa4262Aa14b154": {
        farmId: 7,
        allocPoint: 300000000,
        token0: MIST[ChainId.SMARTBCH],
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x437E444365aD9ed788e8f255c908bceAd5AEA645": {
        farmId: 8,
        allocPoint: 0,
        token0: MIST[ChainId.SMARTBCH],
        token1: FLEXUSD,
      },
      "0x80F712670d268cf2C05e7162674c7466c940eBE3": {
        farmId: 0,
        allocPoint: 1748609,
        token0: new Token(ChainId.SMARTBCH, '0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B', 18, 'EBEN', 'Green Ben'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13": {
        farmId: 1,
        allocPoint: 16502129,
        token0: FLEXUSD,
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x4fF52e9D7824EC9b4e0189F11B5aA0F02b459b03": {
        farmId: 2,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3', 18, 'FLEX', 'FLEX Coin'),
        token1: FLEXUSD,
      },
      "0x1EE39F93450d80981c169E59C8A641a3bC853A09": {
        farmId: 3,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xff3ed63bf8bc9303ea0a7e1215ba2f82d569799e', 18, 'ORB', 'ORB'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xc98552Ad7DFC5daabAd2660DF378e0070ca75Efc": {
        farmId: 4,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xc70c7718C7f1CCd906534C2c4a76914173EC2c44', 18, 'KTH', 'Knuth'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x287a276401caDBe50d5C0398137490E6d45830Dd": {
        farmId: 5,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xe11829a7d5d8806bb36e118461a1012588fafd89', 18, 'SPICE', 'SPICE'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x41075d2Ea8BEF1CAfb24D9Bd2061b620cbc05B60": {
        farmId: 6,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x675E1d6FcE8C7cC091aED06A68D079489450338a', 18, 'ARG', 'Bitcoin Cash Argentina'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xc47B0B4B51EE06De0daF02517D78f0473B776633": {
        farmId: 9,
        allocPoint: 2361927,
        token0: new Token(ChainId.SMARTBCH, '0x265bD28d79400D55a1665707Fa14A72978FA6043', 2, 'CATS', 'CashCats'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xD6EcaDB40b35D17f739Ec27285759d0ca119e3A1": {
        farmId: 10,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x3d13DaFcCA3a188DB340c81414239Bc2be312Ec9', 18, 'AXIEBCH', 'AxieBCH'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xFCf26E0EB200692B3002f941eea0486d2E901aA9": {
        farmId: 11,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x2f309b9d47b1ce7f0ec30a26bab2deab8c4ea5e9', 18, 'SHIBBCH', 'Shiba BCH'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xCFcBC90e617a3996355761b52dF2830B7b6718d0": {
        farmId: 12,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x741746C2Cf4117730d7f087e8492dF595b4fd283', 18, 'DOGE', 'DOGEBCH'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xf9D33ABfaF59fd19077f44399A8971621Cd2eA55": {
        farmId: 13,
        allocPoint: 1921844,
        token0: new Token(ChainId.SMARTBCH, '0xFfA2394B61D3dE16538a2Bbf3491297Cc5a7C79a', 18, 'UAT', 'UatX Token'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xCabdb1321CEAb169935a0c9d4c856250766C3df7": {
        farmId: 14,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xB5b1939ef0a3743d0Ae9282DbA62312b614A5Ac0', 18, 'POTA', 'Potato'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xbE48dC2353a460668A5D859C66e4472661581998": {
        farmId: 15,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xF2d4D9c65C2d1080ac9e1895F6a32045741831Cd', 2, 'HONK', 'Honk'),
      },
      "0x12E03015A85A0c2c1eca69486147608ABB0b801c": {
        farmId: 16,
        allocPoint: 0,
        token0: FLEXUSD,
        token1: new Token(ChainId.SMARTBCH, '0x2f309b9d47b1ce7f0ec30a26bab2deab8c4ea5e9', 18, 'SHIBBCH', 'Shiba BCH'),
      },
      "0x6B68f5D7d0531207a01e9AC16cfCd223D2139D28": {
        farmId: 17,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x7eBeAdb95724a006aFaF2F1f051B13F4eBEBf711', 2, '$KITTEN', 'CashKitten'),
      },
      "0x24615e918AD078900BfE13F4cd26876Bae64dD75": {
        farmId: 18,
        allocPoint: 96434000,
        token0: new Token(ChainId.SMARTBCH, '0x0b00366fBF7037E9d75E4A569ab27dAB84759302', 18, 'LAW', 'LAWTOKEN'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xa331430473ABA2337698fD95a7c2fCf376DEbFb1": {
        farmId: 19,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xC41C680c60309d4646379eD62020c534eB67b6f4', 18, 'XMIST', 'MISTbar'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x1c47c2a72e86B9B488f436F7aC76ACc61e531926": {
        farmId: 20,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x481De06DCA0198844faA36FCa04Db364e5c2f86C', 6, 'MAZE', 'MAZE'),
      },
      "0xA32B73445dBc075dA5054503171362D790164dC9": {
        farmId: 21,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x4F1480ba79F7477230ec3b2eCc868E8221925072', 18, 'KONRA', 'Konra'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xE3e155c22685F7ceAB3F429CA60f302bCFb13616": {
        farmId: 22,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xB5b1939ef0a3743d0Ae9282DbA62312b614A5Ac0', 18, 'POTA', 'Potato'),
        token1: FLEXUSD,
      },
      "0x0663B29E3CAa8F2DB0313eA8B3E942a0431429cf": {
        farmId: 23,
        allocPoint: 0,
        token0: MIST[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xC41C680c60309d4646379eD62020c534eB67b6f4', 18, 'XMIST', 'MISTbar'),
      },
      "0x211c0d74b1213A40Bdfd61490A9893353544ea46": {
        farmId: 24,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x5a3bB59F34D60E9EB5643Fb80C8D712275F6a96A', 18, 'PHA', 'Alpha'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x8e5EdB62775c1Cd003804Ec2a8242E5E0393876b": {
        farmId: 25,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x80453ACDfE0073D6743B27D72e06F48777EeAd80', 0, 'ZOMBIE', 'ZOMBIE'),
      },
      "0x49260567a5610414954a1D8F0E7774104FC5CAED": {
        farmId: 26,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3', 18, 'FLEX', 'FLEX Coin'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x64c379ab93b859AdA71b8AbACA77BeD104a5DbCa": {
        farmId: 27,
        allocPoint: 3543531,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x9288df32951386A8254aEaF80a66B78cCaf75b82', 2, 'sBUSD', 'Smart BUSD'),
      },
      "0xFEC4202E22d0cd950aFC52622114e787FFFa0F53": {
        farmId: 28,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xFC27A40259f5d36F647b1142443Ed8941334C608', 18, 'C4Q', 'C4Q'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x98A03761Fe62b9A1FD7888D86f70E94a40ACD511": {
        farmId: 29,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xB24D7763516bca9656779d760be9a32490f46E27', 18, 'HODL', 'HODL'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x8221D04A71FcD0Dd3d096cB3B49E22918095933F": {
        farmId: 30,
        allocPoint: 1844854,
        token0: new Token(ChainId.SMARTBCH, '0x9192940099fDB2338B928DE2cad9Cd1525fEa881', 18, 'BPAD', 'BCHPad'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x5775D98022590dc60E9c4Ae0a1c56bF1fD8fcaDC": {
        farmId: 31,
        allocPoint: 1732183,
        token0: new Token(ChainId.SMARTBCH, '0x7642Df81b5BEAeEb331cc5A104bd13Ba68c34B91', 18, 'CLY', 'Celery'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x20943aD7855bdE06Dd41BB89C9D2efE05DB329EC": {
        farmId: 32,
        allocPoint: 4942568,
        token0: new Token(ChainId.SMARTBCH, '0x6732E55Ac3ECa734F54C26Bd8DF4eED52Fb79a6E', 18, 'JOY', 'Joystick'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xB02A135992478a485D9DD771092CdD8B4487594A": {
        farmId: 33,
        allocPoint: 0,
        token0: new Token(ChainId.SMARTBCH, '0xAFACB0004A91267b58e720E13DF570Dc6863c854', 18, 'STO', 'SmartBCH Token Observer'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xE75Ec02F28bC0E1ca1794FbFFe8229ac1662075E": {
        farmId: 34,
        allocPoint: 4987241,
        token0: new Token(ChainId.SMARTBCH, '0x252fd94f3Fb53D3D62F4FEc708501ACd59A57e52', 8, 'HAM', 'HAM Token'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x99057a0cB475D1c4d950d552E77e9E68CdDb8261": {
        farmId: 35,
        allocPoint: 0,
        token0: FLEXUSD,
        token1: new Token(ChainId.SMARTBCH, '0xca0235058985fcC1839E9e37c10900a73C126708', 7, 'DAO', 'Decentralized Autonomous Organization'),
      },
      "0x1F354956DE4A7Ed71308225De94a27b35A84EA57": {
        farmId: 36,
        allocPoint: 1749593,
        token0: new Token(ChainId.SMARTBCH, '0x225FCa2A940cd5B18DFb168cD9B7f921C63d7B6E', 18, 'FIRE', 'Incinerate'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xBe8C7C35103c443844Ef234cFFd73a491Df6f503": {
        farmId: 37,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xca0235058985fcC1839E9e37c10900a73C126708', 7, 'DAO', 'Decentralized Autonomous Organization'),
      },
      "0xB31f44E525Cc07037E55bd448004CfF66f1fa878": {
        farmId: 38,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x8d7Ea0ec6CaB515463121A3c70Df541f2F534909', 9, 'WOJAK', 'WOJAK'),
      },
      "0x49F8C72fCA1f6F62411da1Aa451c479e1324Eb8f": {
        farmId: 39,
        allocPoint: 3548940,
        token0: FLEXUSD,
        token1: new Token(ChainId.SMARTBCH, '0x9288df32951386A8254aEaF80a66B78cCaf75b82', 2, 'sBUSD', 'Smart BUSD'),
      },
      "0xEA5038043364830c489D7fd8F95eFE35eaE6f4Ff": {
        farmId: 40,
        allocPoint: 1865283,
        token0: new Token(ChainId.SMARTBCH, '0x2b591190FF951F60CB9424664155e57A402c1AdE', 3, '🌙🌙🌙🌙', 'MoonMoonMoonMoon'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x2eA9369dAEE963CeBc0266AE8b98c3E015C59046": {
        farmId: 41,
        allocPoint: 1903879,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xd2597a0bde31Ddec2440E256d8AA35eb63F1A9e3', 18, 'GAME', 'Game'),
      },
      "0x800632AFC31225813b06185EA8Be8eD571820a50": {
        farmId: 42,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x6e6D4ECE35EEd638A1153339F69E543B7ae5F776', 9, 'SMART', 'SmartDoge'),
      },
      "0x5e937a1E35e1D931FEbB70E2b061ED38c8E43336": {
        farmId: 43,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xe5643aAF41ed9e5a56C3D5D1a049b43Ac69950b2', 18, 'BCHDAO', 'BCHDAO'),
      },
      "0x7E1B9F1e286160A80ab9B04D228C02583AeF90B5": {
        farmId: 44,
        allocPoint: 4206733,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xF05bD3d7709980f60CD5206BddFFA8553176dd29', 18, 'SIDX', 'SmartIndex'),
      },
      "0x4fd950b3cA45d6F40E5187706D3981ee955E06b4": {
        farmId: 45,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x4B85a666deC7C959e88b97814E46113601B07e57', 18, 'GoC', 'GoCrypto'),
      },
      "0xC20A4f3012bA2Df47544d4926B19604Fa777FB01": {
        farmId: 46,
        allocPoint: 3533881,
        token0: new Token(ChainId.SMARTBCH, '0x56381cB87C8990971f3e9d948939e1a95eA113a3', 9, 'GOB', 'Goblin'),
        token1: FLEXUSD,
      },
      "0x1D5A7bea34EE984D54aF6Ff355A1Cb54c29eb546": {
        farmId: 47,
        allocPoint: 12189669,
        token0: new Token(ChainId.SMARTBCH, '0x0b00366fBF7037E9d75E4A569ab27dAB84759302', 18, 'LAW', 'LAWTOKEN'),
        token1: new Token(ChainId.SMARTBCH, '0xE1E655BE6F50344e6dd708c27BD8D66492d6ecAf', 18, 'lawUSD', 'LAW US Dollar'),
      },
      "0xE1B5bC09427710BC4d886eC49654944110B58134": {
        farmId: 48,
        allocPoint: 3470758,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x0E36C351ff40183435C9Bd1D17bfb1F3548f1963', 18, 'LAMBO', 'wenlambo'),
      },
      "0x380094357328488781a0FB31c271a13DB7357c1E": {
        farmId: 49,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x7b82A3b1417Cd21E67f745917a80cC0f53277B8C', 7, 'EVE', 'Expected Value Entropy'),
      },
      "0x8C14d399F3E12b702EFfD16cf27337637b38C84A": {
        farmId: 50,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x4592B88618119e55e37FFCb28EDE02beF6F3c5bA', 18, 'FRN', 'Friend'),
      },
      "0x0151b25a5acF7f2F31bB2Ab4358c9FA894Db2Cb2": {
        farmId: 51,
        allocPoint: 4004893,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x659F04F36e90143fCaC202D4BC36C699C078fC98', 18, 'CLK', 'CatsLuck'),
      },
      "0x7f3F57C92681c9a132660c468f9cdff456fC3Fd7": {
        farmId: 52,
        allocPoint: 17766796,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x35b3Ee79E1A7775cE0c11Bd8cd416630E07B0d6f', 18, 'LNS', 'Bitcoin Cash Name Service'),
      },
      "0xa993067343719C4e43dE972F3f86513478cbb3cD": {
        farmId: 53,
        allocPoint: 4909380,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x288B6Ca2eFCF39C9B68052B0088A0cB3f3D3B5f2', 18, 'PDA', 'PandaToken'),
      },
      "0xdEb684Aa667564a0FedfCe9d444DeE209b7e4e4a": {
        farmId: 54,
        allocPoint: 3464705,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x8dd87b3f50bE9C6Ac5EC08458803843F0D294B3d', 18, 'NFTC', 'NFT Club Token'),
      },
      "0x86B0fD64234a747681f0235B6Cc5FE04a4D95B31": {
        farmId: 55,
        allocPoint: 4053588,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x56381cB87C8990971f3e9d948939e1a95eA113a3', 9, 'GOB', 'Goblin'),
      },
      "0xD45d971c09D966ADBC7064e4ca05e2EDaa3721c1": {
        farmId: 56,
        allocPoint: 0,
        token0: FLEXUSD,
        token1: new Token(ChainId.SMARTBCH, '0x009dC89aC501a62C4FaaF7196aeE90CF79B6fC7c', 18, 'gBCH', 'Goblin BCH'),
      },
      "0x1326E072b412FDF591562807657D48300CA21b1F": {
        farmId: 57,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x009dC89aC501a62C4FaaF7196aeE90CF79B6fC7c', 18, 'gBCH', 'Goblin BCH'),
      },
      "0xAAceDA629026Fe99A13600D1b6EB7f00185061F1": {
        farmId: 58,
        allocPoint: 2012428,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x49F9ECF126B6dDF51C731614755508A4674bA7eD', 18, 'RMZ', 'Xolos'),
      },
      "0x27580618797a2CE02FDFBbee948388a50a823611": {
        farmId: 59,
        allocPoint: 54341210,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xBc2F884680c95A02cea099dA2F524b366d9028Ba', 18, 'bcUSDT', 'BlockNG-Peg USDT Token'),
      },
      "0xde5D57B31cB67d5Aed93c26940394796953961cb": {
        farmId: 60,
        allocPoint: 208845151,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xBc9bD8DDe6C5a8e1CBE293356E02f5984693b195', 18, 'bcBCH', 'BlockNG-Peg BCH Token'),
      },
      "0xFA26d55184cb512180e4Ff9e62B4C1E0327aBB53": {
        farmId: 61,
        allocPoint: 6442227,
        token0: FLEXUSD,
        token1: new Token(ChainId.SMARTBCH, '0xBc2F884680c95A02cea099dA2F524b366d9028Ba', 18, 'bcUSDT', 'BlockNG-Peg USDT Token'),
      },
      "0xf4D43d7ef48f46ee7E6989c45d0e97456e20B53B": {
        farmId: 62,
        allocPoint: 223812331,
        token0: new Token(ChainId.SMARTBCH, '0xBc9bD8DDe6C5a8e1CBE293356E02f5984693b195', 18, 'bcBCH', 'BlockNG-Peg BCH Token'),
        token1: new Token(ChainId.SMARTBCH, '0xBc2F884680c95A02cea099dA2F524b366d9028Ba', 18, 'bcUSDT', 'BlockNG-Peg USDT Token'),
      },
      "0xAb3285456037cb7a4718a01E1711bA8D5e95A628": {
        farmId: 63,
        allocPoint: 0,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0xF80c1Ae9B21BC234c555c9c5F58E8C81996f8BB5', 18, 'BANANA', 'Banana Token'),
      },
      "0x96A47656E7C7758A69B6dB74DAFECD386484B9e6": {
        farmId: 64,
        allocPoint: 1859633,
        token0: WBCH[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x0cB20466c0Dd6454ACF50eC26F3042CCC6362fa0', 18, 'NARATH', 'Narath'),
      },
    },
    [ChainId.SMARTBCH_AMBER]: {
      "0x07DE6fc05597E0E4c92C83637A8a0CA411f3a769": {
        farmId: 0,
        allocPoint: 1000,
        token0: WBCH[ChainId.SMARTBCH_AMBER],
        token1: new Token(ChainId.SMARTBCH_AMBER, '0xC6F80cF669Ab9e4BE07B78032b4821ed5612A9ce', 18, 'sc', 'testcoin2'),
      },
      "0xcd4f24eD6d53d3CF342B6D7a1006ff209DdcC993": {
        farmId: 1,
        allocPoint: 500000,
        token0: new Token(ChainId.SMARTBCH_AMBER, '0x9E93b1e6B6f169b793aFC72BB5241a0388418E2A', 18, 'FOG', 'FOGToken'),
        token1: new Token(ChainId.SMARTBCH_AMBER, '0x19E75581Ce31219c78E7996aEa2714EE88e8f059', 18, 'TEST', 'TESTToken'),
      },
    }
  };

  const kashiPairs = [] // unused
  const swapPairs = []
  let farms = []

  for (const [pairAddress, pair] of Object.entries(hardcodedPairs[chainId])) {
    swapPairs.push({
      id: pairAddress,
      reserveUSD: "100000",
      totalSupply: "1000",
      timestamp: "1599830986",
      token0: {
        id: pair.token0.address,
        name: pair.token0.name,
        symbol: pair.token0.symbol,
        decimals: pair.token0.decimals
      },
      token1: {
        id: pair.token1.address,
        name: pair.token1.name,
        symbol: pair.token1.symbol,
        decimals: pair.token1.decimals
      },
    })

    const f = {
      pair: pairAddress,
      symbol: `${hardcodedPairs[chainId][pairAddress].token0.symbol}-${hardcodedPairs[chainId][pairAddress].token1.symbol}`,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      pool: usePool(pairAddress),
      allocPoint: pair.allocPoint,
      balance: "1000000000000000000",
      chef: 0,
      id: pair.farmId,
      pendingSushi: undefined,
      pending: 0,
      owner: {
        id: MASTERCHEF_ADDRESS[chainId],
        sushiPerBlock: "100000000000000000000",
        totalAllocPoint: "999949643"
      },
      userCount: 1,
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    f.pendingSushi = usePendingSushi(f)
    f.pending = Number.parseFloat(f.pendingSushi?.toFixed())

    farms.push(f);
  }

  farms = farms.sort((a, b) => b.allocPoint - a.allocPoint);

  let bchPriceUSD = 100;
  let mistPriceUSD = 0.001;
  if (chainId === 10000) {
    let bchPriceFlexUSD = 100;
    const mistflexusdPool = farms.find((v) => v.pair === '0x437E444365aD9ed788e8f255c908bceAd5AEA645').pool;
    const bchusdtPool = farms.find((v) => v.pair === '0x27580618797a2CE02FDFBbee948388a50a823611').pool;
    const bchflexusdPool = farms.find((v) => v.pair === '0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13').pool;
    if (bchusdtPool.reserves) {
      bchPriceUSD = Number.parseFloat(bchusdtPool.reserves[1].toFixed()) / Number.parseFloat(bchusdtPool.reserves[0].toFixed());
    }
    if (bchflexusdPool.reserves) {
      bchPriceFlexUSD = Number.parseFloat(bchflexusdPool.reserves[1].toFixed()) / Number.parseFloat(bchflexusdPool.reserves[0].toFixed());
    }
    if (mistflexusdPool.reserves && bchusdtPool.reserves && bchflexusdPool.reserves) {
      mistPriceUSD = 1. / ( Number.parseFloat(mistflexusdPool.reserves[0].toFixed()) / Number.parseFloat(mistflexusdPool.reserves[1].toFixed()))
      mistPriceUSD /= (bchPriceFlexUSD / bchPriceUSD);
    }
  } else {
    // TODO add detection of this for amber in future
    bchPriceUSD = 100;
    mistPriceUSD = 0.001;
  }

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    MASTERCHEF_ADDRESS[chainId],
    farms.map((farm) => new Token(chainId, farm.pair, 18, 'LP', 'LP Token')),
  )

  if (! fetchingV2PairBalances) {
    for (let i=0; i<farms.length; ++i) {
      if (v2PairsBalances.hasOwnProperty(farms[i].pair) && farms[i].pool.totalSupply) {
        const totalSupply = Number.parseFloat(farms[i].pool.totalSupply.toFixed());
        const chefBalance = Number.parseFloat(v2PairsBalances[farms[i].pair].toFixed());

        let tvl = 0;
        if (farms[i].pool.token0 === MIST[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * mistPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === MIST[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * mistPriceUSD * 2;
        }
        else if (farms[i].pool.token0 === FLEXUSD.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token1 === FLEXUSD.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token0 === LAWUSD.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token1 === LAWUSD.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token0 === BCUSDT.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token1 === BCUSDT.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token0 === WBCH[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * bchPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === WBCH[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * bchPriceUSD * 2;
        }
        else if (farms[i].pool.token0 === BCBCH) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * bchPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === BCBCH) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * bchPriceUSD * 2;
        }
        farms[i].tvl = tvl;
        farms[i].totalSupply = totalSupply;
        farms[i].chefBalance = chefBalance;
      } else {
        farms[i].tvl = "0";
        farms[i].totalSupply = 0;
        farms[i].chefBalance = 0;
      }
    }
  }

  const positions = usePositions(chainId)

  // const averageBlockTime = useAverageBlockTime()
  const averageBlockTime = 6;

  // const masterChefV1TotalAllocPoint = useMasterChefV1TotalAllocPoint()

  const masterChefV1SushiPerBlock = useMasterChefV1SushiPerBlock()

  const blocksPerDay = 86400 / Number(averageBlockTime)

  const map = (pool) => {
    // TODO: Account for fees generated in case of swap pairs, and use standard compounding
    // algorithm with the same intervals acrosss chains to account for consistency.
    // For lending pairs, what should the equivilent for fees generated? Interest gained?
    // How can we include this?

    // TODO: Deal with inconsistencies between properties on subgraph
    pool.owner = pool?.owner || pool?.masterChef
    pool.balance = pool?.balance || pool?.slpBalance

    const swapPair = swapPairs?.find((pair) => pair.id === pool.pair)
    const kashiPair = kashiPairs?.find((pair) => pair.id === pool.pair)

    const type = swapPair ? PairType.SWAP : PairType.KASHI

    const pair = swapPair || kashiPair

    const blocksPerDay = 15684 // calculated empirically

    function getRewards() {
      // TODO: Some subgraphs give sushiPerBlock & sushiPerSecond, and mcv2 gives nothing
      const sushiPerBlock =
        pool?.owner?.sushiPerBlock / 1e18 ||
        (pool?.owner?.sushiPerSecond / 1e18) * averageBlockTime ||
        masterChefV1SushiPerBlock

      const rewardPerBlock = (pool.allocPoint / pool.owner.totalAllocPoint) * sushiPerBlock

      const defaultReward = {
        token: 'MIST',
        icon: 'https://assets.mistswap.fi/blockchains/smartbch/assets/0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129/logo.png',
        rewardPerBlock,
        rewardPerDay: rewardPerBlock * blocksPerDay,
        rewardPrice: +mistPriceUSD,
      }

      const defaultRewards = [defaultReward]

      return defaultRewards
    }

    const rewards = getRewards()

    const balance = Number(pool.balance / 1e18);

    const roiPerBlock = rewards.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
    }, 0) / pool.tvl

    const roiPerDay = roiPerBlock * blocksPerDay

    const roiPerYear = roiPerDay * 365

    const position = positions.find((position) => position.id === pool.id && position.chef === pool.chef)

    return {
      ...pool,
      ...position,
      pair: {
        ...pair,
        decimals: pair.type === PairType.KASHI ? Number(pair.asset.tokenInfo.decimals) : 18,
        type,
      },
      balance,
      roiPerYear,
      rewards,
    }
  }

  const FILTER = {
    all: (farm) => farm.allocPoint !== 0,
    portfolio: (farm) => farm.pending !== 0,
    past: (farm) => farm.allocPoint === 0,
    // sushi: (farm) => farm.pair.type === PairType.SWAP && farm.allocPoint !== '0',
    // kashi: (farm) => farm.pair.type === PairType.KASHI && farm.allocPoint !== '0',
    // '2x': (farm) => (farm.chef === Chef.MASTERCHEF_V2) && farm.allocPoint !== '0',
  }

  const data = farms
    .filter((farm) => {
      return (
        (swapPairs && swapPairs.find((pair) => pair.id === farm.pair)) ||
        (kashiPairs && kashiPairs.find((pair) => pair.id === farm.pair))
      )
    })
    .map(map)
    .filter((farm) => {
      return type in FILTER ? FILTER[type](farm) : true
    })

  const options = {
    keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol'],
    threshold: 0.4,
  }

  const { result, term, search } = useFuse({
    data,
    options,
  })

  return (
    <Container id="farm-page" className="h-full py-4 mx-auto lg:grid lg:grid-cols-4 md:py-8 lg:py-12 gap-9" maxWidth="7xl">
      <Head>
        <title>Farm | Mist</title>
        <meta key="description" name="description" content="Farm MIST" />
      </Head>
      <div className={classNames('px-3 md:px-0 lg:block md:col-span-1')}>
        <Menu positionsLength={positions.length} />
        <div className="relative hidden h-80 lg:block">
          <Image layout="fill" objectFit="contain" objectPosition="bottom" src="/mist-machine.png" alt="" />
        </div>
      </div>
      <div className={classNames('space-y-6 col-span-4 lg:col-span-3')}>
        <Search
          search={search}
          placeholder={i18n._(t`Search by name, symbol, address`)}
          term={term}
          className={classNames('px-3 md:px-0 ')}
          inputProps={{
            className:
              'relative w-full bg-transparent border border-transparent focus:border-gradient-r-blue-pink-dark-900 rounded placeholder-secondary focus:placeholder-primary font-bold text-base px-6 py-3.5',
          }}
        />

        <div className="flex items-center hidden text-lg font-bold md:block text-high-emphesis whitespace-nowrap">
          Farms{' '}
          <div className="w-full h-0 ml-4 font-bold bg-transparent border border-b-0 border-transparent rounded text-high-emphesis md:border-gradient-r-blue-pink-dark-800 opacity-20"></div>
        </div>

        <FarmList farms={result} term={term} />
      </div>
    </Container>
  )
}
