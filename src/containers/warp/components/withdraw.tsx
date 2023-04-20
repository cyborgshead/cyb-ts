import { Pane } from '@cybercongress/gravity';
import { DenomArr, InputNumber, OptionSelect } from '../../../components';
import BalanceToken from '../../teleport/components/balanceToken';
import Select from '../../teleport/components/select';
import { Pool } from '@cybercongress/cyber-js/build/codec/tendermint/liquidity/v1beta1/liquidity';
import { Option } from 'src/types';
import { MyPoolsT } from '../../teleport/type';
import { ObjKeyValue } from 'src/types/data';
import { $TsFixMeFunc } from 'src/types/tsfix';

type TypeMyPoolListObj = { [key: string]: MyPoolsT };

const renderOptions = (data: TypeMyPoolListObj) => {
  return Object.keys(data).map((key) => (
    <OptionSelect
      key={key}
      value={key}
      text={
        <DenomArr
          denomValue={data[key].poolCoinDenom}
          onlyText
          tooltipStatusText={false}
        />
      }
      img={
        <DenomArr
          denomValue={data[key].poolCoinDenom}
          onlyImg
          tooltipStatusImg={false}
        />
      }
    />
  ));
};

type StatePropsType = {
  accountBalances: ObjKeyValue | null;
  myPools: Option<TypeMyPoolListObj>;
  selectMyPool: string;
  setSelectMyPool: $TsFixMeFunc;
  amountPoolCoin: string | number;
  onChangeInputWithdraw: $TsFixMeFunc;
};

type WithdrawProps = {
  stateProps: StatePropsType;
};

function Withdraw({ stateProps }: WithdrawProps) {
  const {
    accountBalances,
    myPools,
    selectMyPool,
    setSelectMyPool,
    amountPoolCoin,
    onChangeInputWithdraw,
  } = stateProps;

  return (
    <Pane
      maxWidth="390px"
      width="375px"
      display="flex"
      alignItems="center"
      flexDirection="column"
    >
      <BalanceToken data={accountBalances} token={selectMyPool} />

      {/* <Pane fontSize="18px">{textLeft}</Pane> */}
      <Pane
        display="grid"
        width="100%"
        gridTemplateColumns="40px 1fr"
        gridGap="27px"
        marginBottom={20}
      >
        <Pane width="33px" fontSize="20px" paddingBottom={10}>
          sub
        </Pane>
        <Select
          width="100%"
          valueSelect={selectMyPool}
          textSelectValue={
            selectMyPool !== '' && myPools
              ? myPools[selectMyPool].poolCoinDenom
              : ''
          }
          onChangeSelect={(value) => setSelectMyPool(value)}
        >
          {myPools && renderOptions(myPools)}
        </Select>
      </Pane>
      <InputNumber
        value={amountPoolCoin}
        onValueChange={onChangeInputWithdraw}
      />
    </Pane>
  );
}

export default Withdraw;
