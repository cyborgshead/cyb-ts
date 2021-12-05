/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

const FileType = require('file-type');

const getName = (file) => file.name;

function AddTest({ nodeIpfs }) {
  const inputOpenFileRef = useRef();
  const [totalSupply, setTotalSupply] = useState(null);
  const [file, setFile] = useState(null);

  // useEffect(() => {
  //   const feachData = async () => {
  //     // if (nodeIpfs !== null) {
  //     //   // new Blob()
  //     // }
  //     const data = new Buffer('123fds');
  //     console.log(`data`, data)
  //     const dataFileType = await FileType.fromBuffer(data);
  //     console.log(`dataFileType`, dataFileType)
  //   };
  //   feachData();
  // }, [nodeIpfs]);

  const addPin = async () => {
    // console.log(`file`, file);
    // if (file !== null && file !== undefined && file.name) {
    // const data = new Buffer(file);
    // console.log(`data`, data);
    // const dataFileType = await FileType.fromBuffer(data);
    // console.log(`dataFileType`, dataFileType);

    const dataFile = new File([file], file.name);
    // const file1 = new File(['fo1o'], 'foo1.txt');
    const formData = new FormData();
    formData.append('file', dataFile);
    try {
      const response = await axios({
        method: 'post',
        url: 'https://io.cybernode.ai/add',
        data: formData,
      });
      console.log(`response`, response);
    } catch (error) {
      console.log(`error`, error);
    }
    // }
  };

  console.log(`totalSupply`, totalSupply);

  const showOpenFileDlg = () => {
    inputOpenFileRef.current.click();
  };

  const onFilePickerChange = (files) => {
    const fileOnChange = files.current.files[0];

    setFile(fileOnChange);
  };

  const onClickClear = () => {
    setFile(null);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {file !== null && file !== undefined ? file.name : ''}
      <input
        ref={inputOpenFileRef}
        onChange={() => onFilePickerChange(inputOpenFileRef)}
        type="file"
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className={
          file !== null && file !== undefined ? 'btn-add-close' : 'btn-add-file'
        }
        onClick={
          file !== null && file !== undefined ? onClickClear : showOpenFileDlg
        }
      />
      <button type="button" onClick={() => addPin()}>
        add
      </button>
    </div>
  );
}

const mapStateToProps = (store) => {
  return {
    nodeIpfs: store.ipfs.ipfs,
  };
};

export default connect(mapStateToProps)(AddTest);
