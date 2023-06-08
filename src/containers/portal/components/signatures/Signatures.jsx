import { useMemo, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './styles.scss';
import {
  DICTIONARY_ABC,
  getHeight,
  getNoteFromAdd,
  makeSound,
  cutAddress,
} from './utils';
import { useNavigate } from 'react-router-dom';

const classNames = require('classnames');

function Signatures({ addressActive }) {
  const [plaing, setPlaing] = useState(true);
  const navigate = useNavigate();

  const address = useMemo(() => {
    if (addressActive !== null) {
      const { bech32 } = addressActive;
      return cutAddress(bech32);
    }
    return null;
  }, [addressActive]);

  const useGetItems = useMemo(() => {
    const items = [];

    if (address !== null) {
      const { address: sliceAddress } = address;
      const arrayAddress = sliceAddress.split('');
      const bufferAddress = Buffer.from(sliceAddress)
        .toString('hex')
        .replace(/[a-z]/g, '')
        .split('');
      arrayAddress.forEach((item, index) => {
        items.push({
          color: DICTIONARY_ABC[item].color,
          code: bufferAddress[index] || 2,
        });
      });
    }

    return items;
  }, [address]);

  const copyAddress = useCallback(() => {
    if (addressActive !== null) {
      const { bech32 } = addressActive;
      navigator.clipboard.writeText(bech32);
    }
  }, [addressActive]);

  const onClickMusicalAddress = useCallback(() => {
    navigate(`/neuron/${addressActive.bech32}`);

    return;

    if (!plaing) {
      return;
    }

    if (address !== null) {
      copyAddress();
      const { address: sliceAddress } = address;
      const arrNote = getNoteFromAdd(sliceAddress);
      setPlaing(false);
      makeSound(arrNote);
      setTimeout(() => {
        setPlaing(true);
      }, 7000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, plaing]);

  return (
    <button
      type="button"
      onClick={() => onClickMusicalAddress()}
      className={styles.containerSignaturesBtnPlay}
    >
      <div
        className={classNames(styles.containerSignatures, {
          [styles.containerSignaturesPlaing]: !plaing,
        })}
      >
        {address !== null && address.prefix}
        {useGetItems.map((item) => {
          const key = uuidv4();
          return (
            <div
              key={key}
              className={styles.containerSignaturesItemNote}
              style={{
                background: item.color,
                color: item.color,
                height: `${getHeight(item.code)}px`,
              }}
            />
          );
        })}
        {address !== null && address.end}
      </div>
    </button>
  );
}

export default Signatures;
